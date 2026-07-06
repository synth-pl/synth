import * as fs from 'fs'
import * as path from 'path'

// demo/axon.stdlib.js is the single source of truth for the Axon standard library.
// Edit that file to add or change stdlib functions; this module reads it at runtime.
const _raw = fs.readFileSync(path.join(__dirname, '..', 'demo', 'axon.stdlib.js'), 'utf8')

// Strip the file-header comment block at the top (lines beginning with //)
export const AXON_STDLIB: string = '\n' + _raw.replace(/^(\/\/[^\n]*\n)+/, '')
