import { createLogger } from '@revanced/bot-shared'
import { cp, rm } from 'fs/promises'

async function build(): Promise<void> {
    const logger = createLogger()

    logger.info('Cleaning previous build...')
    await rm('./dist', { recursive: true })

    logger.info('Building Tesseract.js worker...')
    await Bun.build({
        entrypoints: ['../../node_modules/tesseract.js/src/worker-script/node/index.js'],
        target: 'bun',
        outdir: './dist/worker',
    })

    logger.info('Copying Tesseract.js WASM...')
    await cp('../../node_modules/tesseract.js-core', './dist/worker/core', { recursive: true })

    logger.info('Building WebSocket API...')
    await Bun.build({
        entrypoints: ['./src/index.ts'],
        outdir: './dist',
        target: 'bun',
    })
}

await build()
await cp('config.json', 'dist/config.json')
