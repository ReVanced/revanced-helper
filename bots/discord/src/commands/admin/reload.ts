import { AdminCommand } from '$/classes/Command'
import { join, dirname } from 'path'

import type { Config } from 'config.schema'

export default new AdminCommand({
    name: 'reload',
    description: 'Reload configuration',
    async execute(context, trigger) {
        const { api, logger, discord } = context
        context.config = ((await import(join(dirname(Bun.main), '..', 'config.js'))) as { default: Config }).default

        if ('deferReply' in trigger) await trigger.deferReply({ ephemeral: true })

        logger.info('Reinitializing API client to reload configuration...')
        await api.client.ws.setOptions(
            {
                url: context.config.api.url,
            },
            false,
        )
        api.intentionallyDisconnecting = true
        api.client.disconnect(true)
        api.disconnectCount = 0
        api.intentionallyDisconnecting = false
        await api.client.connect()

        logger.info('Reinitializing Discord client to reload configuration...')
        await discord.client.destroy()
        // discord.client.token only gets set whenever a new Client is intialized
        // so that's why we need to provide the token here :/
        await discord.client.login(process.env['DISCORD_TOKEN'])

        // @ts-expect-error: TypeScript dum
        await trigger[('deferReply' in trigger ? 'editReply' : 'reply')]({ content: 'Reloaded configuration' })
    },
})
