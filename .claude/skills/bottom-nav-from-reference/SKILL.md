---
name: bottom-nav-from-reference
description: Rebuild the 1stLive247 mobile bottom navigation (web/src/components/BottomNav.tsx) to match a reference app's bar — its glass/blur background, shadow, active-tab animation and page-change feel — while keeping our colours, gradient and icons. Use for "bottom bar X jaisa", "same animation and smoothness", "glass effect", "shadow add kar", or when the user shares a screenshot/recording of another app's tab bar.
---

# Bottom nav from a reference

Goal: the user shows another app's bottom bar (screenshot, recording, or a URL). We copy the **behaviour and finish** (blur, shadow, motion, timing), never the brand (colours, icons, logo, wording). Our tokens win: `bg-brand` gradient, gold accent, `bg-nav`, `text-text-2`, Onest.

## 1. Capture the reference
- URL that opens here: open it in CDP Chrome (port 9333, mobile 402×874), wait for the app to render, then measure the bar (see step 2).
- URL that does NOT open (geo-block, JS app blank in Wayback): do not use a VPN/proxy. Ask the user for a screen recording (`.mov`) of them tapping each tab, plus one still of the bar. Extract frames with `ffmpeg -vf fps=10,crop=...` into the scratchpad and read a contact sheet.
- From a recording, read: bar height, corner radius, whether the bar floats (margin from the screen edges) or is edge-to-edge, active indicator type (pill behind the icon / dot / underline / raised centre button), whether the active pill slides or fades, label behaviour (always / active only), and how the page transitions (slide, fade, none).

## 2. Measure (when the DOM is reachable)
In CDP `evaluate_script`, find the fixed element at the bottom and dump: `height`, `backgroundColor`, `backdropFilter`, `boxShadow`, `borderTop`, `borderRadius`, `padding`; for the active item: `transition`, `transform`, `color`, `fontSize`; for the active indicator: its `transition` and how `left/transform` changes between two taps (tap, wait 50ms, read again).

## 3. Build with what the project already has
- Edit `web/src/components/BottomNav.tsx` only. The shell (`layout.tsx`) already reserves `pb-28` on mobile and paints a cyan glow behind the bar; keep both.
- Glass: `bg-nav/80 backdrop-blur-xl supports-[backdrop-filter]:bg-nav/70` plus a 1px top hairline `border-t border-line/60` (or `ring-1 ring-white/10` in dark). Shadow: `shadow-[0_-8px_30px_rgb(1_44_120/0.12)]`; in dark mode use a black shadow at 0.4.
- Sliding active pill: one absolutely positioned element inside the bar, width = one tab, `transition-[left] duration-300 ease-[cubic-bezier(.4,0,.2,1)]`; set `left` from the active index (`${index * 100 / tabs.length}%`). No library.
- Icon state: active = `bg-brand` pill or gold icon (match the reference's *pattern*, our colours), `scale-110` with `transition-transform duration-200`; label `text-text-2` → `text-text`.
- Page change: Next already does client navigation. For a cross-fade, wrap page content in a `motion-safe:animate-[fade-in_.25s_ease]` keyframe defined in `globals.css`; do not add Framer Motion.
- Respect `prefers-reduced-motion`: all `transition`/`animate` classes under `motion-safe:`.
- Haptic/overshoot "bounce": `active:scale-95` on the tab, nothing more.

## 4. Verify
- CDP mobile 402×874: tap each tab, screenshot mid-transition (`setTimeout 120ms`) to confirm the pill slides, not jumps.
- Dark mode via the More page toggle; switch back to light.
- Tablet 820 still uses this bar; desktop (lg) uses `DesktopNav`, leave it alone.
- `npm test` in web.

## Don'ts
- No VPN/proxy to reach a blocked reference.
- No copying the reference's colours, icons, labels or logo.
- No new dependencies.
