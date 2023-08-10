import { SlashCommandBuilder } from 'discord.js';
import { checkForPerms } from '../utils/checkModPerms.js';
import reportToLogs from '../utils/reportToLogs.js';
import muteMember from '../utils/muteMember.js';

export default {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member.')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('user')
                .setDescription('The member to mute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('The duration of mute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason of the mute')
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
        const parsedDuration = await muteMember(config, member, {
            duration: interaction.options.getString('duration'),
            reason,
            supportMute: false
        });

        reportToLogs(config, interaction.client, 'muted', null, {
            reason,
            actionTo: await client.users.fetch(interaction.options.getString('user')),
            actionBy: interaction.member,
            channel: interaction.channel,
            expire: parsedDuration
        });
    }
};
