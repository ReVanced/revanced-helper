import { api, discord, logger } from '$/context'
import { listAllFilesRecursive, pathJoinCurrentDir } from '$utils/fs'
import { getMissingEnvironmentVariables } from '@revanced/bot-shared'

// Check if token exists
const missingEnvs = getMissingEnvironmentVariables(['DISCORD_TOKEN', 'DATABASE_URL'])
if (missingEnvs.length) {
    for (const env of missingEnvs) logger.fatal(`${env} is not defined in environment variables`)
    process.exit(1)
}

for (const event of listAllFilesRecursive(pathJoinCurrentDir(import.meta.url, 'events', 'api'))) {
    await import(event)
}

api.client.connect()

for (const event of listAllFilesRecursive(pathJoinCurrentDir(import.meta.url, 'events', 'discord'))) {
    await import(event)
}

discord.client.login()
