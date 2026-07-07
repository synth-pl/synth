// Generate bootstrap goldens: TS oracle JS for each compiler/*.syn module.
// Run: npm run gen:bootstrap-goldens

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const COMPILER_DIR = path.join(__dirname, '..', 'compiler')
const GOLDENS_DIR  = path.join(__dirname, '..', 'compiler', 'goldens')
const CLI          = path.join(__dirname, '..', 'dist', 'cli.js')

const MODULES = [
  'token.syn',
  'lexer.syn',
  'ast.syn',
  'parser.syn',
  'checker.syn',
  'codegen.syn',
  'driver.syn',
]

function main() {
  if (!fs.existsSync(GOLDENS_DIR)) {
    fs.mkdirSync(GOLDENS_DIR, { recursive: true })
  }

  for (const file of MODULES) {
    const name = path.basename(file, '.syn')
    const input = path.join(COMPILER_DIR, file)
    const js = execSync(`node "${CLI}" "${input}"`, {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    })
    const outPath = path.join(GOLDENS_DIR, `bootstrap_${name}.js`)
    fs.writeFileSync(outPath, js)
    console.log(`wrote ${path.relative(process.cwd(), outPath)} (${js.length} bytes)`)
  }
}

main()
