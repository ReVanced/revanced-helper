import { Database } from 'bun:sqlite'
import { Client as APIClient } from '@revanced/bot-api'
import { createLogger } from '@revanced/bot-shared'
import { ActivityType, Client as DiscordClient, Partials } from 'discord.js'
import { drizzle } from 'drizzle-orm/bun-sqlite'

import config from '../config'
import * as schemas from './database/schemas'

import { loadCommands } from '$utils/discord/commands'
import { pathJoinCurrentDir } from '$utils/fs'

export { config }
export const logger = createLogger({
    level: config.logLevel === 'none' ? Number.MAX_SAFE_INTEGER : config.logLevel,
})

export const api = {
    client: new APIClient({
        api: {
            websocket: {
                url: config.api.websocketUrl,
            },
        },
    }),
    isStopping: false,
    disconnectCount: 0,
}

const db = new Database('db.sqlite')

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
    commands: await loadCommands(pathJoinCurrentDir(import.meta.url, 'commands')),
} as const
