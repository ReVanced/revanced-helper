import type { Guild } from 'discord.js'
import { logger } from '../../context'

export const leaveDisallowedGuild = (guild: Guild) => {
    logger.warn(`Server ${guild.name} (${guild.id}) is not allowed to use this bot.`)
    return guild.leave().then(() => logger.debug(`Left guild ${guild.name} (${guild.id})`))
}
