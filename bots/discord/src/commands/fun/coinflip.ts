import { applyCommonEmbedStyles } from '$/utils/discord/embeds'

import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'

import type { Command } from '../types'

export default {
    data: new SlashCommandBuilder().setName('coinflip').setDescription('Do a coinflip!').setDMPermission(true).toJSON(),
    global: true,

    async execute(_, interaction) {
        const result = Math.random() < 0.5 ? ('heads' as const) : ('tails' as const)
        const embed = applyCommonEmbedStyles(new EmbedBuilder().setTitle('Flipping... 🪙'), true, false, false)

        await interaction.reply({
            embeds: [embed.toJSON()],
        })

        embed.setTitle(`The coin landed on... **${result.toUpperCase()}**! ${EmojiMap[result]}`)

        setTimeout(
            () =>
                interaction.editReply({
                    embeds: [embed.toJSON()],
                }),
            1500,
        )
    },
} satisfies Command

const EmojiMap: Record<'heads' | 'tails', string> = {
    heads: '🤯',
    tails: '🐈',
}
