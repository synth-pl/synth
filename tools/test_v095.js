const { Lexer } = require('../dist/lexer.js')
const { Parser } = require('../dist/parser.js')
const { Codegen } = require('../dist/codegen.js')

const src = `
enum Status = Active | Paused | Done

fn getLabel(s: Status) = s

let cost = 1_000_000
let hex = 0xFF
let bin = 0b1010
let pi = 3.141_592
`

const tokens = new Lexer(src).tokenize()
const { ast, errors } = new Parser(tokens).parse()

if (errors.length) {
  console.error('Parse errors:', errors.map(e => e.message))
  process.exit(1)
}

const js = new Codegen().generate(ast, false)
console.log('=== Generated JS ===')
console.log(js)
console.log('=== Multi-error test ===')
const badSrc = `
fn broken(x) = x +++
fn also_broken = 42
fn good(x) = x + 1
`
const { ast: ast2, errors: errs2 } = new Parser(new Lexer(badSrc).tokenize()).parse()
console.log(`Collected ${errs2.length} parse error(s) (expect >= 1):`)
for (const e of errs2) console.log(`  [line ${e.line}:${e.col}] ${e.message}`)
console.log(`Recovered AST has ${ast2.body.length} declaration(s) (expect some)`)
console.log('All checks passed!')
process.exit(0)
