import { EmbedBuilder, GuildChannel, SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import { config } from '$/context'
import { applyCommonEmbedStyles } from '$/utils/discord/embeds'

import type { Command } from '..'

export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge messages from a channel')
        .addIntegerOption(option =>
            option.setName('amount').setDescription('The amount of messages to remove').setMaxValue(100).setMinValue(1),
        )
        .addUserOption(option =>
            option.setName('user').setDescription('The user to remove messages from (needs `until`)'),
        )
        .addStringOption(option =>
            option.setName('until').setDescription('The message ID to remove messages until (overrides `amount`)'),
        )
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ logger }, interaction) {
        const amount = interaction.options.getInteger('amount')
        const user = interaction.options.getUser('user')
        const until = interaction.options.getString('until')

        if (!amount && !until)
            throw new CommandError(CommandErrorType.MissingArgument, 'Either `amount` or `until` must be provided.')

        const channel = interaction.channel!
        if (!(channel.isTextBased() && channel instanceof GuildChannel))
            throw new CommandError(CommandErrorType.InvalidChannel, 'The supplied channel is not a text channel.')

        const embed = applyCommonEmbedStyles(
            new EmbedBuilder({
                title: 'Purging messages',
                description: 'Accumulating messages...',
            }),
            true,
            true,
            true,
        )

        const msgsPromise = channel.messages.fetch(until ? { after: until } : { limit: amount! })
        const reply = await interaction.reply({ embeds: [embed] }).then(it => it.fetch())

        const messages = (
            user ? (await msgsPromise).filter(msg => msg.author.id === user.id) : await msgsPromise
        ).filter(msg => msg.id !== reply.id)

        await channel.bulkDelete(messages, true)

        logger.info(
            `Moderator ${interaction.user.tag} (${interaction.user.id}) purged ${messages.size} messages in #${channel.name} (${channel.id})`,
        )
        await reply.edit({
            embeds: [
                embed.setTitle('Purged messages').setDescription(null).addFields({
                    name: 'Deleted messages',
                    value: messages.size.toString(),
                }),
            ],
        })
    },
} satisfies Command
