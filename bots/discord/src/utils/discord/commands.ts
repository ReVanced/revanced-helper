import type { Command } from '$commands/types'
import { listAllFilesRecursive } from '$utils/fs'

export const loadCommands = async (dir: string) => {
    const commandsMap: Record<string, Command> = {}
    const files = listAllFilesRecursive(dir)
    const commands = await Promise.all(
        files.map(async file => {
            const command = await import(file)
            return command.default
        }),
    )

    for (const command of commands) {
        if (command) commandsMap[command.data.name] = command
    }

    return commandsMap
}
