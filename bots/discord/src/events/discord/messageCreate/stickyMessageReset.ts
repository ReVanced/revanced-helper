import { on, withContext } from '$utils/discord/events'

withContext(on, 'messageCreate', async ({ discord, logger }, msg) => {
    if (!msg.inGuild()) return
    if (msg.author.id === msg.client.user.id) return

    const store = discord.stickyMessages[msg.guildId]?.[msg.channelId]
    if (!store) return

    if (!store.interval) store.interval = setTimeout(store.send, store.timeoutMs) as NodeJS.Timeout
    else {
        store.interval.refresh()

        if (!store.forceSendTimerActive && store.forceSendMs) {
            logger.debug(`Channel ${msg.channelId} in guild ${msg.guildId} is active, starting force send timer`)

            store.forceSendTimerActive = true

            if (!store.forceSendInterval)
                store.forceSendInterval = setTimeout(
                    () =>
                        store.send(true).then(() => {
                            store.forceSendTimerActive = false
                        }),
                    store.forceSendMs,
                ) as NodeJS.Timeout
            else store.forceSendInterval.refresh()
        }
    }
})
