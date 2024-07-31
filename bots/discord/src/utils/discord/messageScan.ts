import { type Response, responses } from '$/database/schemas'
import type { Config, ConfigMessageScanResponse, ConfigMessageScanResponseLabelConfig } from 'config.schema'
import type { Message, PartialUser, User } from 'discord.js'
import { eq } from 'drizzle-orm'
import { createMessageScanResponseEmbed } from './embeds'

export const getResponseFromText = async (
    content: string,
    responses: ConfigMessageScanResponse[],
    // Just to be safe that we will never use data from the context parameter
    { api, logger }: Omit<typeof import('src/context'), 'config'>,
    ocrMode = false,
): Promise<
    Omit<ConfigMessageScanResponse, 'triggers'> & { label?: string; triggers?: ConfigMessageScanResponse['triggers'] }
> => {
    type ResponseConfig = Awaited<ReturnType<typeof getResponseFromText>>
    let responseConfig: Omit<ResponseConfig, 'triggers'> & { triggers?: ResponseConfig['triggers'] } = {
        triggers: undefined,
        response: null,
    }

    const firstLabelIndexes: number[] = []

    // Test if all regexes before a label trigger is matched
    for (let i = 0; i < responses.length; i++) {
        const trigger = responses[i]!

        // Filter override check is not neccessary here, we are already passing responses that match the filter
        // from the messageCreate handler, see line 17 of messageCreate handler
        const {
            triggers: { text: textTriggers, image: imageTriggers },
        } = trigger

        if (ocrMode) {
            if (imageTriggers)
                for (const regex of imageTriggers)
                    if (regex.test(content)) {
                        logger.debug(`Message matched regex (OCR mode): ${regex.source}`)
                        responseConfig = trigger
                        break
                    }
        } else
            for (let j = 0; j < textTriggers!.length; j++) {
                const regex = textTriggers![j]!

                if (regex instanceof RegExp) {
                    if (regex.test(content)) {
                        logger.debug(`Message matched regex (before mode): ${regex.source}`)
                        responseConfig = trigger
                        break
                    }
                } else {
                    firstLabelIndexes[i] = j
                    break
                }
            }
    }

    // If none of the regexes match, we can search for labels immediately
    if (!responseConfig.triggers && !ocrMode) {
        logger.debug('No match from before regexes, doing NLP')
        const scan = await api.client.parseText(content)
        if (scan.labels.length) {
            const matchedLabel = scan.labels[0]!
            logger.debug(`Message matched label with confidence: ${matchedLabel.name}, ${matchedLabel.confidence}`)

            let triggerConfig: ConfigMessageScanResponseLabelConfig | undefined
            const labelConfig = responses.find(x => {
                const config = x.triggers.text!.find(
                    (x): x is ConfigMessageScanResponseLabelConfig => 'label' in x && x.label === matchedLabel.name,
                )
                if (config) triggerConfig = config
                return config
            })

            if (!labelConfig) {
                logger.warn(`No label config found for label ${matchedLabel.name}`)
                return responseConfig
            }

            if (matchedLabel.confidence >= triggerConfig!.threshold) {
                logger.debug('Label confidence is enough')
                responseConfig = labelConfig
            }
        }
    }

    // If we still don't have a response config, we can match all regexes after the initial label trigger
    if (!responseConfig.triggers) {
        logger.debug('No match from NLP, doing after regexes')
        for (let i = 0; i < responses.length; i++) {
            const {
                triggers: { text: textTriggers },
            } = responses[i]!
            const firstLabelIndex = firstLabelIndexes[i] ?? -1

            for (let i = firstLabelIndex + 1; i < textTriggers!.length; i++) {
                const trigger = textTriggers![i]!

                if (trigger instanceof RegExp) {
                    if (trigger.test(content)) {
                        logger.debug(`Message matched regex (after mode): ${trigger.source}`)
                        responseConfig = responses[i]!
                        break
                    }
                }
            }
        }
    }

    return responseConfig
}

export const messageMatchesFilter = (message: Message, filter: NonNullable<Config['messageScan']>['filter']) => {
    if (!filter) return true

    const memberRoles = new Set(message.member?.roles.cache.keys())
    const { blacklist, whitelist } = filter

    // If matches only blacklist, will return false
    // If matches whitelist but also matches blacklist, will return false
    // If matches only whitelist, will return true
    // If matches neither, will return true
    return whitelist
        ? (whitelist.channels?.includes(message.channelId) ?? true) ||
              (whitelist.roles?.some(role => memberRoles.has(role)) ?? true) ||
              (whitelist.users?.includes(message.author.id) ?? true)
        : true &&
              !(
                  blacklist &&
                  (blacklist.channels?.includes(message.channelId) ||
                      blacklist.roles?.some(role => memberRoles.has(role)) ||
                      blacklist.users?.includes(message.author.id))
              )
}

export const handleUserResponseCorrection = async (
    { api, database: db, config: { messageScan: msConfig }, logger }: typeof import('$/context'),
    response: Response,
    reply: Message,
    label: string,
    user: User | PartialUser,
) => {
    const correctLabelResponse = msConfig!.responses!.find(r =>
        r.triggers.text!.some(t => 'label' in t && t.label === label),
    )

    if (!correctLabelResponse) throw new Error('Cannot find label config for the selected label')
    if (!correctLabelResponse.response) return void (await reply.delete())

    if (response.label !== label) {
        db.update(responses)
            .set({
                label,
                correctedById: user.id,
            })
            .where(eq(responses.replyId, response.replyId))

        await reply.edit({
            ...correctLabelResponse.response,
            embeds: correctLabelResponse.response.embeds?.map(it => createMessageScanResponseEmbed(it, 'nlp')),
        })
    }

    await api.client.trainMessage(response.content, label)
    logger.debug(`User ${user.id} trained message ${response.replyId} as ${label} (positive)`)

    await reply.reactions.removeAll()
}
