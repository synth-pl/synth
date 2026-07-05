const fs = require('fs'), vm = require('vm')
const ctx = { globalThis: {}, console }
ctx.window = ctx
vm.createContext(ctx)
vm.runInContext(fs.readFileSync('demo/axon.compiler.js', 'utf8'), ctx)

const src = `type Score = int where value >= 0 and value <= 100
fn grade(s: Score) -> string = "ok"
console.log(grade(95))`

const r = ctx.AxonCompiler.compile(src)
console.log('errors:', r.errors)
console.log('constraint lines:', r.js && r.js.split('\n').filter(l => l.includes('Score') || l.includes(' and ')))
