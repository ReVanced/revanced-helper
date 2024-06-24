import { SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import { applyReferenceToModerationActionEmbed, createModerationActionEmbed } from '$/utils/discord/embeds'
import { removeRolePreset } from '$/utils/discord/rolePresets'
import type { Command } from '..'

export default {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a member')
        .addUserOption(option => option.setName('member').setRequired(true).setDescription('The member to unmute'))
        .toJSON(),

    memberRequirements: {
        permissions: 8n,
    },

    global: false,

    async execute({ config, logger }, interaction) {
        const user = interaction.options.getUser('member', true)
        const member = await interaction.guild!.members.fetch(user.id)
        if (!member)
            throw new CommandError(
                CommandErrorType.InvalidUser,
                'The provided member is not in the server or does not exist.',
            )

        await removeRolePreset(member, 'mute')
        const embed = createModerationActionEmbed('Unmuted', user, interaction.user)

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
