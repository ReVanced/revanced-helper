import { colorConsole, console as uncoloredConsole, Tracer } from 'tracer'
import { Chalk, supportsColor, supportsColorStderr } from 'chalk'

const chalk = new Chalk()
const DefaultConfig = {
    dateformat: 'DD/MM/YYYY HH:mm:ss.sss Z',
    format: [
        '{{message}}',
        {
            error: `${chalk.bgRedBright.whiteBright(' ERROR ')} {{message}}\n${chalk.gray(
                '{{stack}}',
            )}`,
            debug: chalk.gray('DEBUG: {{message}}\n{{stack}}'),
            warn: `${chalk.bgYellowBright.whiteBright(' WARN ')} ${chalk.yellowBright('{{message}}')}\n${chalk.gray(
                '{{stack}}',
            )}`,
            info: `${chalk.bgBlueBright.whiteBright(' INFO ')} ${chalk.cyanBright('{{message}}')}`,
            fatal: `${chalk.bgRedBright.whiteBright(' FATAL ')} ${chalk.redBright('{{message}}')}\n${chalk.white(
                '{{stack}}',
            )}`,
            log: '{{message}}',
            trace: chalk.gray('[{{timestamp}}] TRACE: {{message}}\n{{stack}}'),
        },
    ],
    methods: ['debug', 'trace', 'log', 'info', 'warn', 'error', 'fatal'],
    filters: [],
} satisfies Tracer.LoggerConfig

export function createLogger(config: Omit<Tracer.LoggerConfig, keyof typeof DefaultConfig>) {
    const combinedConfig = { ...DefaultConfig, ...config }

    if (
        // biome-ignore lint/complexity/useOptionalChain: No Biome, this isn't a nullable check
        supportsColor &&
        supportsColor.hasBasic &&
        supportsColorStderr &&
        supportsColorStderr.hasBasic
    )
        return colorConsole(combinedConfig)
    else return uncoloredConsole(combinedConfig)
}

export type Logger = ReturnType<typeof createLogger>
