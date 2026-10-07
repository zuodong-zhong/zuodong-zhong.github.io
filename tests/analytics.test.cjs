const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '..', 'analytics.js'), 'utf8');
const storageKey = 'homepage-analytics-excluded';
const token = '0123456789abcdef0123456789abcdef';

function storage(initial = {}, behavior = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      if (behavior.readThrows) throw new Error('Storage unavailable');
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (behavior.writeThrows) throw new Error('Storage quota exceeded');
      if (!behavior.ignoreWrites) values.set(key, String(value));
    },
    removeItem(key) {
      if (behavior.removeThrows) throw new Error('Storage unavailable');
      if (!behavior.ignoreRemoves) values.delete(key);
    },
  };
}

function element() {
  const listeners = new Map();
  return {
    dataset: {},
    attributes: {},
    textContent: '',
    disabled: true,
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, listener) { listeners.set(name, listener); },
    click() { assert.equal(this.disabled, false); listeners.get('click')(); },
  };
}

function visit(options = {}) {
  const localStorage = options.storage ?? storage();
  const scripts = [];
  const nodes = Object.fromEntries(['status', 'home', 'exclude', 'restore']
    .map(name => [`#analytics-${name}`, element()]));
  const listeners = new Map();
  const location = new URL(options.url ?? 'https://zuodong-zhong.github.io/');
  const context = {
    URLSearchParams,
    localStorage,
    window: {
      location,
      addEventListener(name, listener) { listeners.set(name, listener); },
    },
    document: {
      body: { hasAttribute(name) { return !!options.settings && name === 'data-analytics-settings'; } },
      querySelector(selector) {
        if (selector === 'meta[name="cloudflare-web-analytics-token"]') {
          return options.missingMeta ? null : { content: options.token ?? token };
        }
        return nodes[selector] ?? null;
      },
      createElement(tag) { assert.equal(tag, 'script'); return element(); },
      head: { appendChild(script) { scripts.push(script); } },
    },
  };
  vm.runInNewContext(source, context, { filename: 'analytics.js' });
  return {
    scripts, localStorage,
    status: nodes['#analytics-status'], home: nodes['#analytics-home'],
    exclude: nodes['#analytics-exclude'], restore: nodes['#analytics-restore'],
    storageEvent(key) { listeners.get('storage')({ key }); },
  };
}

test('a production visitor loads exactly one correctly configured Cloudflare beacon', () => {
  const page = visit();
  assert.equal(page.scripts.length, 1);
  assert.equal(page.scripts[0].src, 'https://static.cloudflareinsights.com/beacon.min.js');
  assert.equal(page.scripts[0].type, 'module');
  assert.deepEqual(JSON.parse(page.scripts[0].attributes['data-cf-beacon']), { token });
});

test('a saved exclusion survives new pages and browser contexts', () => {
  const saved = storage({ [storageKey]: '1' });
  assert.equal(visit({ storage: saved }).scripts.length, 0);
  assert.equal(visit({ storage: saved }).scripts.length, 0);
});

test('an exclusion bookmark is applied before the beacon and persists on ordinary URLs', () => {
  for (const query of ['?analytics=off', '?analytics=on&analytics=off', '?analytics=%6fff']) {
    const saved = storage();
    assert.equal(visit({ url: `https://zuodong-zhong.github.io/${query}`, storage: saved }).scripts.length, 0);
    assert.equal(saved.getItem(storageKey), '1');
    assert.equal(visit({ storage: saved }).scripts.length, 0);
  }
});

test('the bookmark excludes the current visit even if saving it fails', () => {
  for (const behavior of [{ writeThrows: true }, { ignoreWrites: true }]) {
    const page = visit({ url: 'https://zuodong-zhong.github.io/?analytics=off', storage: storage({}, behavior) });
    assert.equal(page.scripts.length, 0);
  }
});

test('storage read failures never result in tracking', () => {
  assert.equal(visit({ storage: storage({}, { readThrows: true }) }).scripts.length, 0);
});

test('local previews, HTTP, and other hostnames never load analytics', () => {
  for (const url of [
    'http://localhost:8000/', 'https://localhost/', 'http://127.0.0.1:8000/',
    'http://zuodong-zhong.github.io/', 'https://example.com/',
    'https://zuodong-zhong.github.io.example.com/', 'file:///tmp/index.html',
  ]) {
    assert.equal(visit({ url }).scripts.length, 0, url);
  }
});

test('missing, empty, and malformed Cloudflare tokens leave analytics disabled', () => {
  assert.equal(visit({ missingMeta: true }).scripts.length, 0);
  for (const value of ['', '   ', 'replace-with-token', 'a'.repeat(31), 'a'.repeat(33), 'g'.repeat(32)]) {
    assert.equal(visit({ token: value }).scripts.length, 0, JSON.stringify(value));
  }
});

test('settings pages never load a beacon, including after exclusion or restoration', () => {
  const page = visit({ settings: true });
  assert.equal(page.scripts.length, 0);
  assert.equal(page.status.dataset.state, 'included');
  page.exclude.click();
  assert.equal(page.localStorage.getItem(storageKey), '1');
  assert.equal(page.status.dataset.state, 'excluded');
  assert.match(page.status.textContent, /已保存并确认/);
  assert.equal(page.home.href, './?analytics=off');
  assert.equal(visit({ storage: page.localStorage }).scripts.length, 0);
  assert.equal(visit({ settings: true, storage: page.localStorage }).status.dataset.state, 'excluded');
  page.restore.click();
  assert.equal(page.localStorage.getItem(storageKey), null);
  assert.equal(page.status.dataset.state, 'included');
  assert.match(page.status.textContent, /已清除并确认/);
  assert.equal(page.home.href, './');
  assert.equal(page.scripts.length, 0);
  assert.equal(visit({ storage: page.localStorage }).scripts.length, 1);
});

test('failed or silently discarded exclusion writes never display success', () => {
  for (const behavior of [{ writeThrows: true }, { ignoreWrites: true }, { readThrows: true }]) {
    const page = visit({ settings: true, storage: storage({}, behavior) });
    page.exclude.click();
    assert.match(page.status.textContent, /未能确认/);
    assert.doesNotMatch(page.status.textContent, /已保存并确认/);
    assert.equal(page.home.href, './?analytics=off');
    assert.equal(page.scripts.length, 0);
  }
});

test('failed or silently discarded restoration never displays success', () => {
  for (const behavior of [{ removeThrows: true }, { ignoreRemoves: true }, { readThrows: true }]) {
    const page = visit({ settings: true, storage: storage({ [storageKey]: '1' }, behavior) });
    page.restore.click();
    assert.match(page.status.textContent, /未能确认/);
    assert.doesNotMatch(page.status.textContent, /已清除并确认/);
    assert.equal(page.home.href, './?analytics=off');
    assert.equal(page.scripts.length, 0);
  }
});

test('settings reflect exclusions changed or cleared in another tab', () => {
  const page = visit({ settings: true });
  page.localStorage.setItem(storageKey, '1');
  page.storageEvent(storageKey);
  assert.equal(page.status.dataset.state, 'excluded');
  assert.equal(page.home.href, './?analytics=off');
  page.localStorage.removeItem(storageKey);
  page.storageEvent(null);
  assert.equal(page.status.dataset.state, 'included');
  assert.equal(page.home.href, './');
  assert.equal(page.scripts.length, 0);
});
