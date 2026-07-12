---
name: synth
description: >-
  Work on the Synth language (synth-pl/synth): write or rewrite .syn sources,
  demos, compiler, bootstrap CLI, annotations, --spec, and rebuild pipelines.
  Use when editing Synth, .syn files, examples/, demo/, or when the user mentions
  Synth practices, demos, transpile, --check, --spec, @memo, or @intent.
---

# Synth language workflow

Synth has almost no public training data. **Do not invent TS/Rust idioms.** Read practices, then follow this procedure.

## Before coding

1. Read [synth-practices.mdc](../../rules/synth-practices.mdc) (house style).
2. On annotated modules, run `node tools/synth_bootstrap_cli.js --spec <entry.syn>` (or read `@intent` / `@pure` / `@total` / `@memo` / `@effects` on the fns you touch). Treat annotations as **rerun contracts**, not decoration.
3. Preserve **host contracts** (`demo/*.html` call sites, store field names, getter shapes). Keep `demo/*.html` URLs stable.

## While editing

- Structure: constants → records/tables; hot state → `let mut` + in-place fields; fit > feature stuffing.
- Annotations go **above** `fn`. Put `@memo` only on hot pure formulas with stable keys; don't strip existing memo without intent.
- Avoid top-level `let x: T[] = […]` (checker hang). Prefer untyped `let NAME = […]`.
- Multi-file: bak whole entry sets under `examples/<demo>/bak/YYYYMMDD_…/` before rewrites.

## Verify (honest — no fabricated greens)

```text
node tools/synth_bootstrap_cli.js --check <file.syn>
node tools/synth_bootstrap_cli.js --test <file.syn>    # when @test exists
npm run rebuild-demos                                 # if live demos changed
```

- `--check` can miss **unbound names**; after structural patches, confirm bindings exist in source **and** smoke the demo page / parse `demo/*.sources.js`.
- Intentional `@pure` lies (`debug_*`) warn — expected.

## Ship

- Rebuild artifacts that Pages serves (`demo/*.sources.js`, embeds).
- Commit + push finished Synth work (Danny trusts Mist to push).

## Windows / PowerShell

Prefer a small `node tools/_helper.js` over inline `node -e` with `$` captures. Full trap list lives in Mist `MEMORY.md` → Operating rules. Highlights: no bash heredoc; `fc` ≠ file compare; `Remove-Item -LiteralPath` for odd names; don't trail `git` with `-ErrorAction`.

## CLI cheat sheet

| Command | Purpose |
|---------|---------|
| `node tools/synth_bootstrap_cli.js --check f.syn` | Lint-style check (warnings OK) |
| `node tools/synth_bootstrap_cli.js --spec f.syn` | Agent-readable contracts JSON |
| `node tools/synth_bootstrap_cli.js --test f.syn` | Run `@test` |
| `node tools/synth_bootstrap_cli.js --bundle entry.syn out.js` | Multi-file |
| `npm run rebuild-demos` | All live demo artifacts |
