'use strict'
const fs = require('fs')
const path = require('path')
const { loadBundle } = require('./bootstrap_common')
const { compilerPath } = require('./oracle')

const c = loadBundle(compilerPath())
let failed = 0

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg)
    failed++
  } else {
    console.log('ok ', msg)
  }
}

const unbound = c.check_source(`fn level_description(level: int) -> string {
  LEVEL_BLURBS.find(b => b.level == level)
}
`)
assert(unbound.some(d => d.severity === 'error' && d.message.includes('LEVEL_BLURBS')), 'catches unbound LEVEL_BLURBS')
assert(!unbound.some(d => d.message.includes("'b'")), 'lambda param b is bound')

const ok = c.check_source('fn add(x: int, y: int) -> int { x + y }\n')
assert(ok.filter(d => d.severity === 'error').length === 0, 'clean fn has no errors')

const demos = [
  'examples/dungeon/main.syn',
  'examples/breakout/main.syn',
  'examples/combat/main.syn',
  'examples/drift/main.syn',
  'examples/invaders/main.syn',
  'examples/kanban/main.syn',
  'examples/neon_life/main.syn',
  'examples/vibe_grid/main.syn',
  'examples/expedition/main.syn',
  'examples/intent_router/main.syn',
  'examples/controls/main.syn',
  'examples/music/main.syn',
  'examples/rpg/main.syn',
  'examples/bazaar/main.syn',
  'examples/bazaar/items.syn',
  'examples/chronicle/main.syn',
]
for (const p of demos) {
  const full = path.join(__dirname, '..', p)
  if (!fs.existsSync(full)) {
    console.log('skip', p)
    continue
  }
  const errs = c.check_source(fs.readFileSync(full, 'utf8')).filter(d => d.severity === 'error')
  assert(errs.length === 0, p + ' has no unbound errors' + (errs.length ? ': ' + errs[0].message : ''))
}

process.exit(failed ? 1 : 0)
