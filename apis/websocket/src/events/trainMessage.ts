import { type ClientOperation, ServerOperation } from '@revanced/bot-shared'

import { inspect as inspectObject } from 'util'

import type { EventHandler } from '.'

const trainMessageEventHandler: EventHandler<ClientOperation.TrainMessage> = async (packet, { wit, logger }) => {
    const {
        client,
        d: { text, label },
    } = packet

    const nextSeq = client.currentSequence++
    const actualText = text.slice(0, 279)

    logger.debug(`Client ${client.id} requested to train label ${label} with:`, actualText)

    try {
        await wit.train(actualText, label)
        await client.send(
            {
                op: ServerOperation.TrainedMessage,
                d: null,
            },
            nextSeq,
        )

        logger.debug(`Trained label ${label} with:`, actualText)
    } catch (e) {
        await client.send(
            {
                op: ServerOperation.TrainMessageFailed,
                d: null,
            },
            nextSeq,
        )

        if (e instanceof Error) logger.error(e.stack ?? e.message)
        else logger.error(inspectObject(e))
    }
}

export default trainMessageEventHandler
