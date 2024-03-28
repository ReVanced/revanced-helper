import * as context from '$/context'
import type { ClientEvents } from 'discord.js'

const { client } = context.discord

export const on = <Event extends EventName>(event: Event, listener: ListenerOf<Event>) =>
    client.on(event, (...args) => listener(context, ...args))

export const once = <Event extends EventName>(event: Event, listener: ListenerOf<Event>) =>
    client.once(event, (...args) => listener(context, ...args))

export type EventName = keyof ClientEvents
export type EventMap = {
    [K in EventName]: ListenerOf<K>
}

type ListenerOf<Event extends EventName> = (
    ...args: [typeof import('$/context'), ...ClientEvents[Event]]
) => void | Promise<void>
