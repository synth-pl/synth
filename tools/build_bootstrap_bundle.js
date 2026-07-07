#!/usr/bin/env node
// Build a bootstrap compiler bundle from any Synth compiler bundle.
// Run: npm run build:bootstrap
//      npm run build:bootstrap2

const path = require('path')
const { ROOT, buildBootstrapBundle } = require('./bootstrap_common')

const STAGE1    = path.join(ROOT, 'dist', 'compiler.synth.js')
const BOOTSTRAP = path.join(ROOT, 'dist', 'compiler.bootstrap.js')

function parseArgs(argv) {
  let compiler = STAGE1
  let out = BOOTSTRAP
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--compiler' && argv[i + 1]) {
      compiler = path.resolve(argv[++i])
    } else if (argv[i] === '--out' && argv[i + 1]) {
      out = path.resolve(argv[++i])
    }
  }
  return { compiler, out }
}

function main() {
  const { compiler, out } = parseArgs(process.argv.slice(2))
  const info = buildBootstrapBundle(compiler, out)
  const tag = path.basename(compiler) + ' → ' + path.basename(out)
  console.log(`✓ Bootstrap bundle: ${info.modules.join(' + ')} (${tag})`)
  console.log(`  ${info.modules.length} modules → ${info.lines} lines JS`)
}

main()
