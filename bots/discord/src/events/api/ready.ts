import { on } from '$utils/api/events'
import { logger } from 'src/context'

on('ready', () => {
    logger.info('Connected to the bot API')
})
