import { ClientOperation, ServerOperation } from '@revanced/bot-shared'
import { awaitPacket } from 'src/utils/packets'
import {
    type ClientWebSocketEvents,
    ClientWebSocketManager,
    type ClientWebSocketManagerOptions,
} from './ClientWebSocket'

/**
 * The client that connects to the API.
 */
export default class Client {
    ready = false
    ws: ClientWebSocketManager

    constructor(options: ClientOptions) {
        this.ws = new ClientWebSocketManager(options.api.websocket)
        this.ws.on('ready', () => {
            this.ready = true
        })
        this.ws.on('disconnect', () => {
            this.ready = false
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

        this.ws.send({
            op: ClientOperation.ParseText,
            d: {
                text,
            },
        })

        // Since we don't have heartbeats anymore, this is fine.
        // But if we add anything similar, this will cause another race condition
        // To fix this, we can try adding a instanced function that would return the currentSequence
        // and it would be updated every time a "heartbeat ack" packet is received
        const expectedNextSeq = this.ws.currentSequence + 1
        const awaitPkt = (op: ServerOperation, timeout = this.ws.timeout) =>
            awaitPacket(this.ws, op, expectedNextSeq, timeout)

        return Promise.race([
            awaitPkt(ServerOperation.ParsedText),
            awaitPkt(ServerOperation.ParseTextFailed, this.ws.timeout + 5000),
        ])
            .then(pkt => {
                if (pkt.op === ServerOperation.ParsedText) return pkt.d
                throw new Error('Failed to parse text, the API encountered an error')
            })
            .catch(() => {
                throw new Error('Failed to parse text, the API did not respond in time')
            })
    }

    /**
     * Requests the API to parse the given image and return the text
     * @param url The URL of the image
     * @returns An object containing the ID of the request and the parsed text
     */
    async parseImage(url: string) {
        this.#throwIfNotReady()

        this.ws.send({
            op: ClientOperation.ParseImage,
            d: {
                image_url: url,
            },
        })

        // See line 48
        const expectedNextSeq = this.ws.currentSequence + 1
        const awaitPkt = (op: ServerOperation, timeout = this.ws.timeout) =>
            awaitPacket(this.ws, op, expectedNextSeq, timeout)

        return Promise.race([
            awaitPkt(ServerOperation.ParsedImage),
            awaitPkt(ServerOperation.ParseImageFailed, this.ws.timeout + 5000),
        ])
            .then(pkt => {
                if (pkt.op === ServerOperation.ParsedImage) return pkt.d
                throw new Error('Failed to parse image, the API encountered an error')
            })
            .catch(() => {
                throw new Error('Failed to parse image, the API did not respond in time')
            })
    }

    async trainMessage(text: string, label: string) {
        this.#throwIfNotReady()

        this.ws.send({
            op: ClientOperation.TrainMessage,
            d: {
                label,
                text,
            },
        })

        // See line 48
        const expectedNextSeq = this.ws.currentSequence + 1
        const awaitPkt = (op: ServerOperation, timeout = this.ws.timeout) =>
            awaitPacket(this.ws, op, expectedNextSeq, timeout)

        return Promise.race([
            awaitPkt(ServerOperation.TrainedMessage),
            awaitPkt(ServerOperation.TrainMessageFailed, this.ws.timeout + 5000),
        ])
            .then(pkt => {
                if (pkt.op === ServerOperation.TrainedMessage) return
                throw new Error('Failed to train message, the API encountered an error')
            })
            .catch(() => {
                throw new Error('Failed to train message, the API did not respond in time')
            })
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
    once<TOpName extends keyof ClientWebSocketEvents>(name: TOpName, handler: ClientWebSocketEvents[TOpName]) {
        this.ws.once(name, handler)
        return handler
    }

    /**
     * Disconnects the client from the API
     */
    disconnect() {
        this.ws.disconnect()
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
