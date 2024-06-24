import { createSuccessEmbed } from '$/utils/discord/embeds'
import { durationToString, parseDuration } from '$/utils/duration'

import { SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import { config } from '$/context'
import type { Command } from '..'

export default {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set a slowmode for the current channel')
        .addStringOption(option => option.setName('duration').setDescription('The duration to set').setRequired(true))
        .addStringOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to set the slowmode on (defaults to current channel)')
                .setRequired(false),
        )
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ logger }, interaction) {
        const durationStr = interaction.options.getString('duration', true)
        const id = interaction.options.getChannel('channel')?.id ?? interaction.channelId

        const duration = parseDuration(durationStr)
        const channel = await interaction.guild!.channels.fetch(id)

        if (!channel?.isTextBased())
            throw new CommandError(
                CommandErrorType.InvalidChannel,
                'The supplied channel is not a text channel or does not exist.',
            )

        if (Number.isNaN(duration)) throw new CommandError(CommandErrorType.InvalidDuration, 'Invalid duration.')
        if (duration < 0 || duration > 36e4)
            throw new CommandError(
                CommandErrorType.InvalidDuration,
                'Duration out of range, must be between 0s and 6h.',
            )

        logger.info(`Setting slowmode to ${duration}ms on ${channel.id}`)

        await channel.setRateLimitPerUser(
            duration / 1000,
            `Slowmode set by @${interaction.user.username} (${interaction.user.id})`,
        )
        await interaction.reply({
            embeds: [createSuccessEmbed(`Slowmode set to ${durationToString(duration)} on ${channel.toString()}`)],
        })
    },
} satisfies Command
