import { Chalk } from 'chalk'

const chalk = new Chalk()
const logger = {
    debug: (...args) => console.debug(chalk.gray('DEBUG:', ...args)),
    info: (...args) =>
        console.info(chalk.bgBlue.whiteBright(' INFO '), ...args),
    warn: (...args) =>
        console.warn(
            chalk.bgYellow.blackBright.bold(' WARN '),
            chalk.yellowBright(...args),
        ),
    error: (...args) =>
        console.error(
            chalk.bgRed.whiteBright.bold(' ERROR '),
            chalk.redBright(...args),
        ),
    log: console.log,
} satisfies Logger

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log'
export type LogFunction = (...x: unknown[]) => void
export type Logger = Record<LogLevel, LogFunction>

export default logger
