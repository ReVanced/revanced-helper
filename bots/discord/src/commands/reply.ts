import { PermissionFlagsBits, SlashCommandBuilder, type TextBasedChannel } from 'discord.js'
import type { Command } from '.'

export default {
    data: new SlashCommandBuilder()
        .setName('reply')
        .setDescription('Send a message as the bot')
        .addStringOption(option => option.setName('message').setDescription('The message to send').setRequired(true))
        .addStringOption(option =>
            option
                .setName('reference')
                .setDescription('The message ID to reply to (use `latest` to reply to the latest message)')
                .setRequired(false),
        )
        .toJSON(),

    memberRequirements: {
        mode: 'all',
        roles: ['955220417969262612', '973886585294704640'],
        permissions: PermissionFlagsBits.ManageMessages,
    },

    global: false,

    async execute({ logger }, interaction) {
        const msg = interaction.options.getString('message', true)
        const ref = interaction.options.getString('reference')

        const resolvedRef = ref?.startsWith('latest')
            ? (await interaction.channel?.messages.fetch({ limit: 1 }))?.at(0)?.id
            : ref

        try {
            const channel = (await interaction.guild!.channels.fetch(interaction.channelId)) as TextBasedChannel | null
            if (!channel) throw new Error('Channel not found (or not cached)')

            await channel.send({
                content: msg,
                reply: {
                    messageReference: resolvedRef!,
                    failIfNotExists: true,
                },
            })

            logger.warn(`User ${interaction.user.tag} made the bot say: ${msg}`)
            await interaction.reply({
                content: 'OK!',
                ephemeral: true,
            })
        } catch (e) {
            await interaction.reply({})
        }
    },
} satisfies Command
