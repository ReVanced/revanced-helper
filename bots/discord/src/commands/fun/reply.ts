import { SlashCommandBuilder, type TextBasedChannel } from 'discord.js'

import { config } from '$/context'
import type { Command } from '..'

export default {
    data: new SlashCommandBuilder()
        .setName('reply')
        .setDescription('Send a message as the bot')
        .addStringOption(option => option.setName('message').setDescription('The message to send').setRequired(true))
        .addStringOption(option =>
            option
                .setName('reference')
                .setDescription('The message ID to reply to (use `latest` to reply to the latest message)')
                .setRequired(false),
        )
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ logger }, interaction) {
        const msg = interaction.options.getString('message', true)
        const ref = interaction.options.getString('reference')

        const channel = (await interaction.guild!.channels.fetch(interaction.channelId)) as TextBasedChannel
        const refMsg = ref?.startsWith('latest') ? (await channel.messages.fetch({ limit: 1 })).at(0)?.id : ref

        await channel.send({
            content: msg,
            reply: refMsg ? { messageReference: refMsg, failIfNotExists: true } : undefined,
        })

        logger.info(`User ${interaction.user.tag} made the bot say: ${msg}`)

        await interaction.reply({
            content: 'OK!',
            ephemeral: true,
        })
    },
} satisfies Command
