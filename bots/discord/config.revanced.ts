import { PermissionFlagsBits } from 'discord.js'
import type { Config } from './config.example'

export default {
    owners: ['629368283354628116', '737323631117598811', '282584705218510848'],
    guilds: ['952946952348270622'],
    messageScan: {
        filter: {
            // Team, Mod, Immunity
            roles: ['952987191401926697', '955220417969262612', '1027874293192863765'],
            users: [],
            // Team, Development
            channels: ['952987428786941952', '953965039105232906'],
            whitelist: false,
        },
        humanCorrections: {
            falsePositiveLabel: 'false_positive',
            allow: {
                members: {
                    // Team, Supporter
                    roles: ['952987191401926697', '1019903194941362198'],
                    permissions: PermissionFlagsBits.ManageMessages,
                },
            },
        },
        allowedAttachmentMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        responses: [
            {
                triggers: {
                    text: [{ label: 'false_positive', threshold: 0 }],
                },
                response: null,
            },
        ],
    },
    logLevel: 'debug',
    api: {
        websocketUrl: 'ws://127.0.0.1:3000',
    },
} satisfies Config as Config
