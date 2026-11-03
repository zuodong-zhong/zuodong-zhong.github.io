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

- Extend the existing academic homepage with a quiet 640px world map at the footer. The map answers where readers come from; totals and an expandable region list provide an accessible text equivalent.
- Follow the supplied Haoquan Fang reference's small footer placement and light map. Keep this site's system font, blue accent, hairline rules and 8px spacing. Visual variation 2/10 (blend into the existing site), motion 1/10 (static), density 4/10 (map plus a short summary).
- From the existing Linear reference, retain the 14px compact link scale, medium 500 label weight (adapted from 510), and thin separators. Keep the site's own light palette and font. The map silhouette, tabular totals, branded focus rings, native disclosure and fine list rules provide detail without decorative animation.
- Use Natural Earth's public-domain land outlines and an equirectangular projection. Markers use this site's blue, with radius increasing with visit count. Location is rounded to a one-degree grid; no precise location is shown.
- Show actual data only. A service that has not been connected shows unavailable statistics, a connected empty service shows an empty map, and request failures offer a retry. No example traffic is included in the public page.
- The native details control expands region counts and works with keyboard and touch. Loading the map is deferred until near the viewport; tracking is independent of scrolling and obeys the existing analytics exclusion.
- Verify both languages, a narrow viewport, empty/error states, actual marker projection, duplicate visit IDs, invalid origins, and local/owner tracking exclusions. Deployment and live collection require a separately verified Cloudflare Worker and D1 binding.

### Visitor map verification (2026-11-03)

- Inspected the rendered footer at 1280px and 390px, including the expanded region list and both languages. At 390px the page has no horizontal overflow.
- Local fixtures cover populated, empty and unavailable responses, and retry after failure; the fixture is visibly marked as test data and excluded from publication. Browser console checks reported no errors.
- All 27 repository tests passed, including service aggregation against real SQLite and the shared analytics exclusion gates.
- Deployed the service as a Cloudflare Pages advanced-mode Worker, bound its dedicated D1 database, and verified that the public `/stats` endpoint returns HTTP 200 with an empty initial dataset and the homepage's CORS origin.

## Header verification

Check expanded and compact states at desktop and phone widths; repeated upward/downward scrolling; both languages; chapter anchors; blog and article navigation; and keyboard focus. Confirm that content does not shift during contraction and controls do not overlap or leave the viewport.
