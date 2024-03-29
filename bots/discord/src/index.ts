// import { listAllFilesRecursive, pathJoinCurrentDir } from '$utils/fs'
import { getMissingEnvironmentVariables } from '@revanced/bot-shared'
import { api, discord, logger } from './context'
import { listAllFilesRecursive, pathJoinCurrentDir } from './utils/fs'

for (const event of listAllFilesRecursive(pathJoinCurrentDir(import.meta.url, 'events', 'api'))) {
    await import(event)
}

const { client: apiClient } = api
await apiClient.ws.connect()

for (const event of listAllFilesRecursive(pathJoinCurrentDir(import.meta.url, 'events', 'discord'))) {
    await import(event)
}

const { client: discordClient } = discord

// Check if token exists
const missingEnvs = getMissingEnvironmentVariables(['DISCORD_TOKEN'])
if (missingEnvs.length) {
    for (const env of missingEnvs) logger.fatal(`${env} is not defined in environment variables`)
    process.exit(1)
}

await discordClient.login()
