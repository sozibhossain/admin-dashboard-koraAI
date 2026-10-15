const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function compile(file, requireModule, globals = {}) {
  const compiled = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`, { process, AbortSignal, ...globals })(requireModule, compiled, compiled.exports);
  return compiled.exports;
}

function authConfig(fetchHandler) {
  let config;
  class CredentialsSignin extends Error {}
  compile('lib/auth.ts', name => {
    if (name === 'next-auth') return { __esModule: true, default: options => { config = options; return {}; }, CredentialsSignin };
    if (name === 'next-auth/providers/credentials') return options => options;
    if (name === '@/lib/roles') return compile('lib/roles.ts', require);
    throw new Error(`Unexpected import ${name}`);
  }, { fetch: fetchHandler });
  return config;
}
const response = (status, data) => ({ ok: status < 400, status, json: async () => data });

test('login sends the second factor to the backend and preserves an authenticated admin without provisioning permissions', async () => {
  const calls = [];
  const config = authConfig(async (url, init) => { calls.push({ url, init }); return response(200, { success: true, data: { _id: 'admin-id', email: 'admin@example.invalid', role: 'admin', accessToken: 'test-access', refreshToken: 'test-refresh' } }); });
  const user = await config.providers[0].authorize({ email: ' admin@example.invalid ', password: 'example-password', mfaCode: '123456' });
  assert.equal(user.role, 'admin');
  assert.equal(JSON.parse(calls[0].init.body).mfaCode, '123456');
  assert.equal(JSON.parse(calls[0].init.body).email, 'admin@example.invalid');
  assert.equal(calls.length, 1, 'Authentication must not mutate or require a staff mapping');
});

test('MFA and blocked-account failures remain actionable instead of appearing as a wrong password', async () => {
  for (const [message, code] of [['Valid fresh second factor required', 'second_factor_required'], ['Second factor already used', 'second_factor_required'], ['Account is blocked', 'account_blocked']]) {
    const config = authConfig(async () => response(401, { success: false, message }));
    await assert.rejects(config.providers[0].authorize({ email: 'admin@example.invalid', password: 'example-password' }), error => error.code === code);
  }
});

test('business-owner credentials cannot become an admin dashboard session', async () => {
  const config = authConfig(async () => response(200, { success: true, data: { role: 'business_owner' } }));
  await assert.rejects(config.providers[0].authorize({ email: 'owner@example.invalid', password: 'example-password' }), error => error.code === 'role_not_allowed');
});

test('sign-out asks the backend to revoke the session and still completes when the API is offline', async () => {
  let request;
  const config = authConfig(async (url, init) => { request = { url, init }; throw new Error('Offline'); });
  await config.events.signOut({ token: { accessToken: 'test-access' } });
  assert.equal(request.init.headers.Authorization, 'Bearer test-access');
  assert.equal(request.init.method, 'POST');
  assert.ok(request.url.endsWith('/auth/logout'));
});

test('the admin realtime client authenticates its handshake before receiving updates', async () => {
  const { Server } = await import('../../backendKoraAi/node_modules/socket.io/dist/index.js');
  const server = http.createServer(), io = new Server(server);
  io.use((socket, next) => socket.handshake.auth.token === 'allowed-test-token' ? next() : next(new Error('Authentication required')));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const clientModule = compile('lib/socket.ts', name => name === 'next-auth/react' ? { useSession() {} } : require(name));
  const client = clientModule.createAuthenticatedSocket('allowed-test-token', url);
  const denied = clientModule.createAuthenticatedSocket('wrong-token', url);
  try {
    assert.throws(() => clientModule.createAuthenticatedSocket(''), /authenticated session/);
    await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('Socket connection timed out')), 5000); client.once('connect', () => { clearTimeout(timer); resolve(); }); client.once('connect_error', reject); client.connect(); });
    assert.equal(client.connected, true);
    await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('Socket rejection timed out')), 5000); denied.once('connect_error', error => { clearTimeout(timer); assert.equal(error.message, 'Authentication required'); resolve(); }); denied.connect(); });
  } finally { client.disconnect(); denied.disconnect(); await new Promise(resolve => io.close(resolve)); }
});
