import type { Config } from './config.example'

export default {
    owners: ['629368283354628116'],
    allowedGuilds: ['1205207689832038522'],
    messageScan: {
        roles: [],
        users: ['629368283354628116'],
        channels: [],
        whitelist: true,
        humanCorrections: {
            falsePositiveLabel: 'false_positive',
            memberRequirements: {
                permissions: 8n,
            },
        },
        allowedAttachmentMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        responses: [
            {
                triggers: [
                    {
                        label: 'apps_youtube_buffer',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'buffering :jawdroppinbro:',
                },
            },
            {
                triggers: [/eol/],
                response: {
                    title: 'revenge eol',
                    description: 'eol',
                },
            },
            {
                triggers: [/free robux/i],
                response: {
                    title: 'OMG FREE ROBUX????',
                },
            },
            {
                triggers: [/(hello|hi) world/],
                response: {
                    title: 'Hello, World!',
                    description: 'This is a test response.',
                },
            },
            {
                triggers: [
                    /how to download revanced/i,
                    {
                        label: 'download',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'Where or how to get ReVanced ❓',
                    description:
                        'You might have asked a question that has already been answered in <#953993848374325269>. Make sure to read it as it will answer a lot of your questions, guaranteed.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'You can use ReVanced CLI or ReVanced Manager to get ReVanced. Refer to the documentation in <#953993848374325269> `3`.',
                        },
                    ],
                },
            },
            {
                triggers: [{ label: 'false_positive', threshold: 0 }],
                response: null,
            },
        ],
    },
    logLevel: 'debug',
    api: {
        websocketUrl: 'ws://127.0.0.1:3000',
    },
} as Config
