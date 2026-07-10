'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = {
  console, Math, JSON, Array, Object, String, Number, Boolean, Error, Map, Set, Float32Array, undefined,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'demo/synth.stdlib.js'), 'utf8'), sandbox);
vm.runInContext(
  fs.readFileSync(path.join(root, 'demo/intent_router.sources.js'), 'utf8') +
    '\n;globalThis.handle_message = handle_message;',
  sandbox
);

const cases = [
  ['hey there', 'greet'],
  ['how do I install', 'help'],
  ['I want a refund', 'billing'],
  ['app keeps crashing', 'bug'],
  ['pro plan cost', 'pricing'],
  ['quit', 'exit'],
  ['asdfzxcv', 'unknown'],
];

let failed = 0;
for (const [m, exp] of cases) {
  const r = sandbox.handle_message(m);
  const ok = r.intent === exp;
  console.log(ok ? 'OK' : 'FAIL', JSON.stringify(m), '->', r.intent, '(exp', exp + ')');
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
