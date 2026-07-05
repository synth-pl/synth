const { Lexer } = require('../dist/lexer.js')
const { Parser } = require('../dist/parser.js')
const { Codegen } = require('../dist/codegen.js')

const src = `type Score = int where value >= 0 and value <= 100
fn grade(s: Score) -> string = "ok"
console.log(grade(95))`

const tokens = new Lexer(src).tokenize()
const { ast, errors } = new Parser(tokens).parse()
console.log('errors:', errors)
const js = new Codegen().generate(ast)
const scoreLine = js.split('\n').find(l => l.includes('validate_Score'))
console.log('Score validator:', scoreLine)
