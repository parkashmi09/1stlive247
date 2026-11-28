---
name: icon-picker
description: Find better icons for a 1stLive247 UI spot by searching icon sets on the web (Iconify, which covers Phosphor, Tabler, Lucide, Solar, Fluent, Material Symbols, Mingcute and more), show 4–6 options per icon side by side on a preview page in CDP Chrome, get the user's pick, then inline only the chosen SVGs. Use for "icon sahi nahi lag raha", "badhiya icons dhundh", "icon options dikha", "alag alag websites se icon", or when any icon looks off.
---

# Icon picker

The user picks the icon. Never ship an icon they haven't approved.

## 1. Pin down the spot
- Read the component that draws the icons (for example the `TABS` array in `web/src/components/home/HomeBoard.tsx`). Note the render size, the colour context (a gold, brand or glass chip) and whether the icon is a fill or a stroke icon.
- Take a "before" screenshot in CDP Chrome (port 9333, mobile 402×874).

## 2. See what real sports sites do
- Open 4–5 sites in CDP Chrome on a mobile viewport and take screenshots: Sofascore, FotMob, Flashscore, LiveScore, Cricbuzz, FanCode. Click "Reject all" on any cookie banner.
- Betting sites (Stake, 1xBet, bet365) time out in India, so don't spend calls on them.
- For each site, note the icon and the label it uses for this spot. Labels can differ from ours, for example Trending, Popular, Live Now, Schedule or Fixtures.
- Turn what you find into full tab sets (icon plus label) on the preview page, and say which site each set is like.

## 3. Search the icon sets
Use the Iconify public API, which has 200k+ open icons from 150+ sets. No key and no new dependency.
- Search: `curl -s "https://api.iconify.design/search?query=<word>&limit=60"` returns `icons: ["prefix:name", ...]`.
- Fetch the SVG: `curl -s "https://api.iconify.design/<prefix>/<name>.svg"`.
- Licence: `curl -s "https://api.iconify.design/collections?prefixes=<prefix>"`. Only use MIT, Apache 2.0, ISC or CC0 sets. Skip CC-BY and GPL sets unless the user OKs attribution.
- Try 2–3 words per meaning (live: `live`, `broadcast`, `signal`, `record`; upcoming: `calendar`, `clock`, `schedule`, `hourglass`; top: `star`, `trophy`, `crown`, `fire`).
- Prefer these sets: `ph` (Phosphor, including `-fill` and `-duotone`), `tabler`, `mingcute`, `fluent` and `fluent-emoji-flat` (colourful), `material-symbols`, `lucide`, `iconoir`, `ri` (Remix). Don't use `solar`: it is CC-BY and needs attribution.
- Pick 4–6 candidates per icon. Mix the styles: one filled, one duotone, one colourful (emoji-flat) and one in our current style.

## 4. Build the preview page
- One throwaway page: `web/src/app/prototype/icons-<spot>/page.tsx`, with a `shortcut:` comment saying to delete it once icons are picked.
- Paste each SVG inline as JSX. Convert attributes to camelCase and keep the `viewBox`.
- For every icon, show each option inside the real chip at the real size (for example a 16px icon in an h-9 chip), in both the selected and the unselected state.
- Label each option with a number, the set name and its licence, for example "2 · Solar (MIT)".
- Colour mono icons with `currentColor` or a house token: `text-live` for live, gold for top, `text-text-2` when unselected.

## 5. Show it and ask
- Open `http://localhost:3247/prototype/icons-<spot>` in CDP Chrome and take a full-page mobile screenshot.
- Reply with a short table per icon: number, set, style. Recommend one per icon and ask the user to pick, for example "Top 3, Live 1, Upcoming 4".

## 6. After the pick
- Replace only the chosen icons in the real component, as inline SVG. Don't add an icon package.
- Check them in the browser at 402px, including selected and unselected states.
- Delete the prototype page.
- Commit, push or deploy only when the user asks. Deploy with the steps in the vercel-deploy memory.

## Don'ts
- Don't use brand logos or icons from paid, CC-BY or GPL sets without asking.
- Don't hotlink icons from the Iconify CDN at runtime. Inline them.
- Don't change the real component before the user picks.
