import { SlashCommandBuilder } from 'discord.js'

import type { Command } from '..'

export default {
    data: new SlashCommandBuilder().setName('stop').setDescription('Stops the bot').setDMPermission(true).toJSON(),

    ownerOnly: true,
    global: true,

    async execute({ api, logger }, interaction) {
        api.isStopping = true

        logger.fatal('Stopping bot...')
        await interaction.reply({
            content: 'Stopping... (I will go offline once done)',
            ephemeral: true,
        })

        api.client.disconnect()
        logger.warn('Disconnected from API')

        await interaction.client.destroy()
        logger.warn('Disconnected from Discord API')

        logger.info(`Bot stopped, requested by ${interaction.user.id}`)
        process.exit(0)
    },
} satisfies Command
