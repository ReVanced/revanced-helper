import { MessageScanLabeledResponseReactions } from '$/constants'
import { getResponseFromContent, shouldScanMessage } from '$/utils/discord/messageScan'
import { createMessageScanResponseEmbed } from '$utils/discord/embeds'
import { on } from '$utils/discord/events'

on('messageCreate', async (ctx, msg) => {
    const {
        api,
        config: { messageScan: config },
        database: db,
        logger,
    } = ctx

    if (!config || !config.responses) return
    if (!shouldScanMessage(msg, config)) return

    if (msg.content.length) {
        logger.debug(`Classifying message ${msg.id}`)

        const { response, label } = await getResponseFromContent(msg.content, ctx)

        if (response) {
            logger.debug('Response found')

            const reply = await msg.reply({
                embeds: [createMessageScanResponseEmbed(response)],
            })

            if (label)
                db.labeledResponses.save({
                    reply: reply.id,
                    channel: reply.channel.id,
                    guild: reply.guild.id,
                    referenceMessage: msg.id,
                    label,
                    text: msg.content,
                })

            if (label) {
                for (const reaction of Object.values(MessageScanLabeledResponseReactions)) {
                    await reply.react(reaction)
                }
            }
        }
    }

    if (msg.attachments.size > 0) {
        logger.debug(`Classifying message attachments for ${msg.id}`)

        for (const attachment of msg.attachments.values()) {
            if (attachment.contentType && !config.allowedAttachmentMimeTypes.includes(attachment.contentType)) continue

            try {
                const { text: content } = await api.client.parseImage(attachment.url)
                const { response } = await getResponseFromContent(content, ctx)

                if (response) {
                    logger.debug(`Response found for attachment: ${attachment.url}`)
                    await msg.reply({
                        embeds: [createMessageScanResponseEmbed(response)],
                    })

                    break
                }
            } catch {
                logger.error(`Failed to parse image: ${attachment.url}`)
            }
        }
    }
})
