import { database, logger } from '$/context'
import { appliedPresets } from '$/database/schemas'
import { removeRolePreset } from '$/utils/discord/rolePresets'
import type { Client } from 'discord.js'
import { lt } from 'drizzle-orm'
import { on, withContext } from 'src/utils/discord/events'

export default withContext(on, 'ready', ({ config, logger }, client) => {
    logger.info(`Connected to Discord API, logged in as ${client.user.displayName} (@${client.user.tag})!`)
    logger.info(`Bot is in ${client.guilds.cache.size} guilds`)

    if (config.rolePresets) {
        removeExpiredPresets(client)
        setTimeout(() => removeExpiredPresets(client), config.rolePresets.checkExpiredEvery)
    }
})

const removeExpiredPresets = async (client: Client) => {
    logger.debug('Checking for expired role presets...')

    const expireds = await database.query.appliedPresets.findMany({
        where: lt(appliedPresets.until, Math.floor(Date.now() / 1000)),
    })

    for (const expired of expireds)
        try {
            const guild = await client.guilds.fetch(expired.guildId)
            const member = await guild.members.fetch(expired.memberId)

            logger.debug(`Removing role preset for ${expired.memberId} in ${expired.guildId}`)
            await removeRolePreset(member, expired.preset)
        } catch (e) {
            logger.error(`Error while removing role preset for ${expired.memberId} in ${expired.guildId}: ${e}`)
        }
}
