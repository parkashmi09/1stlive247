---
name: sports-figma-to-next
description: Research similar live-score / sports-news designs on the web, build a premium Figma design (tokens, custom SVG icons, components, screens) for the 1stLive247 client theme, get approval, then implement it in Next.js. Use when the user asks to design or build the sports score app, "figma ready karo", "design pehle phir code", or references Flashscore / Cricbuzz / Sofascore style.
---

# Sports app: research → Figma → Next.js

Order is fixed: **Research → Tokens + Icons → Figma → user approval → Next.js**. Never write app code before the user approves the Figma.

## Inputs
- Client theme: `design/client-reference/theme-1-light-gold.png`, `design/client-reference/theme-2-navy-gold.png`. Read both images first; they are the source of truth for brand look.
- Functional references (for information architecture and data density only): flashscore.com/live, cricbuzz.com, sofascore.com.
- Figma folder: "1stLive247 - Sports App" (team "alex shiv's team"),
  https://www.figma.com/files/team/1698046834227589892/folder/685057795

## Hard rules
- Original design only. Never copy logos, names, team crests, player photos, exact layouts or colours of Flashscore / Cricbuzz / Sofascore. Learn patterns (match row, scorecard, ball-by-ball, tabs), redraw them in the client theme.
- No real team crests or player photos in the design. Use neutral placeholders (initials badge, flag-like generic chip, gradient image placeholder).
- All icons are custom SVGs we draw ourselves (see step 2). No icon fonts, no copied icon packs.

## 1. Research (web search)
Run these searches in one turn (WebSearch, mode "standard"), then open the 4–6 best results with the web-fetch agent:
- "live score app UI design dribbble 2026"
- "cricket scorecard app UI behance"
- "football match centre UI mobile premium dark navy gold"
- "sports news app UI kit figma community"
- "ball by ball commentary UI design"
Also take screenshots of the three reference sites via chrome-devtools (CDP Chrome on port 9333) at 390px and 1440px widths. Save them to `design/research/`.
Write `design/research/NOTES.md`: for each screen type (home, live list, match centre, scorecard, commentary, news, more/settings), list the patterns worth using, with source links. Keep it short.

## 2. Design tokens + custom icons
Derive from the client images and write `design/tokens.json`:
- Colour: navy primary (deep ~#0A1F4A, mid ~#13306E), gold accent gradient (~#B8862B → #F2D27A), white/off-white surfaces, live red, boundary green (4 = green outline, 6 = green fill), neutral greys. Light theme is the base; dark theme uses navy surfaces.
- Type: one display face (bold condensed italic for logo-like headings) and one UI sans face (Inter or similar from Google Fonts). Scale: 12/14/16/20/24/32.
- Radius 12/16/24, spacing 4-pt grid, card shadow, gold hairline borders.
Icons in `design/icons/*.svg`, 24×24 viewBox, 1.75 stroke, round caps, `currentColor`, plus a duotone "active" variant with a gold fill:
home, live (broadcast), news, videos, scores (trophy), more, search, bell, share, back, settings, star, cricket, football, tennis, basketball, racing (horse), f1 (flag), kabaddi, stats (bars), lightning, globe.
Check each icon renders at 16, 24 and 32 px before using it.

## 3. Build the Figma file
Use the Figma MCP server (`figma`, user scope) to write to the canvas. If it is not authenticated, tell the user to run `/mcp`, pick figma, finish the login, and then continue.
Fallback if the MCP cannot write: create the file in the CDP Chrome (folder → + Create → Design), then build the screens as HTML and import them with the htmltodesign connector.

File name: "1stLive247 — App UI v1". Pages:
1. **Cover**: brand lockup, tagline "Always on for sports".
2. **Foundations**: colour styles, text styles, spacing, radius, shadows (from tokens.json, as Figma variables).
3. **Icons**: every SVG from `design/icons`, as components, in default and active variants.
4. **Components** (with variants): top bar, sport chip tabs, segmented tabs, sport icon rail, live badge, hero match card, match row (cricket / football / tennis / kabaddi), recent-balls strip, commentary row, news hero card, news list row, settings row and toggle, bottom nav with gold active indicator, buttons.
5. **Mobile 390×844**: Home, Live Scores, Match Centre (Overview, Scorecard, Commentary), News list, News article, More.
6. **Desktop 1440**: Home and Match Centre (three columns: left sports and leagues, centre matches, right news and ads).
Use auto layout everywhere so the screens map cleanly to flex in code.

## 4. Review gate
Screenshot every screen. Put each screen next to the client images and check the brand colours, gold accents, density and readability. Send the Figma link to the user and **stop until they approve or give changes**.

## 5. Next.js implementation (only after approval)
- `npx create-next-app@latest web --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --use-npm --yes`
- Tokens become CSS variables in `globals.css` plus the Tailwind theme. Icons become React components in `src/components/icons/` (inline SVG, `currentColor`).
- For each Figma frame, pull its design context through the Figma MCP and build the matching component or route: `/`, `/live`, `/match/[id]`, `/news`, `/news/[slug]`, `/more`.
- Use typed mock data in `src/data/` first. Wire a real scores API only when the user picks one.
- Responsive: the mobile layout is the base and the desktop layout starts at `lg`. Dark mode comes from the tokens.
- Verify with chrome-devtools screenshots at 390 and 1440 px against the Figma frames.
