const { Lexer }   = require('../dist/lexer.js')
const { Parser }  = require('../dist/parser.js')
const { Codegen } = require('../dist/codegen.js')

const examples = {
  hello: `fn greet(name: string) = "Hello, {name}!"
let msg = greet("world")
console.log(msg)`,

  types: `type Score = int where value >= 0 and value <= 100
type NonEmpty = string where length > 0
fn grade(score: Score, name: NonEmpty) -> string {
  match score {
    | n when n >= 90 => "{name}: A"
    | n when n >= 80 => "{name}: B"
    | _              => "{name}: F"
  }
}
console.log(grade(95, "Alice"))`,

  match: `type Shape =
  | Circle { r: float }
  | Rect   { w: float, h: float }
  | Point
fn area(shape: Shape) -> float {
  match shape {
    | Circle { r }  => 3.14159 * r * r
    | Rect { w, h } => w * h
    | Point         => 0.0
  }
}
console.log(area(Circle(5.0)))`,

  generics: `record Pair<A, B> { first: A\n  second: B }
fn swap<A, B>(p: Pair<A, B>) -> Pair<B, A> { Pair(p.second, p.first) }
let p = Pair(42, "hello")
let q = swap(p)
console.log(q.first)`,

  pipeline: `record User { name: string\n  score: int\n  active: bool }
let users = [User("Alice", 95, true), User("Bob", 62, false)]
let result = users |> filter(.active) |> map(.name)
for name in result { console.log(name) }`,

  store: `store Counter { value: int = 0\n  label: string = "clicks" }
on Counter.change { console.log(Counter.value) }
fn increment() { Counter.set({ value: Counter.value + 1 }) }
increment()
increment()`,

  async: `async fn fetch_user(id: int) -> string {
  await Promise.resolve(null)
  "User" + id
}
async fn main() {
  let name = await fetch_user(1)
  console.log(name)
}
main()`,

  errors: `@throws
fn parse_int(s: string) -> any {
  let n = parseInt(s, 10)
  if isNaN(n) { err("Not a number: " + s) }
  else { ok(n) }
}
fn safe_parse(s: string) -> string {
  match parse_int(s) {
    | Ok { value }    => "Parsed: " + value
    | Err { message } => "Error: " + message
  }
}
console.log(safe_parse("42"))`,

  loops: `let mut total = 0
for i in 1..=10 { total = total + i }
console.log("Sum = " + total)`,

  enums: `enum Priority = Low | Medium | High | Critical
record Task { id: int\n  title: string\n  priority: Priority }
let t = Task(1, "Design API", Priority.High)
console.log(t.title)`,

  numbers: `let population = 8_000_000_000
let red = 0xFF0000
let READ = 0b0001
console.log(population)`,

  multilambda: `record User { name: string\n  score: int }
let users = [User("Alice", 94), User("Bob", 61)]
let ranked = users |> filter(u => { let q = u.score >= 70\n  q })
for r in ranked { console.log(r.name) }`,
}

let passed = 0, failed = 0
for (const [name, src] of Object.entries(examples)) {
  try {
    const tokens = new Lexer(src).tokenize()
    const { ast, errors } = new Parser(tokens).parse()
    if (errors.length) {
      console.log(`FAIL  ${name}: ${errors.map(e => e.message).join('; ')}`)
      failed++
    } else {
      new Codegen().generate(ast)
      console.log(`ok    ${name}`)
      passed++
    }
  } catch (e) {
    console.log(`FAIL  ${name}: ${e.message}`)
    failed++
  }
}
console.log(`\n${passed} passed, ${failed} failed`)
