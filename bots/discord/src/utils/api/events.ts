import type { ClientWebSocketEvents } from '@revanced/bot-api'
import { api } from '../../context'

const { client } = api

export function on<Event extends EventName>(event: Event, listener: ListenerOf<Event>) {
    client.on(event, listener)
}

export function once<Event extends EventName>(event: Event, listener: ListenerOf<Event>) {
    client.once(event, listener)
}

export type EventName = keyof ClientWebSocketEvents
export type ListenerOf<Event extends EventName> = ClientWebSocketEvents[Event]
