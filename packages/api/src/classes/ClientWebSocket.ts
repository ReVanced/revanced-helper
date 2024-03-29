import { EventEmitter } from 'events'
import {
    type ClientOperation,
    DisconnectReason,
    type Packet,
    ServerOperation,
    deserializePacket,
    isServerPacket,
    serializePacket,
    uncapitalize,
} from '@revanced/bot-shared'
import type TypedEmitter from 'typed-emitter'
import { type RawData, WebSocket } from 'ws'

/**
 * The class that handles the WebSocket connection to the server.
 * This is the only relevant class for the time being. But in the future, there may be more classes to handle different protocols of the API.
 */
export class ClientWebSocketManager {
    readonly url: string
    timeout: number

    ready = false
    disconnected: false | DisconnectReason = false
    currentSequence = 0

    #socket: WebSocket = null!
    #emitter = new EventEmitter() as TypedEmitter<ClientWebSocketEvents>

    constructor(options: ClientWebSocketManagerOptions) {
        this.url = options.url
        this.timeout = options.timeout ?? 10000
    }

    /**
     * Connects to the WebSocket API
     * @returns A promise that resolves when the client is ready
     */
    connect() {
        return new Promise<void>((rs, rj) => {
            try {
                this.#socket = new WebSocket(this.url)

                const timeout = setTimeout(() => {
                    if (!this.ready) {
                        this.#socket?.close(DisconnectReason.TooSlow)
                        throw new Error('WebSocket connection was not readied in time')
                    }
                }, this.timeout)

                this.#socket.on('open', () => {
                    this.disconnected = false
                    clearTimeout(timeout)
                    this.#listen()
                    rs()
                })

                this.#socket.on('error', err => {
                    clearTimeout(timeout)
                    throw err
                })

                this.#socket.on('close', (code, reason) => {
                    clearTimeout(timeout)
                    this._handleDisconnect(code, reason.toString())
                })
            } catch (e) {
                rj(e)
            }
        })
    }

    /**
     * Adds an event listener
     * @param name The event name to listen for
     * @param handler The event handler
     * @returns The event handler function
     */
    on<TOpName extends keyof ClientWebSocketEvents>(name: TOpName, handler: ClientWebSocketEvents[typeof name]) {
        this.#emitter.on(name, handler)
    }

    /**
     * Removes an event listener
     * @param name The event name to remove a listener from
     * @param handler The event handler to remove
     * @returns The removed event handler function
     */
    off<TOpName extends keyof ClientWebSocketEvents>(name: TOpName, handler: ClientWebSocketEvents[typeof name]) {
        this.#emitter.off(name, handler)
    }

    /**
     * Adds an event listener that will only be called once
     * @param name The event name to listen for
     * @param handler The event handler
     * @returns The event handler function
     */
    once<TOpName extends keyof ClientWebSocketEvents>(name: TOpName, handler: ClientWebSocketEvents[typeof name]) {
        this.#emitter.once(name, handler)
    }

    /**
     * Sends a packet to the server
     * @param packet The packet to send
     * @returns A promise that resolves when the packet has been sent
     */
    send<TOp extends ClientOperation>(packet: Packet<TOp>) {
        this.#throwIfDisconnected('Cannot send a packet when already disconnected from the server')

        this.#socket.send(serializePacket(packet), err => {
            throw err
        })
    }

    /**
     * Disconnects from the WebSocket API
     */
    disconnect() {
        this.#throwIfDisconnected('Cannot disconnect when already disconnected from the server')
        this._handleDisconnect(DisconnectReason.PlannedDisconnect)
    }

    /**
     * Checks whether the client is ready
     * @returns Whether the client is ready
     */
    isReady(): this is ReadiedClientWebSocketManager {
        return this.ready
    }

    #listen() {
        this.#socket.on('message', data => {
            const packet = deserializePacket(this._toBuffer(data))

            if (!isServerPacket(packet)) return this.#emitter.emit('invalidPacket', packet)

            this.currentSequence = packet.s
            this.#emitter.emit('packet', packet)

            switch (packet.op) {
                case ServerOperation.Hello: {
                    this.#emitter.emit('hello')
                    this.ready = true
                    this.#emitter.emit('ready')
                    break
                }
                case ServerOperation.Disconnect:
                    return this._handleDisconnect((packet as Packet<ServerOperation.Disconnect>).d.reason)
                default:
                    return this.#emitter.emit(
                        uncapitalize(ServerOperation[packet.op] as ClientWebSocketEventName),
                        // @ts-expect-error: TS at it again
                        packet,
                    )
            }
        })
    }

    #throwIfDisconnected(errorMessage: string) {
        if (this.disconnected !== false) throw new Error(errorMessage)
        if (this.#socket.readyState !== this.#socket.OPEN) throw new Error(errorMessage)
    }

    protected _handleDisconnect(reason: DisconnectReason | number, message?: string) {
        this.disconnected = reason in DisconnectReason ? reason : DisconnectReason.Generic
        this.#socket?.close(reason)
        this.#socket = null!

        this.#emitter.emit('disconnect', reason, message)
    }

    protected _toBuffer(data: RawData) {
        if (data instanceof Buffer) return data
        if (data instanceof ArrayBuffer) return Buffer.from(data)
        return Buffer.concat(data)
    }
}

export interface ClientWebSocketManagerOptions {
    /**
     * The URL to connect to
     */
    url: string
    /**
     * The timeout for the connection
     * @default 10000
     */
    timeout?: number
}

export type ClientWebSocketEventName = keyof typeof ServerOperation

type ClientWebSocketPredefinedEvents = {
    hello: () => Promise<void> | void
    ready: () => Promise<void> | void
    packet: (packet: Packet<ServerOperation>) => Promise<void> | void
    invalidPacket: (packet: Packet) => Promise<void> | void
    disconnect: (reason: DisconnectReason | number, message?: string) => Promise<void> | void
}

export type ClientWebSocketEvents = {
    [K in Exclude<Uncapitalize<ClientWebSocketEventName>, keyof ClientWebSocketPredefinedEvents>]: (
        packet: Packet<(typeof ServerOperation)[Capitalize<K>]>,
    ) => Promise<void> | void
} & ClientWebSocketPredefinedEvents

export type ReadiedClientWebSocketManager = RequiredProperty<InstanceType<typeof ClientWebSocketManager>>
