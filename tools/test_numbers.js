const { Lexer } = require('../dist/lexer.js')
const { Parser } = require('../dist/parser.js')

// Patch expectIdentOrKeyword to show what token is failing
const OrigParser = Parser
const origExpect = Parser.prototype.expectIdentOrKeyword
Parser.prototype.expectIdentOrKeyword = function() {
  const tok = this.peek()
  console.log('expectIdentOrKeyword tok:', JSON.stringify(tok))
  return origExpect.call(this)
}

const src = `let population  = 8_000_000_000
let red         = 0xFF0000
let FULL_PERMS  = 0b0111
let golden      = 1.618_033_988
console.log(population.toLocaleString())
console.log(red.toString(16))
console.log(FULL_PERMS.toString(2))
console.log(golden.toFixed(6))`

try {
  const tokens = new Lexer(src).tokenize()
  const { ast, errors } = new Parser(tokens).parse()
  console.log('errors:', errors)
  console.log('OK')
} catch(e) {
  console.error('Error:', e.message)
}
