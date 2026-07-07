// Shared golden diff helpers + bundle parity runner.

const fs   = require('fs')
const path = require('path')
const vm   = require('vm')
const { resolveModuleOrder, extractStdlib } = require('./bootstrap_common')

const FIXTURES_DIR     = path.join(__dirname, '..', 'compiler', 'fixtures')
const CHECKER_FIXTURES = path.join(__dirname, '..', 'compiler', 'checker_fixtures')
const GOLDENS_DIR      = path.join(__dirname, '..', 'compiler', 'goldens')

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

function loadTokenGolden(name) {
  return JSON.parse(fs.readFileSync(path.join(GOLDENS_DIR, `tokens_${name}.json`), 'utf8'))
}

function loadAstGolden(name) {
  return JSON.parse(fs.readFileSync(path.join(GOLDENS_DIR, `ast_${name}.json`), 'utf8'))
}

function loadDiagnosticsGolden(name) {
  return JSON.parse(fs.readFileSync(path.join(GOLDENS_DIR, `diagnostics_${name}.json`), 'utf8'))
}

function loadJsGolden(name) {
  return fs.readFileSync(path.join(GOLDENS_DIR, `js_${name}.js`), 'utf8')
}

function diffText(expected, actual, label) {
  if (expected === actual) return []
  return [`${label}: expected ${expected.length} bytes, got ${actual.length} bytes`]
}

function diffJson(expected, actual, label, p = label) {
  const errors = []
  if (expected === actual) return errors
  if (typeof expected !== typeof actual) {
    errors.push(`${p}: type ${typeof expected} vs ${typeof actual}`)
    return errors
  }
  if (expected === null || actual === null || typeof expected !== 'object') {
    if (expected !== actual) {
      errors.push(`${p}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    }
    return errors
  }
  if (Array.isArray(expected) !== Array.isArray(actual)) {
    errors.push(`${p}: array mismatch`)
    return errors
  }
  if (Array.isArray(expected)) {
    const n = Math.max(expected.length, actual.length)
    for (let i = 0; i < n; i++) {
      errors.push(...diffJson(expected[i], actual[i], label, `${p}[${i}]`))
    }
    return errors
  }
  const keys = new Set([...Object.keys(expected), ...Object.keys(actual)])
  for (const key of [...keys].sort()) {
    if (!(key in expected)) {
      errors.push(`${p}.${key}: extra field ${JSON.stringify(actual[key])}`)
      continue
    }
    if (!(key in actual)) {
      errors.push(`${p}.${key}: missing field ${JSON.stringify(expected[key])}`)
      continue
    }
    errors.push(...diffJson(expected[key], actual[key], label, `${p}.${key}`))
  }
  return errors
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

function runBundleParityTests(bundle, label) {
  let failed = false
  const fixtures = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.syn')).sort()

  for (const file of fixtures) {
    const name = path.basename(file, '.syn')
    const src = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
    try {
      const actual = serializeTokens(bundle.tokenize(src))
      const expected = loadTokenGolden(name)
      const errors = diffTokens(expected, actual, `${label}:tokens:${name}`)
      if (errors.length) {
        failed = true
        console.error(`FAIL ${label} lexer ${name}`)
        errors.slice(0, 5).forEach(e => console.error('  ', e))
      }
    } catch (e) {
      failed = true
      console.error(`FAIL ${label} tokenize(${name}):`, e.message)
    }
  }
  if (!failed) console.log(`ok  ${label} lexer vs goldens (${fixtures.length} fixtures)`)

  let parserFailed = false
  for (const file of fixtures) {
    const name = path.basename(file, '.syn')
    const src = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
    try {
      const actual = serializeAst(bundle.parse(bundle.tokenize(src)))
      const expected = loadAstGolden(name)
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
      const expected = loadJsGolden(name)
      const diffs = diffText(expected, actual, `${label}:codegen:${name}`)
      if (diffs.length) {
        codegenFailed = true
        console.error(`FAIL ${label} codegen ${name}`)
        diffs.forEach(e => console.error('  ', e))
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
      const actual = serializeDiagnostics(bundle.check_source(src))
      const expected = loadDiagnosticsGolden(name)
      const errors = diffJson(expected, actual, name)
      if (errors.length) {
        checkerFailed = true
        console.error(`FAIL ${label} checker ${name}`)
        errors.slice(0, 5).forEach(e => console.error('  ', e))
      }
    } catch (e) {
      checkerFailed = true
      console.error(`FAIL ${label} check_source(${name}):`, e.message)
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
      const expected = loadJsGolden(name)
      const diffs = diffText(expected, result.js, `${label}:driver:${name}`)
      if (diffs.length) {
        driverFailed = true
        console.error(`FAIL ${label} driver compile ${name}`)
        diffs.forEach(e => console.error('  ', e))
      }
    } catch (e) {
      driverFailed = true
      console.error(`FAIL ${label} compile(${name}):`, e.message)
    }
  }
  if (!driverFailed) console.log(`ok  ${label} driver compile vs goldens`)
  return failed || driverFailed
}

function runAstConstructorTests(bundle, label, bundlePathForStdlib) {
  const testEntry = path.join(__dirname, '..', 'compiler', 'ast_test.syn')
  const modules = resolveModuleOrder(testEntry)
  const parts = []
  for (let i = 0; i < modules.length; i++) {
    let source = modules[i].source
    if (i > 0) {
      source = source.replace(/^import\s+\{[^}]+\}\s+from\s+"[^"]+"\s*\n?/m, '')
    }
    const result = bundle.compile(source)
    if (!result || typeof result.js !== 'string') {
      console.error(`FAIL ${label} AST constructor tests: no JS for ${modules[i].name}`)
      return true
    }
    parts.push(result.js)
  }
  const js = parts.join('\n\n')
  try {
    const err = (() => { try { new Function(js); return null } catch (e) { return String(e.message || e) } })()
    if (err) {
      console.error(`FAIL ${label} AST constructor tests: invalid JS — ${err}`)
      return true
    }
    const ctx = vm.createContext({
      console,
      process,
      Math,
      JSON,
      Array,
      Object,
      Map,
      Set,
      String,
      Number,
      Boolean,
      globalThis: {},
    })
    ctx.globalThis = ctx
    if (bundlePathForStdlib && fs.existsSync(bundlePathForStdlib)) {
      const stdlib = extractStdlib(fs.readFileSync(bundlePathForStdlib, 'utf8'))
      vm.runInContext(stdlib, ctx)
    }
    vm.runInContext('{\n' + js + '\n}', ctx)
    const summary = ctx.__runSynthTests?.() ?? { passed: 0, failed: 0, total: 0, results: [] }
    if (summary.failed > 0 || summary.total === 0) {
      console.error(`FAIL ${label} AST constructor tests: ${summary.failed}/${summary.total} failed`)
      for (const r of (summary.results || []).slice(0, 5)) {
        console.error(`  ${r.ok ? 'ok' : 'FAIL'} ${r.desc}${r.error ? ` (${r.error})` : ''}`)
      }
      return true
    }
    console.log(`ok  ${label} AST constructor tests (${summary.total} passed)`)
    return false
  } catch (e) {
    console.error(`FAIL ${label} AST constructor tests:`, e.message)
    return true
  }
}

module.exports = {
  FIXTURES_DIR,
  CHECKER_FIXTURES,
  GOLDENS_DIR,
  serializeTokens,
  serializeAst,
  serializeDiagnostics,
  loadTokenGolden,
  loadAstGolden,
  loadDiagnosticsGolden,
  loadJsGolden,
  diffText,
  diffJson,
  diffTokens,
  runBundleParityTests,
  runAstConstructorTests,
}
