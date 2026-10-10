const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const requireLocal = name => load(path.resolve(path.dirname(file), `${name}.ts`));
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`, {})(requireLocal, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
const { isNovyaRoute } = load(path.join(root, 'lib/novya-routes.ts'));
const { resources } = load(path.join(root, 'lib/novya-pages.ts'));
const refs = JSON.parse(fs.readFileSync(path.join(root, 'docs/novya-design-coverage.json'), 'utf8'));
const fixtureId = '507f1f77bcf86cd799439011';
const staticRoutes = ['/dashboard', '/inbox', '/calendar', '/approvals', '/settings', '/workflows'];
const accepted = route => staticRoutes.includes(route) || isNovyaRoute(route.replace(/^\//, '').split('/'));
for (const entry of refs) {
  const route = entry.route.replaceAll(':id', fixtureId).replace(':provider', 'openai');
  assert.ok(accepted(route), `Design ${entry.reference} route is not reachable: ${route}`);
}
let tabs = 0, forms = 0;
for (const [base, resource] of Object.entries(resources)) {
  const routeBase = base === 'approvals/all' ? 'approvals' : base;
  assert.ok(accepted(`/${base}`), `Missing resource list ${base}`);
  if (!['kora/history', 'live-view/channels'].includes(base)) assert.ok(accepted(`/${routeBase}/${fixtureId}`), `Missing detail ${base}`);
  for (const [, tab] of resource.tabs || []) { assert.ok(accepted(`/${routeBase}/${fixtureId}/${tab}`), `Missing tab ${base}/${tab}`); tabs++; }
  if (resource.fields) {
    assert.ok(accepted(`/${routeBase}/create`), `Missing create ${base}`);
    assert.ok(accepted(`/${routeBase}/${fixtureId}/edit`), `Missing edit ${base}`); forms += 2;
  }
}
for (const route of ['/workspace', '/app', '/settings/security/invalid', '/settings/general/defaults/extra', '/tasks/team/edit', '/kora/conversations', '/live-view/channels/invalid', '/team/members/create/edit']) assert.equal(accepted(route), false, `Invalid route accepted: ${route}`);
console.log(`Passed: ${refs.length} design references, ${tabs} resource tabs, ${forms} form routes; excluded and malformed routes rejected.`);
