import { inspect } from 'util'
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
                    // biome-ignore lint/security/noGlobalEval: This is fine as it's an admin command
                    value: `\`\`\`js\n${inspect(eval(code), {
                        depth: 1,
                        showHidden,
                        getters: true,
                        numericSeparator: true,
                        showProxy: true,
                    })}\`\`\``,
                }),
            ],
        })
    },
})
