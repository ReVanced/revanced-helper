import CommandError from '$/classes/CommandError'
import { createStackTraceEmbed } from '$utils/discord/embeds'
import { on, withContext } from '$utils/discord/events'

withContext(on, 'interactionCreate', async (context, interaction) => {
    if (!interaction.isChatInputCommand()) return

    const { logger, discord } = context
    const command = discord.commands[interaction.commandName]

    logger.debug(`Command ${interaction.commandName} being invoked by ${interaction.user.tag}`)
    if (!command)
        return void logger.error(`Interaction command ${interaction.commandName} not implemented but registered!!!`)

    try {
        logger.debug(`Command ${interaction.commandName} being executed`)
        await command.onInteraction(context, interaction)
    } catch (err) {
        if (!(err instanceof CommandError))
            logger.error(`Error while executing command ${interaction.commandName}:`, err)
        await interaction[interaction.replied ? 'followUp' : 'reply']({
            embeds: [err instanceof CommandError ? err.toEmbed() : createStackTraceEmbed(err)],
            ephemeral: true,
        })
    }
})
