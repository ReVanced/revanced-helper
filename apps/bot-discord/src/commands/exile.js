import { SlashCommandBuilder } from 'discord.js';
import { checkForPerms } from '../utils/checkSupporterPerms.js'
import reportToLogs from '../utils/reportToLogs.js';
import muteMember from '../utils/muteMember.js';
import exileMemberToChannel from '../utils/exileMemberToChannel.js';

export default {
    data: new SlashCommandBuilder()
        .setName('exile')
        .setDescription('Exile a member to support.')
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to exile')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason of the exile')
                .setRequired(true)
        ),
    async execute(_, config, interaction) {
        if (!checkForPerms(config, interaction.member)) return interaction.reply({
            epheremal: true,
            content: 'You don\'t have the required permissions.'
        });

        await interaction.deferReply();

        const user = interaction.options.getUser('user');

        const member = await interaction.guild.members.fetch(user);
        const reason = interaction.options.getString('reason');
        const parsedDuration = await muteMember(config, member, {
            reason,
            supportMute: true,
            guild: interaction.guild
        });

        exileMemberToChannel(member, interaction.channel, null, reason, config);

        reportToLogs(config, interaction.client, 'exiled', null, {
            reason,
            actionTo: user,
            actionBy: interaction.member,
            channel: interaction.channel,
            expire: parsedDuration
        }, interaction);
    }
};
