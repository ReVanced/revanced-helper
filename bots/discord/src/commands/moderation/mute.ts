import { SlashCommandBuilder } from 'discord.js'

import CommandError, { CommandErrorType } from '$/classes/CommandError'
import { applyRolePreset } from '$/utils/discord/rolePresets'
import type { Command } from '..'

import { config } from '$/context'
import { applyReferenceToModerationActionEmbed, createModerationActionEmbed } from '$/utils/discord/embeds'
import { parse } from 'simple-duration'

export default {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member')
        .addUserOption(option => option.setName('member').setRequired(true).setDescription('The member to mute'))
        .addStringOption(option => option.setName('reason').setDescription('The reason for muting the member'))
        .addStringOption(option => option.setName('duration').setDescription('The duration of the mute'))
        .toJSON(),

    memberRequirements: {
        roles: config.moderation?.roles ?? [],
    },

    global: false,

    async execute({ config, logger }, interaction) {
        const user = interaction.options.getUser('member', true)
        const reason = interaction.options.getString('reason')
        const duration = interaction.options.getString('duration')
        const durationMs = duration ? parse(duration) : null

        if (Number.isInteger(durationMs) && durationMs! < 1)
            throw new CommandError(
                CommandErrorType.InvalidDuration,
                'The duration must be at least 1 millisecond long.',
            )

        const member = await interaction.guild!.members.fetch(user.id)
        if (!member)
            throw new CommandError(
                CommandErrorType.InvalidUser,
                'The provided member is not in the server or does not exist.',
            )

        await applyRolePreset(member, 'mute', durationMs ? Date.now() + durationMs : null)

        const embed = createModerationActionEmbed(
            'Muted',
            user,
            interaction.user,
            reason ?? 'No reason provided',
            durationMs,
        )

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
