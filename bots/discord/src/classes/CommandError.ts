import { createErrorEmbed } from '$/utils/discord/embeds'

export default class CommandError extends Error {
    type: CommandErrorType

    constructor(type: CommandErrorType, message?: string) {
        super(message)
        this.name = 'CommandError'
        this.type = type
    }

    toEmbed() {
        return createErrorEmbed(ErrorTitleMap[this.type], this.message ?? '')
    }
}

export enum CommandErrorType {
    Generic,
    MissingArgument,
    InvalidUser,
    InvalidChannel,
    InvalidDuration,
}

const ErrorTitleMap: Record<CommandErrorType, string> = {
    [CommandErrorType.Generic]: 'An exception was thrown',
    [CommandErrorType.MissingArgument]: 'Missing argument',
    [CommandErrorType.InvalidUser]: 'Invalid user',
    [CommandErrorType.InvalidChannel]: 'Invalid channel',
    [CommandErrorType.InvalidDuration]: 'Invalid duration',
}
