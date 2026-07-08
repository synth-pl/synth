# Synth Language

Syntax highlighting and language support for [Synth](https://github.com/synth-pl/synth) — an AI-native programming language that transpiles to JavaScript.

## Install

### From Open VSX (recommended)

Works in **Cursor**, **VS Code**, and **VSCodium** — installs globally for your user account:

```bash
cursor --install-extension synth-lang.synth-language
```

```bash
code --install-extension synth-lang.synth-language
```

Or search **Synth Language** in the Extensions panel (`synth-lang.synth-language`).

After installing, reload the window once. Open any `.syn` file — the status bar should show **Synth** with syntax colors.

### Local install (development)

From this directory:

```powershell
.\install.ps1
```

Builds a VSIX, installs globally, and caches a copy at `%USERPROFILE%\.synth\synth-language.vsix`.

> Grammar-only extension — no `main` script or activation race. The TextMate grammar loads declaratively and survives restarts reliably.

See [PUBLISHING.md](./PUBLISHING.md) for maintainer release steps.

## Features

- Syntax highlighting for `.syn` files (template literals, triple-quoted strings, `store`/`on`, `async`/`await`, `and`/`or`/`not`, `??`/`?.`, hex/binary numbers)
- Bracket matching and auto-closing
- Comment toggling (`//` line comments)

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

- [Open VSX](https://open-vsx.org/extension/synth-lang/synth-language)
- [GitHub](https://github.com/synth-pl/synth)
- [Live Playground](https://synth-pl.github.io/synth/playground.html)
- [Language Demos](https://synth-pl.github.io/synth/landing.html)
