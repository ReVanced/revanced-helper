import { ClientOperation, ServerOperation } from '@revanced/bot-shared'

import { inspect as inspectObject } from 'node:util'

import type { EventHandler } from './index.js'

const parseTextEventHandler: EventHandler<ClientOperation.ParseText> = async (
    packet,
    { witClient, logger }
) => {
    const {
        client,
        d: { text, id },
    } = packet

    logger.debug(`Client ${client.id} requested to parse text:`, text)

    try {
        const { intents } = await witClient.message(text, {})
        const intentsWithoutIds = intents.map(({ id, ...rest }) => rest)

        await client.send({
            op: ServerOperation.ParsedText,
            d: {
                id,
                labels: intentsWithoutIds,
            },
        })
    } catch (e) {
        await client.send({
            op: ServerOperation.ParseTextFailed,
            d: {
                id,
            },
        })

        if (e instanceof Error) logger.error(e.stack ?? e.message)
        else logger.error(inspectObject(e))
    }
}

export default parseTextEventHandler
