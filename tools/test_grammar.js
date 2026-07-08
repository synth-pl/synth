// Smoke test for vscode-extension/syntaxes/synth.tmLanguage.json
const fs = require('fs')
const path = require('path')
const { Registry } = require('vscode-textmate')
const { loadWASM, OnigScanner, OnigString } = require('vscode-oniguruma')

const GRAMMAR = path.join(__dirname, '..', 'vscode-extension', 'syntaxes', 'synth.tmLanguage.json')
const SAMPLE = fs.readFileSync(path.join(__dirname, '..', 'compiler', 'ast.syn'), 'utf8').split('\n').slice(0, 35).join('\n')

async function main() {
  const wasm = await fs.promises.readFile(
    require.resolve('vscode-oniguruma/release/onig.wasm')
  )
  await loadWASM(wasm.buffer)

  const grammarContent = fs.readFileSync(GRAMMAR, 'utf8')
  const registry = new Registry({
    onigLib: Promise.resolve({
      createOnigScanner(patterns) { return new OnigScanner(patterns) },
      createOnigString(s) { return new OnigString(s) },
    }),
    loadGrammar: async (scope) => {
      if (scope === 'source.synth') return JSON.parse(grammarContent)
      return null
    },
  })

  const grammar = await registry.loadGrammar('source.synth')
  if (!grammar) {
    console.error('FAIL: could not load grammar')
    process.exit(1)
  }

  let ruleStack = null
  let colored = 0
  let plain = 0
  const lines = SAMPLE.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const result = grammar.tokenizeLine(lines[i], ruleStack)
    ruleStack = result.ruleStack
    for (const tok of result.tokens) {
      const text = lines[i].slice(tok.startIndex, tok.endIndex)
      const scopes = tok.scopes.filter(s => s !== 'source.synth')
      if (scopes.length) {
        colored++
        if (text === 'export' || text === 'record' || text === 'int' || text === 'string') {
          console.log(`  ${JSON.stringify(text)} -> ${scopes.join(' ')}`)
        }
      } else {
        plain++
      }
    }
  }

  console.log(`tokens with scopes: ${colored}, plain: ${plain}`)
  if (colored < 10) {
    console.error('FAIL: too few highlighted tokens')
    process.exit(1)
  }
  console.log('ok grammar tokenizes ast.syn sample')
}

main().catch(err => {
  console.error('FAIL:', err)
  process.exit(1)
})
