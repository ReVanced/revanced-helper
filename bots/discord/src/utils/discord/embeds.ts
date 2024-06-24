import { DefaultEmbedColor, MessageScanHumanizedMode, ReVancedLogoURL } from '$/constants'
import { EmbedBuilder, type EmbedField, type User } from 'discord.js'
import type { ConfigMessageScanResponseMessage } from '../../../config.schema'

export const createErrorEmbed = (title: string, description?: string) =>
    applyCommonEmbedStyles(
        new EmbedBuilder()
            .setTitle(title)
            .setDescription(description ?? null)
            .setAuthor({ name: 'Error' })
            .setColor('Red'),
    )

export const createStackTraceEmbed = (stack: unknown) =>
    // biome-ignore lint/style/useTemplate: shut
    createErrorEmbed('An exception was thrown', '```js\n' + stack + '```')

export const createSuccessEmbed = (title: string, description?: string) =>
    applyCommonEmbedStyles(
        new EmbedBuilder()
            .setTitle(title)
            .setDescription(description ?? null)
            .setColor('Green'),
    )

export const createMessageScanResponseEmbed = (
    response: ConfigMessageScanResponseMessage,
    mode: 'ocr' | 'nlp' | 'match',
) => {
    const embed = new EmbedBuilder().setTitle(response.title ?? null)

    if (response.description) embed.setDescription(response.description)
    if (response.fields) embed.addFields(response.fields)

    embed.setFooter({
        text: `ReVanced • Done via ${MessageScanHumanizedMode[mode]}`,
        iconURL: ReVancedLogoURL,
    })

    return applyCommonEmbedStyles(embed, true, true, true)
}

export const createModerationActionEmbed = (
    action: string,
    user: User,
    moderator: User,
    reason?: string,
    expires?: number | null,
    extraFields?: EmbedField[][],
) => {
    const fields: EmbedField[] = []
    if (extraFields?.[0]) fields.push(...extraFields[0])
    if (reason) fields.push({ name: 'Reason', value: reason, inline: true })
    if (Number.isInteger(expires) || expires === null)
        fields.push({
            name: 'Expires',
            value: Number.isInteger(expires) ? `<t:${expires}:F>` : 'Never',
            inline: true,
        })
    if (extraFields?.[1]) fields.push(...extraFields[1])

    const embed = new EmbedBuilder()
        .setTitle(`${action} ${user.tag}`)
        .setDescription(`${user.toString()} was ${action.toLowerCase()} by ${moderator.toString()}`)
        .addFields(fields)
        .setThumbnail(user.displayAvatarURL({ forceStatic: true }))

    return applyCommonEmbedStyles(embed, true, true, true)
}

export const applyReferenceToModerationActionEmbed = (embed: EmbedBuilder, reference: string) => {
    embed.addFields({ name: 'Reference', value: `[Jump to message](${reference})`, inline: true })
    return embed
}

export const applyCommonEmbedStyles = (
    embed: EmbedBuilder,
    setThumbnail = false,
    setFooter = false,
    setColor = false,
) => {
    if (setFooter)
        embed.setFooter({
            text: 'ReVanced',
            iconURL: ReVancedLogoURL,
        })

    if (setColor) embed.setColor(DefaultEmbedColor)
    if (setThumbnail) embed.setThumbnail(ReVancedLogoURL)

    return embed
}
