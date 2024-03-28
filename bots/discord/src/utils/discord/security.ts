import type { Guild, GuildManager } from 'discord.js'
import { config, logger } from '../../context'

export function leaveDisallowedGuild(guild: Guild) {
    logger.warn(`Server ${guild.name} (${guild.id}) is not allowed to use this bot.`)
    return guild.leave().then(() => logger.debug(`Left guild ${guild.name} (${guild.id})`))
}

export async function leaveDisallowedGuilds(guildManager: GuildManager) {
    const guilds = await guildManager.fetch()
    for (const [id, guild] of guilds) {
        if (!config.allowedGuilds.includes(id)) await leaveDisallowedGuild(await guild.fetch())
    }
}
