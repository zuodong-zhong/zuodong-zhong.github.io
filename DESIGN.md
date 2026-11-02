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

## Verification

Check expanded and compact states at desktop and phone widths; repeated upward/downward scrolling; both languages; chapter anchors; blog and article navigation; and keyboard focus. Confirm that content does not shift during contraction and controls do not overlap or leave the viewport.
