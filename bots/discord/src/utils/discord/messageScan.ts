import type { LabeledResponse } from '$/classes/Database'
import type { Config, ConfigMessageScanResponseLabelConfig, ConfigMessageScanResponseMessage } from 'config.example'
import type { Message, PartialUser, User } from 'discord.js'
import { createMessageScanResponseEmbed } from './embeds'

export const getResponseFromContent = async (
    content: string,
    { api, logger, config: { messageScan: config } }: typeof import('src/context'),
    ocrMode = false,
) => {
    if (!config || !config.responses) {
        logger.warn('No message scan config found')

        return {
            response: null,
            label: undefined,
        }
    }

    let label: string | undefined
    let response: ConfigMessageScanResponseMessage | undefined | null
    const firstLabelIndexes: number[] = []

    // Test if all regexes before a label trigger is matched
    for (let i = 0; i < config.responses.length; i++) {
        const trigger = config.responses[i]!

        const { triggers, ocrTriggers, response: resp } = trigger
        if (response) break

        if (ocrMode && ocrTriggers)
            for (const regex of ocrTriggers)
                if (regex.test(content)) {
                    logger.debug(`Message matched regex (OCR mode): ${regex.source}`)
                    response = resp
                    break
                }

        for (let j = 0; j < triggers.length; j++) {
            const trigger = triggers[j]!

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
        const scan = await api.client.parseText(content)
        if (scan.labels.length) {
            const matchedLabel = scan.labels[0]!
            logger.debug(`Message matched label with confidence: ${matchedLabel.name}, ${matchedLabel.confidence}`)

            let triggerConfig: ConfigMessageScanResponseLabelConfig | undefined
            const labelConfig = config.responses.find(x => {
                const config = x.triggers.find(
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
    if (!response)
        for (let i = 0; i < config.responses.length; i++) {
            const { triggers, response: resp } = config.responses[i]!
            const firstLabelIndex = firstLabelIndexes[i] ?? -1

            for (let i = firstLabelIndex + 1; i < triggers.length; i++) {
                const trigger = triggers[i]!

                if (trigger instanceof RegExp) {
                    if (trigger.test(content)) {
                        logger.debug(`Message matched regex (after mode): ${trigger.source}`)
                        response = resp
                        break
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
    config: NonNullable<Config['messageScan']>,
): message is Message<true> => {
    if (message.author.bot) return false
    if (!message.guild) return false

    const filters = [
        config.users?.includes(message.author.id),
        message.member?.roles.cache.some(x => config.roles?.includes(x.id)),
        config.channels?.includes(message.channel.id),
    ]

    if (config.whitelist && filters.every(x => !x)) return false
    if (!config.whitelist && filters.some(x => x)) return false

    return true
}

export const handleUserResponseCorrection = async (
    { api, database: db, config: { messageScan: msConfig }, logger }: typeof import('$/context'),
    response: LabeledResponse,
    reply: Message,
    label: string,
    user: User | PartialUser,
) => {
    const correctLabelResponse = msConfig!.responses!.find(r => r.triggers.some(t => 'label' in t && t.label === label))

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
