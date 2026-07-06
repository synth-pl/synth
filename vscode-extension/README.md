# Synth Language

Syntax highlighting and language support for [Synth](https://github.com/synth-pl/synth) — an AI-native programming language that transpiles to JavaScript.

## Features

- Syntax highlighting for `.syn` files
- Bracket matching and auto-closing
- Comment toggling (`//` line comments)
- Language icons

## About Synth

Synth is a concise, expressive language designed for AI-assisted development. Features include:

- `store` — reactive state
- `match` — pattern matching
- `@memo` — memoization
- `do` notation — block expressions
- Pipeline operator (`|>`)
- Spread, object shorthand, async/await

```synth
store Player {
  hp:    int    = 100
  level: int    = 1
}

fn status(hp) =
  match hp {
    | 0       => "defeated"
    | 1..25   => "critical"
    | 26..50  => "hurt"
    | _       => "healthy"
  }
```

## Links

- [GitHub](https://github.com/synth-pl/synth)
- [Live Playground](https://synth-pl.github.io/synth/playground.html)
- [Language Demos](https://synth-pl.github.io/synth/landing.html)
