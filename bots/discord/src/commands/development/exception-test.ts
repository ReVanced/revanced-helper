import { SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import type { Command } from '..'

export default {
    data: new SlashCommandBuilder()
        .setName('exception-test')
        .setDescription('throw up pls')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('The type of exception to throw')
                .addChoices({
                    name: 'process exception',
                    value: 'Process',
                })
                .addChoices({
                    name: 'generic error',
                    value: 'Generic',
                })
                .addChoices({
                    name: 'invalid argument',
                    value: 'InvalidArgument',
                })
                .addChoices({
                    name: 'invalid channel',
                    value: 'InvalidChannel',
                })
                .addChoices({
                    name: 'invalid user',
                    value: 'InvalidUser',
                })
                .addChoices({
                    name: 'invalid duration',
                    value: 'InvalidDuration',
                })
                .setRequired(true),
        )
        .setDMPermission(true)
        .toJSON(),

    ownerOnly: true,
    global: true,

    async execute(_, interaction) {
        const type = interaction.options.getString('type', true)
        if (type === 'Process') throw new Error('Intentional process exception')
        throw new CommandError(CommandErrorType[type as keyof typeof CommandErrorType], 'Intentional bot design') // ;)
    },
} satisfies Command
