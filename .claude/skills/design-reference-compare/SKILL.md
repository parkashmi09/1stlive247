---
name: design-reference-compare
description: Compare the built 1stLive247 screens against a client/designer reference image (screenshot, Dribbble shot, mockup) element by element, and report what matches, what differs, and what can't be done because of data. Use for "reference se compare kar", "client ki image jaisa hai ki nahi", "overall design comparison", "kya missing hai", or after implementing a design from a reference image.
---

# Design reference compare

Goal: an honest side-by-side of the reference and what is actually rendered, so the user knows exactly what is left. Compare, don't redesign: fixes happen only after the user picks them.

## 1. Read the reference
- Open every reference image the user sent in this conversation (later crops override earlier full shots).
- List the screens in it (e.g. Home, Match Details · Statistics, Match Details · Line up).
- For each screen, break it into elements, top to bottom: header, greeting, date strip, section titles, cards (status tab, logos, score plate, labels, bottom panel), tabs, lists, bottom nav, background.
- Per element, note: shape (pill, hexagon, notch, inset panel), colour/material (glass, gradient, flat), size, type weight, spacing.

## 2. Capture ours
- CDP Chrome (port 9333), dev server on 3247 (live API by default; never start the backend locally).
- Mobile 402×874×2 first, because the references are phone screens. Use the closest real match type (football for score plates, cricket for overs) and screenshot the same part of the page as the reference.
- Dark mode once: `localStorage.setItem('theme','dark')` via initScript, then remove the key.

## 3. Compare
One table per screen:

| Element | Reference | Ours | Status |
|---|---|---|---|

Status values:
- ✅ **Match**
- 🟡 **Close**: say the exact difference (size, colour, shape)
- ❌ **Missing**: frontend can do it
- ⛔ **Blocked**: needs data the feed or backend doesn't have (lineups, fan avatars, user name, past dates). Say what data.

Then give:
- **Overall score**: matched / total elements per screen, as numbers. No adjectives.
- **Top fixes**: at most 5, ordered by visual impact, each with the file to change (`components/match-cards.tsx`, `match-centre.tsx`, `ui.tsx`, `globals.css`, `BottomNav.tsx`, `home/HomeBoard.tsx`).
- **Deliberate differences**: anything kept on purpose for client points or branding (search bar, filter, Finished section, bat/ball, logo), so it isn't "fixed" by mistake.

## Rules
- Only compare what you screenshotted. If a view wasn't checked (tablet, desktop, a tab), say so.
- Don't invent data to close a gap: no fake avatars, names or lineups.
- Ask before changing code; deploy only when the user says so.
