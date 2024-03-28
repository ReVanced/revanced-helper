export default {
    owners: ['USER_ID_HERE'],
    allowedGuilds: ['GUILD_ID_HERE'],
    messageScan: {
        channels: ['CHANNEL_ID_HERE'],
        roles: ['ROLE_ID_HERE'],
        users: ['USER_ID_HERE'],
        whitelist: false,
        humanCorrections: {
            falsePositiveLabel: 'false_positive',
            allowUsers: ['USER_ID_HERE'],
            memberRequirements: {
                permissions: 8n,
                roles: ['ROLE_ID_HERE'],
            },
        },
        allowedAttachmentMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        responses: [
            {
                triggers: [/^regexp?$/, { label: 'label', threshold: 0.85 }],
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
        websocketUrl: 'ws://127.0.0.1:3000',
    },
} as Config

export type Config = {
    owners: string[]
    allowedGuilds: string[]
    messageScan?: Partial<{
        roles: string[]
        users: string[]
        channels: string[]
        humanCorrections: {
            falsePositiveLabel: string
            allowUsers?: string[]
            memberRequirements?: {
                permissions?: bigint
                roles?: string[]
            }
        }
        responses: ConfigMessageScanResponse[]
    }> & { whitelist: boolean; allowedAttachmentMimeTypes: string[] }
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'log' | 'trace' | 'debug'
    api: {
        websocketUrl: string
    }
}

export type ConfigMessageScanResponse = {
    triggers: Array<RegExp | ConfigMessageScanResponseLabelConfig>
    response: ConfigMessageScanResponseMessage | null
}

export type ConfigMessageScanResponseLabelConfig = {
    label: string
    threshold: number
}

export type ConfigMessageScanResponseMessage = {
    title: string
    description?: string
    fields?: Array<{
        name: string
        value: string
    }>
}
