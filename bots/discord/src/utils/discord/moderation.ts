import { config, logger } from '$/context'
import type { ChatInputCommandInteraction, EmbedBuilder, Guild, User } from 'discord.js'
import { applyReferenceToModerationActionEmbed, createModerationActionEmbed } from './embeds'

const PresetLogAction = {
    apply: 'Applied role preset to',
    remove: 'Removed role preset from',
} as const

export const sendPresetReplyAndLogs = (
    action: keyof typeof PresetLogAction,
    interaction: ChatInputCommandInteraction,
    user: User,
    preset: string,
    expires?: number | null,
) =>
    sendModerationReplyAndLogs(
        interaction,
        createModerationActionEmbed(PresetLogAction[action], user, interaction.user, undefined, expires, [
            [{ name: 'Preset', value: preset, inline: true }],
        ]),
    )

export const sendModerationReplyAndLogs = async (interaction: ChatInputCommandInteraction, embed: EmbedBuilder) => {
    const reply = await interaction.reply({ embeds: [embed] }).then(it => it.fetch())
    const logChannel = await getLogChannel(interaction.guild!)
    await logChannel?.send({ embeds: [applyReferenceToModerationActionEmbed(embed, reply.url)] })
}

export const getLogChannel = async (guild: Guild) => {
    const logConfig = config.moderation?.log
    if (!logConfig) return

    try {
        const channel = await guild.channels.fetch(logConfig.thread ?? logConfig.channel)
        if (!channel || !channel.isTextBased())
            return void logger.warn('The moderation log channel does not exist, skipping logging')

        return channel
    } catch (error) {
        logger.warn('Failed to fetch the moderation log channel:', error)
    }

    return
}
