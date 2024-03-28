import { type ClientOperation, ServerOperation } from '@revanced/bot-shared'

import { inspect as inspectObject } from 'util'

import type { EventHandler } from '.'

const parseTextEventHandler: EventHandler<ClientOperation.ParseText> = async (packet, { wit, logger }) => {
    const {
        client,
        d: { text },
    } = packet

    const nextSeq = client.currentSequence++
    const actualText = text.slice(0, 279)

    logger.debug(`Client ${client.id} requested to parse text:`, actualText)

    try {
        const { intents } = await wit.message(actualText)
        const intentsWithoutIds = intents.map(({ id, ...rest }) => rest)

        await client.send(
            {
                op: ServerOperation.ParsedText,
                d: {
                    labels: intentsWithoutIds,
                },
            },
            nextSeq,
        )
    } catch (e) {
        await client.send(
            {
                op: ServerOperation.ParseTextFailed,
                d: null,
            },
            nextSeq,
        )

        if (e instanceof Error) logger.error(e.stack ?? e.message)
        else logger.error(inspectObject(e))
    }
}

export default parseTextEventHandler
