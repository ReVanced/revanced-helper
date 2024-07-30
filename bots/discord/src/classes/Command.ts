import { ApplicationCommandOptionType } from 'discord.js'

import { createErrorEmbed } from '$/utils/discord/embeds'
import { isAdmin } from '$/utils/discord/permissions'

import { config } from '../context'
import CommandError, { CommandErrorType } from './CommandError'

import type { Filter } from 'config.schema'
import type {
    APIApplicationCommandChannelOption,
    CacheType,
    Channel,
    ChatInputCommandInteraction,
    CommandInteractionOption,
    GuildMember,
    Message,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    Role,
    User,
} from 'discord.js'

export default class Command<
    Global extends boolean = false,
    Options extends CommandOptionsOptions | undefined = undefined,
    AllowMessageCommand extends boolean = false,
> {
    name: string
    description: string
    requirements?: CommandRequirements
    options?: Options
    global?: Global
    #execute: CommandExecuteFunction<Global, Options, AllowMessageCommand>

    static OptionType = ApplicationCommandOptionType

    constructor({
        name,
        description,
        requirements,
        options,
        global,
        execute,
    }: CommandOptions<Global, Options, AllowMessageCommand>) {
        this.name = name
        this.description = description
        this.requirements = requirements
        this.options = options
        this.global = global
        this.#execute = execute
    }

    async onMessage(
        context: typeof import('../context'),
        msg: Message<If<Global, false, true>>,
        args: CommandArguments,
    ): Promise<unknown> {
        if (!this.global && !msg.inGuild())
            return await msg.reply({
                embeds: [createErrorEmbed('Cannot run this command', 'This command can only be used in a server.')],
            })

        const executor = this.global ? msg.author : await msg.guild?.members.fetch(msg.author.id)!

        if (!(await this.canExecute(executor, msg.channelId)))
            return await msg.reply({
                embeds: [
                    createErrorEmbed(
                        'Cannot run this command',
                        'You do not meet the requirements to run this command.',
                    ),
                ],
            })

        const options = this.options
            ? ((await this.#resolveMessageOptions(msg, this.options, args)) as CommandExecuteFunctionOptionsParameter<
                  NonNullable<Options>
              >)
            : undefined

        // @ts-expect-error: Type mismatch (again!) because TypeScript is not smart enough
        return await this.#execute({ ...context, executor }, msg, options)
    }

    async #resolveMessageOptions(msg: Message, options: CommandOptionsOptions, args: CommandArguments) {
        const iterableOptions = Object.entries(options)
        const _options = {} as unknown

        for (let i = 0; i < iterableOptions.length; i++) {
            const [name, option] = iterableOptions[i]!
            const { type, required, description } = option
            const isSubcommandLikeOption =
                type === ApplicationCommandOptionType.Subcommand ||
                type === ApplicationCommandOptionType.SubcommandGroup

            const arg = args[i]

            const expectedType = `${ApplicationCommandOptionType[type]}${required ? '' : '?'}`
            const argExplainationString = `\n-# **${name}**: ${description}`
            const choicesString =
                'choices' in option && option.choices
                    ? `\n\n-# **AVAILABLE CHOICES**\n${option.choices.map(({ value }) => `- ${value}`).join('\n')}`
                    : ''

            if (isSubcommandLikeOption && !arg)
                throw new CommandError(
                    CommandErrorType.MissingArgument,
                    `Missing required subcommand.\n\n-# **AVAILABLE SUBCOMMANDS**\n${iterableOptions.map(([name, { description }]) => `- **${name}**: ${description}`).join('\n')}`,
                )

            if (required && !arg)
                throw new CommandError(
                    CommandErrorType.MissingArgument,
                    `Missing required argument **${name}** with type **${expectedType}**.${argExplainationString}${choicesString}`,
                )

            if (typeof arg === 'object' && arg.type !== type)
                throw new CommandError(
                    CommandErrorType.InvalidArgument,
                    `Invalid type for argument **${name}**.${argExplainationString}\n\nExpected type: **${expectedType}**\nGot type: **${ApplicationCommandOptionType[arg.type]}**${choicesString}`,
                )

            if ('choices' in option && option.choices && !option.choices.some(({ value }) => value === arg))
                throw new CommandError(
                    CommandErrorType.InvalidArgument,
                    `Invalid choice for argument **${name}**.\n${argExplainationString}\n\n${choicesString}\n`,
                )

            const argValue = typeof arg === 'string' ? arg : arg?.id

            if (argValue && arg) {
                if (isSubcommandLikeOption) {
                    const [subcommandName, subcommandOption] = iterableOptions.find(([name]) => name === argValue)!

                    // @ts-expect-error: Not smart enough, TypeScript :(
                    _options[subcommandName] = await this.#resolveMessageOptions(
                        msg,
                        (subcommandOption as CommandSubcommandLikeOption).options,
                        args.slice(i + 1),
                    )

                    break
                }

                if (
                    (type === ApplicationCommandOptionType.Channel ||
                        type === ApplicationCommandOptionType.User ||
                        type === ApplicationCommandOptionType.Role) &&
                    Number.isNaN(Number(argValue))
                )
                    throw new CommandError(
                        CommandErrorType.InvalidArgument,
                        `Malformed ID for argument **${name}**.${argExplainationString}`,
                    )

                if (
                    (type === ApplicationCommandOptionType.Number || type === ApplicationCommandOptionType.Integer) &&
                    Number.isNaN(Number(argValue))
                ) {
                    throw new CommandError(
                        CommandErrorType.InvalidArgument,
                        `Invalid number for argument **${name}**.${argExplainationString}`,
                    )
                }

                if (
                    type === ApplicationCommandOptionType.Boolean &&
                    !['true', 'false', 'yes', 'no', 'y', 'n', 't', 'f'].includes(argValue)
                )
                    throw new CommandError(
                        CommandErrorType.InvalidArgument,
                        `Invalid boolean for argument **${name}**.${argExplainationString}`,
                    )

                // @ts-expect-error: Not smart enough, TypeScript :(
                _options[name] =
                    type === ApplicationCommandOptionType.Number || type === ApplicationCommandOptionType.Integer
                        ? Number(argValue)
                        : type === ApplicationCommandOptionType.Boolean
                          ? argValue[0] === 't' || argValue[0] === 'y'
                          : type === ApplicationCommandOptionType.Channel
                            ? await msg.client.channels.fetch(argValue)
                            : type === ApplicationCommandOptionType.User
                              ? await msg.client.users.fetch(argValue)
                              : type === ApplicationCommandOptionType.Role
                                ? await msg.guild?.roles.fetch(argValue)
                                : argValue
            }
        }

        return _options
    }

    async onInteraction(
        context: typeof import('../context'),
        interaction: ChatInputCommandInteraction,
    ): Promise<unknown> {
        const { logger } = context

        if (interaction.commandName !== this.name) {
            logger.warn(`Command name mismatch, expected ${this.name}, but got ${interaction.commandName}!`)
            return await interaction.reply({
                embeds: [
                    createErrorEmbed(
                        'Internal command name mismatch',
                        'The interaction command name does not match the expected command name.',
                    ),
                ],
            })
        }

        if (!this.global && !interaction.inGuild()) {
            logger.error(`Command ${this.name} cannot be run in DMs, but was registered as global`)
            return await interaction.reply({
                embeds: [createErrorEmbed('Cannot run this command', 'This command can only be used in a server.')],
                ephemeral: true,
            })
        }

        const executor = this.global ? interaction.user : await interaction.guild?.members.fetch(interaction.user.id)!

        if (!(await this.canExecute(executor, interaction.channelId)))
            return await interaction.reply({
                embeds: [
                    createErrorEmbed(
                        'Cannot run this command',
                        'You do not meet the requirements to run this command.',
                    ),
                ],
                ephemeral: true,
            })

        const options = this.options
            ? ((await this.#resolveInteractionOptions(interaction)) as CommandExecuteFunctionOptionsParameter<
                  NonNullable<Options>
              >)
            : undefined

        if (options === null)
            return await interaction.reply({
                embeds: [
                    createErrorEmbed(
                        'Internal command option type mismatch',
                        'The interaction command option type does not match the expected command option type.',
                    ),
                ],
            })

        // @ts-expect-error: Type mismatch (again!) because TypeScript is not smart enough
        return await this.#execute({ ...context, executor }, interaction, options)
    }

    async #resolveInteractionOptions(
        interaction: ChatInputCommandInteraction,
        options: readonly CommandInteractionOption[] = interaction.options.data,
    ) {
        const _options = {} as unknown

        if (this.options)
            for (const { name, type, value } of options) {
                if (this.options[name]?.type !== type) return null

                if (
                    type === ApplicationCommandOptionType.Subcommand ||
                    type === ApplicationCommandOptionType.SubcommandGroup
                ) {
                    const subOptions = Object.entries((this.options[name] as CommandSubcommandLikeOption).options)

                    // @ts-expect-error: Not smart enough, TypeScript :(
                    _options[name] = await this.#resolveInteractionOptions(interaction, subOptions)

                    break
                }

                if (!value) continue

                // @ts-expect-error: Not smart enough, TypeScript :(
                _options[name] =
                    type === ApplicationCommandOptionType.Channel
                        ? await interaction.client.channels.fetch(value as string)
                        : type === ApplicationCommandOptionType.User
                          ? await interaction.client.users.fetch(value as string)
                          : type === ApplicationCommandOptionType.Role
                            ? await interaction.guild?.roles.fetch(value as string)
                            : value
            }

        return _options
    }

    async canExecute(executor: User | GuildMember, channelId: string): Promise<boolean> {
        if (!this.requirements) return false

        const {
            adminOnly,
            channels,
            roles,
            permissions,
            users,
            mode = 'all',
            defaultCondition = 'fail',
            memberRequirementsForUsers = 'pass',
        } = this.requirements

        const member = this.global ? null : (executor as GuildMember)
        const bDefCond = defaultCondition !== 'fail'
        const bMemReqForUsers = memberRequirementsForUsers !== 'fail'

        const conditions = [
            adminOnly ? isAdmin(executor) : bDefCond,
            channels ? channels.includes(channelId) : bDefCond,
            member ? (roles ? roles.some(role => member.roles.cache.has(role)) : bDefCond) : bMemReqForUsers,
            member ? (permissions ? member.permissions.has(permissions) : bDefCond) : bMemReqForUsers,
            users ? users.includes(executor.id) : bDefCond,
        ]

        if (mode === 'all' && conditions.some(condition => !condition)) return false
        if (mode === 'any' && conditions.every(condition => !condition)) return false

        return true
    }

    get json(): RESTPostAPIChatInputApplicationCommandsJSONBody & { contexts: Array<0 | 1 | 2> } {
        return {
            name: this.name,
            description: this.description,
            options: this.options ? this.#transformOptions(this.options) : undefined,
            // https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types
            contexts: this.global ? [0] : [0, 1],
        }
    }

    #transformOptions(optionsObject: Record<string, CommandOption>) {
        const options: RESTPostAPIChatInputApplicationCommandsJSONBody['options'] = []

        for (const [name, option] of Object.entries(optionsObject)) {
            options.push({
                // biome-ignore lint/suspicious/noExplicitAny: Good enough work here
                type: option.type as any,
                name,
                description: option.description,
                required: option.required,
                ...(option.type === ApplicationCommandOptionType.Subcommand ||
                option.type === ApplicationCommandOptionType.SubcommandGroup
                    ? {
                          options: this.#transformOptions((option as CommandSubcommandLikeOption).options),
                      }
                    : {}),
                ...(option.type === ApplicationCommandOptionType.Channel ? { channel_types: option.types } : {}),
                ...(option.type === ApplicationCommandOptionType.Integer ||
                option.type === ApplicationCommandOptionType.Number
                    ? {
                          min_value: option.min,
                          max_value: option.max,
                          choices: option.choices,
                          autocomplete: option.autocomplete,
                      }
                    : {}),
                ...(option.type === ApplicationCommandOptionType.String
                    ? {
                          min_length: option.minLength,
                          max_length: option.maxLength,
                          choices: option.choices,
                          autocomplete: option.autocomplete,
                      }
                    : {}),
            })
        }

        return options
    }
}

export class ModerationCommand<
    Options extends CommandOptionsOptions,
    AllowMessageCommand extends boolean = true,
> extends Command<false, Options, AllowMessageCommand> {
    constructor(options: ExtendedCommandOptions<false, Options, AllowMessageCommand>) {
        super({
            ...options,
            requirements: {
                ...options.requirements,
                defaultCondition: 'pass',
                roles: (config.moderation?.roles ?? []).concat(options.requirements?.roles ?? []),
            },
            // @ts-expect-error: No thanks
            allowMessageCommand: options.allowMessageCommand ?? true,
            global: false,
        })
    }
}

export class AdminCommand<Options extends CommandOptionsOptions, AllowMessageCommand extends boolean> extends Command<
    true,
    Options,
    AllowMessageCommand
> {
    constructor(options: ExtendedCommandOptions<true, Options, AllowMessageCommand>) {
        super({
            ...options,
            requirements: {
                ...options.requirements,
                adminOnly: true,
                defaultCondition: 'pass',
            },
            global: true,
        })
    }
}

/* TODO: 
    APIApplicationCommandAttachmentOption
    APIApplicationCommandMentionableOption
    APIApplicationCommandRoleOption
*/

export interface CommandOptions<
    Global extends boolean,
    Options extends CommandOptionsOptions | undefined,
    AllowMessageCommand extends boolean,
> {
    name: string
    description: string
    requirements?: CommandRequirements
    options?: Options
    execute: CommandExecuteFunction<Global, Options, AllowMessageCommand>
    global?: Global
    allowMessageCommand?: AllowMessageCommand
}

export type CommandArguments = Array<string | CommandSpecialArgument>

export type CommandSpecialArgument = {
    type: (typeof CommandSpecialArgumentType)[keyof typeof CommandSpecialArgumentType]
    id: string
}

export const CommandSpecialArgumentType = {
    Channel: ApplicationCommandOptionType.Channel,
    Role: ApplicationCommandOptionType.Role,
    User: ApplicationCommandOptionType.User,
}

type ExtendedCommandOptions<
    Global extends boolean,
    Options extends CommandOptionsOptions,
    AllowMessageCommand extends boolean,
> = Omit<CommandOptions<Global, Options, AllowMessageCommand>, 'global'> & {
    requirements?: Omit<CommandOptions<false, Options, AllowMessageCommand>['requirements'], 'defaultCondition'>
}

export type CommandOptionsOptions = Record<string, CommandOption>

type CommandExecuteFunction<
    Global extends boolean,
    Options extends CommandOptionsOptions | undefined,
    AllowMessageCommand extends boolean,
> = (
    context: CommandContext<Global>,
    trigger: If<
        AllowMessageCommand,
        Message<InvertBoolean<Global>> | ChatInputCommandInteraction<If<Global, CacheType, 'raw' | 'cached'>>,
        ChatInputCommandInteraction<If<Global, CacheType, 'raw' | 'cached'>>
    >,
    options: Options extends CommandOptionsOptions ? CommandExecuteFunctionOptionsParameter<Options> : never,
) => Promise<unknown> | unknown

type If<T extends boolean | undefined, U, V> = T extends true ? U : V
type InvertBoolean<T extends boolean> = If<T, false, true>

type CommandExecuteFunctionOptionsParameter<Options extends CommandOptionsOptions> = {
    [K in keyof Options]: Options[K]['type'] extends
        | ApplicationCommandOptionType.Subcommand
        | ApplicationCommandOptionType.SubcommandGroup
        ? // @ts-expect-error: Shut up, it works
          CommandExecuteFunctionOptionsParameter<Options[K]['options']> | undefined
        : If<
              Options[K]['required'],
              CommandOptionValueMap[Options[K]['type']],
              CommandOptionValueMap[Options[K]['type']] | undefined
          >
}

type CommandContext<Global extends boolean> = typeof import('../context') & {
    executor: CommandExecutor<Global>
}

type CommandOptionValueMap = {
    [ApplicationCommandOptionType.Boolean]: boolean
    [ApplicationCommandOptionType.Channel]: Channel
    [ApplicationCommandOptionType.Integer]: number
    [ApplicationCommandOptionType.Number]: number
    [ApplicationCommandOptionType.String]: string
    [ApplicationCommandOptionType.User]: User
    [ApplicationCommandOptionType.Role]: Role
    [ApplicationCommandOptionType.Subcommand]: never
    [ApplicationCommandOptionType.SubcommandGroup]: never
}

type CommandOption =
    | CommandBooleanOption
    | CommandChannelOption
    | CommandIntegerOption
    | CommandNumberOption
    | CommandStringOption
    | CommandUserOption
    | CommandRoleOption
    | CommandSubcommandOption
    | CommandSubcommandGroupOption

type CommandExecutor<Global extends boolean> = If<Global, User, GuildMember>

type CommandOptionBase<Type extends ApplicationCommandOptionType> = {
    type: Type
    description: string
    required?: boolean
}

type CommandBooleanOption = CommandOptionBase<ApplicationCommandOptionType.Boolean>

type CommandChannelOption = CommandOptionBase<ApplicationCommandOptionType.Channel> & {
    types: APIApplicationCommandChannelOption['channel_types']
}

interface CommandOptionChoice<ValueType = number | string> {
    name: string
    value: ValueType
}

type CommandOptionWithAutocompleteOrChoicesWrapper<
    Base extends CommandOptionBase<ApplicationCommandOptionType>,
    ChoiceType extends CommandOptionChoice,
> =
    | (Base & {
          autocomplete: true
          choices?: never
      })
    | (Base & {
          autocomplete?: false
          choices?: ChoiceType[] | readonly ChoiceType[]
      })

type CommandIntegerOption = CommandOptionWithAutocompleteOrChoicesWrapper<
    CommandOptionBase<ApplicationCommandOptionType.Integer>,
    CommandOptionChoice<number>
> & {
    min?: number
    max?: number
}

type CommandNumberOption = CommandOptionWithAutocompleteOrChoicesWrapper<
    CommandOptionBase<ApplicationCommandOptionType.Number>,
    CommandOptionChoice<number>
> & {
    min?: number
    max?: number
}

type CommandStringOption = CommandOptionWithAutocompleteOrChoicesWrapper<
    CommandOptionBase<ApplicationCommandOptionType.String>,
    CommandOptionChoice<string>
> & {
    minLength?: number
    maxLength?: number
}

type CommandUserOption = CommandOptionBase<ApplicationCommandOptionType.User>

type CommandRoleOption = CommandOptionBase<ApplicationCommandOptionType.Role>

type SubcommandLikeApplicationCommandOptionType =
    | ApplicationCommandOptionType.Subcommand
    | ApplicationCommandOptionType.SubcommandGroup

interface CommandSubcommandLikeOption<
    Type extends SubcommandLikeApplicationCommandOptionType = SubcommandLikeApplicationCommandOptionType,
> extends CommandOptionBase<Type> {
    options: CommandOptionsOptions
    required?: never
}

type CommandSubcommandOption = CommandSubcommandLikeOption<ApplicationCommandOptionType.Subcommand>
type CommandSubcommandGroupOption = CommandSubcommandLikeOption<ApplicationCommandOptionType.SubcommandGroup>

export type CommandRequirements = Filter & {
    mode?: 'all' | 'any'
    adminOnly?: boolean
    permissions?: bigint
    defaultCondition?: 'fail' | 'pass'
    memberRequirementsForUsers?: 'pass' | 'fail'
}
