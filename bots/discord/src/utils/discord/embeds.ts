import { DefaultEmbedColor, MessageScanHumanizedMode, ReVancedLogoURL } from '$/constants'
import { EmbedBuilder } from 'discord.js'
import type { ConfigMessageScanResponseMessage } from '../../../config.example'

export const createErrorEmbed = (title: string, description?: string) =>
    applyCommonStyles(
        new EmbedBuilder()
            .setTitle(title)
            .setDescription(description ?? null)
            .setAuthor({ name: 'Error' })
            .setColor('Red'),
        false,
    )

export const createStackTraceEmbed = (stack: unknown) =>
    // biome-ignore lint/style/useTemplate: shut
    createErrorEmbed('An exception was thrown', '```js' + stack + '```')

export const createSuccessEmbed = (title: string, description?: string) =>
    applyCommonStyles(
        new EmbedBuilder()
            .setTitle(title)
            .setDescription(description ?? null)
            .setAuthor({ name: 'Success' })
            .setColor('Green'),
        false,
    )

export const createMessageScanResponseEmbed = (
    response: ConfigMessageScanResponseMessage,
    mode: 'ocr' | 'nlp' | 'match',
) => {
    const embed = new EmbedBuilder().setTitle(response.title)

    if (response.description) embed.setDescription(response.description)
    if (response.fields) embed.addFields(response.fields)

    embed.setFooter({
        text: `ReVanced • Done via ${MessageScanHumanizedMode[mode]}`,
        iconURL: ReVancedLogoURL,
    })

    return applyCommonStyles(embed)
}

const applyCommonStyles = (embed: EmbedBuilder, setColor = true, setThumbnail = true) => {
    embed.setFooter({
        text: 'ReVanced',
        iconURL: ReVancedLogoURL,
    })

    if (setColor) embed.setColor(DefaultEmbedColor)
    if (setThumbnail) embed.setThumbnail(ReVancedLogoURL)

    return embed
}
