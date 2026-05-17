# Landing page — port notes

This folder is the **production Next.js 15 port** of the landing prototype, ready to drop into your `shigerudev/HackIndies` repo. It targets the `web/` package of that monorepo.

## What changed in `web/`

| Path | Change |
|---|---|
| `web/src/app/page.tsx` | **Replaced.** New marketing landing at `/`. |
| `web/src/app/dashboard/page.tsx` | **New (moved).** Your previous root page — the defensor dashboard — moved here. Link to it from anywhere with `<Link href="/dashboard">`. |
| `web/src/app/layout.tsx` | **Replaced.** Adds `next/font` (Inter + JetBrains Mono), full SEO/OG metadata, `lang="es"`, `dir="ltr"`. |
| `web/src/app/globals.css` | **Replaced.** All design tokens + landing styles. Still starts with `@import "tailwindcss";` so the rest of your app keeps working. |
| `web/src/app/opengraph-image.tsx` | **New.** Dynamic OG image (1200×630) via `next/og`. |
| `web/src/components/landing/*` | **New.** 12 components: Header, Hero, Problem, Solution, Architecture, Audiences, CaseDigecam, Comparison, Ethics, OpenSource, FinalCta, Footer. |
| `web/src/components/ui/*` | **New.** Button, Chip, Card, CodeBlock. |
| `web/src/lib/cn.ts` | **New.** Tiny class-name combiner. |
| `web/public/logo-horizontal.png` | **New.** Copied from `/assets`. |
| `web/public/logo-vertical.png` | **New.** Copied from `/assets`. |
| `web/package.json` | **Updated.** Added `lucide-react`. |

Your existing `web/src/app/{casos,hitl,demo,playground}` routes and `web/src/components/{EventCard,CitizenChat,SeverityBadge,…}` are untouched. The landing routes them via:

- `/casos/digecam` — linked from the DIGECAM case CTA.
- `/hitl`, `/demo`, `/playground` — still work, just no longer linked from the root nav. The dashboard at `/dashboard` keeps the old links to them.

If you want the marketing nav to expose them, add menu entries to `Header.tsx` (the `NAV_ITEMS` array).

## How to merge into your local clone

```bash
# from the root of your HackIndies clone, on a clean branch
git checkout -b feat/landing-page

# Drop the new + updated files in (overwrite when prompted)
# Easiest: download this whole project as a zip and copy the `web/` subtree.

cd web
npm install            # picks up lucide-react
npm run dev            # opens http://localhost:3000

# Once you've eyeballed it
git add web/
git commit -m "feat(web): landing page at /, move dashboard to /dashboard"
git push -u origin feat/landing-page
```

Then open the PR on github.com.

## Server vs client components

Per Next.js 15 best practice, the landing is mostly server-rendered. Only three components are `'use client'`:

- `Header.tsx` — listens to scroll to apply the frosted-glass state.
- `Architecture.tsx` — holds accordion open state.
- `CodeBlock.tsx` (used by `FinalCta`) — clipboard write.

Everything else (Hero, Problem, Solution, Audiences, CaseDigecam, Comparison, Ethics, OpenSource, FinalCta, Footer) is a server component with zero client-side JS.

## Tailwind v4 notes

`globals.css` uses the new `@theme { … }` block to expose tokens as utilities (`bg-bg-base`, `text-fg-primary`, `border-brand-cyan`). The components themselves mostly use the plain CSS classes defined further down in `globals.css` (`.btn`, `.section`, `.card`, `.timeline-v`, etc.) — that's intentional: it keeps the JSX clean and the design tokens centralized. If you'd prefer Tailwind-utility-everything, port the styles section by section.

There is no `tailwind.config.js`. Tailwind v4 doesn't need one when all theming happens in CSS.

## Substitutions

- **Geist → Inter** and **Geist Mono → JetBrains Mono** (both via `next/font`, `display: 'swap'`). To swap to real Geist when you have it, replace the imports in `app/layout.tsx`.
- **Lucide React** is the icon set across the page. The prototype's inline SVGs map 1:1.

## Mode claro (light mode) — how to extend

`globals.css` puts every color behind a CSS custom property. To add light mode, add a `[data-theme="light"]` block (or `@media (prefers-color-scheme: light)`) that overrides:

```css
[data-theme="light"] {
  --bg-base: #f6fbff;
  --bg-elevated: #ffffff;
  --bg-overlay: #f1f6fb;
  --bg-inset: #eef4fa;
  --fg-primary: #03060a;
  --fg-secondary: #475569;
  --fg-muted: #94a3b8;
  --border-subtle: rgba(34, 211, 238, 0.18);
  --border-strong: rgba(29, 78, 216, 0.40);
  /* brand colors stay the same; gradients still read on light */
}
```

Then add a small client-side toggle that flips `document.documentElement.dataset.theme`.

## Accessibility & performance

- AA contrast (token `--fg-primary` over `--bg-base` passes 16:1).
- Skip link, semantic landmarks (`<header>/<main>/<section aria-labelledby>/<footer>`), focus rings on every interactive element.
- `prefers-reduced-motion: reduce` disables the hero float and the dashed connector animation.
- `next/image` with `priority` on header logo + hero logo only (LCP).
- No bundle-bloat from icon libraries — Lucide tree-shakes the imported icons only.
- Zero third-party trackers.

## Restricciones honored

- No invented real names, real domains, or real hashes (only `empleado@institucion.gob.gt`, `a1b2c…`, "Institución pública A").
- Vector Crítico quote linked, not reproduced from any specific article.
- No newsletter / lead-capture forms.
- No third-party scripts (Google Analytics, social pixels, chat widgets).
