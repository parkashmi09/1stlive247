---
name: responsive-views
description: Build or change any 1stLive247 web screen so it works on mobile, tablet and desktop in one pass, with the shared shell, breakpoints, grid rules and ad slots. Use for any new page or component in web/src, for "web view", "tab view", "desktop layout", "responsive", "ad slot", or when a screen looks fine on one size and broken on another.
---

# Responsive views: mobile, tablet, desktop

One codebase, three views. Every screen change must be checked on all three before it is done.

## Breakpoints (Tailwind defaults, do not invent new ones)

| View | Width | Shell | Navigation |
|---|---|---|---|
| Mobile | < 768 (`base`) | one column, `max-w-[480px]`, `px-4` | `BottomNav` |
| Tablet | 768–1023 (`md:`) | one wide column, `md:max-w-[960px] md:px-6` | `BottomNav` (touch device) |
| Desktop | ≥ 1024 (`lg:`) | `lg:max-w-[1280px]`, main + 380px side column | `DesktopNav` header; the bottom nav is hidden |

The shell lives in `web/src/app/layout.tsx`. Pages never set their own outer max-width. Detail pages (match, article, More) only centre their content (`lg:mx-auto lg:max-w-[880px]`).

## Layout rules

1. **Mobile first.** Write the phone classes, then add `md:` and `lg:` overrides. Never break the phone view: it is the designer's Figma-exact view.
2. **Card grids.** A list of cards is `grid gap-2 md:grid-cols-2 md:gap-3`. A header inside a grid gets `md:col-span-2`.
3. **Side column (desktop only).** Use `lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6`. The side column is `<aside>` with `lg:sticky lg:top-20`. On mobile and tablet the aside content flows above or below the main content, or gets `hidden lg:block` when it repeats something.
4. **Sticky offsets.** Desktop header is 64px, so sticky things use `lg:top-16` (bars) or `lg:top-20` (columns). `TopBar` already does this.
5. **Horizontal scrollers** (sport pills) cancel the gutter with `-mx-4 px-4`. Undo it at the size where the gutter changes (`lg:mx-0 lg:px-0`).
6. **Images and SVGs that render twice** (once in the mobile bar, once in the hidden desktop header) must use `useId()` for gradient or clip ids. A duplicate id paints from the hidden copy and the visible one goes blank (see `components/brand.tsx`).
7. **No layout logic in JS.** Use CSS breakpoints only. No `window.innerWidth`, no `matchMedia`: they hydrate wrong under Cache Components.

## Ad slots

Use `<AdSlot>` from `web/src/components/AdSlot.tsx`. Never hand-build an ad box. Placements, so every view has the same inventory:

| Placement | Mobile | Tablet | Desktop |
|---|---|---|---|
| `list-inline`: inside match lists, after every 6th item | 320×100 | 728×90 (spans the grid) | 728×90 |
| `top`: under the page header | none | 728×90 | 970×90 |
| `side`: side column, after the widgets | none | none | 300×250, sticky |
| `match`: Match Centre, under the score header | 320×50 | 728×90 | 728×90 |

Slots reserve their height, so no layout shift happens when a real ad loads. Today they render a labelled placeholder. Real ads are wired in one place later.

## Done checklist (verify in the CDP browser, port 9333)

Emulate each size and take a screenshot:
- 402×874 mobile
- 820×1180 tablet
- 1440×900 desktop

On every screen:
- [ ] Nothing overflows horizontally.
- [ ] Bottom nav is visible on mobile and tablet; the header nav is visible on desktop.
- [ ] Logo and bell are painted (not blank) in every view.
- [ ] Ad slots sit in their placements and keep their reserved height.
- [ ] Light and dark mode both work (the More page has the toggle).
