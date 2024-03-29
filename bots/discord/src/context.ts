import { loadCommands } from '$utils/discord/commands'
import { Client as APIClient } from '@revanced/bot-api'
import { createLogger } from '@revanced/bot-shared'
import { ActivityType, Client as DiscordClient, Partials } from 'discord.js'
import config from '../config'
import { LabeledResponseDatabase } from './classes/Database'
import { pathJoinCurrentDir } from './utils/fs'

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

export const database = {
    labeledResponses: new LabeledResponseDatabase(),
} as const

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
