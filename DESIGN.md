# Academic site design

The site presents Zuodong Zhong's research, publications, experience, and learning notes. Readers must immediately recognize the researcher and be able to navigate to a section, read a post, and switch between English and Chinese.

## Existing visual language

- Preserve the white academic homepage, serif body, blue headings, color portrait, and 1040px content width.
- Shared navigation uses the existing system sans-serif stack and `site-theme.css` tokens. Blue identifies links and the current section.
- Blog and article pages retain their existing reading palettes and layouts.

## Gathering header

The requested reference is [DeepSeek Harness](https://www.deepseek.com/harness/), inspected on 2026-11-02. Its header moves inward after scrolling and reveals a rounded translucent surface. This site adapts those two actions to its existing light palette. The compact navigation scale (13–14px), 8px spacing rhythm, and restrained border/elevation hierarchy also agree with the Linear reference in the qiaomu design catalog; its dark palette and typography are not applied.

- At the top, the name, section links, and language switch span the content width.
- Beyond 48px of scrolling, the name and language control move inward around the stationary navigation. The floating surface appears behind them; returning to 24px from the top expands the header.
- Desktop compact width targets 840px, with measured space for all controls. On phones, the same surface contains two rows, retaining swipeable navigation and the language control.
- The header's layout height stays constant. Text is translated without scaling, while only the background surface scales. A 280ms interruptible transition connects the states.
- Reduced motion disables transitions. Reduced transparency uses a solid surface. Anchors account for the sticky header at every width. Without JavaScript, the existing links remain usable.

## Visitor map

- Use a compact 240 × 120px visitor card at the right of the footer, following the user's 2026-11-04 screenshot. Keep the copyright and template credit together on the left. On phones, the card sits below that text and retains its small size.
- The card pairs a pale blue map on the left with a narrow white statistics panel on the right: a location dot, compact visit count, unit and explicit all-time label. White land outlines, blue ring markers and the existing `--site-accent` (#2c5191) adapt the reference's purple treatment to this site's identity. Visual variation 2/10, static motion 1/10, compact information density 6/10.
- From the existing Linear reference, retain the 14px compact link scale, medium 500 label weight (adapted from 510), and thin separators. Keep the site's own light palette and font. The map silhouette, tabular totals, branded focus rings, native disclosure and fine list rules provide detail without decorative animation.
- Use Natural Earth's public-domain land outlines and an equirectangular projection. Markers use this site's blue, with radius increasing with visit count. Location is rounded to a one-degree grid; no precise location is shown.
- Show actual data only. A service that has not been connected shows unavailable statistics, a connected empty service shows an empty map, and request failures offer a retry. No example traffic is included in the public page.
- The entire card is a native details control, with a visible focus ring; expanding it reveals full counts, region names, since date and failure recovery. Keep loading/unavailable indicators distinct from a true zero. Loading the map is deferred until near the viewport; tracking is independent of scrolling and obeys the existing analytics exclusion.
- Keep the existing cumulative data contract. The reference's 30-day caption must not be copied onto all-time data. No service redeployment or data migration is required for this visual change.
- Verify both languages, a narrow viewport, empty/error states, actual marker projection, duplicate visit IDs, invalid origins, and local/owner tracking exclusions. Deployment and live collection require a separately verified Cloudflare Worker and D1 binding.

### Visitor map verification (2026-11-03)

- Inspected the rendered footer at 1280px and 390px, including the expanded region list and both languages. At 390px the page has no horizontal overflow.
- Local fixtures cover populated, empty and unavailable responses, and retry after failure; the fixture is visibly marked as test data and excluded from publication. Browser console checks reported no errors.
- All 27 repository tests passed, including service aggregation against real SQLite and the shared analytics exclusion gates.
- Deployed the service as a Cloudflare Pages advanced-mode Worker, bound its dedicated D1 database, and verified that the public `/stats` endpoint returns HTTP 200 with an empty initial dataset and the homepage's CORS origin.

### Compact card verification (2026-11-04)

- Measured the rendered card at 240 × 120px in a 1280px desktop viewport, aligned with the footer's right edge. Inspected the 390px phone layout in both languages with no horizontal overflow.
- Verified the compact English count (1.1K), Chinese count (1100), full region list, keyboard disclosure, true-zero state and recovery after a failed request using clearly marked local-only fixtures.
- Kept the copyright block independent of the expanded statistics height. Browser error logs were empty, and all 27 repository tests passed. Only presentation code and cache versions changed; the existing service and tracking exclusions are retained.

## Header verification

Check expanded and compact states at desktop and phone widths; repeated upward/downward scrolling; both languages; chapter anchors; blog and article navigation; and keyboard focus. Confirm that content does not shift during contraction and controls do not overlap or leave the viewport.
