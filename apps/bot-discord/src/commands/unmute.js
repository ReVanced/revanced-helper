import { SlashCommandBuilder } from 'discord.js';
import { checkForPerms } from '../utils/checkModPerms.js';
import reportToLogs from '../utils/reportToLogs.js';
import unmuteMember from '../utils/unmuteMember.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a member.')
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to unmute')
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
        const isMuted = await unmuteMember(config, member, false);

        if (!isMuted) {
            await interaction.editReply({
                content: 'Member was not muted.'
            });

            return;
        }

        reportToLogs(config, interaction.client, 'unmuted', null, {
            reason: null,
            actionTo: user,
            actionBy: interaction.member,
            channel: interaction.channel,
        }, interaction);
    }
};
