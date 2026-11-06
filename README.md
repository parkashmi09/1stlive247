# 1stLive247

Live scores and sports news. Mobile-first web app with a real-time backend.

```
web/       Next.js 16 (App Router, Cache Components, Tailwind v4) — http://localhost:3247
backend/   Node 24 + TypeScript, Express 5, Socket.IO 4.8, PostgreSQL 17 — http://localhost:4247
design/    Figma tokens (tokens.json), custom icons, research
```

## Run locally

```bash
# 1. database (once)
createdb score247 && createdb score247_test
cd backend && cp .env.example .env && npm install && npm run db:migrate && npm run db:seed

# 2. backend (mock live feed ticks a ball every 4s)
npm run dev

# 3. frontend (new terminal)
cd web && cp .env.example .env.local && npm install && npm run dev -- --port 3247
```

Reset the demo match at any time: `cd backend && npm run db:seed`.

## How data flows

- First paint: Next.js server components call the REST API (`web/src/lib/api.ts`), streamed behind `<Suspense>`.
- Live: the browser holds one Socket.IO connection (`web/src/lib/live.ts`) and patches state in place.
- Backend: a `LiveProvider` emits events → `live/engine.ts` writes them to Postgres in one transaction → broadcasts to rooms.

### REST (`/api/v1`)

| Method | Path | Notes |
|---|---|---|
| GET | `/matches?status=live\|upcoming\|finished&sport=cricket` | list |
| GET | `/matches/:id` | one match |
| GET | `/matches/:id/centre` | scorecard, recent balls, commentary (newest first) |
| GET | `/news?sport=&limit=` | list |
| GET | `/news/:slug` | article |
| GET | `/sports`, `/health`, `/ready` | |

### Socket.IO events

| Direction | Event | Payload |
|---|---|---|
| client → server | `live:subscribe` | — joins the room for all live score changes |
| client → server | `match:subscribe` / `match:unsubscribe` | `{ id }` (ack: `{ ok, error? }`) |
| server → client | `match:update` | full `Match` |
| server → client | `centre:update` | centre without commentary |
| server → client | `commentary:new` | `{ matchId, entries }` newest first |

Contract types: `backend/src/types.ts` (mirrored in `web/src/data/types.ts`).

## In-house Sports API (live data)

`backend/.env`: `LIVE_PROVIDER=sportsapi`, `PROVIDER_BASE_URL=http://187.53.141.8:9232`, `PROVIDER_API_KEY=…`.
The machine's public IP must be in the key's Allowed IPs (admin → Clients). `LIVE_PROVIDER=mock` runs the offline demo instead.

- `backend/src/feed/store.ts`: boots from `/live/{sport}` + `/upcoming/{sport}`, then one `/stream` SSE connection keeps an in-memory store fresh and pushes `match:update` to Socket.IO rooms.
- Sports shown: football, tennis, basketball, kabaddi (map in `API_SPORT`). Racing/motorsport have no home/away and are skipped for now.
- **Cricket comes from the in-house Cricbuzz API** (`backend/src/feed/cricbuzz.ts`, `CRICBUZZ_API_KEY`, base `http://187.53.141.8:9228`, ids prefixed `cb-`): `/live/cricket` + `/stream`, and for matches someone has open: scorecard (every ~20 s), `full_commentary` once then the small `comm` slice merged on top. The key's client needs the products Live matches, Scoreboard, Commentary, Scorecard & stats and Live push.
- `GET /api/v1/matches/:id/stats` proxies `/event/{id}/slice/stats` (cached 10 s per match).
- Match clocks: the feed's `timer` anchor is ticked in the browser (`web/src/lib/clock.ts`), no polling.
- `npm run feed:probe <sport>` saves raw payloads to `backend/samples/` when adding new mappings.

## Checks

```bash
cd backend && npm run typecheck && npm test   # unit + REST/socket end-to-end (uses score247_test)
cd web && npm run lint && npx tsc --noEmit && npm test
```
