import type { ClientOperation } from '@revanced/bot-shared'
import type { Wit } from 'node-wit'
import type { Worker as TesseractWorker } from 'tesseract.js'
import { ClientPacketObject } from '../classes/Client.js'
import type { Config } from '../utils/getConfig.js'
import type { Logger } from '../utils/logger.js'

export { default as parseTextEventHandler } from './parseText.js'
export { default as parseImageEventHandler } from './parseImage.js'

export type EventHandler<POp extends ClientOperation> = (
    packet: ClientPacketObject<POp>,
    context: EventContext,
) => void | Promise<void>
export type EventContext = {
    witClient: Wit
    tesseractWorker: TesseractWorker
    logger: Logger
    config: Config
}
