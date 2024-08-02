import { inspect } from 'util'
import { runInThisContext } from 'vm'
import { ApplicationCommandOptionType } from 'discord.js'

import { AdminCommand } from '$/classes/Command'
import { createSuccessEmbed } from '$/utils/discord/embeds'

export default new AdminCommand({
    name: 'eval',
    description: 'Make the bot less sentient by evaluating code',
    options: {
        code: {
            description: 'The code to evaluate',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        ['show-hidden']: {
            description: 'Show hidden properties',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        },
    },
    async execute(_, trigger, { code, 'show-hidden': showHidden }) {
        await trigger.reply({
            ephemeral: true,
            embeds: [
                createSuccessEmbed('Evaluate', `\`\`\`js\n${code}\`\`\``).addFields({
                    name: 'Result',
                    value: `\`\`\`js\n${inspect(runInThisContext(code), { depth: 1, showHidden, getters: true, numericSeparator: true, showProxy: true })}\`\`\``,
                }),
            ],
        })
    },
})
