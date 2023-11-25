import { ClientOperation, Packet, ServerOperation } from '@revanced/bot-shared'
import ClientGateway, { ClientGatewayEventHandlers } from './ClientGateway.js'

/**
 * The client that connects to the API.
 */
export default class Client {
    ready: boolean = false
    gateway: ClientGateway
    #parseId: number = 0

    constructor(options: ClientOptions) {
        this.gateway = new ClientGateway({
            url: options.api.gatewayUrl,
        })

        this.gateway.on('ready', () => {
            this.ready = true
        })
    }

    connect() {
        return this.gateway.connect()
    }

    isReady(): this is ReadiedClient {
        return this.ready
    }

    async parseText(text: string) {
        this.#throwIfNotReady()

        const currentId = (this.#parseId++).toString()

        this.gateway.send({
            op: ClientOperation.ParseText,
            d: {
                text,
                id: currentId,
            },
        })

        type CorrectPacket = Packet<ServerOperation.ParsedText>

        const promise = new Promise<CorrectPacket>((rs, rj) => {
            const parsedTextListener = (packet: CorrectPacket) => {
                if (packet.d.id !== currentId) return
                this.gateway.off('parsedText', parsedTextListener)
                rs(packet)
            }

            const parseTextFailedListener = (
                packet: Packet<ServerOperation.ParseTextFailed>
            ) => {
                if (packet.d.id !== currentId) return
                this.gateway.off('parseTextFailed', parseTextFailedListener)
                rj(packet)
            }

            this.gateway.on('parsedText', parsedTextListener)
            this.gateway.on('parseTextFailed', parseTextFailedListener)
        })

        return await promise
    }

    async parseImage(url: string) {
        this.#throwIfNotReady()

        const currentId = (this.#parseId++).toString()

        this.gateway.send({
            op: ClientOperation.ParseImage,
            d: {
                image_url: url,
                id: currentId,
            },
        })

        type CorrectPacket = Packet<ServerOperation.ParsedImage>

        const promise = new Promise<CorrectPacket>((rs, rj) => {
            const parsedImageListener = (packet: CorrectPacket) => {
                if (packet.d.id !== currentId) return
                this.gateway.off('parsedImage', parsedImageListener)
                rs(packet)
            }

            const parseImageFailedListener = (
                packet: Packet<ServerOperation.ParseImageFailed>
            ) => {
                if (packet.d.id !== currentId) return
                this.gateway.off('parseImageFailed', parseImageFailedListener)
                rj(packet)
            }

            this.gateway.on('parsedImage', parsedImageListener)
            this.gateway.on('parseImageFailed', parseImageFailedListener)
        })

        return await promise
    }

    on<TOpName extends keyof ClientGatewayEventHandlers>(
        name: TOpName,
        handler: ClientGatewayEventHandlers[typeof name]
    ) {
        this.gateway.on(name, handler)
    }

    off<TOpName extends keyof ClientGatewayEventHandlers>(
        name: TOpName,
        handler: ClientGatewayEventHandlers[typeof name]
    ) {
        this.gateway.off(name, handler)
    }

    once<TOpName extends keyof ClientGatewayEventHandlers>(
        name: TOpName,
        handler: ClientGatewayEventHandlers[typeof name]
    ) {
        this.gateway.once(name, handler)
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
    gatewayUrl: string
}
