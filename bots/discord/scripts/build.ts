import { createLogger } from '@revanced/bot-shared'
import { cp, rename, rm } from 'fs/promises'

const logger = createLogger()

logger.warn('Cleaning previous build...')
await rm('./dist', { recursive: true })

logger.info('Building bot...')
await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'bun',
    external: ['./config.js'],
    minify: true,
    sourcemap: 'external',
})

logger.info('Copying config...')
await cp('config.js', 'dist/config.js')

logger.info('Copying database schema...')
await rename('.drizzle', 'dist/.drizzle')
