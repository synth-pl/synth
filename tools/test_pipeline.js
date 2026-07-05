const { Lexer } = require('../dist/lexer.js')
const { Parser } = require('../dist/parser.js')
const { Codegen } = require('../dist/codegen.js')
const vm = require('vm')

const src = `record User {
  name:  string
  score: int
}

let users = [
  User("Alice", 94),
  User("Bob",   61),
  User("Eve",   99),
]

let ranked = users |> sort_by(.score)
console.log(ranked)`

const { ast, errors } = new Parser(new Lexer(src).tokenize()).parse()
console.log('errors:', errors)
const js = new Codegen().generate(ast)

js.split('\n').filter(l => l.includes('sort') || l.includes('ranked') || l.includes('score')).forEach(l => console.log(l))
