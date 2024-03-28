import { listAllFilesRecursive } from '$utils/fs'
import { getMissingEnvironmentVariables } from '@revanced/bot-shared'
import { api, discord, logger } from './context'

for (const apiEvents of await listAllFilesRecursive('src/events/api')) {
    await import(apiEvents)
}

const { client: apiClient } = api
await apiClient.ws.connect()

for (const discordEvents of await listAllFilesRecursive('src/events/discord')) {
    await import(discordEvents)
}

const { client: discordClient } = discord

// Check if token exists
const missingEnvs = getMissingEnvironmentVariables(['DISCORD_TOKEN'])
if (missingEnvs.length) {
    for (const env of missingEnvs) logger.fatal(`${env} is not defined in environment variables`)
    process.exit(1)
}

await discordClient.login()
