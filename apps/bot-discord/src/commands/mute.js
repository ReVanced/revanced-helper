import { SlashCommandBuilder } from 'discord.js';
import { checkForPerms } from '../utils/checkModPerms.js';
import reportToLogs from '../utils/reportToLogs.js';
import muteMember from '../utils/muteMember.js';

export default {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member.')
        .setDMPermission(false)
        .addUserOption(option =>
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
        if (!checkForPerms(config, interaction.member)) return interaction.reply({
            epheremal: true,
            content: 'You don\'t have the required permissions.'
        });

        await interaction.deferReply();

        const member = interaction.options.getUser('user');

        const reason = interaction.options.getString('reason');
        const parsedDuration = await muteMember(config, member, {
            duration: interaction.options.getString('duration'),
            reason,
            supportMute: false
        });

        reportToLogs(config, interaction.client, 'muted', null, {
            reason,
            actionTo: member,
            actionBy: interaction.member,
            channel: interaction.channel,
            expire: parsedDuration
        }, interaction);
    }
};
