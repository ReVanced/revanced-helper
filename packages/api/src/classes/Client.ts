import { ClientOperation, Packet, ServerOperation } from '@revanced/bot-shared'
import { ClientWebSocketManager, ClientWebSocketEvents, ClientWebSocketManagerOptions } from './ClientWebSocket'

/**
 * The client that connects to the API.
 */
export default class Client {
    ready = false
    ws: ClientWebSocketManager
    #parseId = 0

    constructor(options: ClientOptions) {
        this.ws = new ClientWebSocketManager(options.api.websocket)
        this.ws.on('ready', () => {
            this.ready = true
        })
        this.ws.on('disconnect', () => {

        })
    }

    /**
     * Checks whether the client is ready
     * @returns Whether the client is ready
     */
    isReady(): this is ReadiedClient {
        return this.ready
    }

    /**
     * Requests the API to parse the given text
     * @param text The text to parse
     * @returns An object containing the ID of the request and the labels
     */
    async parseText(text: string) {
        this.#throwIfNotReady()

        const currentId = (this.#parseId++).toString()

        this.ws.send({
            op: ClientOperation.ParseText,
            d: {
                text,
                id: currentId,
            },
        })

        type CorrectPacket = Packet<ServerOperation.ParsedText>

        const promise = new Promise<CorrectPacket['d']>((rs, rj) => {
            const parsedTextListener = (packet: CorrectPacket) => {
                if (packet.d.id !== currentId) return
                this.ws.off('parsedText', parsedTextListener)
                rs(packet.d)
            }

            const parseTextFailedListener = (packet: Packet<ServerOperation.ParseTextFailed>) => {
                if (packet.d.id !== currentId) return
                this.ws.off('parseTextFailed', parseTextFailedListener)
                rj()
            }

            this.ws.on('parsedText', parsedTextListener)
            this.ws.on('parseTextFailed', parseTextFailedListener)
        })

        return await promise
    }

    /**
     * Requests the API to parse the given image and return the text
     * @param url The URL of the image
     * @returns An object containing the ID of the request and the parsed text
     */
    async parseImage(url: string) {
        this.#throwIfNotReady()

        const currentId = (this.#parseId++).toString()

        this.ws.send({
            op: ClientOperation.ParseImage,
            d: {
                image_url: url,
                id: currentId,
            },
        })

        type CorrectPacket = Packet<ServerOperation.ParsedImage>

        const promise = new Promise<CorrectPacket['d']>((rs, rj) => {
            const parsedImageListener = (packet: CorrectPacket) => {
                if (packet.d.id !== currentId) return
                this.ws.off('parsedImage', parsedImageListener)
                rs(packet.d)
            }

            const parseImageFailedListener = (packet: Packet<ServerOperation.ParseImageFailed>) => {
                if (packet.d.id !== currentId) return
                this.ws.off('parseImageFailed', parseImageFailedListener)
                rj()
            }

            this.ws.on('parsedImage', parsedImageListener)
            this.ws.on('parseImageFailed', parseImageFailedListener)
        })

        return await promise
    }

    /**
     * Adds an event listener
     * @param name The event name to listen for
     * @param handler The event handler
     * @returns The event handler function
     */
    on<TOpName extends keyof ClientWebSocketEvents>(name: TOpName, handler: ClientWebSocketEvents[TOpName]) {
        this.ws.on(name, handler)
        return handler
    }

    /**
     * Removes an event listener
     * @param name The event name to remove a listener from
     * @param handler The event handler to remove
     * @returns The removed event handler function
     */
    off<TOpName extends keyof ClientWebSocketEvents>(name: TOpName, handler: ClientWebSocketEvents[TOpName]) {
        this.ws.off(name, handler)
        return handler
    }

    /**
     * Adds an event listener that will only be called once
     * @param name The event name to listen for
     * @param handler The event handler
     * @returns The event handler function
     */
    once<TOpName extends keyof ClientWebSocketEvents>(
        name: TOpName,
        handler: ClientWebSocketEvents[TOpName],
    ) {
        this.ws.once(name, handler)
        return handler
    }

    #throwIfNotReady() {
        if (!this.isReady()) throw new Error('Client is not ready')
    }
}

export type ReadiedClient = Client & { ready: true }

export interface ClientOptions {
    api: ClientApiOptions
}

export interface ClientApiOptions {
    websocket: ClientWebSocketManagerOptions
}
