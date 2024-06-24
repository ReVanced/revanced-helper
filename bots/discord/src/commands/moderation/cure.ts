import { SlashCommandBuilder } from 'discord.js'

import type { Command } from '..'

import { config } from '$/context'
import { cureNickname } from '$/utils/discord/moderation'

export default {
    data: new SlashCommandBuilder()
        .setName('cure')
        .setDescription("Cure a member's nickname")
        .addUserOption(option => option.setName('member').setRequired(true).setDescription('The member to cure'))
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute(_, interaction) {
        const user = interaction.options.getUser('user', true)
        const member = await interaction.guild!.members.fetch(user.id)
        await cureNickname(member)
    },
} satisfies Command
