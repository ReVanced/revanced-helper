import { readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'bun'

export const listAllFilesRecursive = (dir: string): string[] => {
    const files = readdirSync(dir)
    const result: string[] = []
    for (const file of files) {
        const filePath = join(dir, file)
        const fileStat = statSync(filePath)
        if (fileStat.isDirectory()) {
            result.push(...listAllFilesRecursive(filePath))
        } else {
            result.push(filePath)
        }
    }
    return result
}

export const pathJoinCurrentDir = (importMetaUrl: string, ...objects: [string, ...string[]]) =>
    join(dirname(fileURLToPath(importMetaUrl)), ...objects)
