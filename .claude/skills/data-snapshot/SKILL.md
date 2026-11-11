---
name: data-snapshot
description: Freeze all 1stLive247 data (matches, match centre, insights, news) from the backend into web/snapshot/ JSON so the web app runs with NO API, e.g. on Vercel after feed access is cut. Use for "snapshot", "data ko JSON mein save karo", "replica", "mini db", "API band ho jayega", "offline data", "refresh snapshot".
---

# Data snapshot (offline mini DB)

The web app can read frozen JSON instead of the backend. Use this when the feed or the backend is going away, or for a Vercel demo.

## Refresh the data
1. Check the backend has data first: `curl -s http://217.216.78.106:4247/api/v1/matches?status=live | head -c 200`. If it's empty, the feed IP is probably not allowed. Tell the user, and do NOT overwrite the snapshot.
2. `cd web && npm run snapshot` (or `node scripts/snapshot.mjs <apiBase>`). About 15s for ~700 matches, about 12MB.
   - It writes to `snapshot.tmp/` and swaps it in only when the run succeeds, so a failed run keeps the old data.
   - It aborts if the backend returns 0 matches.
3. `cd web && npm test` (snapshot.test.ts checks the files answer like the API).

## Layout (`web/snapshot/`, committed to git so Vercel ships it)
- `index.json`: `{ takenAt, source, sports, matches, featured, news }`
- `matches/<id>.json`: `{ match, centre, insights }` (centre is cricket only; null otherwise)
- `news/<slug>.json`: the full article

## Run in snapshot mode
- Env `NEXT_PUBLIC_DATA_SOURCE=snapshot`.
  - `web/src/lib/api.ts` routes every call through `web/src/lib/snapshot.ts`.
  - The socket never connects (`live.ts`), so scores stay frozen at `takenAt`.
- Local: `NEXT_PUBLIC_DATA_SOURCE=snapshot npx next dev -p 3247`.
- Vercel: set `NEXT_PUBLIC_DATA_SOURCE=snapshot` in project env. `next.config.ts` has `outputFileTracingIncludes` so the JSON is bundled into the functions.
- No env set = normal live mode against `NEXT_PUBLIC_API_URL`. Nothing changes.

## Adding a new API call
If you add a method to `api.ts`, handle its path in `snapshotGet` and save that data in `scripts/snapshot.mjs`. Otherwise snapshot mode 404s on it.

## Known limits
- Frozen data: "live" matches stay live and the match clocks keep ticking from the frozen timer.
- Only matches the backend listed at snapshot time exist; other ids 404.
