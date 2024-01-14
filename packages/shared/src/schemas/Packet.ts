import {
    url,
    AnySchema,
    NullSchema,
    ObjectSchema,
    Output,
    array,
    enum_,
    null_,
    number,
    object,
    parse,
    special,
    string,
    // merge
} from 'valibot'
import DisconnectReason from '../constants/DisconnectReason'
import { ClientOperation, Operation, ServerOperation } from '../constants/Operation'

/**
 * Schema to validate packets
 */
export const PacketSchema = special<Packet>(input => {
    if (
        typeof input === 'object' &&
        input &&
        'op' in input &&
        typeof input.op === 'number' &&
        input.op in Operation &&
        'd' in input &&
        typeof input.d === 'object'
    ) {
        try {
            parse(PacketDataSchemas[input.op as Operation], input.d)
            return true
        } catch {
            return false
        }
    }
    return false
}, 'Invalid packet data')

/**
 * Schema to validate packet data for each possible operations
 */
export const PacketDataSchemas = {
    [ServerOperation.Hello]: object({
        heartbeatInterval: number(),
    }),
    [ServerOperation.HeartbeatAck]: object({
        nextHeartbeat: number(),
    }),
    [ServerOperation.ParsedText]: object({
        id: string(),
        labels: array(
            object({
                name: string(),
                confidence: special<number>(input => typeof input === 'number' && input >= 0 && input <= 1),
            }),
        ),
    }),
    [ServerOperation.ParsedImage]: object({
        id: string(),
        text: string(),
    }),
    [ServerOperation.ParseTextFailed]: object({
        id: string(),
    }),
    [ServerOperation.ParseImageFailed]: object({
        id: string(),
    }),
    [ServerOperation.Disconnect]: object({
        reason: enum_(DisconnectReason),
    }),

    [ClientOperation.Heartbeat]: null_(),
    [ClientOperation.ParseText]: object({
        id: string(),
        text: string(),
    }),
    [ClientOperation.ParseImage]: object({
        id: string(),
        image_url: string([url()]),
    }),
} as const satisfies Record<
    Operation,
    // biome-ignore lint/suspicious/noExplicitAny: This is a schema, it's not possible to type it
    ObjectSchema<any> | AnySchema | NullSchema
>

export type Packet<TOp extends Operation = Operation> = {
    op: TOp
    d: Output<(typeof PacketDataSchemas)[TOp]>
}
