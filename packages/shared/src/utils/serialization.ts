import * as BSON from 'bson'
import { Packet, PacketSchema } from '../schemas/index.js'
import { Operation } from '../constants/index.js'
import { parse } from 'valibot'

/**
 * Compresses a packet into a buffer
 * @param packet The packet to compress
 * @returns A buffer of the compressed packet
 */
export function serializePacket<TOp extends Operation>(packet: Packet<TOp>) {
    return BSON.serialize(packet)
}

/**
 * Decompresses a buffer into a packet
 * @param buffer The buffer to decompress
 * @returns A packet
 */
export function deserializePacket(buffer: Buffer) {
    const data = BSON.deserialize(buffer)
    return parse(PacketSchema, data) as Packet
}