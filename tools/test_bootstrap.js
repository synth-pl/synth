// Phase 7 bootstrap harness:
// 1. Stage-1 Synth compiles each compiler/*.syn module → valid JS
// 2. Bootstrap bundle (Synth-compiled modules) passes fixture parity vs goldens
// Run: npm run test:bootstrap

const fs   = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { ROOT, loadBundle, validateJs } = require('./bootstrap_common')
const { runBundleParityTests } = require('./parity_common')

const COMPILER_DIR = path.join(ROOT, 'compiler')
const GOLDENS_DIR  = path.join(ROOT, 'compiler', 'goldens')
const STAGE1       = path.join(ROOT, 'dist', 'compiler.synth.js')
const BOOTSTRAP    = path.join(ROOT, 'dist', 'compiler.bootstrap.js')

const MODULES = [
  'token.syn',
  'lexer.syn',
  'ast.syn',
  'parser.syn',
  'checker.syn',
  'codegen.syn',
  'driver.syn',
]

function testSelfHostModules(stage1) {
  let failed = false
  console.log('\n── self-host: compile each compiler module ──')

  for (const file of MODULES) {
    const name = path.basename(file, '.syn')
    const src = fs.readFileSync(path.join(COMPILER_DIR, file), 'utf8')
    try {
      const result = stage1.compile(src)
      const err = validateJs(result.js || '')
      if (err) {
        failed = true
        console.error(`FAIL ${file}: invalid JS — ${err}`)
        continue
      }
      let goldenNote = ''
      const goldenPath = path.join(GOLDENS_DIR, `bootstrap_${name}.js`)
      if (fs.existsSync(goldenPath)) {
        const golden = fs.readFileSync(goldenPath, 'utf8')
        goldenNote = ` (synth ${result.js.length}B vs TS ${golden.length}B, ${(result.js.length / golden.length * 100).toFixed(0)}%)`
      }
      console.log(`ok  ${file} → valid JS${goldenNote}`)
    } catch (e) {
      failed = true
      console.error(`FAIL ${file}:`, e.message)
    }
  }
  return failed
}

function main() {
  if (!fs.existsSync(STAGE1)) {
    console.error('missing dist/compiler.synth.js — run npm run build:compiler')
    process.exit(1)
  }

  let failed = false
  const stage1 = loadBundle(STAGE1)
  failed = testSelfHostModules(stage1) || failed

  console.log('\n── build bootstrap bundle ──')
  execSync(`node "${path.join(__dirname, 'build_bootstrap_bundle.js')}"`, { stdio: 'inherit' })

  if (!fs.existsSync(BOOTSTRAP)) {
    console.error('FAIL bootstrap bundle not produced')
    process.exit(1)
  }

  console.log('\n── bootstrap bundle parity ──')
  let bootstrap
  try {
    bootstrap = loadBundle(BOOTSTRAP)
  } catch (e) {
    console.error('FAIL loading bootstrap bundle:', e.message)
    process.exit(1)
  }

  failed = runBundleParityTests(bootstrap, 'bootstrap') || failed

  if (failed) {
    console.error('\nbootstrap: checks FAILED')
    process.exit(1)
  }
  console.log('\nbootstrap: all checks passed ✓')
}

main()
