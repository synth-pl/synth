#!/usr/bin/env node
// Build dist/compiler.bootstrap.js — Synth stage-1 compiles compiler/*.syn modules.
// Run: npm run build:bootstrap

const fs   = require('fs')
const path = require('path')
const vm   = require('vm')

const ROOT       = path.join(__dirname, '..')
const COMPILER   = path.join(ROOT, 'compiler')
const ENTRY      = path.join(COMPILER, 'driver.syn')
const STAGE1     = path.join(ROOT, 'dist', 'compiler.synth.js')
const OUT        = path.join(ROOT, 'dist', 'compiler.bootstrap.js')

function loadStage1() {
  if (!fs.existsSync(STAGE1)) {
    throw new Error('missing dist/compiler.synth.js — run npm run build:compiler first')
  }
  const body = fs.readFileSync(STAGE1, 'utf8')
    + '\nmodule.exports = { compile, tokenize, parse, generate, check, check_source };'
  const module = { exports: {} }
  new vm.Script(body, { filename: STAGE1 }).runInNewContext({
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

function resolveModuleOrder(entryPath) {
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

function extractStdlib(stage1Source) {
  const start = stage1Source.indexOf('const $map =')
  const end = stage1Source.indexOf('/** @typedef {{')
  if (start < 0 || end < 0) {
    throw new Error('could not extract stdlib from stage-1 bundle')
  }
  return stage1Source.slice(start, end).trim()
}

function main() {
  const stage1Source = fs.readFileSync(STAGE1, 'utf8')
  const stdlib = extractStdlib(stage1Source)
  const synth = loadStage1()
  const modules = resolveModuleOrder(ENTRY)
  const parts = [stdlib, '']

  for (const mod of modules) {
    const result = synth.compile(mod.source)
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

  fs.writeFileSync(OUT, parts.join('\n\n'))
  const lines = parts.join('\n').split('\n').length
  console.log(`✓ Bootstrap bundle: ${modules.map(m => m.name).join(' + ')} → compiler.bootstrap.js`)
  console.log(`  ${modules.length} modules → ${lines} lines JS`)
}

main()
