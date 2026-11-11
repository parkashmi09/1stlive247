---
name: ui-prototype-picker
description: For one 1stLive247 UI piece (tabs, cards, headers, filters, banners), compare how competitor sports apps do it, build 4–5 clickable prototype variants on one preview page, show them in CDP Chrome, and implement only the one the user picks. Use for "design options do", "competitors dekh ke prototype banao", "samples dikha main select karunga", "isko redesign karo", or when the user is unsure how a component should look.
---

# UI prototype picker

The user picks the design; you never ship a variant they haven't chosen.

## 1. Pin down the piece
- Read the current component (for example `web/src/components/home/HomeBoard.tsx`). Note its states, data, sizes and where it renders.
- Take a screenshot of it in CDP Chrome (port 9333, mobile 402×874) so you have a "before".

## 2. Compare competitors
Look at 4–5 apps that solve the same thing: Sofascore, Flashscore, FotMob, Cricbuzz, OneFootball, ESPN.
- If you need to check what an app does today, use WebSearch. Otherwise say the comparison comes from known patterns.
- For each app, write down one line: the pattern and what it's good at (clarity, density, premium feel, touch size).

## 3. Build the prototype page
- Put all variants on one throwaway client page: `web/src/app/prototype/<piece>/page.tsx`. Add a `shortcut:` comment that says to delete it once a variant is picked.
- One `Frame` per variant, labelled with a letter (A–E), a short title and "like <app>". Make every variant clickable (`useState`).
- Use only the house tokens and components: `bg-brand`, `bg-brand-diag`, `bg-gold`, `text-gold`, `bg-surface`, `bg-surface-2`, `border-line`, `text-text`, `text-text-2`, `bg-live`, and `cx` from `components/ui`.
- Icons: inline 24×24 stroke SVGs, or `Icon` / `SportIcon`. No new dependencies.
- Use realistic sample data (counts, names) and say it is sample data.
- Labels must fit at 402px wide: no wrapping, no overflow. Shorten a label rather than shrink text below 11px.

## 4. Show it
- Open `http://localhost:3247/prototype/<piece>` in CDP Chrome. Take a full-page screenshot on mobile, then fix any cramped variant before showing it.
- Check dark mode once with the toggle on the More page, then switch back to light.
- Reply with a table: letter, design, which app it's like, when it's best. Give one recommendation and ask for a letter.

## 5. After the user picks
- Build the chosen variant into the real component, wired to real data (for example live counts from `matches`).
- Check it on mobile (402), tablet (820) and desktop (1440). Follow the `responsive-views` skill.
- Delete the prototype page.
- Commit and push only when the user asks. Deploy with the `vercel-deploy` steps (git-free copy, `--archive=tgz`).

## Don'ts
- Don't copy a competitor's logo, colours, icons or exact layout. Take the pattern and use 1stLive247 branding.
- Don't change the real component before the user picks.
- Don't leave the prototype route in a deploy.
