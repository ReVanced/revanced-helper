import { join } from 'path'
import { readdir, stat } from 'fs/promises'

export async function listAllFilesRecursive(dir: string): Promise<string[]> {
    const files = await readdir(dir)
    const result: string[] = []
    for (const file of files) {
        const filePath = join(dir, file)
        const fileStat = await stat(filePath)
        if (fileStat.isDirectory()) {
            result.push(...(await listAllFilesRecursive(filePath)))
        } else {
            result.push(filePath)
        }
    }
    return result
}
