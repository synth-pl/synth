const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundle = fs.readFileSync(path.join(__dirname, '../demo/synth.compiler.js'), 'utf8');
const ctx = { console, globalThis: {} };
ctx.globalThis = ctx;
vm.runInNewContext(bundle, ctx);
const SynthCompiler = ctx.SynthCompiler;
if (!SynthCompiler) {
  console.error('SynthCompiler not found');
  process.exit(1);
}

const src = 'print("Hello, World!")';
const { js, errors } = SynthCompiler.compile(src);
console.log('errors:', errors);
const stdlib = SynthCompiler.stdlib || '';
const userJs = (js && stdlib && js.startsWith(stdlib)) ? js.slice(stdlib.length).trimStart() : js;
const execJs = stdlib + '{\n' + userJs + '\n}';

try {
  const fn = new Function(
    'console', 'Math', 'JSON', 'Array', 'Object', 'Map', 'Set',
    'String', 'Number', 'Boolean', 'Promise', 'parseInt', 'parseFloat', 'isNaN',
    execJs
  );
  fn(
    { log: (...a) => console.log('LOG', ...a), warn: console.warn, error: console.error },
    Math, JSON, Array, Object, Map, Set,
    String, Number, Boolean, Promise, parseInt, parseFloat, isNaN
  );
  console.log('OK');
} catch (e) {
  console.error('RUN ERROR:', e.message);
  const idx = execJs.indexOf('uuid');
  if (idx >= 0) {
    console.log('context around uuid:\n', execJs.slice(Math.max(0, idx - 100), idx + 100));
  }
}
