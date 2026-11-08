# Design — Gino Angelici Portfolio

A locked design system for this site. Every page redesign reads this file
before emitting code. Do not regenerate per page — extend or amend this file
when the system needs to grow.

## Genre

**editorial** — Hallmark's canonical anti-slop voice. Replaces an earlier
modern-minimal / SaaS-card-grid build that read as templated. A personal
portfolio is closer to a considered piece of writing than a product
dashboard — this system treats it that way: prose, hairlines, restraint.

## Macrostructure families

- **Identity** (`index.html`): **Long Document** — continuous prose, inline
  section heads, no card grid, no icons, no hero image. Reads like a real
  page someone wrote, not a template someone filled in.
- **Browse** (`projects/index.html`): **Index-First** — the page IS a list.
  Hairline dividers between rows, no bordered cards. Search only (no year
  filter — dropped, see Provenance).
- **Document** (`resume/index.html`): a trimmed, document-flow CV. A
  plain "Résumé" heading and contact links, then flowing sections divided
  by hairlines. No stat row and no PDF download link.
- **Utility** (`contact/index.html`): a plain page, no card chrome.

## Theme — Lavender Night

Dark, high-contrast-serif, lavender. Pale lavender-white type on a deep
violet-charcoal page, with a soft lavender accent. Replaced Studio
(ivory + forest green) on request; see Provenance.

```
--color-paper:   oklch(17%   0.028 300)   /* deep violet-charcoal */
--color-paper-2: oklch(21%   0.034 300)
--color-ink:     oklch(95%   0.016 300)   /* lavender-white */
--color-ink-2:   oklch(85%   0.022 300)
--color-ink-3:   oklch(68%   0.030 300)
--color-rule:    oklch(32%   0.036 300)
--color-accent:  oklch(79%   0.105 300)   /* lavender */
--color-focus:   oklch(83%   0.115 300)
```

Accent use is a highlighter, not a fill: underlines, focus rings, one small
square mark beside a heading, active nav state. Never a filled button —
primary actions are text links (accent colour + arrow), per Hallmark's
colour discipline ("do not fill giant buttons with it").

## Typography

- Display: **Newsreader**, weight 600/700, roman only
- Body: **IBM Plex Sans**, weight 400/500
- Outlier (≤2 roles, used consistently): **JetBrains Mono** — tags the
  small-caps masthead meta-line and every stand-alone number (résumé
  stats, repo counts). Never a third body font.
- Measure: 65ch. Line-height 1.65 for body, 1.05–1.15 for display.

## Spacing

Same 4-point scale as before, reused: `--space-3xs` … `--space-3xl`.

## Motion

Quiet. No scroll-reveals, no card hovers, no bounce, no counting-up
numbers. Everything is just there, per Long Document's own rule.

## Nav + footer (shared, built in `global.js`)

- **Nav** — N6 Newspaper masthead: centred wordmark, small-caps meta line
  above, inline link row below (Home / Projects / Résumé / Contact / a
  plain-text "Jump to ⌘K"), double hairline rule beneath. Not a bordered
  bar, not a floating pill.
- **Footer** — Ft1 Mast-headed: wordmark, one plain line (no marketing
  tagline), a link row (GitHub · LinkedIn · Email), tiny copyright.

## What pages MUST share

- The masthead, footer, ⌘K palette (kept — genuinely useful, not slop)
- Newsreader + IBM Plex Sans + JetBrains Mono
- The green accent, used only as underline/mark/focus-ring — never a fill
- Hairline dividers instead of card borders everywhere

## What pages MAY differ on

- Macrostructure within their family
- Density (Contact is one short page)

## Provenance

2026-07-15: initial multi-page build (modern-minimal, custom "Cobalt"
theme). Same day: retheme to custom "Cold Snap" (icy paper, green accent).
2026-07-15 (later): **full structural rebuild** — user feedback was that
the Cobalt/Cold Snap build still read as generic AI-portfolio slop (card
grids, icon tiles, a JSON-terminal gimmick, a ten-widget analytics
dashboard, over-written copy). This rebuild: genre editorial, catalog
theme Studio, macrostructures Long Document / Index-First / trimmed doc
flow. Cut entirely: the home hero terminal card, the home featured-projects
strip, the home GitHub-stats widget, the projects-page D3 donut filter, and
on `meta/` — the language donut, activity heatmap, coding-journey
sparkline, tech radar, repo-size bubbles, commit bars, and the particle-
network canvas. `meta/` no longer depends on D3 at all. Copy was cut
across every page — shorter ledes, one bullet per role instead of two,
skills as plain lines instead of tag clouds.

2026-07-20: added a **Favorite Projects** duo to the home page — two real
screenshots (Citi Bike, Seal Health Modeling), hairline-bordered, no
rounded corners or shadow, linking out to the live sites. This is a
deliberate, requested exception to Long Document's "no featured-projects
strip" rule from the rebuild above — kept to exactly two images, captioned
in body type (not card chrome), so it reads as an illustrated aside in the
prose rather than a reintroduced dashboard widget. Also added recruiter-
facing skill tags (mono, muted) under every project description and every
`index.html` experience role, and a small accent `↗` mark on project
titles/roles that link to a live site or repo. Dropped the projects-page
year filter — search-only now.

2026-07-20 (later): removed `meta/` entirely — the GitHub-activity page
(and its nav-cmdk entry) is gone, not just trimmed. `meta-page` styles and
the GitHub REST API dependency (`meta/main.js`) are deleted. Macrostructure
families and shared-rules sections above updated accordingly.

2026-11-08: switched theme from Studio (light ivory, forest green) to
**Lavender Night** (dark, hue 300) at Gino's request. Tokens only; layout,
type, and accent discipline unchanged. `color-scheme: dark`; command-palette
overlay and shadow retinted. Synced `resume/source/resume.tex` with the master
resume (all projects, end-date order) and corrected project years in
`lib/projects.json` (Organ Trail 2026, Seal Health 2025, SD Parking 2025).

2026-11-08 (later): résumé page simplified. Removed the three-number stat
row, the repeated name heading (the masthead already shows it), and the
Download PDF link; home page no longer mentions a downloadable PDF.
