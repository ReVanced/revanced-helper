import { EventEmitter } from 'events'
import {
    ClientOperation,
    DisconnectReason,
    Packet,
    ServerOperation,
    deserializePacket,
    isClientPacket,
    serializePacket,
    uncapitalize,
} from '@revanced/bot-shared'

import type TypedEmitter from 'typed-emitter'
import type { RawData, WebSocket } from 'ws'

export default class Client {
    id: string
    disconnected: DisconnectReason | false = false
    ready = false

    lastHeartbeat: number = null!
    heartbeatInterval: number

    #hbTimeout: NodeJS.Timeout = null!
    #emitter = new EventEmitter() as TypedEmitter<ClientEventHandlers>
    #socket: WebSocket

    constructor(options: ClientOptions) {
        this.#socket = options.socket
        this.heartbeatInterval = options.heartbeatInterval ?? 60000
        this.id = options.id

        this.#socket.on('error', () => this.forceDisconnect())
        this.#socket.on('close', () => this.forceDisconnect())
        this.#socket.on('unexpected-response', () => this.forceDisconnect())

        this.send({
            op: ServerOperation.Hello,
            d: {
                heartbeatInterval: this.heartbeatInterval,
            },
        })
            .then(() => {
                this.#listen()
                this.#listenHeartbeat()
                this.ready = true
                this.#emitter.emit('ready')
            })
            .catch(() => {
                if (this.disconnected === false) this.disconnect(DisconnectReason.ServerError)
                else this.forceDisconnect(DisconnectReason.ServerError)
            })
    }

    on<TOpName extends keyof ClientEventHandlers>(name: TOpName, handler: ClientEventHandlers[typeof name]) {
        this.#emitter.on(name, handler)
    }

    once<TOpName extends keyof ClientEventHandlers>(name: TOpName, handler: ClientEventHandlers[typeof name]) {
        this.#emitter.once(name, handler)
    }

    off<TOpName extends keyof ClientEventHandlers>(name: TOpName, handler: ClientEventHandlers[typeof name]) {
        this.#emitter.off(name, handler)
    }

    send<TOp extends ServerOperation>(packet: Packet<TOp>) {
        return new Promise<void>((resolve, reject) => {
            try {
                this.#throwIfDisconnected('Cannot send packet to client that has already disconnected')
                this.#socket.send(serializePacket(packet))
                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }

    async disconnect(reason: DisconnectReason = DisconnectReason.Generic) {
        this.#throwIfDisconnected('Cannot disconnect client that has already disconnected')

        try {
            await this.send({ op: ServerOperation.Disconnect, d: { reason } })
        } catch (err) {
            throw new Error(`Cannot send disconnect reason to client ${this.id}: ${err}`)
        } finally {
            this.forceDisconnect(reason)
        }
    }

    forceDisconnect(reason: DisconnectReason = DisconnectReason.Generic) {
        if (this.disconnected !== false) return

        // It's so weird because if I moved this down a few lines
        // it would just fire the disconnect event twice because of a race condition
        this.disconnected = reason
        this.ready = false

        if (this.#hbTimeout) clearTimeout(this.#hbTimeout)
        this.#socket.close()

        this.#emitter.emit('disconnect', reason)
    }

    #throwIfDisconnected(errorMessage: string) {
        if (this.disconnected !== false) throw new Error(errorMessage)

        if (this.#socket.readyState !== this.#socket.OPEN) {
            this.forceDisconnect(DisconnectReason.Generic)
            throw new Error(errorMessage)
        }
    }

    #listen() {
        this.#socket.on('message', data => {
            this.#emitter.emit('message', data)
            try {
                const rawPacket = deserializePacket(this._toBuffer(data))
                if (!isClientPacket(rawPacket)) throw null

                const packet: ClientPacketObject<ClientOperation> = {
                    ...rawPacket,
                    client: this,
                }

                this.#emitter.emit('packet', packet)
                this.#emitter.emit(
                    uncapitalize(ClientOperation[packet.op] as ClientEventName),
                    // @ts-expect-error TypeScript doesn't know that the above line will negate the type enough
                    packet,
                )
            } catch (e) {
                // TODO: add error fields to sent packet so we can log what went wrong
                this.disconnect(DisconnectReason.InvalidPacket)
            }
        })
    }

    #listenHeartbeat() {
        this.lastHeartbeat = Date.now()
        this.#startHeartbeatTimeout()

        this.on('heartbeat', () => {
            this.lastHeartbeat = Date.now()
            this.#hbTimeout.refresh()

            this.send({
                op: ServerOperation.HeartbeatAck,
                d: {
                    nextHeartbeat: this.lastHeartbeat + this.heartbeatInterval,
                },
            }).catch(() => {})
        })
    }

    #startHeartbeatTimeout() {
        this.#hbTimeout = setTimeout(() => {
            if (Date.now() - this.lastHeartbeat > 0) {
                // TODO: put into config
                // 5000 is extra time to account for latency
                const interval = setTimeout(() => this.disconnect(DisconnectReason.TimedOut), 5000)

                this.once('heartbeat', () => clearTimeout(interval))
                // This should never happen but it did in my testing so I'm adding this just in case
                this.once('disconnect', () => clearTimeout(interval))
                // Technically we don't have to do this, but JUST IN CASE!
            } else this.#hbTimeout.refresh()
        }, this.heartbeatInterval)
    }

    protected _toBuffer(data: RawData) {
        if (data instanceof Buffer) return data
        if (data instanceof ArrayBuffer) return Buffer.from(data)
        return Buffer.concat(data)
    }
}

export interface ClientOptions {
    id: string
    socket: WebSocket
    heartbeatInterval?: number
}

export type ClientPacketObject<TOp extends ClientOperation> = Packet<TOp> & {
    client: Client
}

export type ClientEventName = keyof typeof ClientOperation

export type ClientEventHandlers = {
    [K in Uncapitalize<ClientEventName>]: (
        packet: ClientPacketObject<(typeof ClientOperation)[Capitalize<K>]>,
    ) => Promise<unknown> | unknown
} & {
    ready: () => Promise<unknown> | unknown
    packet: (packet: ClientPacketObject<ClientOperation>) => Promise<unknown> | unknown
    disconnect: (reason: DisconnectReason) => Promise<unknown> | unknown
    message: (data: RawData) => Promise<unknown> | unknown
}
