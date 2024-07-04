import { Database } from 'bun:sqlite'
import { Client as APIClient } from '@revanced/bot-api'
import { createLogger } from '@revanced/bot-shared'
import { ActivityType, Client as DiscordClient, Partials } from 'discord.js'
import { drizzle } from 'drizzle-orm/bun-sqlite'

// Export config first, as commands require them
import config from '../config.js'
export { config }

import * as commands from './commands'
import * as schemas from './database/schemas'

import type { Command } from './commands/types'

export const logger = createLogger({
    level: config.logLevel === 'none' ? Number.MAX_SAFE_INTEGER : config.logLevel,
})

export const api = {
    client: new APIClient({
        api: {
            websocket: {
                url: config.api.url,
            },
        },
    }),
    isStopping: false,
    disconnectCount: 0,
}

const db = new Database(process.env['DATABASE_URL'])

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
        presence: {
            activities: [
                {
                    type: ActivityType.Watching,
                    name: 'cat videos',
                },
            ],
        },
    }),
    commands: Object.fromEntries(Object.values<Command>(commands).map((cmd) => [cmd.data.name, cmd])) as Record<string, Command>,
} as const
