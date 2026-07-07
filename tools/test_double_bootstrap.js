// Phase 8 — true double-bootstrap:
// Bootstrap v1 compiles compiler/*.syn → bootstrap v2; v2 runs full parity with no stage-1 loaded.
// Run: npm run test:double-bootstrap

const fs   = require('fs')
const path = require('path')
const { ROOT, loadBundle, buildBootstrapBundle, validateJs } = require('./bootstrap_common')
const { runBundleParityTests, runAstConstructorTests } = require('./parity_common')

const BOOTSTRAP  = path.join(ROOT, 'dist', 'compiler.bootstrap.js')
const BOOTSTRAP2 = path.join(ROOT, 'dist', 'compiler.bootstrap2.js')

function compareBundles(v1Path, v2Path) {
  const v1 = fs.readFileSync(v1Path, 'utf8')
  const v2 = fs.readFileSync(v2Path, 'utf8')
  if (v1 === v2) {
    console.log('ok  bootstrap v1 vs v2: byte-identical')
    return false
  }
  console.log(`note bootstrap v1 vs v2: ${v1.length}B vs ${v2.length}B (${(v2.length / v1.length * 100).toFixed(1)}%)`)
  let i = 0
  while (i < v1.length && i < v2.length && v1[i] === v2[i]) i++
  console.log(`note first diff at byte ${i}`)
  return false
}

function testSelfCompileSyn(bundle, label) {
  const hello = 'export fn hello() -> string { "hi" }'
  try {
    const result = bundle.compile(hello)
    const err = validateJs(result.js || '')
    if (err) {
      console.error(`FAIL ${label} compile hello.syn: invalid JS — ${err}`)
      return true
    }
    const fn = new Function(result.js + '\nreturn hello();')
    if (fn() !== 'hi') {
      console.error(`FAIL ${label} compile hello.syn: wrong result`)
      return true
    }
    console.log(`ok  ${label} compile hello.syn`)
    return false
  } catch (e) {
    console.error(`FAIL ${label} compile hello.syn:`, e.message)
    return true
  }
}

function main() {
  if (!fs.existsSync(BOOTSTRAP)) {
    console.error('missing dist/compiler.bootstrap.js — run npm run build:bootstrap first')
    process.exit(1)
  }

  console.log('── double-bootstrap: v1 compiles v2 (no stage-1) ──')
  let failed = false
  try {
    const info = buildBootstrapBundle(BOOTSTRAP, BOOTSTRAP2)
    console.log(`✓ built compiler.bootstrap2.js (${info.lines} lines, ${info.bytes} bytes)`)
  } catch (e) {
    console.error('FAIL building bootstrap2:', e.message)
    process.exit(1)
  }

  failed = compareBundles(BOOTSTRAP, BOOTSTRAP2) || failed

  console.log('\n── bootstrap v2 parity (runtime: bootstrap2 only) ──')
  let bundle2
  try {
    bundle2 = loadBundle(BOOTSTRAP2)
  } catch (e) {
    console.error('FAIL loading bootstrap2:', e.message)
    process.exit(1)
  }

  failed = runBundleParityTests(bundle2, 'bootstrap2') || failed
  failed = runAstConstructorTests(bundle2, 'bootstrap2', BOOTSTRAP2) || failed
  failed = testSelfCompileSyn(bundle2, 'bootstrap2') || failed

  if (failed) {
    console.error('\ndouble-bootstrap: checks FAILED')
    process.exit(1)
  }
  console.log('\ndouble-bootstrap: all checks passed ✓')
}

main()
