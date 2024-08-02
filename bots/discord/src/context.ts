import { Database } from 'bun:sqlite'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { Client as APIClient } from '@revanced/bot-api'
import { createLogger } from '@revanced/bot-shared'
import { Client as DiscordClient, type Message, Partials } from 'discord.js'
import { drizzle } from 'drizzle-orm/bun-sqlite'

// Export some things first, as commands require them
import config from '../config.js'
export { config }

export const logger = createLogger({
    level: config.logLevel === 'none' ? Number.MAX_SAFE_INTEGER : config.logLevel,
})

import * as commands from './commands'
import * as schemas from './database/schemas'

import type { default as Command, CommandOptionsOptions } from './classes/Command'

export const api = {
    client: new APIClient({
        api: {
            websocket: {
                url: config.api.url,
            },
        },
    }),
    intentionallyDisconnecting: false,
    disconnectCount: 0,
}

const DatabasePath = process.env['DATABASE_PATH']
const DatabaseSchemaDir = join(import.meta.dir, '..', '.drizzle')

let dbSchemaFileName: string | undefined

if (DatabasePath && !existsSync(DatabasePath)) {
    logger.warn('Database file not found, trying to create from schema...')

    try {
        const file = readdirSync(DatabaseSchemaDir, { withFileTypes: true })
            .filter(file => file.isFile() && file.name.endsWith('.sql'))
            .sort()
            .at(-1)

        if (!file) throw new Error('No schema file found')

        dbSchemaFileName = file.name
        logger.debug(`Using schema file: ${dbSchemaFileName}`)
    } catch (e) {
        logger.fatal('Could not create database from schema, check if the schema file exists and is accessible')
        logger.fatal(e)
        process.exit(1)
    }
}

const db = new Database(DatabasePath, { readwrite: true, create: true })
if (dbSchemaFileName) db.run(readFileSync(join(DatabaseSchemaDir, dbSchemaFileName)).toString())

export const database = drizzle(db, {
    schema: schemas,
})

export const discord = {
    client: new DiscordClient({
        intents: [
            'Guilds',
            'GuildMembers',
            'GuildModeration',
            'GuildMessages',
            'GuildMessageReactions',
            'DirectMessages',
            'DirectMessageReactions',
            'MessageContent',
        ],
        allowedMentions: {
            parse: ['users'],
            repliedUser: true,
        },
        partials: [Partials.Message, Partials.Reaction],
    }),
    commands: Object.fromEntries(Object.values(commands).map(cmd => [cmd.name, cmd])) as Record<
        string,
        Command<boolean, CommandOptionsOptions | undefined, boolean>
    >,
    stickyMessages: {} as Record<
        string,
        Record<
            string,
            {
                forceSendTimerActive?: boolean
                timeoutMs: number
                forceSendMs?: number
                send: (forced?: boolean) => Promise<void>
                currentMessage?: Message<true>
                interval?: NodeJS.Timeout
                forceSendInterval?: NodeJS.Timeout
            }
        >
    >,
} as const
