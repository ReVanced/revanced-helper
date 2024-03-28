import type { Packet, ServerOperation } from '@revanced/bot-shared'
import type { ClientWebSocketManager } from 'src/classes'

export function awaitPacket<TOp extends ServerOperation>(
    ws: ClientWebSocketManager,
    op: TOp,
    expectedSeq: number,
    timeout = 10000,
): Promise<Packet<TOp>> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            ws.off('packet', handler)
            reject('Awaiting packet timed out')
        }, timeout)

        function handler(packet: Packet) {
            if (packet.op === op && packet.s === expectedSeq) {
                clearTimeout(timer)
                ws.off('packet', handler)
                resolve(packet as Packet<TOp>)
            }
        }

        ws.on('packet', handler)
    })
}
