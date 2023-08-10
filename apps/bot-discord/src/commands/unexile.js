import { SlashCommandBuilder } from 'discord.js';
import { checkForPerms } from '../utils/checkModPerms.js';
import reportToLogs from '../utils/reportToLogs.js';
import unmuteMember from '../utils/unmuteMember.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unexile')
        .setDescription('Get the member back from an exilation.')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('user')
                .setDescription('The member to unexile')
                .setRequired(true)
        ),
    async execute(_, config, interaction) {
        if (checkForPerms(config, interaction.member)) return interaction.reply({
            epheremal: true,
            content: 'You don\'t have the required permissions.'
        });

        await interaction.deferReply();

        let member;
        try {
            member = await interaction.guild.members.fetch(interaction.options.getString('user'));
        } catch (_) {
            await interaction.editReply({
                content: 'Could not find member.'
            });

            return;
        }

        const reason = interaction.options.getString('reason');
        const isExiled = await unmuteMember(config, member);

        if (!isExiled) {
            await interaction.editReply({
                content: 'Member was not exiled.'
            });

            return;
        }

        reportToLogs(config, interaction.client, 'unmuted', null, {
            reason,
            actionTo: await client.users.fetch(interaction.options.getString('user')),
            actionBy: interaction.member,
            channel: interaction.channel,
        });
    }
};
