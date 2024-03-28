import { on } from '$utils/discord/events'
import { leaveDisallowedGuild } from '$utils/discord/security'

on('guildCreate', async ({ config }, guild) => {
    if (config.allowedGuilds.includes(guild.id)) return
    await leaveDisallowedGuild(guild)
})
