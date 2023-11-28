import { createLogger as createWinstonLogger, LoggerOptions, transports, format } from 'winston'
import { Chalk, ChalkInstance } from 'chalk'

const chalk = new Chalk()

const LevelPrefixes = {
    error: `${chalk.bgRed.whiteBright(' ERR! ')} `,
    warn: `${chalk.bgYellow.black(' WARN ')} `,
    info: `${chalk.bgBlue.whiteBright(' INFO ')} `,
    log: chalk.reset(''),
    debug: chalk.gray('DEBUG: '),
    silly: chalk.gray('SILLY: '),
} as Record<string, string>

const LevelColorFunctions = {
    error: chalk.redBright,
    warn: chalk.yellowBright,
    info: chalk.cyanBright,
    log: chalk.reset,
    debug: chalk.gray,
    silly: chalk.gray,
} as Record<string, ChalkInstance>

export function createLogger(
    serviceName: string,
    config: SafeOmit<
        LoggerOptions,
        | 'defaultMeta'
        | 'exceptionHandlers'
        | 'exitOnError'
        | 'handleExceptions'
        | 'handleRejections'
        | 'levels'
        | 'rejectionHandlers'
    >,
) {
    const logger = createWinstonLogger({
        exitOnError: false,
        defaultMeta: { serviceName },
        handleExceptions: true,
        handleRejections: true,
        transports: config.transports ?? [
            new transports.Console(),
            new transports.File({
                dirname: 'logs',
                filename: `${serviceName}-${Date.now()}.log`,
                format: format.combine(
                    format.uncolorize(),
                    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    format.printf(
                        ({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`,
                    ),
                ),
            }),
        ],
        format: format.printf(({ level, message }) => LevelPrefixes[level] + LevelColorFunctions[level]!(message)),
        ...config,
    })

    logger.silly(`Logger for ${serviceName} created at ${Date.now()}`)

    return logger
}

type SafeOmit<T, K extends keyof T> = Omit<T, K>
export type Logger = ReturnType<typeof createLogger>
