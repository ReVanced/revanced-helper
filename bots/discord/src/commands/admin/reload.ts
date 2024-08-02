import { AdminCommand } from '$/classes/Command'
import { join, dirname } from 'path'

import type { Config } from 'config.schema'

export default new AdminCommand({
    name: 'reload',
    description: 'Reload configuration',
    async execute(context, trigger) {
        context.config = ((await import(join(dirname(Bun.main), '..', 'config.js'))) as { default: Config }).default

        await trigger.reply({
            content: 'Reloaded configuration',
            ephemeral: true,
        })
    },
})
