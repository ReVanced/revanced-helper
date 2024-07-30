import { type CommandArguments, CommandSpecialArgumentType } from '$/classes/Command'
import CommandError from '$/classes/CommandError'
import { createStackTraceEmbed } from '$utils/discord/embeds'
import { on, withContext } from '$utils/discord/events'

withContext(on, 'messageCreate', async (context, msg) => {
    const { logger, discord, config } = context

    if (msg.author.bot) return

    const regex = new RegExp(`^(?:${config.prefix}|${msg.client.user.toString()}\\s*)([a-zA-Z-_]+)(?:\\s+)?(.+)?`)
    const matches = msg.content.match(regex)

    if (!matches) return
    const [, commandName, argsString] = matches
    if (!commandName) return

    const command = discord.commands[commandName]
    logger.debug(`Command ${commandName} being invoked by ${msg.author.id}`)
    if (!command) return void logger.error(`Command ${commandName} not implemented`)

    const argsRegex: RegExp = /[^\s"]+|"([^"]*)"/g
    const args: CommandArguments = []
    let match: RegExpExecArray | null

    // biome-ignore lint/suspicious/noAssignInExpressions: nuh uh
    while ((match = argsRegex.exec(argsString ?? '')) !== null) {
        const arg = match[1] ? match[1] : match[0]
        const mentionMatch = arg.match(/<(@(?:!|&)?|#)(.+?)>/)

        if (mentionMatch) {
            const [, prefix, id] = mentionMatch

            if (!id || !prefix) {
                args.push('')
                continue
            }

            args.push({
                type: CommandSpecialArgumentType[prefix[1] === '&' ? 'Role' : prefix[0] === '#' ? 'Channel' : 'User'],
                id,
            })
        } else args.push(arg)
    }

    try {
        logger.debug(`Command ${commandName} being executed`)
        await command.onMessage(context, msg, args)
    } catch (err) {
        if (!(err instanceof CommandError)) logger.error(`Error while executing command ${commandName}:`, err)
        await msg.reply({ embeds: [err instanceof CommandError ? err.toEmbed() : createStackTraceEmbed(err)] })
    }
})
