import type { APIEmbed } from 'discord.js'

export type Config = {
    owners: string[]
    guilds: string[]
    moderation?: {
        log?: {
            channel: string
            thread?: string
        }
    }
    rolePresets?: {
        checkExpiredEvery: number
        guilds: Record<string, Record<string, RolePresetData>>
    }
    messageScan?: {
        allowedAttachmentMimeTypes: string[]
        filter: {
            roles?: string[]
            users?: string[]
            channels?: string[]
            whitelist: boolean
        }
        humanCorrections: {
            falsePositiveLabel: string
            allow?: {
                users?: string[]
                members?: {
                    permissions?: bigint
                    roles?: string[]
                }
            }
        }
        responses: ConfigMessageScanResponse[]
    }
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'log' | 'trace' | 'debug'
    api: {
        websocketUrl: string
    }
}

export type RolePresetData = {
    give: string[]
    take: string[]
}

export type ConfigMessageScanResponse = {
    triggers: {
        text?: Array<RegExp | ConfigMessageScanResponseLabelConfig>
        image?: Array<RegExp>
    }
    filterOverride?: NonNullable<Config['messageScan']>['filter']
    response: ConfigMessageScanResponseMessage | null
}

export type ConfigMessageScanResponseLabelConfig = {
    /**
     * Label name
     */
    label: string
    /**
     * Confidence threshold
     */
    threshold: number
}

export type ConfigMessageScanResponseMessage = APIEmbed
