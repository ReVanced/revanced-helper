import { SlashCommandBuilder } from 'discord.js';
import { checkForPerms } from '../utils/checkModPerms';
import reportToLogs from '../utils/reportToLogs.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member.')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('user')
                .setDescription('The member to ban')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('dmd')
                .setDescription('Amount of days to delete messages')
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the ban')
        ),
    async execute(_, config, interaction) {
        if (!checkForPerms(config, interaction.member)) return interaction.reply({
            epheremal: true,
            content: 'You don\'t have the required permissions.'
        });
        
        interaction.guild.members.unban(interaction.getString('user'),
            interaction.getString('reason'));

        reportToLogs(config, interaction.client, 'unbanned', null, {
            reason: interaction.getString('reason'),
            actionTo: await client.users.fetch(interaction.getString('user')),
            actionBy: interaction.member,
            channel: interaction.channel
        });
    }
};
