import { REST } from '@discordjs/rest'
import { getMissingEnvironmentVariables } from '@revanced/bot-shared'
import { Routes } from 'discord-api-types/v9'
import type { RESTGetCurrentApplicationResult, RESTPutAPIApplicationCommandsResult } from 'discord.js'
import { config, discord } from '../src/context'

// Check if token exists

const missingEnvs = getMissingEnvironmentVariables(['DISCORD_TOKEN'])
if (missingEnvs.length) {
    for (const env of missingEnvs) console.error(`${env} is not defined in environment variables`)
    process.exit(1)
}

const commands = Object.values(discord.commands)
const globalCommands = commands.filter(x => x.global && x.data.dm_permission)
const guildCommands = commands.filter(x => !x.global)

const rest = new REST({ version: '10' }).setToken(process.env['DISCORD_TOKEN']!)

try {
    const app = (await rest.get(Routes.currentApplication())) as RESTGetCurrentApplicationResult

    if (typeof app === 'object' && app && 'id' in app && typeof app.id === 'string') {
        const data = (await rest.put(Routes.applicationCommands(app.id), {
            body: globalCommands.map(x => x.data),
        })) as RESTPutAPIApplicationCommandsResult

        console.info(`Reloaded ${data.length} global commands.`)

        const guildCommandsMapped = guildCommands.map(x => x.data)
        for (const guildId of config.allowedGuilds) {
            const data = (await rest.put(Routes.applicationGuildCommands(app.id, guildId), {
                body: guildCommandsMapped,
            })) as RESTPutAPIApplicationCommandsResult

            console.info(`Reloaded ${data.length} guild commands for guild ${guildId}.`)
        }
    }
} catch (error) {
    console.error(error)
}
