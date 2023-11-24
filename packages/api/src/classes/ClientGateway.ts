import { type RawData, WebSocket } from 'ws'
import type TypedEmitter from 'typed-emitter'
import {
    ClientOperation,
    DisconnectReason,
    Packet,
    ServerOperation,
    deserializePacket,
    isServerPacket,
    serializePacket,
    uncapitalize,
} from '@revanced/bot-shared'
import { EventEmitter } from 'events'

/**
 * The class that handles the WebSocket connection to the server.
 * This is the only relevant class for the time being. But in the future, there may be more classes to handle different protocols of the API.
 */
export default class ClientGateway {
    readonly url: string
    ready: boolean = false
    disconnected: boolean | DisconnectReason = DisconnectReason.NeverConnected
    config: Readonly<Packet<ServerOperation.Hello>['d']> | null = null!

    #hbTimeout: NodeJS.Timeout = null!
    #socket: WebSocket = null!
    #emitter =
        new EventEmitter() as TypedEmitter<ClientGatewayEventHandlers>

    constructor(options: ClientGatewayOptions) {
        this.url = options.url
    }

    connect() {
        return new Promise<void>((rs, rj) => {
            try {
                this.#socket = new WebSocket(this.url)

                this.#socket.on('open', () => {
                    this.disconnected = false
                    rs()
                })

                this.#socket.on('close', () =>
                    this.#handleDisconnect(DisconnectReason.Generic)
                )

                this.#listen()
                this.ready = true
                this.#emitter.emit('ready')
            } catch (e) {
                rj(e)
            }
        })
    }

    on<TOpName extends keyof ClientGatewayEventHandlers>(
        name: TOpName,
        handler: ClientGatewayEventHandlers[typeof name]
    ) {
        this.#emitter.on(name, handler)
    }

    off<TOpName extends keyof ClientGatewayEventHandlers>(
        name: TOpName,
        handler: ClientGatewayEventHandlers[typeof name]
    ) {
        this.#emitter.off(name, handler)
    }

    once<TOpName extends keyof ClientGatewayEventHandlers>(
        name: TOpName,
        handler: ClientGatewayEventHandlers[typeof name]
    ) {
        this.#emitter.once(name, handler)
    }

    send<TOp extends ClientOperation>(packet: Packet<TOp>) {
        this.#throwIfDisconnected(
            'Cannot send a packet when already disconnected from the server'
        )

        return new Promise<void>((resolve, reject) =>
            this.#socket.send(serializePacket(packet), err =>
                err ? reject(err) : resolve()
            )
        )
    }

    disconnect() {
        this.#throwIfDisconnected(
            'Cannot disconnect when already disconnected from the server'
        )

        this.#handleDisconnect(DisconnectReason.Generic)
    }

    isReady(): this is ReadiedClientGateway {
        return this.ready
    }

    #listen() {
        this.#socket.on('message', data => {
            const packet = deserializePacket(this._toBuffer(data))
            // TODO: maybe log this?
            // Just ignore the invalid packet, we don't have to disconnect
            if (!isServerPacket(packet)) return

            this.#emitter.emit('packet', packet)

            switch (packet.op) {
                case ServerOperation.Hello:
                    const data = Object.freeze(
                        (packet as Packet<ServerOperation.Hello>).d
                    )
                    this.config = data
                    this.#emitter.emit('hello', data)
                    this.#startHeartbeating()
                    break
                case ServerOperation.Disconnect:
                    return this.#handleDisconnect(
                        (packet as Packet<ServerOperation.Disconnect>).d.reason
                    )
                default:
                    return this.#emitter.emit(
                        uncapitalize(
                            ServerOperation[packet.op] as ClientGatewayServerEventName
                        ),
                        // @ts-expect-error
                        packet
                    )
            }
        })
    }

    #throwIfDisconnected(errorMessage: string) {
        if (this.disconnected !== false) throw new Error(errorMessage)
        if (this.#socket.readyState !== this.#socket.OPEN)
            throw new Error(errorMessage)
    }

    #handleDisconnect(reason: DisconnectReason) {
        clearTimeout(this.#hbTimeout)
        this.disconnected = reason
        this.#socket.close()

        this.#emitter.emit('disconnect', reason)
    }

    #startHeartbeating() {
        this.on('heartbeatAck', packet => {
            this.#hbTimeout = setTimeout(() => {
                this.send({
                    op: ClientOperation.Heartbeat,
                    d: null,
                })
            }, packet.d.nextHeartbeat - Date.now())
        })

        // Immediately send a heartbeat so we can get when to send the next one
        this.send({
            op: ClientOperation.Heartbeat,
            d: null,
        })
    }

    protected _toBuffer(data: RawData) {
        if (data instanceof Buffer) return data
        else if (data instanceof ArrayBuffer) return Buffer.from(data)
        else return Buffer.concat(data)
    }
}

export interface ClientGatewayOptions {
    /**
     * The gateway URL to connect to
     */
    url: string
}

export type ClientGatewayServerEventName = keyof typeof ServerOperation

export type ClientGatewayEventHandlers = {
    [K in Uncapitalize<ClientGatewayServerEventName>]: (
        packet: Packet<(typeof ServerOperation)[Capitalize<K>]>
    ) => Promise<void> | void
} & {
    hello: (
        config: NonNullable<ClientGateway['config']>
    ) => Promise<void> | void
    ready: () => Promise<void> | void
    packet: (packet: Packet<ServerOperation>) => Promise<void> | void
    disconnect: (reason: DisconnectReason) => Promise<void> | void
}

export type ReadiedClientGateway = RequiredProperty<
    InstanceType<typeof ClientGateway>
>
