import { SlashCommandBuilder } from 'discord.js'

import type { Command } from '..'

import { config } from '$/context'
import { applyReferenceToModerationActionEmbed, createModerationActionEmbed } from '$/utils/discord/embeds'

export default {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user')
        .addUserOption(option => option.setName('user').setRequired(true).setDescription('The user to unban'))
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ config, logger }, interaction) {
        const user = interaction.options.getUser('member', true)

        await interaction.guild!.members.unban(
            user,
            `Unbanned by moderator ${interaction.user.tag} (${interaction.user.id})`,
        )

        const embed = createModerationActionEmbed('Unbanned', user, interaction.user)
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
