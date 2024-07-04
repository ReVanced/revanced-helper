import { SlashCommandBuilder } from 'discord.js'

import type { Command } from '../types'

import { config } from '$/context'
import { createModerationActionEmbed } from '$/utils/discord/embeds'
import { sendModerationReplyAndLogs } from '$/utils/discord/moderation'

export default {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user')
        .addUserOption(option => option.setName('user').setRequired(true).setDescription('The user to unban'))
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ logger }, interaction) {
        const user = interaction.options.getUser('user', true)

        await interaction.guild!.members.unban(
            user,
            `Unbanned by moderator ${interaction.user.tag} (${interaction.user.id})`,
        )

        await sendModerationReplyAndLogs(interaction, createModerationActionEmbed('Unbanned', user, interaction.user))
        logger.info(`${interaction.user.tag} (${interaction.user.id}) unbanned ${user.tag} (${user.id})`)
    },
} satisfies Command
