import { on, withContext } from '$utils/discord/events'

withContext(on, 'messageCreate', async ({ discord, logger }, msg) => {
    if (!msg.inGuild()) return
    if (msg.author.id === msg.client.user.id) return

    const store = discord.stickyMessages[msg.guildId]?.[msg.channelId]
    if (!store) return

    // TODO: Fix this by fixing the logic below
    if (store.timerActive && store.forceTimerActive) {
        logger.error(
            `Both timers are active in sticky message store: ${msg.guildId}.${msg.channelId}, this should not happen!`,
        )
        logger.info('Clearing the timer and the restarting the force timer...')
        clearTimeout(store.timer)
        store.timerActive = false
        // If the force timer is active, it implies the force timer exists
        store.forceTimer!.refresh()
    }

    const timerPreviouslyActive = store.timerActive
    // If there isn't a timer, start it up
    store.timerActive = true
    if (!store.timer) store.timer = setTimeout(store.send, store.timerMs) as NodeJS.Timeout
    else {
        /* 
            If:
                - (negate carried) There's a timer
                - The timer is not active
                - The force timer is not active
            Then:
                - Restart the timer
        */
        if (!timerPreviouslyActive && !store.forceTimerActive) store.timer.refresh()
        /*
            If:
                - Any of:
                    - (negate carried) The timer is active
                    - (negate carried) The force timer is active
                - The force timer is not active
            Then:
                - Start the force timer and clear the existing timer
        */ else if (!store.forceTimerActive && store.forceTimerMs) {
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
    }
})
