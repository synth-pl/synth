// Phase 7 bootstrap harness:
// 1. Stage-1 Synth compiles each compiler/*.syn module → valid JS
// 2. Bootstrap bundle (Synth-compiled modules) passes fixture parity vs goldens
// Run: npm run test:bootstrap

const fs   = require('fs')
const path = require('path')
const vm   = require('vm')
const { execSync } = require('child_process')

const ROOT              = path.join(__dirname, '..')
const COMPILER_DIR      = path.join(ROOT, 'compiler')
const GOLDENS_DIR       = path.join(ROOT, 'compiler', 'goldens')
const FIXTURES_DIR      = path.join(ROOT, 'compiler', 'fixtures')
const CHECKER_FIXTURES  = path.join(ROOT, 'compiler', 'checker_fixtures')
const STAGE1            = path.join(ROOT, 'dist', 'compiler.synth.js')
const BOOTSTRAP         = path.join(ROOT, 'dist', 'compiler.bootstrap.js')

const MODULES = [
  'token.syn',
  'lexer.syn',
  'ast.syn',
  'parser.syn',
  'checker.syn',
  'codegen.syn',
  'driver.syn',
]

function loadBundle(bundlePath) {
  const body = fs.readFileSync(bundlePath, 'utf8')
    + '\nmodule.exports = { compile, tokenize, parse, generate, check, check_source };'
  const module = { exports: {} }
  new vm.Script(body, { filename: bundlePath }).runInNewContext({
    module,
    exports: module.exports,
    console,
    String,
    Array,
    Math,
    Object,
    JSON,
    Map,
    Set,
  })
  return module.exports
}

function validateJs(js) {
  try {
    new Function(js)
    return null
  } catch (e) {
    return String(e.message || e)
  }
}

function serializeTokens(tokens) {
  return tokens.map(t => ({
    type:  t.type,
    value: t.value,
    line:  t.line,
    col:   t.col,
  }))
}

function serializeAst(node) {
  if (node === null || node === undefined) return null
  if (typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(serializeAst)
  const out = {}
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined) continue
    out[key] = serializeAst(value)
  }
  return out
}

function serializeDiagnostics(diags) {
  return diags.map(d => ({
    severity: d.severity,
    message:  d.message,
    line:     d.line,
  }))
}

function diffJson(expected, actual, label, p = label) {
  const errors = []
  if (typeof expected !== typeof actual) {
    errors.push(`${p}: type ${typeof expected} vs ${typeof actual}`)
    return errors
  }
  if (expected === null || typeof expected !== 'object') {
    if (expected !== actual) errors.push(`${p}: ${JSON.stringify(expected)} vs ${JSON.stringify(actual)}`)
    return errors
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      errors.push(`${p}: expected array`)
      return errors
    }
    if (expected.length !== actual.length) {
      errors.push(`${p}: length ${expected.length} vs ${actual.length}`)
    }
    const n = Math.min(expected.length, actual.length)
    for (let i = 0; i < n; i++) {
      errors.push(...diffJson(expected[i], actual[i], label, `${p}[${i}]`))
    }
    return errors
  }
  for (const key of Object.keys(expected)) {
    if (!(key in actual)) errors.push(`${p}.${key}: missing`)
    else errors.push(...diffJson(expected[key], actual[key], label, `${p}.${key}`))
  }
  return errors
}

function diffTokens(expected, actual, label) {
  const errors = []
  if (expected.length !== actual.length) {
    errors.push(`${label}: token count ${expected.length} vs ${actual.length}`)
  }
  const n = Math.min(expected.length, actual.length)
  for (let i = 0; i < n; i++) {
    for (const key of ['type', 'value', 'line', 'col']) {
      if (expected[i][key] !== actual[i][key]) {
        errors.push(`${label}[${i}].${key}: ${JSON.stringify(expected[i][key])} vs ${JSON.stringify(actual[i][key])}`)
      }
    }
  }
  return errors
}

function loadGolden(kind, name) {
  if (kind === 'tokens') {
    return JSON.parse(fs.readFileSync(path.join(GOLDENS_DIR, `tokens_${name}.json`), 'utf8'))
  }
  if (kind === 'ast') {
    return JSON.parse(fs.readFileSync(path.join(GOLDENS_DIR, `ast_${name}.json`), 'utf8'))
  }
  if (kind === 'diagnostics') {
    return JSON.parse(fs.readFileSync(path.join(GOLDENS_DIR, `diagnostics_${name}.json`), 'utf8'))
  }
  return fs.readFileSync(path.join(GOLDENS_DIR, `js_${name}.js`), 'utf8')
}

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
        const ratio = result.js.length / golden.length
        goldenNote = ` (synth ${result.js.length}B vs TS ${golden.length}B, ${(ratio * 100).toFixed(0)}%)`
      }
      console.log(`ok  ${file} → valid JS${goldenNote}`)
    } catch (e) {
      failed = true
      console.error(`FAIL ${file}:`, e.message)
    }
  }
  return failed
}

function testBundleParity(bundle, label) {
  let failed = false
  const fixtures = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.syn')).sort()

  let lexerFailed = false
  for (const file of fixtures) {
    const name = path.basename(file, '.syn')
    const src = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
    try {
      const actual = serializeTokens(bundle.tokenize(src))
      const expected = loadGolden('tokens', name)
      const errors = diffTokens(expected, actual, `${label}:tokens:${name}`)
      if (errors.length) {
        lexerFailed = true
        console.error(`FAIL ${label} lexer ${name}`)
        errors.slice(0, 5).forEach(e => console.error('  ', e))
      }
    } catch (e) {
      lexerFailed = true
      console.error(`FAIL ${label} tokenize(${name}):`, e.message)
    }
  }
  if (!lexerFailed) console.log(`ok  ${label} lexer vs goldens (${fixtures.length} fixtures)`)
  failed = failed || lexerFailed

  let parserFailed = false
  for (const file of fixtures) {
    const name = path.basename(file, '.syn')
    const src = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
    try {
      const actual = serializeAst(bundle.parse(bundle.tokenize(src)))
      const expected = loadGolden('ast', name)
      const errors = diffJson(expected, actual, name)
      if (errors.length) {
        parserFailed = true
        console.error(`FAIL ${label} parser ${name}`)
        errors.slice(0, 5).forEach(e => console.error('  ', e))
      }
    } catch (e) {
      parserFailed = true
      console.error(`FAIL ${label} parse(${name}):`, e.message)
    }
  }
  if (!parserFailed) console.log(`ok  ${label} parser vs goldens`)
  failed = failed || parserFailed

  let codegenFailed = false
  for (const file of fixtures) {
    const name = path.basename(file, '.syn')
    const src = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
    try {
      const ast = bundle.parse(bundle.tokenize(src))
      const actual = bundle.generate(ast)
      const expected = loadGolden('js', name)
      if (actual !== expected) {
        codegenFailed = true
        console.error(`FAIL ${label} codegen ${name}: ${expected.length}B expected, ${actual.length}B got`)
      }
    } catch (e) {
      codegenFailed = true
      console.error(`FAIL ${label} generate(${name}):`, e.message)
    }
  }
  if (!codegenFailed) console.log(`ok  ${label} codegen vs goldens`)
  failed = failed || codegenFailed

  const checkerFixtures = fs.readdirSync(CHECKER_FIXTURES).filter(f => f.endsWith('.syn')).sort()
  let checkerFailed = false
  for (const file of checkerFixtures) {
    const name = path.basename(file, '.syn')
    const src = fs.readFileSync(path.join(CHECKER_FIXTURES, file), 'utf8')
    try {
      const actual = serializeDiagnostics(bundle.check(bundle.parse(bundle.tokenize(src))))
      const expected = loadGolden('diagnostics', name)
      const errors = diffJson(expected, actual, name)
      if (errors.length) {
        checkerFailed = true
        console.error(`FAIL ${label} checker ${name}`)
        errors.slice(0, 5).forEach(e => console.error('  ', e))
      }
    } catch (e) {
      checkerFailed = true
      console.error(`FAIL ${label} check(${name}):`, e.message)
    }
  }
  if (!checkerFailed) console.log(`ok  ${label} checker vs goldens`)
  failed = failed || checkerFailed

  let driverFailed = false
  for (const file of fixtures) {
    const name = path.basename(file, '.syn')
    const src = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
    try {
      const result = bundle.compile(src)
      const expected = loadGolden('js', name)
      if (result.js !== expected) {
        driverFailed = true
        console.error(`FAIL ${label} driver compile ${name}: ${expected.length}B expected, ${(result.js||'').length}B got`)
      }
    } catch (e) {
      driverFailed = true
      console.error(`FAIL ${label} compile(${name}):`, e.message)
    }
  }
  if (!driverFailed) console.log(`ok  ${label} driver compile vs goldens`)
  return failed || driverFailed
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

  failed = testBundleParity(bootstrap, 'bootstrap') || failed

  if (failed) {
    console.error('\nbootstrap: checks FAILED')
    process.exit(1)
  }
  console.log('\nbootstrap: all checks passed ✓')
}

main()
