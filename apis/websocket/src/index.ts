import fastifyWebsocket from '@fastify/websocket'
import { fastify } from 'fastify'

import witPkg from 'node-wit'
import { createWorker as createTesseractWorker } from 'tesseract.js'
const { Wit } = witPkg

import { inspect as inspectObject } from 'node:util'

import Client from './classes/Client.js'

import { EventContext, parseImageEventHandler, parseTextEventHandler } from './events/index.js'

import { DisconnectReason, HumanizedDisconnectReason, createLogger } from '@revanced/bot-shared'
import { WebSocket } from 'ws'
import { checkEnvironment, getConfig } from './utils/index.js'

// Load config, init logger, check environment

const config = getConfig()
const logger = createLogger('websocket-api', {
    level: config.consoleLogLevel === 'none' ? 'error' : config.consoleLogLevel,
    silent: config.consoleLogLevel === 'none',
})

checkEnvironment(logger)

// Workers and API clients

const tesseractWorker = await createTesseractWorker('eng')
const witClient = new Wit({
    accessToken: process.env['WIT_AI_TOKEN']!,
})

process.on('beforeExit', () => tesseractWorker.terminate())

// Server logic

const clients = new Set<Client>()
const clientSocketMap = new WeakMap<WebSocket, Client>()
const eventContext: EventContext = {
    tesseractWorker,
    logger,
    witClient,
    config,
}

const server = fastify()
    .register(fastifyWebsocket, {
        options: {
            // 16 KiB max payload
            // A Discord message can not be longer than 4000 characters
            // OCR should not be longer than 16000 characters
            maxPayload: 16 * 1024,
        },
    })
    .register(async instance => {
        instance.get('/', { websocket: true }, async (connection, request) => {
            try {
                const client = new Client({
                    socket: connection.socket,
                    id: request.hostname,
                    heartbeatInterval: config.clientHeartbeatInterval,
                })

                clientSocketMap.set(connection.socket, client)
                clients.add(client)

                logger.debug(`Client ${client.id}'s instance has been added`)
                logger.info(`New client connected (now ${clients.size} clients) with ID:`, client.id)

                client.on('disconnect', reason => {
                    clients.delete(client)
                    logger.info(`Client ${client.id} disconnected because client ${HumanizedDisconnectReason[reason]}`)
                })

                client.on('parseText', async packet => parseTextEventHandler(packet, eventContext))

                client.on('parseImage', async packet => parseImageEventHandler(packet, eventContext))

                if (['debug', 'silly'].includes(config.consoleLogLevel)) {
                    logger.debug('Debug logs enabled, attaching debug events...')

                    client.on('packet', ({ client, ...rawPacket }) =>
                        logger.debug(`Packet received from client ${client.id}: ${inspectObject(rawPacket)}`),
                    )

                    client.on('heartbeat', () => logger.debug('Heartbeat received from client', client.id))
                }
            } catch (e) {
                if (e instanceof Error) logger.error(e.stack ?? e.message)
                else logger.error(inspectObject(e))

                const client = clientSocketMap.get(connection.socket)

                if (!client) {
                    logger.error(
                        'Missing client instance when encountering an error. If the instance still exists in memory, it will NOT be removed!',
                    )
                    return connection.socket.terminate()
                }

                if (client.disconnected === false) client.disconnect(DisconnectReason.ServerError)
                else client.forceDisconnect()

                clients.delete(client)

                logger.debug(`Client ${client.id} disconnected because of an internal error`)
            }
        })
    })

// Start the server

logger.debug(`Starting with these configurations: ${inspectObject(config)}`, )

await server.listen({
    host: config.address ?? '0.0.0.0',
    port: config.port ?? 80,
})

const addressInfo = server.server.address()
if (!addressInfo || typeof addressInfo !== 'object')
    logger.debug('Server started, but cannot determine address information')
else logger.info(`Server started at: ${addressInfo.address}:${addressInfo.port}`)
