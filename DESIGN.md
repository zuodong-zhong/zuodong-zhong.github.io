# Academic site design

The site presents Zuodong Zhong's research, publications, experience, and learning notes. Readers must immediately recognize the researcher and be able to navigate to a section, read a post, and switch between English and Chinese.

## Existing visual language

- Preserve the white academic homepage, serif body, blue headings, color portrait, and 1040px content width.
- Shared navigation uses the existing system sans-serif stack and `site-theme.css` tokens. Blue identifies links and the current section.
- Blog content and article reading text use the homepage's serif stack. Navigation and search/filter controls use the shared sans-serif UI stack. Articles retain their individual reading palettes and layouts.

## Blog consistency

- Match the homepage's white background, blue headings and links, 1040px content width, serif text, and normal letter spacing. Keep the existing archive layout, cover artwork, series order, and article content. Visual variation 2/10, motion 1/10, information density 6/10: familiar academic styling, quiet interactions, readable summaries.
- Each article card uses the same sequence and spacing: calendar/date, clock/reading time, series/study number, linked title/subtitle, summary, and topic tags. Quantum cards receive the same calendar and clock icons as diffusion cards. Publication and update dates retain their distinct meanings.
- Use a small SVG chevron at the right of each article title, matching the user's Axi's Blog screenshot. No diagonal glyph or separate read-article capsule. Keep the whole card clickable and the keyboard focus outline; the chevron moves 2px right on pointer hover and stays still with reduced motion.
- Use one shared card style for both collections, with consistent metadata, two topic tags, and the same bilingual study numbering. Render QNN and Grover labels consistently with the topic filters.
- Preserve search, collection/topic filtering, whole-card links, visible keyboard focus, bilingual content, and responsive wrapping. Verify all six cards and representative article pages at desktop and phone widths; formulas keep their own math font.
- Collections in the sidebar are the sole collection navigation; do not repeat them as tabs above the post list. Place search beside the page title on desktop and below it on phones. Collection URLs remain valid independently of topic buttons, and the current collection is highlighted in the sidebar.
- Keep the blog copy concise: no generic introductory or closing slogans. Collection cards show their titles and useful counts. Preserve article summaries and the bilingual Feynman technique paragraph.

### Blog verification (2026-11-04)

- Inspected both collections and languages on desktop and the 351px phone layout. All six cards have two metadata icons, matching series numbering and topic labels; the page has no horizontal overflow at 351px and 390px.
- Verified search results, the no-results state, reset, collection and topic filters. Checked serif text and independently styled KaTeX formulas in DDPM and QNN articles. All six articles build successfully, and all 27 existing tests pass.

## Gathering header

The requested reference is [DeepSeek Harness](https://www.deepseek.com/harness/), inspected on 2026-11-02. Its header moves inward after scrolling and reveals a rounded translucent surface. This site adapts those two actions to its existing light palette. The compact navigation scale (13–14px), 8px spacing rhythm, and restrained border/elevation hierarchy also agree with the Linear reference in the qiaomu design catalog; its dark palette and typography are not applied.

- At the top, the name, section links, and language switch span the content width.
- Beyond 48px of scrolling, the name and language control move inward around the stationary navigation. The floating surface appears behind them; returning to 24px from the top expands the header.
- Desktop compact width targets 840px, with measured space for all controls. On phones, the same surface contains two rows, retaining swipeable navigation and the language control.
- The header's layout height stays constant. Text is translated without scaling, while only the background surface scales. A 280ms interruptible transition connects the states.
- Reduced motion disables transitions. Reduced transparency uses a solid surface. Anchors account for the sticky header at every width. Without JavaScript, the existing links remain usable.

## Visitor map

- Use a compact 170 × 85px visitor card at the right of the footer, following the user's 2026-11-04 size correction. Vertically center the copyright and template credit against the card, retaining their original inherited serif font, 14px/small sizes and 6px gap. Only the map uses the shared sans-serif UI font. On phones, center both the text and the card in a compact stack. Opening details must not move the copyright block.
- The card pairs a pale blue map on the left with a narrow white statistics panel on the right: a location dot, compact visit count, unit and explicit single-line all-time label. White land outlines, blue ring markers and the existing `--site-accent` (#2c5191) adapt the reference's purple treatment to this site's identity. Visual variation 2/10, hover motion 2/10, compact information density 6/10.
- The hover follows the reference homepage's public `assets/css/main.css`, checked on 2026-11-04, with the user's subsequent request for less elevation: a 1px lift, 160ms ease transition, soft border and 0 4px 12px accent shadow at 10% opacity. Use our blue, fade a fixed shadow with opacity, and only enable the lift for fine pointers with hover. Reduced-motion users retain the color/shadow feedback without movement or animation; keyboard focus retains its blue outline.
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

### Footer alignment and hover follow-up (2026-11-04)

- Inspected the revised desktop footer at 1280px in both languages: the two text lines sit at the card's vertical center, and the English all-time label stays on one line.
- Triggered actual pointer hover and observed the animated upward transform and blue shadow; leaving the card restored its resting state. Clicking and pressing Enter still toggle the region details.
- At 390px the card and copyright are centered, with a 240px card and no horizontal overflow. Changes are limited to CSS and its cache version; collection code and service data are untouched.

### Smaller card and original typography (2026-11-04)

- Reduced the card to 170 × 85px, approximately half its previous area, including proportionally smaller counter spacing. Confirmed the rendered dimensions, no counter overflow, and the original inherited Georgia/serif typography at 14px for copyright.
- Checked desktop and narrow layouts with no horizontal overflow, Chinese footer text, and keyboard expansion of the full visitor statistics. The existing blue hover effect and analytics code are unchanged.

## Header verification

Check expanded and compact states at desktop and phone widths; repeated upward/downward scrolling; both languages; chapter anchors; blog and article navigation; and keyboard focus. Confirm that content does not shift during contraction and controls do not overlap or leave the viewport.
