// Team-logo index for cricket: Flashscore has logos, Cricbuzz has the scores. Names are matched after normalizing.
// The index only grows (persisted in Postgres), so a team keeps its logo after its Flashscore fixture is gone.
import { pool } from "../db/pool.ts";
import { logger } from "../logger.ts";
import { ENDPOINTS, sportsApi } from "./sports-api.ts";
import type { Scoreboard } from "./store.ts";

/** "India Women" ≈ "India W", "Sri Lanka" ≈ "SriLanka", case/punctuation-insensitive. */
export const nameKey = (name: string) =>
  name.toLowerCase().replace(/\bwomen\b/g, "w").replace(/\bxi\b/g, "xi").replace(/[^a-z0-9]+/g, "");

const LOGO_BASE = "https://static.flashscore.com/res/image/data/";

/** h2h rows carry team names (FH/FK) and logo files (EC/ED) for both teams' recent opponents. */
export function logosFromH2h(rows: Record<string, string>[]): [string, string][] {
  const out: [string, string][] = [];
  for (const r of rows)
    for (const [name, file] of [[r.FH, r.EC], [r.FK, r.ED]] as const)
      if (name && file) out.push([name, LOGO_BASE + file]);
  return out;
}

export function createLogoIndex(sport = "cricket") {
  const logos = new Map<string, string>();
  const harvested = new Set<string>(); // fixture ids whose h2h we already read
  let timer: NodeJS.Timeout | undefined;

  async function ingest(events: Scoreboard[]) {
    return save(events.flatMap((sb) => [[sb.home, sb.home_logo], [sb.away, sb.away_logo]] as [string, string | undefined][]));
  }

  async function save(pairs: [string, string | undefined][]) {
    const rows: [string, string, string][] = [];
    for (const [name, logo] of pairs) {
      if (!name || !logo) continue;
      const key = nameKey(name);
      if (logos.get(key) === logo) continue;
      logos.set(key, logo);
      rows.push([key, name, logo]);
    }
    for (const [key, name, logo] of rows)
      await pool.query(
        `INSERT INTO team_logos (sport, name_key, name, logo) VALUES ($1,$2,$3,$4)
         ON CONFLICT (sport, name_key) DO UPDATE SET logo = EXCLUDED.logo, name = EXCLUDED.name, updated_at = now()`,
        [sport, key, name, logo]);
    return rows.length;
  }

  async function refresh() {
    const [live, upcoming] = await Promise.all([
      sportsApi<{ events: { event_id: string; scoreboard: Scoreboard }[] }>(ENDPOINTS.live(sport)),
      sportsApi<{ events: { event_id: string; scoreboard: Scoreboard }[] }>(ENDPOINTS.upcoming(sport)),
    ]);
    const events = [...live.events, ...upcoming.events];
    let added = await ingest(events.map((e) => e.scoreboard));
    // h2h of each new fixture lists both teams' recent opponents with logos (national teams included)
    for (const e of events.filter((e) => !harvested.has(e.event_id)).slice(0, 8)) {
      harvested.add(e.event_id);
      try { added += await save(logosFromH2h(await sportsApi<Record<string, string>[]>(ENDPOINTS.slice(e.event_id, "h2h"), { timeoutMs: 15_000 }))); }
      catch { /* h2h is optional */ }
    }
    return added;
  }

  return {
    async start() {
      const r = await pool.query<{ name_key: string; logo: string }>("SELECT name_key, logo FROM team_logos WHERE sport = $1", [sport]);
      for (const row of r.rows) logos.set(row.name_key, row.logo);
      try { logger.info({ known: logos.size, added: await refresh() }, "cricket logo index ready"); }
      catch (err) { logger.warn({ err: String(err) }, "logo index refresh failed"); }
      timer = setInterval(() => { void refresh().catch(() => {}); }, 10 * 60_000);
    },
    stop() { clearInterval(timer); },
    lookup: (name: string) => logos.get(nameKey(name)),
    ingest,
  };
}
export type LogoIndex = ReturnType<typeof createLogoIndex>;
