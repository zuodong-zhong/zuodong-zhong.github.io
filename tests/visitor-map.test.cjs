const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const origin = 'https://zuodong-zhong.github.io';
const worker = import('../visitor-map-worker/worker.mjs');

function database() {
  const sqlite = new DatabaseSync(':memory:');
  const wrap = (sql, values = []) => ({
    bind(...args) { return wrap(sql, args); },
    async run() { return sqlite.prepare(sql).run(...values); },
    async all() { return { results: sqlite.prepare(sql).all(...values) }; },
  });
  return {
    prepare(sql) { return wrap(sql); },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.all());
        sqlite.exec('COMMIT');
        return results;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
}

function request(options = {}) {
  const req = new Request(`https://map.example${options.path || '/track'}`, {
    method: options.method || 'POST',
    headers: { Origin: options.origin || origin, 'Content-Type': 'application/json', ...options.headers },
    ...((options.method || 'POST') === 'POST' ? { body: options.body || JSON.stringify({ id: options.id || webcrypto.randomUUID(), latitude: 89, country: 'FAKE' }) } : {}),
  });
  Object.defineProperty(req, 'cf', { value: options.cf || { country: 'CN', latitude: '39.9', longitude: '116.4' } });
  return req;
}

test('real SQLite aggregates only this service, deduplicates sessions, and keeps client-supplied locations out', async () => {
  const { default: service } = await worker;
  const env = { DB: database() };
  const read = () => service.fetch(request({ path: '/stats', method: 'GET' }), env).then(r => r.json());
  assert.deepEqual(await read(), { total: 0, since: null, countries: [], locations: [] });
  const id = webcrypto.randomUUID();
  assert.equal((await service.fetch(request({ id }), env)).status, 204);
  assert.equal((await service.fetch(request({ id: id.toUpperCase() }), env)).status, 204);
  await service.fetch(request({ cf: { country: 'JP', latitude: '35.7', longitude: '139.7' } }), env);
  await service.fetch(request({ cf: { country: 'US' } }), env);
  const stats = await read();
  assert.equal(stats.total, 3);
  assert.equal(stats.since, new Date().toISOString().slice(0, 10));
  assert.deepEqual(stats.countries, [{ country: 'CN', visits: 1 }, { country: 'JP', visits: 1 }, { country: 'US', visits: 1 }]);
  assert.deepEqual(stats.locations, [
    { country: 'CN', latitude: 40, longitude: 116, visits: 1 },
    { country: 'JP', latitude: 36, longitude: 140, visits: 1 },
  ]);
  assert.deepEqual(await read(), stats, 'reading the map must never count as a visit');
});

test('untrusted origins, methods, malformed IDs, bots, and privacy preferences do not add visits', async () => {
  const { default: service } = await worker;
  const env = { DB: database() };
  for (const [options, status] of [
    [{ origin: 'https://example.com' }, 403],
    [{ origin: 'https://zuodong-zhong.github.io.example.com' }, 403],
    [{ method: 'GET' }, 405],
    [{ body: '{invalid' }, 400],
    [{ body: JSON.stringify({ id: 'not-a-session' }) }, 400],
    [{ body: 'a'.repeat(257) }, 413],
    [{ headers: { DNT: '1' } }, 204],
    [{ headers: { 'Sec-GPC': '1' } }, 204],
    [{ headers: { 'User-Agent': 'Googlebot' } }, 204],
  ]) assert.equal((await service.fetch(request(options), env)).status, status);
  const preflight = await service.fetch(request({ method: 'OPTIONS' }), env);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal((await (await service.fetch(request({ path: '/stats', method: 'GET' }), env)).json()).total, 0);
  assert.equal((await service.fetch(request({ path: '/stats', method: 'GET' }), {})).status, 503);
});

test('invalid or missing coordinates never create a false point at zero', async () => {
  const { locationFrom } = await worker;
  assert.deepEqual(locationFrom(), { country: 'ZZ', latitude: null, longitude: null });
  for (const value of [null, '', undefined, 'bad', Infinity, 91]) {
    assert.deepEqual(locationFrom({ latitude: value, longitude: 10 }), { country: 'ZZ', latitude: null, longitude: null });
  }
  assert.deepEqual(locationFrom({ country: 'GB', latitude: '0', longitude: '0' }), { country: 'GB', latitude: 0, longitude: 0 });
});

const analyticsSource = readFileSync(path.join(__dirname, '../analytics.js'), 'utf8');
const mapSource = readFileSync(path.join(__dirname, '../visitor-map.js'), 'utf8');

function storage(initial = {}, fail = false) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { if (fail) throw new Error('Storage unavailable'); return values.get(key) ?? null; },
    setItem(key, value) { if (fail) throw new Error('Storage unavailable'); values.set(key, value); },
  };
}

function visit(options = {}) {
  const nodes = new Map();
  const element = () => ({ hidden: false, textContent: '', setAttribute() {}, addEventListener() {}, append() {}, replaceChildren() {} });
  const root = { querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, element()); return nodes.get(selector); } };
  const requests = [];
  const context = {
    URL, URLSearchParams, Intl, Date, AbortController, setTimeout, clearTimeout,
    crypto: webcrypto,
    navigator: { doNotTrack: options.dnt ? '1' : '0' },
    localStorage: options.localStorage || storage(),
    sessionStorage: options.sessionStorage || storage(),
    MutationObserver: class { observe() {} },
    IntersectionObserver: class { observe() {} },
    fetch(url, init) { requests.push({ url, init }); return Promise.resolve({ ok: true }); },
    window: { location: new URL(options.url || origin) },
    document: {
      documentElement: { lang: 'en' },
      body: { hasAttribute() { return false; } },
      head: { appendChild() {} },
      querySelector(selector) {
        if (selector === '.visitor-map') return root;
        if (selector === 'meta[name="visitor-map-endpoint"]') return { content: options.endpoint ?? 'https://map.example' };
        return null;
      },
      createElement: element,
    },
  };
  vm.runInNewContext(analyticsSource, context);
  vm.runInNewContext(mapSource, context);
  return { requests, nodes, sessionStorage: context.sessionStorage };
}

test('map tracking obeys the real shared analytics exclusion gates', () => {
  for (const options of [
    { url: 'http://localhost:8765' },
    { url: 'http://zuodong-zhong.github.io' },
    { url: `${origin}/?analytics=on&analytics=off` },
    { localStorage: storage({ 'homepage-analytics-excluded': '1' }) },
    { localStorage: storage({}, true) },
    { sessionStorage: storage({}, true) },
    { dnt: true },
    { endpoint: '' },
  ]) assert.equal(visit(options).requests.length, 0);
});

test('refreshing keeps the same visit UUID within a 30-minute tab session', () => {
  const saved = storage();
  const first = visit({ sessionStorage: saved }).requests[0];
  const second = visit({ sessionStorage: saved }).requests[0];
  assert.equal(first.url, 'https://map.example/track');
  assert.equal(first.init.method, 'POST');
  assert.deepEqual(JSON.parse(first.init.body), JSON.parse(second.init.body));
  const old = JSON.parse(saved.getItem('homepage-visitor-session'));
  saved.setItem('homepage-visitor-session', JSON.stringify({ ...old, startedAt: Date.now() - 31 * 60 * 1000 }));
  assert.notEqual(JSON.parse(visit({ sessionStorage: saved }).requests[0].init.body).id, old.id);
});
