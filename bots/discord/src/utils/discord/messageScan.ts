import type { LabeledResponse } from '$/classes/Database'
import type {
    Config,
    ConfigMessageScanResponse,
    ConfigMessageScanResponseLabelConfig,
    ConfigMessageScanResponseMessage,
} from 'config.example'
import type { Message, PartialUser, User } from 'discord.js'
import { createMessageScanResponseEmbed } from './embeds'

export const getResponseFromText = async (
    content: string,
    responses: ConfigMessageScanResponse[],
    // Just to be safe that we will never use data from the context parameter
    { api, logger }: Omit<typeof import('src/context'), 'config'>,
    ocrMode = false,
) => {
    let label: string | undefined
    let response: ConfigMessageScanResponseMessage | undefined | null
    const firstLabelIndexes: number[] = []

    // Test if all regexes before a label trigger is matched
    for (let i = 0; i < responses.length; i++) {
        const trigger = responses[i]!

        // Filter override check is not neccessary here, we are already passing responses that match the filter
        // from the messageCreate handler
        const {
            triggers: { text: textTriggers, image: imageTriggers },
            response: resp,
        } = trigger
        if (response) break

        if (ocrMode) {
            if (imageTriggers)
                for (const regex of imageTriggers)
                    if (regex.test(content)) {
                        logger.debug(`Message matched regex (OCR mode): ${regex.source}`)
                        response = resp
                        break
                    }
        } else
            for (let j = 0; j < textTriggers!.length; j++) {
                const trigger = textTriggers![j]!

                if (trigger instanceof RegExp) {
                    if (trigger.test(content)) {
                        logger.debug(`Message matched regex (before mode): ${trigger.source}`)
                        response = resp
                        break
                    }
                } else {
                    firstLabelIndexes[i] = j
                    break
                }
            }
    }

    // If none of the regexes match, we can search for labels immediately
    if (!response && !ocrMode) {
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
                return { response: null, label: undefined }
            }

            if (matchedLabel.confidence >= triggerConfig!.threshold) {
                logger.debug('Label confidence is enough')
                label = matchedLabel.name
                response = labelConfig.response
            }
        }
    }

    // If we still don't have a label, we can match all regexes after the initial label trigger
    if (!response) {
        logger.debug('No match from NLP, doing after regexes')
        for (let i = 0; i < responses.length; i++) {
            const {
                triggers: { text: textTriggers },
                response: resp,
            } = responses[i]!
            const firstLabelIndex = firstLabelIndexes[i] ?? -1

            for (let i = firstLabelIndex + 1; i < textTriggers!.length; i++) {
                const trigger = textTriggers![i]!

                if (trigger instanceof RegExp) {
                    if (trigger.test(content)) {
                        logger.debug(`Message matched regex (after mode): ${trigger.source}`)
                        response = resp
                        break
                    }
                }
            }
        }
    }

    return {
        response,
        label,
    }
}

export const shouldScanMessage = (
    message: Message,
    filter: NonNullable<Config['messageScan']>['filter'],
): message is Message<true> => {
    if (message.author.bot) return false
    if (!message.guild) return false
    if (!filter) return true

    const filters = [
        filter.users?.includes(message.author.id),
        message.member?.roles.cache.some(x => filter.roles?.includes(x.id)),
        filter.channels?.includes(message.channel.id),
    ]

    if (filter.whitelist && filters.every(x => !x)) return false
    if (!filter.whitelist && filters.some(x => x)) return false

    return true
}

export const handleUserResponseCorrection = async (
    { api, database: db, config: { messageScan: msConfig }, logger }: typeof import('$/context'),
    response: LabeledResponse,
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
        db.labeledResponses.edit(response.reply, { label, correctedBy: user.id })
        await reply.edit({
            embeds: [createMessageScanResponseEmbed(correctLabelResponse.response, 'nlp')],
        })
    }

    await api.client.trainMessage(response.text, label)
    logger.debug(`User ${user.id} trained message ${response.reply} as ${label} (positive)`)

    await reply.reactions.removeAll()
}
