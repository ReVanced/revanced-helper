import { SlashCommandBuilder } from 'discord.js'

import type { Command } from '../types'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import { config } from '$/context'
import { createModerationActionEmbed } from '$/utils/discord/embeds'
import { sendModerationReplyAndLogs } from '$/utils/discord/moderation'
import { parseDuration } from '$/utils/duration'

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user')
        .addUserOption(option => option.setName('user').setRequired(true).setDescription('The user to ban'))
        .addStringOption(option => option.setName('reason').setDescription('The reason for banning the user'))
        .addStringOption(option =>
            option.setName('dmd').setDescription('Duration to delete messages (must be from 0 to 7 days)'),
        )
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ logger }, interaction) {
        const user = interaction.options.getUser('user', true)
        const reason = interaction.options.getString('reason') ?? 'No reason provided'
        const dmd = interaction.options.getString('dmd')

        const member = await interaction.guild!.members.fetch(user.id)
        const moderator = await interaction.guild!.members.fetch(interaction.user.id)

        if (member.bannable) throw new CommandError(CommandErrorType.Generic, 'This user cannot be banned by the bot.')

        if (moderator.roles.highest.comparePositionTo(member.roles.highest) <= 0)
            throw new CommandError(
                CommandErrorType.InvalidUser,
                'You cannot ban a user with a role equal to or higher than yours.',
            )

        const dms = Math.floor(dmd ? parseDuration(dmd) : 0 / 1000)
        await interaction.guild!.members.ban(user, {
            reason: `Banned by moderator ${interaction.user.tag} (${interaction.user.id}): ${reason}`,
            deleteMessageSeconds: dms,
        })

        await sendModerationReplyAndLogs(
            interaction,
            createModerationActionEmbed('Banned', user, interaction.user, reason),
        )
        logger.info(
            `${interaction.user.tag} (${interaction.user.id}) banned ${user.tag} (${user.id}) because ${reason}, deleting their messages sent in the previous ${dms}s`,
        )
    },
} satisfies Command
