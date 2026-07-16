const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const apiCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'api.js'), 'utf8');
const sandbox = {
  console,
  window: { DEBUG_MODE: false },
  localStorage: {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; }
  },
  fetch: async () => ({})
};

vm.createContext(sandbox);
vm.runInContext(apiCode, sandbox);

const result = sandbox.API._demoLogin('demo@freightflow.in', 'demo1234');
assert.ok(result, 'expected a demo login payload');
assert.strictEqual(result.email, 'demo@freightflow.in');
assert.strictEqual(result.role, 'admin');
console.log('login fallback test passed');
