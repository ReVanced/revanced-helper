import { MessageScanLabeledResponseReactions } from '$/constants'
import { responses } from '$/database/schemas'
import { getResponseFromText, messageMatchesFilter } from '$/utils/discord/messageScan'
import { createMessageScanResponseEmbed } from '$utils/discord/embeds'
import { on, withContext } from '$utils/discord/events'

withContext(on, 'messageCreate', async (context, msg) => {
    const {
        api,
        config: { messageScan: config },
        database: db,
        logger,
    } = context

    if (!config || !config.responses) return
    if (msg.author.bot && !config.scanBots) return
    if (!msg.inGuild() && !config.scanOutsideGuilds) return
    if (msg.inGuild() && msg.member?.partial) await msg.member.fetch()

    const filteredResponses = config.responses.filter(x => messageMatchesFilter(msg, x.filterOverride ?? config.filter))
    if (!filteredResponses.length) return

    if (msg.content.length) {
        try {
            logger.debug(`Classifying message ${msg.id}`)

            const { response, label, respondToReply } = await getResponseFromText(
                msg.content,
                filteredResponses,
                context,
            )

            if (response) {
                logger.debug('Response found')

                const toReply = respondToReply ? (msg.reference?.messageId ? await msg.fetchReference() : msg) : msg
                const reply = await toReply.reply({
                    ...response,
                    embeds: response.embeds?.map(createMessageScanResponseEmbed),
                })

                if (label) {
                    await db.insert(responses).values({
                        replyId: reply.id,
                        channelId: reply.channel.id,
                        guildId: reply.guild!.id,
                        referenceId: msg.id,
                        label,
                        content: msg.content,
                    })

                    for (const reaction of Object.values(MessageScanLabeledResponseReactions)) {
                        await reply.react(reaction)
                    }
                }
            }
        } catch (e) {
            logger.error('Failed to classify message:', e)
        }
    }

    if (msg.attachments.size > 0 && config.attachments?.scanAttachments) {
        logger.debug(`Classifying message attachments for ${msg.id}`)

        for (const attachment of msg.attachments.values()) {
            if (
                config.attachments.allowedMimeTypes &&
                !config.attachments.allowedMimeTypes.includes(attachment.contentType!)
            ) {
                logger.debug(`Disallowed MIME type for attachment: ${attachment.url}, ${attachment.contentType}`)
                continue
            }

            if (attachment.contentType?.startsWith('text/') && attachment.size > (config.attachments.maxTextFileSize ?? 512 * 1000)) {
                logger.debug(`Attachment ${attachment.url} is too large be to scanned, size is ${attachment.size}`)   
                continue
            }

            try {
                const { text: content } = await api.client.parseImage(attachment.url)
                const { response } = await getResponseFromText(content, filteredResponses, context, true)

                if (response) {
                    logger.debug(`Response found for attachment: ${attachment.url}`)
                    await msg.reply({
                        ...response,
                        embeds: response.embeds?.map(createMessageScanResponseEmbed),
                    })

                    break
                }
            } catch {
                logger.error(`Failed to parse image: ${attachment.url}`)
            }
        }
    }
})
