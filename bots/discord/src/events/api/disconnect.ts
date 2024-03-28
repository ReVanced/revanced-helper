import { on } from '$utils/api/events'
import { DisconnectReason, HumanizedDisconnectReason } from '@revanced/bot-shared'
import { api, logger } from 'src/context'

on('disconnect', (reason, msg) => {
    if (reason === DisconnectReason.PlannedDisconnect && api.isStopping) return

    const ws = api.client.ws
    if (!ws.disconnected) ws.disconnect()

    logger.fatal(
        `Disconnected from the bot API ${
            reason in HumanizedDisconnectReason
                ? `because ${HumanizedDisconnectReason[reason as keyof typeof HumanizedDisconnectReason]}`
                : 'for an unknown reason'
        }`,
    )

    // TODO: move to config
    if (api.disconnectCount >= 3) {
        console.error(new Error('Disconnected from bot API too many times'))
        // We don't want the process hanging
        process.exit(1)
    }

    logger.info(
        `Disconnected from bot API ${++api.disconnectCount} times (this time because: ${reason}, ${msg}), reconnecting again...`,
    )
    setTimeout(() => ws.connect(), 10000)
})
