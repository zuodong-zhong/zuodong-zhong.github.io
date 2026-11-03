// A separate service for zuodong-zhong.github.io. No IP address, user agent,
// page URL, cookies, or precise location is written to the database.
const SITE_ORIGIN = 'https://zuodong-zhong.github.io';
const ready = new WeakMap();

export const schema = [
  `CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude REAL,
    longitude REAL
  )`,
  'CREATE INDEX IF NOT EXISTS visits_location ON visits(country, latitude, longitude)',
];

function initialize(db) {
  if (!ready.has(db)) {
    const setup = db.batch(schema.map((sql) => db.prepare(sql))).catch((error) => { ready.delete(db); throw error; });
    ready.set(db, setup);
  }
  return ready.get(db);
}

export function locationFrom(cf = {}) {
  const country = /^[A-Z]{2}$/.test(cf.country || '') && cf.country !== 'XX' ? cf.country : 'ZZ';
  const coordinate = (value, limit) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && Math.abs(n) <= limit ? Math.round(n) : null;
  };
  const latitude = coordinate(cf.latitude, 90);
  const longitude = coordinate(cf.longitude, 180);
  // Do not turn a missing coordinate into a dot at (0, 0).
  return { country, latitude: longitude === null ? null : latitude, longitude: latitude === null ? null : longitude };
}

function reply(body, status = 200, extra = {}) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': SITE_ORIGIN,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path !== '/stats' && path !== '/track') return reply({ error: 'Not found' }, 404);
    if (request.method === 'OPTIONS') {
      if (request.headers.get('Origin') !== SITE_ORIGIN) return reply({ error: 'Origin not allowed' }, 403);
      return reply(null, 204, {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      });
    }
    if ((path === '/stats' && request.method !== 'GET') || (path === '/track' && request.method !== 'POST')) {
      return reply({ error: 'Method not allowed' }, 405, { Allow: path === '/stats' ? 'GET, OPTIONS' : 'POST, OPTIONS' });
    }

    let id;
    if (path === '/track') {
      if (request.headers.get('Origin') !== SITE_ORIGIN) return reply({ error: 'Origin not allowed' }, 403);
      if (request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1'
        || request.cf?.botManagement?.verifiedBot
        || /bot|crawler|spider|headless/i.test(request.headers.get('User-Agent') || '')) return reply(null, 204);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({ error: 'JSON required' }, 415);
      try {
        const body = await request.text();
        if (body.length > 256) return reply({ error: 'Request too large' }, 413);
        id = JSON.parse(body).id;
        if (typeof id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)) throw new Error('Invalid session');
      } catch { return reply({ error: 'Invalid visit' }, 400); }
    }

    if (!env.DB) return reply({ error: 'Visitor statistics unavailable' }, 503);
    try {
      await initialize(env.DB);
      if (path === '/track') {
        const { country, latitude, longitude } = locationFrom(request.cf);
        await env.DB.prepare('INSERT OR IGNORE INTO visits (id, day, country, latitude, longitude) VALUES (?, ?, ?, ?, ?)')
          .bind(id.toLowerCase(), new Date().toISOString().slice(0, 10), country, latitude, longitude).run();
        return reply(null, 204);
      }

      const [summary, countries, locations] = await env.DB.batch([
        env.DB.prepare('SELECT COUNT(*) AS total, MIN(day) AS since FROM visits'),
        env.DB.prepare('SELECT country, COUNT(*) AS visits FROM visits GROUP BY country ORDER BY visits DESC, country'),
        env.DB.prepare(`SELECT country, latitude, longitude, COUNT(*) AS visits FROM visits
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          GROUP BY country, latitude, longitude ORDER BY visits DESC, country, latitude, longitude LIMIT 1000`),
      ]);
      return reply({ ...summary.results[0], countries: countries.results, locations: locations.results }, 200, {
        'Cache-Control': 'public, max-age=60',
      });
    } catch { return reply({ error: 'Visitor statistics unavailable' }, 503); }
  },
};
