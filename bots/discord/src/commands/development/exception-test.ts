import { SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import type { Command } from '../types'

export default {
    data: new SlashCommandBuilder()
        .setName('exception-test')
        .setDescription('Makes the bot intentionally hate you by throwing an exception')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('The type of exception to throw')
                .setRequired(true)
                .addChoices(
                    Object.keys(CommandErrorType).map(
                        k =>
                            ({
                                name: k,
                                value: k,
                            }) as const,
                    ),
                ),
        )
        .setDMPermission(true)
        .toJSON(),

    adminOnly: true,
    global: true,

    async execute(_, interaction) {
        const type = interaction.options.getString('type', true)
        if (type === 'Process') throw new Error('Intentional process exception')
        throw new CommandError(CommandErrorType[type as keyof typeof CommandErrorType], 'Intentional bot design') // ;)
    },
} satisfies Command
