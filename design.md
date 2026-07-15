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
  Hairline dividers between rows, no bordered cards. Search + a plain-text
  year filter (no chart).
- **Document** (`resume/index.html`): a trimmed, document-flow CV. Three
  real numbers lead as plain large display type (no filled stat box),
  then flowing sections divided by hairlines.
- **Utility** (`contact/index.html`, `meta/index.html`): plain pages,
  no card chrome. `meta/` was cut from a ten-widget dashboard down to five
  honest facts — see Provenance.

## Theme — Studio (catalog)

Light, high-contrast-serif, chromatic-green. A deep forest-green signal on
warm ivory paper — a print-studio register, not a screen-glow one.

```
--color-paper:   oklch(97%   0.010 110)   /* warm ivory, sage-tinted */
--color-paper-2: oklch(94%   0.012 108)
--color-ink:     oklch(20%   0.02  130)   /* deep forest-charcoal */
--color-ink-2:   oklch(32%   0.018 128)
--color-ink-3:   oklch(52%   0.014 120)
--color-rule:    oklch(85%   0.014 110)
--color-accent:  oklch(46%   0.14  145)   /* deep forest/pine green */
--color-focus:   oklch(50%   0.14  145)
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

Quiet. No scroll-reveals, no card hovers, no bounce. One thing moves: the
stat numbers count up once on the résumé and meta pages. Everything else
is just there, per Long Document's own rule.

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
- Density (Meta is now five facts; Contact is one short page)

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
