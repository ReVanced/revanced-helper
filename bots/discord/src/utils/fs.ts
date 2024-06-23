import { readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'bun'

export const listAllFilesRecursive = (dir: string): string[] =>
    readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter(x => x.isFile())
        .map(x => join(x.parentPath, x.name))

export const pathJoinCurrentDir = (importMetaUrl: string, ...objects: [string, ...string[]]) =>
    join(dirname(fileURLToPath(importMetaUrl)), ...objects)
