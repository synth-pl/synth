const { Lexer } = require('../dist/lexer.js');
const { Parser } = require('../dist/parser.js');
const { Codegen } = require('../dist/codegen.js');
const stdlib = require('../dist/stdlib.js');
const vm = require('vm');

const src = `
print("Hello, World!")
print("Answer:", 42)
println("Section one")
print("After the gap")
`;

const { ast, errors } = new Parser(new Lexer(src).tokenize()).parse();
if (errors.length) { console.error('PARSE ERROR:', errors[0].message); process.exit(1); }
const js = new Codegen().generate(ast);
const ctx = { console, ...stdlib };
vm.createContext(ctx);
vm.runInContext(js, ctx);
console.log('\nPASS');
