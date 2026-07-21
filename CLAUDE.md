# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Gino Angelici's personal portfolio site — static HTML/CSS/vanilla JS, no build step, no framework, no package.json. Deployed via GitHub Pages (custom domain `ginoangelici.com`, see `CNAME`).

## Running locally

There is no build/lint/test tooling. Serve the directory with any static server and open it in a browser, e.g. VS Code's Live Server (configured in `.vscode/settings.json` on port 5501), or:

```
python3 -m http.server 5501
```

Pages are plain files under their own directories (`projects/index.html`, `resume/index.html`, `contact/index.html`, `meta/index.html`) plus the root `index.html`. There's no router — verify changes by opening the actual page.

## Architecture

- **`global.js`** — the shared shell, imported as an ES module (`type="module"`) on every page. On load it injects the nav masthead and footer into `document.body` via DOM APIs (not templated server-side), builds the ⌘K command palette, and exports two shared helpers: `fetchJSON(url)` and `renderProjects(projects, containerElement, headingLevel)`. Any page that lists projects imports these from `global.js` rather than duplicating fetch/render logic.
  - Path resolution is home-relative: `document.documentElement` gets a `home` class only on the root `index.html`; `global.js` checks for that class to decide whether asset/page links need a `../` prefix. If you add a new top-level page, follow the existing directory-per-page pattern (`newpage/index.html`) so this relative-path logic keeps working.
- **`lib/projects.json`** — single source of truth for project data (title, year, image, description). `projects/projects.js` fetches this, and both the year-filter buttons and the free-text search box filter client-side over the parsed array (`Object.values(project).join('\n')` substring match). Adding a project means adding an object here; no other file needs to change.
- **`meta/main.js`** — standalone GitHub-activity page that calls the public GitHub REST API directly from the browser (`api.github.com/users/...`) for the account `AncientAbacus`. No auth token, no backend — rate-limited by GitHub's unauthenticated quota.
- **`style.css`** (root) is the main stylesheet shared across pages; `meta/style.css` holds only meta-page-specific overrides.

## Design system — read `design.md` before touching HTML/CSS

`design.md` is a locked design system produced by the **Hallmark** skill (`.agents/skills/hallmark/`) and is the authority for anything visual. Key constraints future edits must respect:

- Genre is **editorial** (Long Document home, Index-First projects list, trimmed-CV résumé, plain utility pages) — explicitly *not* card grids, icon tiles, or dashboard widgets. The design.md provenance notes a prior "AI-portfolio slop" build (card grids, JSON-terminal gimmick, D3 donuts/heatmaps/particle networks) that was deliberately ripped out; don't reintroduce that pattern.
- Theme "Studio": warm-ivory paper, deep forest-green accent, defined as CSS custom properties (`--color-paper`, `--color-ink`, `--color-accent`, etc.) in `oklch()`. Reuse these variables rather than hardcoding new colors.
- Typography: Newsreader (display), IBM Plex Sans (body), JetBrains Mono (small-caps meta line and standalone numbers only) — no other fonts.
- The accent color is used only as underline/mark/focus-ring, never as a filled button background.
- Nav and footer markup live in `global.js`, not in per-page HTML — edit there, not by copy-pasting header markup into a page.
- When making a non-trivial visual/structural change, prefer invoking the `hallmark` skill so `design.md` stays the record of what changed and why (it has a Provenance log at the bottom — extend it rather than silently diverging).
