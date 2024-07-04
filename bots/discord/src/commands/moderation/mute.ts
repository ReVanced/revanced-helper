import { SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import { applyRolePreset } from '$/utils/discord/rolePresets'
import type { Command } from '../types'

import { config } from '$/context'
import { createModerationActionEmbed } from '$/utils/discord/embeds'
import { sendModerationReplyAndLogs } from '$/utils/discord/moderation'
import { parseDuration } from '$/utils/duration'

export default {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member')
        .addUserOption(option => option.setName('member').setRequired(true).setDescription('The member to mute'))
        .addStringOption(option => option.setName('reason').setDescription('The reason for muting the member'))
        .addStringOption(option => option.setName('duration').setDescription('The duration of the mute'))
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ logger }, interaction, { userIsOwner }) {
        const user = interaction.options.getUser('member', true)
        const reason = interaction.options.getString('reason') ?? 'No reason provided'
        const duration = interaction.options.getString('duration')
        const durationMs = duration ? parseDuration(duration) : null

        if (Number.isInteger(durationMs) && durationMs! < 1)
            throw new CommandError(
                CommandErrorType.InvalidDuration,
                'The duration must be at least 1 millisecond long.',
            )

        const expires = durationMs ? Date.now() + durationMs : null
        const moderator = await interaction.guild!.members.fetch(interaction.user.id)
        const member = await interaction.guild!.members.fetch(user.id)
        if (!member)
            throw new CommandError(
                CommandErrorType.InvalidUser,
                'The provided member is not in the server or does not exist.',
            )

        if (!member.manageable)
            throw new CommandError(CommandErrorType.Generic, 'This user cannot be managed by the bot.')

        if (moderator.roles.highest.comparePositionTo(member.roles.highest) <= 0 && !userIsOwner)
            throw new CommandError(
                CommandErrorType.InvalidUser,
                'You cannot mute a user with a role equal to or higher than yours.',
            )

        await applyRolePreset(member, 'mute', durationMs ? Date.now() + durationMs : null)
        await sendModerationReplyAndLogs(
            interaction,
            createModerationActionEmbed('Muted', user, interaction.user, reason, durationMs),
        )

        logger.info(
            `Moderator ${interaction.user.tag} (${interaction.user.id}) muted ${user.tag} (${user.id}) until ${expires} because ${reason}`,
        )
    },
} satisfies Command
