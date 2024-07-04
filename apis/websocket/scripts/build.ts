import { createLogger } from '@revanced/bot-shared'
import { cp } from 'fs/promises'

async function build(): Promise<void> {
    const logger = createLogger()

    logger.info('Building Tesseract.js worker...')
    await Bun.build({
        entrypoints: ['../../node_modules/tesseract.js/src/worker-script/node/index.js'],
        target: 'bun',
        outdir: './dist/worker',
    })

    logger.info('Building WebSocket API...')
    await Bun.build({
        entrypoints: ['./src/index.ts'],
        outdir: './dist',
        target: 'bun',
    })
}

await build()
await cp('config.json', 'dist/config.json')
