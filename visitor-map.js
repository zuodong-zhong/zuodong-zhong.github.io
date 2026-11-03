(() => {
  const root = document.querySelector('.visitor-map');
  if (!root) return;

  const status = root.querySelector('[data-visitor-status]');
  const totals = root.querySelector('[data-visitor-totals]');
  const since = root.querySelector('[data-visitor-since]');
  const points = root.querySelector('[data-visitor-points]');
  const countries = root.querySelector('[data-visitor-countries]');
  const compactCount = root.querySelector('[data-visitor-count]');
  const beacon = root.querySelector('[data-visitor-beacon]');
  const card = root.querySelector('.visitor-map-card');
  const retry = root.querySelector('[data-visitor-retry]');
  const configured = document.querySelector('meta[name="visitor-map-endpoint"]')?.content.trim();
  let endpoint;
  try {
    const url = new URL(configured);
    if (url.protocol === 'https:' && !url.username && !url.password) endpoint = url.origin;
  } catch { /* A missing service never falls back to another site's visitor data. */ }

  let state = endpoint ? 'loading' : 'unavailable';
  let data;
  let loading = false;
  const text = (en, zh) => document.documentElement.lang.startsWith('zh') ? zh : en;

  function render() {
    const locale = document.documentElement.lang;
    const number = new Intl.NumberFormat(locale);
    const names = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames([locale], { type: 'region' }) : null;
    const countryName = (code) => code === 'ZZ' ? text('Unknown location', '未知位置') : names?.of(code) || code;
    status.textContent = {
      loading: text('Loading visitor statistics…', '正在加载访客统计…'),
      unavailable: text('Visitor statistics are not available yet.', '访客统计暂未开放。'),
      error: text('Visitor statistics could not be loaded.', '暂时无法加载访客统计。'),
      empty: text('The first visitor will appear here soon.', '访客足迹将从这里开始。'),
      ready: '',
    }[state];
    retry.hidden = state !== 'error';
    totals.hidden = !data;
    since.hidden = !data?.since;
    compactCount.textContent = data
      ? new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(data.total)
      : state === 'error' || state === 'unavailable' ? '!' : '—';
    beacon.setAttribute('data-state', state);
    card.setAttribute('title', status.textContent || text('View visitor statistics', '查看地区统计'));
    if (!data) return;

    const count = data.countries.filter(({ country }) => country !== 'ZZ').length;
    totals.textContent = text(
      `${number.format(data.total)} ${data.total === 1 ? 'visit' : 'visits'} · ${number.format(count)} ${count === 1 ? 'region' : 'regions'}`,
      `${number.format(data.total)} 次访问 · ${number.format(count)} 个地区`,
    );
    card.setAttribute('title', totals.textContent);
    since.textContent = data.since ? text(`Since ${data.since} · All time`, `自 ${data.since} 起累计`) : '';

    countries.replaceChildren(...data.countries.map(({ country, visits }) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      const count = document.createElement('strong');
      name.textContent = countryName(country);
      count.textContent = number.format(visits);
      item.append(name, count);
      return item;
    }));
    points.replaceChildren(...data.locations.map(({ country, latitude, longitude, visits }) => {
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      marker.setAttribute('transform', `translate(${(longitude + 180) * 2} ${(90 - latitude) * 2})`);
      const radius = Math.min(10, 5 + Math.log2(visits + 1));
      for (const [kind, r] of [['halo', radius + 6], ['ring', radius + 2], ['dot', radius * .6]]) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', `visitor-map-${kind}`);
        circle.setAttribute('r', r);
        marker.append(circle);
      }
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = text(`${countryName(country)} · ${number.format(visits)} visits`, `${countryName(country)} · ${number.format(visits)} 次访问`);
      marker.append(title);
      return marker;
    }));
  }

  function validData(value) {
    const count = (n) => Number.isSafeInteger(n) && n >= 0;
    const region = (row) => /^[A-Z]{2}$/.test(row.country) && count(row.visits);
    return value && count(value.total)
      && (value.since === null || /^\d{4}-\d{2}-\d{2}$/.test(value.since))
      && Array.isArray(value.countries) && value.countries.length <= 300 && value.countries.every(region)
      && Array.isArray(value.locations) && value.locations.length <= 1000
      && value.locations.every((row) => region(row) && Number.isFinite(row.latitude) && Math.abs(row.latitude) <= 90
        && Number.isFinite(row.longitude) && Math.abs(row.longitude) <= 180);
  }

  async function load() {
    if (!endpoint || loading) return;
    loading = true;
    state = 'loading';
    render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${endpoint}/stats`, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal });
      if (!response.ok) throw new Error('Visitor service unavailable');
      const result = await response.json();
      if (!validData(result)) throw new Error('Invalid visitor statistics');
      data = result;
      state = data.total ? 'ready' : 'empty';
    } catch {
      state = 'error';
    } finally {
      clearTimeout(timeout);
      loading = false;
      render();
    }
  }

  // analytics.js processes ?analytics=off and storage failures before setting this flag.
  // Reading /stats never counts as a visit, including for excluded browsers.
  async function track() {
    if (!endpoint || window.homepageAnalyticsAllowed !== true || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
    try {
      const key = 'homepage-visitor-session';
      const now = Date.now();
      let session;
      try { session = JSON.parse(sessionStorage.getItem(key)); } catch { /* Start a new session if the saved value is malformed. */ }
      if (!session || !/^[a-f0-9-]{36}$/i.test(session.id) || !Number.isFinite(session.startedAt)
        || now - session.startedAt >= 30 * 60 * 1000 || session.startedAt > now) {
        session = { id: crypto.randomUUID(), startedAt: now };
        sessionStorage.setItem(key, JSON.stringify(session));
      }
      await fetch(`${endpoint}/track`, {
        method: 'POST', mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: session.id }),
      });
    } catch { /* Tracking must never interfere with reading the homepage. */ }
  }

  retry.addEventListener('click', load);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
  track();
  if (endpoint) {
    if (typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); load(); }
      }, { rootMargin: '300px' });
      observer.observe(root);
    } else load();
  }
})();
