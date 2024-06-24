import CommandError from '$/classes/CommandError'
import { createErrorEmbed, createStackTraceEmbed } from '$utils/discord/embeds'
import { on } from '$utils/discord/events'

export default on('interactionCreate', async (context, interaction) => {
    if (!interaction.isChatInputCommand()) return

    const { logger, discord, config } = context
    const command = discord.commands[interaction.commandName]

    logger.debug(`Command ${interaction.commandName} being invoked by ${interaction.user.tag}`)
    if (!command) return void logger.error(`Command ${interaction.commandName} not implemented but registered!!!`)

    const isOwner = config.owners.includes(interaction.user.id)

    /**
     * Owner check
     */
    if (command.ownerOnly && !isOwner)
        return void (await interaction.reply({
            embeds: [createErrorEmbed('Massive skill issue', 'This command can only be used by the bot owners.')],
            ephemeral: true,
        }))

    /**
     * Sanity check
     */
    if (!command.global && !interaction.inGuild()) {
        logger.error(`Command ${interaction.commandName} cannot be run in DMs, but was registered as global`)
        await interaction.reply({
            embeds: [createErrorEmbed('Cannot run that here', 'This command can only be used in a server.')],
            ephemeral: true,
        })
        return
    }

    /**
     * Permission checks
     */
    if (interaction.inGuild()) {
        // Bot owners get bypass
        if (command.memberRequirements && !isOwner) {
            const { permissions = 0n, roles = [], mode } = command.memberRequirements

            const member = await interaction.guild!.members.fetch(interaction.user.id)

            const [missingPermissions, missingRoles] = [
                // This command is an owner-only command (the user is not an owner, checked above)
                permissions <= 0n ||
                    // or the user doesn't have the required permissions
                    (permissions > 0n && !interaction.memberPermissions.has(permissions)),

                // If not:
                !roles.some(x => member.roles.cache.has(x)),
            ]

            if ((mode === 'any' && missingPermissions && missingRoles) || missingPermissions || missingRoles)
                return void interaction.reply({
                    embeds: [
                        createErrorEmbed(
                            'Missing roles or permissions',
                            "You don't have the required roles or permissions to use this command.",
                        ),
                    ],
                    ephemeral: true,
                })
        }
    }

    try {
        logger.debug(`Command ${interaction.commandName} being executed`)
        await command.execute(context, interaction, { userIsOwner: isOwner })
    } catch (err) {
        logger.error(`Error while executing command ${interaction.commandName}:`, err)
        await interaction[interaction.replied ? 'followUp' : 'reply']({
            embeds: [err instanceof CommandError ? err.toEmbed() : createStackTraceEmbed(err)],
            ephemeral: true,
        })
    }
})
