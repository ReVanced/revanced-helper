import * as fs from 'fs'

fs.cpSync('../../node_modules/tesseract.js', './dist/tesseract.js', { recursive: true })
