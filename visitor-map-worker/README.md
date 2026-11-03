# Homepage visitor map

This service belongs to `zuodong-zhong.github.io`. The example URL at
`visitor-map.hqfang.workers.dev` is Haoquan Fang's service, not a shared endpoint
for this site. Its footer placement inspired the component; this implementation
uses its own database and does not request or copy his visitor counts.

## Deploy in the Cloudflare dashboard

The service uses Cloudflare Pages advanced mode at
`https://zuodong-visitor-map.pages.dev`, with its own D1 database.

1. Create a D1 database named `zuodong-visitor-map`.
2. Run `python3 visitor-map-worker/package.py` from the repository root.
   Create a Pages Direct Upload project named `zuodong-visitor-map`, upload
   `.preview/visitor-map.zip`, and deploy. The archive contains the tested
   `worker.mjs` as `_worker.js`; it does not contain a placeholder service.
3. Under the Pages project's Settings, add a production **D1 database** binding
   named `DB` and select the new database. Upload the bundle again to activate
   the binding in a new deployment. The Worker initializes its two SQL
   schema statements on the first request; there is no migration to paste.
4. Open `https://zuodong-visitor-map.pages.dev/stats`. A new service must return
   `{"total":0,"since":null,"countries":[],"locations":[]}`.
5. Put that service's HTTPS origin in the homepage's
   `<meta name="visitor-map-endpoint" content="">`, then publish the homepage.
   Never put an account API token in HTML or client JavaScript.
6. Verify a real homepage visit, then reload `/stats` after its 60-second cache
   expires. Local previews, `?analytics=off`, saved exclusions, and the analytics
   settings page must not add a visit. Do not send fake locations to production.

For subsequent CLI deployments, build the bundle, then run
`wrangler pages deploy ../.preview/visitor-map-deploy` from this directory
after signing in to the owning Cloudflare account. The database ID in
`wrangler.jsonc` identifies the provisioned database; it is not an API credential.

## Counting and data

- `POST /track` accepts only the site's exact Origin and a random v4 session UUID.
  Coordinates and country are read from Cloudflare's `request.cf`; any location
  sent by the client is ignored. Duplicate UUIDs are ignored atomically by D1.
- The browser keeps that UUID in session storage for 30 minutes. Counts are
  visits, not unique people: a new tab, new browser, or expired session can count
  again. Tracking runs only on the homepage. DNT and Global Privacy Control skip it.
- The database retains the anonymous visit UUID, UTC day, region code, and
  latitude/longitude rounded to whole degrees. No IP address, user agent, page
  URL, cookie, or precise location is stored by this code. The schema is append-only.
- `GET /stats` returns only aggregate totals, first recorded UTC day, region
  counts and up to 1,000 most visited coordinate buckets. Unknown locations are
  counted but have no map marker. Results may be cached for 60 seconds.
- Origin checks block other websites from sending browser traffic; they are not
  authentication against clients that forge headers. This is a personal-site
  visitor counter, not an audited analytics product.
- This new collection starts at activation. It does not import previous
  Cloudflare Web Analytics history; the two counters also use different rules.

`npm test` from the repository root covers aggregation with real in-memory
SQLite, deduplication, origin/method handling, location validation, and existing
analytics exclusions. The backend tests use Node 22.13+ (`node:sqlite`).
