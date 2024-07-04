import { OEM, createWorker as createTesseractWorker } from 'tesseract.js'

import { join as joinPath } from 'path'
import { inspect as inspectObject } from 'util'
import { exists as pathExists } from 'fs/promises'

import Client from './classes/Client'

import {
    type EventContext,
    type WitMessageResponse,
    parseImageEventHandler,
    parseTextEventHandler,
    trainMessageEventHandler,
} from './events'

import { DisconnectReason, HumanizedDisconnectReason, createLogger } from '@revanced/bot-shared'
import { getConfig } from './utils/config'

import { createServer } from 'http'
import { type WebSocket, WebSocketServer } from 'ws'

// Load config, init logger, check environment

const config = getConfig()
const logger = createLogger({
    level: config.logLevel === 'none' ? Number.MAX_SAFE_INTEGER : config.logLevel,
})

if (!process.env['NODE_ENV']) logger.warn('NODE_ENV not set, defaulting to `development`')
const environment = (process.env['NODE_ENV'] ?? 'development') as NodeEnvironment

if (!['development', 'production'].includes(environment)) {
    logger.error('NODE_ENV is neither `development` nor `production`, unable to determine environment')
    logger.info('Set NODE_ENV to blank to use `development` mode')
    process.exit(1)
}

logger.info(`Running in ${environment} mode...`)

if (!process.env['WIT_AI_TOKEN']) {
    logger.error('WIT_AI_TOKEN is not defined in the environment variables')
    process.exit(1)
}

// Workers and API clients

const TesseractWorkerPath = joinPath(import.meta.dir, 'worker', 'index.js')
const TesseractCompiledWorkerExists = await pathExists(TesseractWorkerPath)
const tesseract = await createTesseractWorker(
    'eng',
    OEM.DEFAULT,
    TesseractCompiledWorkerExists ? { workerPath: TesseractWorkerPath } : undefined,
)

const wit = {
    token: process.env['WIT_AI_TOKEN']!,
    async fetch(route: string, options?: RequestInit) {
        const res = await fetch(`https://api.wit.ai${route}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            ...options,
        })

        if (!res.ok) throw new Error(`Failed to fetch from Wit.ai: ${res.statusText} (${res.status})`)

        return await res.json()
    },
    message(text: string) {
        return this.fetch(`/message?q=${encodeURIComponent(text)}&n=8`) as Promise<WitMessageResponse>
    },
    async train(text: string, label: string) {
        await this.fetch('/utterances', {
            body: JSON.stringify([
                {
                    text,
                    intent: label,
                    entities: [],
                    traits: [],
                },
            ]),
            method: 'POST',
        })
    },
} as const

// Server logic

const clientMap = new WeakMap<WebSocket, Client>()
const eventContext: EventContext = {
    tesseract,
    logger,
    wit,
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
        })

        clientMap.set(socket, client)

        logger.debug(`Client ${client.id}'s instance has been added`)
        logger.info(`New client connected with ID: ${client.id}`)

        client.on('disconnect', reason => {
            logger.info(
                `Client ${client.id} disconnected because client ${HumanizedDisconnectReason[reason]} (${reason})`,
            )
        })

        client.on('parseText', packet => parseTextEventHandler(packet, eventContext))
        client.on('parseImage', packet => parseImageEventHandler(packet, eventContext))
        client.on('trainMessage', packet => trainMessageEventHandler(packet, eventContext))

        if (['debug', 'trace'].includes(config.logLevel)) {
            logger.debug('Debug logs enabled, attaching debug events...')

            client.on('packet', ({ client, ...rawPacket }) =>
                logger.debug(`Packet received from client ${client.id}: ${inspectObject(rawPacket)}`),
            )

            client.on('message', d => logger.debug(`Message from client ${client.id}:`, d))
        }
    } catch (e) {
        if (e instanceof Error) logger.error(e.stack ?? e.message)
        else logger.error(inspectObject(e))

        const client = clientMap.get(socket)

        if (!client) {
            logger.error(
                'Missing client instance when encountering an error. If the instance still exists in memory, it will NOT be removed!',
            )
            return socket.terminate()
        }

        if (client.disconnected === false) client.disconnect(DisconnectReason.ServerError)

        logger.debug(`Client ${client.id} disconnected because of an internal error`)
    }
})

// Start the server

server.listen(config.port, config.address)

logger.debug(`Starting with these configurations: ${inspectObject(config)}`)

const addressInfo = wss.address()
if (!addressInfo || typeof addressInfo !== 'object')
    logger.debug('Server started, but cannot determine address information')
else logger.info(`Server started at: ${addressInfo.address}:${addressInfo.port}`)
