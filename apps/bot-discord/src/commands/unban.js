import { SlashCommandBuilder } from 'discord.js';
import { checkForPerms } from '../utils/checkModPerms.js';
import reportToLogs from '../utils/reportToLogs.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a member.')
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to ban')
                .setRequired(true)
        ),
    async execute(_, config, interaction) {
        if (checkForPerms(config, interaction.member)) return interaction.reply({
            epheremal: true,
            content: 'You don\'t have the required permissions.'
        });
        
        interaction.guild.members.unban(interaction.options.getUser('user'));

        reportToLogs(config, interaction.client, 'unbanned', null, {
            reason: null,
            actionTo: await client.users.fetch(interaction.options.getString('user')),
            actionBy: interaction.member,
            channel: interaction.channel
        }, interaction);
    }
};
