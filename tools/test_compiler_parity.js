// Parity harness: TS lexer oracle vs goldens; Synth lexer when bundle exists.

const fs = require('fs')
const path = require('path')
const { Lexer } = require('../dist/lexer.js')

const FIXTURES_DIR = path.join(__dirname, '..', 'compiler', 'fixtures')
const GOLDENS_DIR  = path.join(__dirname, '..', 'compiler', 'goldens')
const SYNTH_BUNDLE = path.join(__dirname, '..', 'dist', 'compiler.synth.js')

function serializeTokens(tokens) {
  return tokens.map(t => ({
    type:  t.type,
    value: t.value,
    line:  t.line,
    col:   t.col,
  }))
}

function loadGolden(name) {
  const p = path.join(GOLDENS_DIR, `tokens_${name}.json`)
  if (!fs.existsSync(p)) {
    throw new Error(`missing golden: ${p} (run npm run gen:lexer-goldens)`)
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function diffTokens(expected, actual, label) {
  const errors = []
  const n = Math.max(expected.length, actual.length)
  for (let i = 0; i < n; i++) {
    const e = expected[i]
    const a = actual[i]
    if (!e) {
      errors.push(`${label}[${i}]: extra token ${JSON.stringify(a)}`)
      continue
    }
    if (!a) {
      errors.push(`${label}[${i}]: missing token ${JSON.stringify(e)}`)
      continue
    }
    for (const key of ['type', 'value', 'line', 'col']) {
      if (e[key] !== a[key]) {
        errors.push(
          `${label}[${i}].${key}: expected ${JSON.stringify(e[key])}, got ${JSON.stringify(a[key])}`
        )
      }
    }
  }
  return errors
}

function testTsLexerVsGoldens() {
  const fixtures = fs.readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith('.syn'))
    .sort()

  let failed = false
  for (const file of fixtures) {
    const name = path.basename(file, '.syn')
    const src  = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
    const actual   = serializeTokens(new Lexer(src).tokenize())
    const expected = loadGolden(name)
    const errors   = diffTokens(expected, actual, name)
    if (errors.length > 0) {
      failed = true
      console.error(`FAIL TS lexer vs golden: ${name}`)
      for (const e of errors.slice(0, 10)) console.error('  ', e)
      if (errors.length > 10) console.error(`  ... and ${errors.length - 10} more`)
    } else {
      console.log(`ok  TS lexer vs golden: ${name} (${actual.length} tokens)`)
    }
  }
  return failed
}

function loadSynthBundle(bundlePath) {
  const module = { exports: {} }
  const exports = module.exports
  const body = fs.readFileSync(bundlePath, 'utf8')
    + '\nmodule.exports = { compile, tokenize, parse, generate };'
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', body)(module, exports)
  return module.exports
}

function testSynthLexerVsGoldens() {
  if (!fs.existsSync(SYNTH_BUNDLE)) {
    console.log('skip Synth lexer (no dist/compiler.synth.js — run npm run build:compiler)')
    return false
  }

  let synth
  try {
    synth = loadSynthBundle(SYNTH_BUNDLE)
  } catch (err) {
    console.error('FAIL loading Synth compiler bundle:', err.message)
    return true
  }

  if (typeof synth.compile !== 'function') {
    console.error('FAIL Synth bundle: export compile not found')
    return true
  }

  // Phase 1: once lexer.syn is implemented, tokenize via compile internals or
  // a dedicated export. For now we only verify the bundle loads and runs.
  const fixtures = fs.readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith('.syn'))
    .sort()

  let failed = false
  for (const file of fixtures) {
    const name = path.basename(file, '.syn')
    const src  = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
    try {
      const result = synth.compile(src)
      if (!result || typeof result.js !== 'string') {
        failed = true
        console.error(`FAIL Synth compile(${name}): unexpected result shape`)
      } else {
        console.log(`ok  Synth compile stub: ${name}`)
      }
    } catch (err) {
      failed = true
      console.error(`FAIL Synth compile(${name}):`, err.message)
    }
  }
  return failed
}

function main() {
  let failed = false
  failed = testTsLexerVsGoldens() || failed
  failed = testSynthLexerVsGoldens() || failed
  if (failed) process.exit(1)
  console.log('compiler parity: all checks passed')
}

main()
