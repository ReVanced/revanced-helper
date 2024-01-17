import witPkg from 'node-wit'
import { createWorker as createTesseractWorker } from 'tesseract.js'
const { Wit } = witPkg

import { inspect as inspectObject } from 'util'

import Client from './classes/Client'

import { EventContext, parseImageEventHandler, parseTextEventHandler } from './events/index'

import { DisconnectReason, HumanizedDisconnectReason, createLogger } from '@revanced/bot-shared'
import { checkEnvironment, getConfig } from './utils/index'

import { createServer } from 'http'
import { WebSocket, WebSocketServer } from 'ws'

// Load config, init logger, check environment

const config = getConfig()
const logger = createLogger({
    level: config['consoleLogLevel'] === 'none' ? Infinity : config['consoleLogLevel'],
})

checkEnvironment(logger)

// Workers and API clients

const tesseractWorker = await createTesseractWorker('eng')
const witClient = new Wit({
    accessToken: process.env['WIT_AI_TOKEN']!,
})

// Server logic

const clients = new Set<Client>()
const clientSocketMap = new WeakMap<WebSocket, Client>()
const eventContext: EventContext = {
    tesseractWorker,
    logger,
    witClient,
    config,
}

const server = createServer()

const wss = new WebSocketServer({
    // 16 KiB max payload
    // A Discord message can not be longer than 4000 characters
    // OCR should not be longer than 16000 characters
    maxPayload: 16 * 1024,
    server,
})

wss.on('connection', async (socket, request) => {
    try {
        if (!request.socket.remoteAddress) {
            socket.close()
            return logger.warn('Connection failed because client is missing remote address')
        }

        const client = new Client({
            socket,
            id: `${request.socket.remoteAddress}:${request.socket.remotePort}`,
            heartbeatInterval: config['clientHeartbeatInterval'],
        })

        clientSocketMap.set(socket, client)
        clients.add(client)

        logger.debug(`Client ${client.id}'s instance has been added`)
        logger.info(`New client connected (now ${clients.size} clients) with ID:`, client.id)

        client.on('disconnect', reason => {
            clients.delete(client)
            logger.info(`Client ${client.id} disconnected because client ${HumanizedDisconnectReason[reason]}`)
        })

        client.on('parseText', async packet => parseTextEventHandler(packet, eventContext))

        client.on('parseImage', async packet => parseImageEventHandler(packet, eventContext))

        if (['debug', 'trace'].includes(config['consoleLogLevel'])) {
            logger.debug('Debug logs enabled, attaching debug events...')

            client.on('packet', ({ client, ...rawPacket }) =>
                logger.debug(`Packet received from client ${client.id}: ${inspectObject(rawPacket)}`),
            )

            client.on('message', d => logger.debug(`Message from client ${client.id}:`, d))

            client.on('heartbeat', () => logger.debug('Heartbeat received from client', client.id))
        }
    } catch (e) {
        if (e instanceof Error) logger.error(e.stack ?? e.message)
        else logger.error(inspectObject(e))

        const client = clientSocketMap.get(socket)

        if (!client) {
            logger.error(
                'Missing client instance when encountering an error. If the instance still exists in memory, it will NOT be removed!',
            )
            return socket.terminate()
        }

        if (client.disconnected === false) client.disconnect(DisconnectReason.ServerError)
        else client.forceDisconnect()

        clients.delete(client)

        logger.debug(`Client ${client.id} disconnected because of an internal error`)
    }
})

// Start the server

server.listen(config['port'], config['address'])

logger.debug(`Starting with these configurations: ${inspectObject(config)}`)

const addressInfo = wss.address()
if (!addressInfo || typeof addressInfo !== 'object')
    logger.debug('Server started, but cannot determine address information')
else logger.info(`Server started at: ${addressInfo.address}:${addressInfo.port}`)
