import { SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import { sendPresetReplyAndLogs } from '$/utils/discord/moderation'
import { applyRolePreset, removeRolePreset } from '$/utils/discord/rolePresets'
import { parseDuration } from '$/utils/duration'
import type { Command } from '../types'

export default {
    data: new SlashCommandBuilder()
        .setName('role-preset')
        .setDescription('Manage role presets for a member')
        .addStringOption(option =>
            option
                .setName('action')
                .setRequired(true)
                .setDescription('The action to perform')
                .addChoices([
                    { name: 'apply', value: 'apply' },
                    { name: 'remove', value: 'remove' },
                ]),
        )
        .addUserOption(option => option.setName('member').setRequired(true).setDescription('The member to manage'))
        .addStringOption(option =>
            option.setName('preset').setRequired(true).setDescription('The preset to apply or remove'),
        )
        .addStringOption(option =>
            option.setName('duration').setDescription('The duration to apply the preset for (only for apply action)'),
        )
        .toJSON(),

    memberRequirements: {
        roles: ['955220417969262612', '973886585294704640'],
    },

    global: false,

    async execute({ logger }, interaction, { userIsOwner }) {
        const action = interaction.options.getString('action', true) as 'apply' | 'remove'
        const user = interaction.options.getUser('member', true)
        const preset = interaction.options.getString('preset', true)
        const duration = interaction.options.getString('duration')

        let expires: number | null | undefined = undefined
        const moderator = await interaction.guild!.members.fetch(interaction.user.id)
        const member = await interaction.guild!.members.fetch(user.id)
        if (!member)
            throw new CommandError(
                CommandErrorType.InvalidUser,
                'The provided member is not in the server or does not exist.',
            )

        if (!member.manageable)
            throw new CommandError(CommandErrorType.Generic, 'This user cannot be managed by the bot.')

        if (action === 'apply') {
            const durationMs = duration ? parseDuration(duration) : null
            if (Number.isInteger(durationMs) && durationMs! < 1)
                throw new CommandError(
                    CommandErrorType.InvalidDuration,
                    'The duration must be at least 1 millisecond long.',
                )

            if (moderator.roles.highest.comparePositionTo(member.roles.highest) <= 0 && !userIsOwner)
                throw new CommandError(
                    CommandErrorType.InvalidUser,
                    'You cannot apply a role preset to a user with a role equal to or higher than yours.',
                )

            expires = durationMs ? Date.now() + durationMs : null
            await applyRolePreset(member, preset, expires)
            logger.info(
                `Moderator ${interaction.user.tag} (${interaction.user.id}) applied role preset ${preset} to ${user.id} until ${expires}`,
            )
        } else if (action === 'remove') {
            await removeRolePreset(member, preset)
            logger.info(
                `Moderator ${interaction.user.tag} (${interaction.user.id}) removed role preset ${preset} from ${user.id}`,
            )
        }

        await sendPresetReplyAndLogs(action, interaction, user, preset, expires)
    },
} satisfies Command
