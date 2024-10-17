import { on, withContext } from '$utils/discord/events'

withContext(on, 'messageCreate', async ({ discord, logger }, msg) => {
    if (!msg.inGuild()) return
    if (msg.author.id === msg.client.user.id) return

    const store = discord.stickyMessages[msg.guildId]?.[msg.channelId]
    if (!store) return

    if (store.timerActive) {
        if (!store.forceTimerActive && store.forceTimerMs) {
            logger.debug(
                `Channel ${msg.channelId} in guild ${msg.guildId} is active, starting force send timer and clearing existing timer`,
            )

            // Clear the timer
            clearTimeout(store.timer)
            store.timerActive = false

            // (Re)start the force timer
            store.forceTimerActive = true
            if (!store.forceTimer)
                store.forceTimer = setTimeout(
                    () =>
                        store.send(true).then(() => {
                            store.forceTimerActive = false
                        }),
                    store.forceTimerMs,
                ) as NodeJS.Timeout
            else store.forceTimer.refresh()
        }
    } else if (!store.forceTimerActive) {
        store.timerActive = true
        if (!store.timer) store.timer = setTimeout(store.send, store.timerMs) as NodeJS.Timeout
    }
})
