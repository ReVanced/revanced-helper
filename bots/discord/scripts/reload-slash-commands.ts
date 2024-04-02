import { REST } from '@discordjs/rest'
import { getMissingEnvironmentVariables } from '@revanced/bot-shared'
import { Routes } from 'discord-api-types/v9'
import type {
    RESTGetCurrentApplicationResult,
    RESTPutAPIApplicationCommandsResult,
    RESTPutAPIApplicationGuildCommandsResult,
} from 'discord.js'
import { config, discord, logger } from '../src/context'

// Check if token exists

const missingEnvs = getMissingEnvironmentVariables(['DISCORD_TOKEN'])
if (missingEnvs.length) {
    for (const env of missingEnvs) logger.fatal(`${env} is not defined in environment variables`)
    process.exit(1)
}

// Group commands by global and guild

const { global: globalCommands = [], guild: guildCommands = [] } = Object.groupBy(Object.values(discord.commands), c =>
    c.global ? 'global' : 'guild',
)

// Set commands

const rest = new REST({ version: '10' }).setToken(process.env['DISCORD_TOKEN']!)

try {
    const app = (await rest.get(Routes.currentApplication())) as RESTGetCurrentApplicationResult
    const data = (await rest.put(Routes.applicationCommands(app.id), {
        body: globalCommands.map(({ data }) => {
            if (!data.dm_permission) data.dm_permission = true
            logger.warn(`Command ${data.name} has no dm_permission set, forcing to true as it is a global command`)
            return data
        }),
    })) as RESTPutAPIApplicationCommandsResult

    logger.info(`Reloaded ${data.length} global commands`)

    for (const guildId of config.guilds) {
        const data = (await rest.put(Routes.applicationGuildCommands(app.id, guildId), {
            body: guildCommands.map(x => x.data),
        })) as RESTPutAPIApplicationGuildCommandsResult

        logger.info(`Reloaded ${data.length} guild commands for guild ${guildId}`)
    }
} catch (e) {
    logger.fatal(e)
}
