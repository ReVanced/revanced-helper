import { on } from 'src/utils/discord/events'

export default on('ready', ({ logger }, client) => {
    logger.info(`Connected to Discord API, logged in as ${client.user.displayName} (@${client.user.tag})!`)
    logger.info(
        `Bot is in ${client.guilds.cache.size} guilds, if this is not expected, please run the /leave-unknowns command`,
    )
})
