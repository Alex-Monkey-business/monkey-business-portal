# Handoff: Alex Monkey Business — Landing Page

## Overview

**Alex Monkey Business** is a minimalist personal portal / landing page — a single page that acts as an index to everything Alex is working on (client work + personal side projects). No sales pitch, no long bios; just a large editorial hero and a clean, list-based project directory.

Tone: warm, editorial, understated. Motion is quiet and intentional — the "monkey business" is in the brand name and the mark, not in the UI behavior.

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior, not production code to copy directly.

The task is to **recreate these HTML designs in the target codebase's existing environment** (React, Next.js, Astro, SvelteKit — whatever stack Alex picks) using its established patterns. If no environment exists yet, choose the simplest appropriate framework for a low-maintenance personal site — **Astro** is recommended (static, ships tiny JS, trivial to deploy on Vercel/Netlify/Cloudflare Pages).

The design tokens in `styles/tokens.css` are the **source of truth** for colors, typography, spacing, motion, and radii. Port them into the target codebase's token/theme layer (CSS variables, Tailwind theme, styled-system, etc.).

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, and interaction details are all locked in. Recreate pixel-perfectly.

## Screens / Views

This is a **single-page site** with three stacked regions plus a fixed nav.

### 1. Fixed top navigation (`.nav`)

- **Position**: `position: fixed; top/left/right: 0; z-index: 50`.
- **Padding**: `22px 40px` desktop, `18px 22px` ≤640px.
- **Background**: `color-mix(in oklab, var(--bg) 78%, transparent)` with `backdrop-filter: blur(14px) saturate(1.2)`.
- **Behavior**: When `window.scrollY > 12`, add class `is-scrolled` → reveals 1px `var(--border)` bottom border (300ms ease-out).
- **Left**: Monkey mark SVG, 32×32, hover `rotate(-12deg) scale(1.08)` over 500ms spring easing.
- **Right (ul)**: 2 text links — `Projects`, `Email` (mailto). 28px gap desktop, 18px mobile. 13px, `color: var(--fg2)`; underline animates in left-to-right on hover (`transform: scaleX` 300ms).

### 2. Hero (`.hero`)

- **Container**: `min-height: 92vh; padding: 24vh 40px 8vh; max-width: 1200px`. Centered vertically via flex.
- **Title** (`.hero-title`): two stacked lines, each in a `.line` span with `overflow: hidden`.
  - Line 1: `Alex`
  - Line 2: `<em>Monkey business</em>.` — italic, colored `var(--accent)`.
  - Font: Instrument Serif, `clamp(72px, 16vw, 260px)`, `line-height: 0.86`, `letter-spacing: -0.045em`, weight 400.
  - Entry animation: each line's inner span starts at `translateY(110%)` and rises to `0` over 1.1s `var(--ease-out)`. Line 2 delayed by 140ms.
- **Subtitle** (`.hero-sub`): "A portal to the things I'm tinkering with." — 16px, `var(--fg3)`, 40px top margin, `max-width: 32ch`. Fades in with 10px rise, 800ms ease-out, 500ms delay.

*Note*: An illustration slot (`.illo`) exists but is `display: none` — Alex plans to design a more subtle illustration later. Leave the hook in place.

### 3. Projects list (`#projects` / `.projects-wrap`)

- **Container**: `max-width: 720px; padding: 8vh 40px 14vh`.
- **Label**: `.projects-label` — monospace, 11px, uppercase, letter-spacing 0.1em, `var(--fg4)`, 28px bottom margin. Currently reads `Projects · 03`.
- **List** (`ul.projects`): plain `<ul>`, no bullets.

Each project row (`ul.projects a`):
- Grid: `1fr auto`, 20px gap, baseline-aligned.
- Padding: `20px 0`.
- Border: `1px solid var(--border)` bottom; first row also has top border.
- **Title** (`.title`): Instrument Serif, `clamp(22px, 3vw, 28px)`, weight 400, `letter-spacing: -0.015em`. `<em>` inside is italic (no color shift).
- **WIP tag** (`.title .tag`): monospace 10px, uppercase, letter-spacing 0.14em, `color: var(--accent)`, `1px solid currentColor`, pill radius, 2px/8px padding, `top: -4px` relative offset.
- **Year** (`.year`): monospace, 12px, `var(--fg3)`.

Hover state:
- `padding-left: 18px` (340ms ease-out).
- Text color → `var(--accent)`; year → accent at 0.7 opacity.
- Pseudo `::before` `→` slides in from `translate(-140%, -50%)` to `translate(0, -50%)`, opacity 0 → 1.

Reveal on scroll: each `li` starts `opacity: 0; transform: translateY(14px)`. An `IntersectionObserver` (threshold 0.2) adds `.is-in` which triggers a 700ms transition. A `--i` CSS var on each `<li>` delays each by `i * 60ms` (staggered reveal).

Current content:
1. **Larvik Beach Volley** — 2026 — `wip`
2. **DiggSki** — 2026 — `wip`
3. **Halsen G15** (italicized "G15") — 2026

### 4. Footer (`<footer>`)

- Max-width 720, same horizontal padding.
- Monospace, 11px, `var(--fg4)`, letter-spacing 0.06em.
- Flex `justify-content: space-between`.
- Left: `Oslo` · Right: `Alex · 2026`.

## Interactions & Behavior

- **Nav scroll shadow**: single `scroll` listener, passive, toggles `.is-scrolled` at `scrollY > 12`.
- **Project reveal**: `IntersectionObserver({ threshold: 0.2 })` — adds `.is-in`, unobserves.
- **Hover states**: all done in CSS (no JS).
- **Reduced motion**: the design respects `prefers-reduced-motion: reduce` — all rising/fading/looping animations are disabled.
- **No routing yet**: project links are `href="#"`. Each will eventually route to its own landing page (e.g. `/larvik-beach-volley`, `/diggski`, `/halsen-g15`).

### Tweaks panel (development-only in prototype)

The prototype has a small Tweaks panel (`#tweaks`) behind a `postMessage` host protocol (`__activate_edit_mode` / `__deactivate_edit_mode` / `__edit_mode_set_keys`). **Do NOT port this to production.** It's a dev surface tied to the Claude preview host. The two persisted knobs — `accent` and `dark` — should be preserved, but via a conventional mechanism (e.g. CSS theme toggle button in nav, or simply committed as the accent default).

Current accent is `#C85C81` (bubble pink) per Alex's latest tweak. Use that as the default accent in production unless told otherwise.

## State Management

Essentially none for the landing itself. When project detail pages are added:

- A simple `projects` data structure (array of `{ slug, title, year, status, emSlice? }`) to drive the list.
- Detail pages per project.

## Design Tokens

Full set in `styles/tokens.css`. Key values:

### Colors (light)
- `--bg` / `--cream-50`: `#FFF6DE` — paper/page background
- `--bg-elevated` / `--cream-100`: `#FFFFFF`
- `--fg1` / `--ink-900`: `#242424` — primary text
- `--fg2` / `--ink-700`: `#3A3A3A` — secondary text
- `--fg3`: `#24242499` (ink @60%) — captions/meta
- `--fg4`: `#2424244D` (ink @30%) — disabled/hairline
- `--border` / `--cream-300`: `#EEE1D3`
- `--accent` (current): `#C85C81` (bubble-500 pink). Originally `#E24037` (coral-500).
- Accent palette options:
  - Coral: `#E24037` / hover `#B32A22`
  - Sage: `#5B8F66` / `#2E5920`
  - Sky: `#3E6FB0` / `#26467F`
  - Bubble: `#C85C81` / `#803A32`
  - Ink (mono): `#242424`

### Colors (dark)
Applied via `body.dark`:
- `--bg`: `#1A1815`
- `--fg1`: `#F3EADA`
- `--fg2`: `#C9BFAE`
- `--fg3`: `#9A907F`
- `--fg4`: `#6B6354`
- `--border`: `#2E2A24`

### Typography
- Display: **Instrument Serif** (Google Fonts), used for all large titles and project titles.
- UI: **Geist** (Google Fonts), weights 400/500/600/700.
- Mono: **Geist Mono**, weights 400/500.
- Accent (unused on landing): **Caveat**.
- Scale: `12, 14, 16, 18, 22, 28, 36, 48, 64, 88` px tokens.
- Line heights: tight 1.05 / snug 1.2 / normal 1.45 / loose 1.65.

### Spacing scale
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80` px (tokens `--s-1` … `--s-20`).

### Radii
`--r-xs: 4px, --r-sm: 8px, --r-md: 12px, --r-lg: 18px, --r-xl: 24px, --r-pill: 999px`.

### Shadows
- `--shadow-1/2/3`: soft warm directional shadows (see tokens file).
- `--shadow-pop`: `0 3px 0 var(--ink-900)` — "sticker" hard offset. Not used on this landing but part of the system.

### Motion
- `--ease-out: cubic-bezier(0.2, 0.8, 0.2, 1)` — default.
- `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — gentle overshoot for landings.
- `--dur-fast: 120ms`, `--dur-base: 200ms`, `--dur-slow: 360ms`.

## Assets

- `assets/mark.svg` — Monkey head mark (200×200 viewBox). Used in nav at 32×32.
- `assets/logo.svg` — Full wordmark (mark + "Monkey" italic serif + "business" coral sans).

Both are custom SVG — part of the Monkey Business design system and safe to ship as-is.

## Files

- `Alex Monkey Business.html` — the prototype. Self-contained except for the two stylesheets.
- `styles/tokens.css` — all CSS variables (colors, type, spacing, radii, shadows, motion). **Port first.**
- `styles/landing.css` — older v1 styles, superseded by the `<style>` block inside the current HTML. Safe to ignore if starting clean; kept for reference.
- `assets/mark.svg`, `assets/logo.svg`.

## Next steps (Alex's roadmap)

1. Design a new, more subtle hero illustration (slot already reserved).
2. Build individual landing pages for each project:
   - `Larvik Beach Volley` — beach volleyball club
   - `DiggSki` — freeride ski club
   - `Halsen G15` — football coach companion app. Screenshots exist locally on Alex's Mac at `~/Desktop/Fotball app Halsen G2015` — they need to be re-uploaded or placed in `assets/halsen/` in the new repo. This page should use phone-frame mobile mockups around the screenshots with minimal copy (app name, one-line purpose, feature list).
3. Replace `href="#"` with real routes.

---

Built in the Claude web app. Moved to Claude Code for implementation so new project pages and screenshot mockups can be built locally alongside the image assets.
