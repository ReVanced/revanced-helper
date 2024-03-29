import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import { checkForPerms } from '../utils/checkSupporterPerms.js'
import muteMember from '../utils/muteMember.js';
import exileMemberToChannel from '../utils/exileMemberToChannel.js';
import reportToLogs from '../utils/reportToLogs.js';

export default {
    data: new ContextMenuCommandBuilder()
        .setName('Exile Member')
        .setType(ApplicationCommandType.Message),
    async execute(helper, config, interaction) {
        if (
            !checkForPerms(config, interaction.member)
        )
            return interaction.reply({
                content: 'You don\'t have the permission to do this.',
                ephemeral: true
            });
        
        await interaction.deferReply();
        const targetMsg = interaction.targetMessage;

        const member = await interaction.guild.members.fetch(targetMsg.author.id);
        const parsedDuration = await muteMember(config, member, {
            channel: interaction.channel,
            reason: null,
            supportMute: true,
            guild: interaction.guild
        });

        exileMemberToChannel(targetMsg.author, interaction.channel, targetMsg.content, null, config);

        reportToLogs(config, interaction.client, 'exiled', null, {
            reason: null,
            actionTo: targetMsg.author,
            actionBy: interaction.member,
            channel: interaction.channel,
            expire: parsedDuration
        }, interaction);

        await targetMsg.delete();
    }
};
