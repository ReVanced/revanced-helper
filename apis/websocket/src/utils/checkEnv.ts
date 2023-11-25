import type { Logger } from './logger.js'

export default function checkEnv(logger: Logger) {
    if (!process.env['NODE_ENV'])
        logger.warn('NODE_ENV not set, defaulting to `development`')
    const environment = (process.env['NODE_ENV'] ??
        'development') as NodeEnvironment

    if (!['development', 'production'].includes(environment)) {
        logger.error(
            'NODE_ENV is neither `development` nor `production`, unable to determine environment'
        )
        logger.info('Set NODE_ENV to blank to use `development` mode')
        process.exit(1)
    }

    logger.info(`Running in ${environment} mode...`)

    if (environment === 'production' && process.env['IS_USING_DOT_ENV']) {
        logger.warn(
            'You seem to be using .env files, this is generally not a good idea in production...'
        )
    }

    if (!process.env['WIT_AI_TOKEN']) {
        logger.error('WIT_AI_TOKEN is not defined in the environment variables')
        process.exit(1)
    }

    return environment
}
