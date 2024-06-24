import { SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import { config } from '$/context'
import { appliedPresets } from '$/database/schemas'
import { createModerationActionEmbed } from '$/utils/discord/embeds'
import { sendModerationReplyAndLogs } from '$/utils/discord/moderation'
import { removeRolePreset } from '$/utils/discord/rolePresets'
import { and, eq } from 'drizzle-orm'
import type { Command } from '..'

export default {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a member')
        .addUserOption(option => option.setName('member').setRequired(true).setDescription('The member to unmute'))
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ logger, database }, interaction) {
        const user = interaction.options.getUser('member', true)
        const member = await interaction.guild!.members.fetch(user.id)
        if (!member)
            throw new CommandError(
                CommandErrorType.InvalidUser,
                'The provided member is not in the server or does not exist.',
            )

        if (
            !(await database.query.appliedPresets.findFirst({
                where: and(eq(appliedPresets.memberId, member.id), eq(appliedPresets.preset, 'mute')),
            }))
        )
            throw new CommandError(CommandErrorType.Generic, 'This user is not muted.')

        await removeRolePreset(member, 'mute')
        await sendModerationReplyAndLogs(interaction, createModerationActionEmbed('Unmuted', user, interaction.user))

        logger.info(`Moderator ${interaction.user.tag} (${interaction.user.id}) unmuted ${user.tag} (${user.id})`)
    },
} satisfies Command
