import { SlashCommandBuilder } from 'discord.js'

import type { Command } from '..'

import { config } from '$/context'
import { applyReferenceToModerationActionEmbed, createModerationActionEmbed } from '$/utils/discord/embeds'
import { parseDuration } from '$/utils/duration'

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user')
        .addUserOption(option => option.setName('user').setRequired(true).setDescription('The user to ban'))
        .addStringOption(option => option.setName('reason').setDescription('The reason for banning the user'))
        .addStringOption(option =>
            option.setName('dmd').setDescription('Duration to delete messages (must be from 0 to 7 days)'),
        )
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ config, logger }, interaction) {
        const user = interaction.options.getUser('member', true)
        const reason = interaction.options.getString('reason') ?? undefined
        const dmd = interaction.options.getString('dmd')

        const dms = Math.floor(dmd ? parseDuration(dmd) : 0 / 1000)
        await interaction.guild!.members.ban(user, {
            reason: `Banned by moderator ${interaction.user.tag} (${interaction.user.id}): ${reason}`,
            deleteMessageSeconds: dms,
        })

        const embed = createModerationActionEmbed('Banned', user, interaction.user, reason ?? 'No reason provided')
        const reply = await interaction.reply({ embeds: [embed] }).then(it => it.fetch())

        const logConfig = config.moderation?.log
        if (logConfig) {
            const channel = await interaction.guild!.channels.fetch(logConfig.thread ?? logConfig.channel)
            if (!channel || !channel.isTextBased())
                return void logger.warn('The moderation log channel does not exist, skipping logging')

            await channel.send({ embeds: [applyReferenceToModerationActionEmbed(embed, reply.url)] })
        }
    },
} satisfies Command
