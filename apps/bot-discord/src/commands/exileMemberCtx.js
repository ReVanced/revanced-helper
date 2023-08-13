import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import { checkForPerms } from '../utils/checkSupporterPerms.js'
import muteMember from '../utils/muteMember.js';
import exileMemberToChannel from '../utils/exileMemberToChannel.js';

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
        
        const targetMsg = interaction.targetMessage;
        muteMember(config, targetMsg.author, {
            channel: interaction.channel,
            reason: null,
            supportMute: true
        });

        exileMemberToChannel(targetMsg.author, interaction.channel, targetMsg.content, config, true);
    }
};
