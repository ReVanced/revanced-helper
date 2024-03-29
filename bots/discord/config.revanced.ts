import { PermissionFlagsBits } from 'discord.js'
import type { Config } from './config.example'

export default {
    owners: ['629368283354628116', '737323631117598811', '282584705218510848'],
    allowedGuilds: ['952946952348270622'],
    messageScan: {
        // Team, Mod, Immunity
        roles: ['952987191401926697', '955220417969262612', '1027874293192863765'],
        users: [],
        // Team, Development
        channels: ['952987428786941952', '953965039105232906'],
        whitelist: false,
        humanCorrections: {
            falsePositiveLabel: 'false_positive',
            memberRequirements: {
                // Team, Supporter
                roles: ['952987191401926697', '1019903194941362198'],
                permissions: PermissionFlagsBits.ManageMessages,
            },
        },
        allowedAttachmentMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        responses: [
            {
                triggers: [
                    {
                        label: 'suggested_version',
                        threshold: 0.85,
                    },
                ],
                reply: {
                    title: 'Which version is suggested ❓',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'The suggested version can be seen in ReVanced Manager in the app selector screen. Refer to the ReVanced Manager documentation in <#953993848374325269> `3`.',
                        },
                    ],
                },
            },
            {
                triggers: [
                    /(re)?v[ae]nced? crash/i,
                    {
                        label: 'revanced_crash',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'Why am I experiencing crashes ❓',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'You may have patched an unsuggested version of the app, changed the selection of patches or used a faulty APK. Refer to the documentation in <#953993848374325269> `3` in order to correctly patch your app correctly using ReVanced CLI or ReVanced Manager.',
                        },
                    ],
                },
            },
            {
                triggers: [
                    /manager abort(ed)?/i,
                    {
                        label: 'rvmanager_abort',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'Why is ReVanced Manager aborting ❓',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'Your device may be unsupported by ReVanced Manager. Refer to the documentation in <#953993848374325269> `3` in order to use ReVanced CLI or check if your device is supported by ReVanced Manager.',
                        },
                    ],
                },
            },
            {
                triggers: [
                    /(how|where|what).{0,15}(download|install|get) (re)?v[ae]nced?/i,
                    {
                        label: 'revanced_download',
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
                triggers: [
                    /(re)?v[ae]nced?( on)?( android)? tv/i,
                    {
                        label: 'androidtv_support',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'Does ReVanced support YouTube for Android TVs ❓',
                    description:
                        'You might have asked a question that has already been answered in <#953993848374325269>. Make sure to read it as it will answer a lot of your questions, guaranteed.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'Please refer to <#953993848374325269> `5`. Alternative, there is [SmartTubeNext](https://github.com/yuliskov/SmartTubeNext#smarttube).',
                        },
                    ],
                },
            },
            {
                triggers: [
                    {
                        label: 'revanced_nodownloader',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'How do I download videos on YouTube ❓',
                    description:
                        'You might have asked a question that has already been answered in <#953993848374325269>. Make sure to read it as it will answer a lot of your questions, guaranteed.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'In order to be able to download videos on YouTube without YouTube Premium, you can patch YouTube with the `External downloads` patch. You can configure the downloader in the settings of the patched app. NewPipe is the default downloader. Please refer to <#953993848374325269> `24`.',
                        },
                    ],
                },
            },
            {
                triggers: [
                    {
                        label: 'revanced_casting',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'Why can I not cast videos on YouTube ❓',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'You may have patched YouTube with the `GmsCore support` patch which makes YouTube use Vanced MicroG instead of Google Services, but Vanced MicroG does not reliably support casting. In order to be able to cast videos on the patched app, you should not patch the app with the `GmsCore support` patch, but then you are forced to mount the patched app with root permissions, because you will not be able to install the app in normal circumstances and Google Services will reject the patched app.',
                        },
                    ],
                },
            },
            {
                triggers: [
                    /(where|what|how).{0,15}(get|install|download) ((vanced )?microg|gms(core)?)/i,
                    {
                        label: 'microg_download',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'Where can I get GmsCore ❓',
                    description:
                        'You might have asked a question that has already been answered in <#953993848374325269>. Make sure to read it as it will answer a lot of your questions, guaranteed.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'If you patched YouTube using the `GmsCore support` patch, the patched app will redirect you to the download link of GmsCore if you open it. In case it does not, please refer to <#953993848374325269> `17`.',
                        },
                    ],
                },
            },
            {
                triggers: [
                    {
                        label: 'microg_nointernet',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'Why does YouTube say, I am offline ❓',
                    description:
                        'You might have asked a question that has already been answered in <#953993848374325269>. Make sure to read it as it will answer a lot of your questions, guaranteed.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'Please refer to <#953993848374325269> `15`.',
                        },
                    ],
                },
            },
            {
                triggers: [
                    /revanced\.[^a][^p]?[^p]?/i,
                    {
                        label: 'rvdownload_unofficial',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'What are the official links of ReVanced ❓',
                    description: 'A list of official links can be found in <#954066838856273960>.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'ReVanced is always available at [revanced.app](https://revanced.app).',
                        },
                    ],
                },
            },
            {
                triggers: [
                    /(re)?v[ae]nced?( videos?)? ((not )?loading|buffering)/i,
                    {
                        label: 'yt_buffering',
                        threshold: 0.85,
                    },
                ],
                response: {
                    title: 'Why do videos fail to play❓',
                    description:
                        'You might have asked a question that has been answered in the <#953993848374325269> channel already. Make sure to read it as it will answer a lot of your questions, guaranteed.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'Please refer to <#953993848374325269> `32`.',
                        },
                    ],
                },
            },
            {
                triggers: [],
                ocrTriggers: [/is not installed/],
                response: {
                    title: 'How do I download videos on YouTube ❓',
                    description:
                        'You might have asked a question that has already been answered in <#953993848374325269>. Make sure to read it as it will answer a lot of your questions, guaranteed.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'In order to be able to download videos on YouTube without YouTube Premium, you can patch YouTube with the `External downloads` patch. You can configure the downloader in the settings of the patched app. NewPipe is the default downloader. Please refer to <#953993848374325269> `24`.',
                        },
                    ],
                },
            },
            {
                triggers: [],
                ocrTriggers: [/You're offline|Please check your/],
                response: {
                    title: 'Why does YouTube say, I am offline ❓',
                    description:
                        'You might have asked a question that has already been answered in <#953993848374325269>. Make sure to read it as it will answer a lot of your questions, guaranteed.',
                    fields: [
                        {
                            name: '🔸 Regarding your question',
                            value: 'Please refer to <#953993848374325269> `15`.',
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
