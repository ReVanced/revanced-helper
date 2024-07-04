import { on, withContext } from '$utils/api/events'

withContext(on, 'ready', ({ logger }) => void logger.info('Connected to the bot API'))
