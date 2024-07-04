import { inspect } from 'util'
import { SlashCommandBuilder } from 'discord.js'

import { createSuccessEmbed } from '$/utils/discord/embeds'
import type { Command } from '../types'

export default {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Make the bot less sentient by evaluating code')
        .addStringOption(option => option.setName('code').setDescription('The code to evaluate').setRequired(true))
        .setDMPermission(true)
        .toJSON(),

    ownerOnly: true,
    global: true,

    async execute(_, interaction) {
        const code = interaction.options.getString('code', true)

        await interaction.reply({
            ephemeral: true,
            embeds: [
                createSuccessEmbed('Evaluate', `\`\`\`js\n${code}\`\`\``).addFields({
                    name: 'Result',
                    // biome-ignore lint/security/noGlobalEval: Deal with it
                    value: `\`\`\`js\n${inspect(eval(code), { depth: 1 })}\`\`\``,
                }),
            ],
        })
    },
} satisfies Command
