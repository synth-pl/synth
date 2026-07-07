// Shared helpers for bootstrap bundle build + parity tests.

const fs   = require('fs')
const path = require('path')
const vm   = require('vm')

const ROOT    = path.join(__dirname, '..')
const COMPILER = path.join(ROOT, 'compiler')
const ENTRY   = path.join(COMPILER, 'driver.syn')

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

function parseImports(source, dir) {
  const imports = []
  const re = /import\s+\{[^}]*\}\s+from\s+"(\.\/[^"]+)"/g
  for (const m of source.matchAll(re)) {
    const rel = m[1].endsWith('.syn') ? m[1] : `${m[1]}.syn`
    imports.push(path.resolve(dir, rel))
  }
  return imports
}

function resolveModuleOrder(entryPath = ENTRY) {
  const visited = new Map()
  const order = []

  function visit(absPath) {
    if (visited.has(absPath)) return
    if (!fs.existsSync(absPath)) {
      throw new Error(`module not found: ${absPath}`)
    }
    const source = fs.readFileSync(absPath, 'utf8')
    for (const dep of parseImports(source, path.dirname(absPath))) {
      visit(dep)
    }
    visited.set(absPath, source)
    order.push(absPath)
  }

  visit(entryPath)
  return order.map(absPath => ({
    absPath,
    name: path.basename(absPath),
    source: visited.get(absPath),
  }))
}

function validateJs(js) {
  try {
    new Function(js)
    return null
  } catch (e) {
    return String(e.message || e)
  }
}

function extractStdlib(bundleSource) {
  const start = bundleSource.indexOf('const $map =')
  if (start < 0) {
    throw new Error('could not find stdlib start in compiler bundle')
  }
  let end = bundleSource.indexOf('/** @typedef {{')
  if (end < 0) {
    end = bundleSource.indexOf('// ─── token.syn')
  }
  if (end < 0) {
    end = bundleSource.indexOf('\nconst Token =')
  }
  if (end < 0 || end <= start) {
    throw new Error('could not extract stdlib from compiler bundle')
  }
  return bundleSource.slice(start, end).trim()
}

function buildBootstrapBundle(compilerPath, outPath) {
  if (!fs.existsSync(compilerPath)) {
    throw new Error(`missing compiler bundle: ${compilerPath}`)
  }
  const bundleSource = fs.readFileSync(compilerPath, 'utf8')
  const stdlib = extractStdlib(bundleSource)
  const compiler = loadBundle(compilerPath)
  const modules = resolveModuleOrder(ENTRY)
  const parts = [stdlib, '']

  for (const mod of modules) {
    const result = compiler.compile(mod.source)
    if (!result || typeof result.js !== 'string' || result.js.length === 0) {
      throw new Error(`compile produced no JS: ${mod.name}`)
    }
    const syntaxErr = validateJs(result.js)
    if (syntaxErr) {
      throw new Error(`invalid JS from ${mod.name}: ${syntaxErr}`)
    }
    const pad = Math.max(0, 50 - mod.name.length)
    parts.push(`// ─── ${mod.name} ${'─'.repeat(pad)}`)
    parts.push(result.js)
  }

  fs.writeFileSync(outPath, parts.join('\n\n'))
  return {
    modules: modules.map(m => m.name),
    lines: parts.join('\n').split('\n').length,
    bytes: fs.statSync(outPath).size,
  }
}

module.exports = {
  ROOT,
  COMPILER,
  ENTRY,
  loadBundle,
  parseImports,
  resolveModuleOrder,
  validateJs,
  extractStdlib,
  buildBootstrapBundle,
}
