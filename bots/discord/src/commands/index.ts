import type { SlashCommandBuilder } from '@discordjs/builders'
import type { ChatInputCommandInteraction } from 'discord.js'

// Temporary system
export type Command = {
    data: ReturnType<SlashCommandBuilder['toJSON']>
    // The function has to return void or Promise<void>
    // because TS may complain about some code paths not returning a value
    /**
     * The function to execute when this command is triggered
     * @param interaction The interaction that triggered this command
     */
    execute: (context: typeof import('../context'), interaction: ChatInputCommandInteraction) => Promise<void> | void
    memberRequirements?: {
        /**
         * The mode to use when checking for requirements.
         * - `all` means that the user needs meet all requirements specified.
         * - `any` means that the user needs to meet any of the requirements specified.
         *
         * @default "all"
         */
        mode?: 'all' | 'any'
        /**
         * The permissions required to use this command (in BitFields).
         *
         * - **0n** means that everyone can use this command.
         * - **-1n** means that only bot owners can use this command.
         * @default -1n
         */
        permissions?: bigint
        /**
         * The roles required to use this command.
         * By default, this is set to `[]`.
         */
        roles?: string[]
    }
    /**
     * Whether this command can only be used by bot owners.
     * @default false
     */
    ownerOnly?: boolean
    /**
     * Whether to register this command as a global slash command.
     * This is set to `false` and commands will be registered in allowed guilds only by default.
     * @default false
     */
    global?: boolean
}
