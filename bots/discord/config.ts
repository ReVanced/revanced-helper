import type { Config } from './config.schema'

export default {
    owners: ['USER_ID_HERE'],
    guilds: ['GUILD_ID_HERE'],
    moderation: {
        cure: {
            defaultName: 'Server member',
        },
        roles: ['ROLE_ID_HERE'],
        log: {
            channel: 'CHANNEL_ID_HERE',
            // Optional
            thread: 'THREAD_ID_HERE',
        },
    },
    rolePresets: {
        guilds: {
            GUILD_ID_HERE: {
                preset: {
                    give: ['ROLE_ID_HERE'],
                    take: ['ROLE_ID_HERE'],
                },
                anotherPreset: {
                    give: ['ROLE_ID_HERE'],
                    take: ['ROLE_ID_HERE'],
                },
            },
        },
        checkExpiredEvery: 3600,
    },
    messageScan: {
        filter: {
            channels: ['CHANNEL_ID_HERE'],
            roles: ['ROLE_ID_HERE'],
            users: ['USER_ID_HERE'],
            whitelist: false,
        },
        humanCorrections: {
            falsePositiveLabel: 'false_positive',
            allow: {
                members: {
                    permissions: 8n,
                    roles: ['ROLE_ID_HERE'],
                },
            },
        },
        allowedAttachmentMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        responses: [
            {
                triggers: {
                    text: [/^regexp?$/, { label: 'label', threshold: 0.85 }],
                },
                response: {
                    title: 'Embed title',
                    description: 'Embed description',
                    fields: [
                        {
                            name: 'Field name',
                            value: 'Field value',
                        },
                    ],
                },
            },
        ],
    },
    logLevel: 'log',
    api: {
        url: 'ws://127.0.0.1:3000',
        disconnectLimit: 3,
    },
} satisfies Config as Config
