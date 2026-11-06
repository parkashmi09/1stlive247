// Live store fed by the in-house Sports API: bootstrap from /live + /upcoming, then keep fresh from the /stream SSE.
// One upstream connection serves every user (as the API docs require); changes are pushed out over Socket.IO.
import { config } from "../config.ts";
import { logger } from "../logger.ts";
import type { Match, MatchStatus, Side, SportId, Timer, Tone } from "../types.ts";
import { isNotable } from "../featured.ts";
import { ENDPOINTS, sportsApi } from "./sports-api.ts";

/** Our sport ids -> the API's sport names. Extend here to support more sports. */
export const API_SPORT: Partial<Record<SportId, string>> = {
  football: "football", tennis: "tennis", basketball: "basketball",
  kabaddi: "kabaddi", racing: "horse-racing", f1: "motorsport",
  // cricket comes from the Cricbuzz feed (feed/cricbuzz.ts), not from here
};
const OUR_SPORT = Object.fromEntries(Object.entries(API_SPORT).map(([ours, theirs]) => [theirs, ours])) as Record<string, SportId | undefined>;

export type Scoreboard = {
  event_id: string; sport: string; status: string; start_ts: number;
  home: string; away: string; home_short?: string | string[]; away_short?: string | string[];
  home_score?: string; away_score?: string; minute?: string; info?: string; league?: string; country?: string;
  home_logo?: string; away_logo?: string;
};
export type ApiTimer = {
  mode: "clock" | "minute" | "none"; running: boolean; anchor_ts: number | null; base_s: number; period_len_s: number | null;
  server_ts: number; display: string; minute_label: string;
};

const TONES: Tone[] = ["navy", "gold", "red", "green", "sky"];
const toneOf = (s: string) => TONES[[...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % TONES.length]!;
const short = (v: string | string[] | undefined, name: string) =>
  (Array.isArray(v) ? v.join("/") : v) || name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
const status = (s: string): MatchStatus => (s === "live" ? "live" : s === "finished" ? "finished" : "upcoming");

export function toTimer(t: ApiTimer): Timer {
  return { mode: t.mode, running: t.running, anchorTs: t.anchor_ts, baseS: t.base_s, periodLenS: t.period_len_s, serverTs: t.server_ts, display: t.display, minuteLabel: t.minute_label };
}

/** API scoreboard (+ optional timer) -> our Match contract. Returns undefined for sports we don't show. */
export function toMatch(sb: Scoreboard, timer?: ApiTimer): Match | undefined {
  const sport = OUR_SPORT[sb.sport];
  // shortcut: race-style events (horse racing, motorsport) have no home/away; skipped until a race card UI exists
  if (!sport || !sb.home || !sb.away) return undefined;
  const st = status(sb.status);
  const [league, ...rest] = (sb.league ?? "").split(": ");
  const minute = sb.minute && sb.minute !== "-1" ? `${sb.minute}'` : undefined;
  const clock = st !== "live" ? undefined
    : timer ? (timer.mode === "none" ? timer.display : timer.minute_label || timer.display) || minute
    : minute;
  const side = (name: string, code: string | string[] | undefined, score: string | undefined, logo: string | undefined): Side => ({
    team: { code: short(code, name), name, tone: toneOf(name), ...(logo && { logo }) },
    ...(st !== "upcoming" && score !== undefined && score !== "" && { score }),
  });
  const home = side(sb.home, sb.home_short, sb.home_score, sb.home_logo);
  const away = side(sb.away, sb.away_short, sb.away_score, sb.away_logo);
  if (st === "finished" && home.score && away.score && Number(home.score) !== Number(away.score)) {
    (Number(home.score) < Number(away.score) ? home : away).lost = true;
  }
  return {
    id: sb.event_id,
    sport,
    competition: rest.length ? `${rest.join(": ")} · ${titleCase(league!)}` : sb.league ?? "",
    status: st,
    start: new Date(sb.start_ts * 1000).toISOString(),
    home, away,
    ...(clock && { clock }),
    ...(sb.info && { note: sb.info }),
    ...(st === "finished" && { stage: "Final" }),
    ...(timer && st === "live" && { timer: toTimer(timer) }),
  };
}
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

type Entry = { sb: Scoreboard; timer?: ApiTimer; seenAt: number };

export function createFeedStore(onChange: (m: Match) => void, onOther?: (sb: Scoreboard) => void) {
  const events = new Map<string, Entry>();
  let abort: AbortController | undefined;
  let timers: NodeJS.Timeout[] = [];

  const put = (sb: Scoreboard, timer?: ApiTimer) => {
    const prev = events.get(sb.event_id);
    events.set(sb.event_id, { sb, timer: timer ?? prev?.timer, seenAt: Date.now() });
  };

  async function loadSport(api: string) {
    const [live, upcoming] = await Promise.all([
      sportsApi<{ events: { scoreboard: Scoreboard }[] }>(ENDPOINTS.live(api)),
      sportsApi<{ events: { scoreboard: Scoreboard }[] }>(ENDPOINTS.upcoming(api)),
    ]);
    for (const e of live.events) put(e.scoreboard);
    // a match that dropped off /live has ended (the stream doesn't always send the final update)
    const liveIds = new Set(live.events.map((e) => e.scoreboard.event_id));
    for (const [id, e] of events)
      if (e.sb.sport === api && e.sb.status === "live" && !liveIds.has(id)) events.set(id, { ...e, sb: { ...e.sb, status: "finished" }, timer: undefined });
    // soonest 200 for the lists, plus every big-tournament fixture (for the Home banner) from the full list
    upcoming.events.forEach((e, i) => {
      if (i < 200) return put(e.scoreboard);
      const m = toMatch(e.scoreboard);
      if (m && isNotable(m.competition)) put(e.scoreboard);
    });
    // live clocks: one /timer per live match, then /stream keeps them current
    await Promise.all(live.events.map(async (e) => {
      try { put(e.scoreboard, await sportsApi<ApiTimer>(ENDPOINTS.timer(e.scoreboard.event_id))); } catch { /* clock optional */ }
    }));
    return live.events.length;
  }

  async function bootstrap() {
    const results = await Promise.allSettled((Object.values(API_SPORT) as string[]).map(loadSport));
    results.forEach((r, i) => { if (r.status === "rejected") logger.warn({ sport: (Object.values(API_SPORT) as string[])[i], err: String(r.reason) }, "feed bootstrap failed"); });
    logger.info({ events: events.size }, "feed bootstrapped");
  }

  // Minimal SSE client over fetch (Node has no EventSource); reconnects 3s after any drop, as the docs ask.
  async function stream() {
    while (abort && !abort.signal.aborted) {
      try {
        const url = `${config.PROVIDER_BASE_URL!.replace(/\/$/, "")}/stream?include_scoreboard=1&include_timer=1`;
        const r = await fetch(url, { headers: { "X-API-Key": config.PROVIDER_API_KEY!, accept: "text/event-stream" }, signal: abort.signal });
        if (!r.ok || !r.body) throw new Error(`stream ${r.status}`);
        logger.info("feed stream connected");
        let buf = "";
        const decoder = new TextDecoder();
        for await (const chunk of r.body) {
          buf += decoder.decode(chunk, { stream: true });
          let i;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const block = buf.slice(0, i); buf = buf.slice(i + 2);
            const event = /^event: (.+)$/m.exec(block)?.[1];
            const data = /^data: (.+)$/m.exec(block)?.[1];
            if (event === "update" && data) onUpdate(JSON.parse(data) as { id: string; scoreboard?: Scoreboard; timer?: ApiTimer });
          }
        }
        throw new Error("stream ended");
      } catch (err) {
        if (abort?.signal.aborted) return;
        logger.warn({ err: String(err) }, "feed stream dropped; reconnecting in 3s");
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  function onUpdate(u: { id: string; scoreboard?: Scoreboard; timer?: ApiTimer }) {
    if (!u.scoreboard) return;
    if (!OUR_SPORT[u.scoreboard.sport]) { onOther?.(u.scoreboard); return; } // e.g. cricket: only its logos are used
    put(u.scoreboard, u.timer);
    const m = toMatch(u.scoreboard, events.get(u.id)?.timer);
    if (m) onChange(m);
  }

  function prune() {
    const cutoff = Date.now() - 3 * 3600_000;
    for (const [id, e] of events) if (e.sb.status === "finished" && e.seenAt < cutoff) events.delete(id);
  }

  return {
    async start() {
      abort = new AbortController();
      await bootstrap();
      void stream();
      timers = [
        setInterval(prune, 10 * 60_000),
        setInterval(() => { void Promise.allSettled((Object.values(API_SPORT) as string[]).map(loadSport)); }, 10 * 60_000), // pick up new fixtures
      ];
    },
    stop() { abort?.abort(); timers.forEach(clearInterval); },
    list(f: { status?: MatchStatus; sport?: SportId } = {}): Match[] {
      const out: Match[] = [];
      for (const e of events.values()) {
        const m = toMatch(e.sb, e.timer);
        if (m && (!f.status || m.status === f.status) && (!f.sport || m.sport === f.sport)) out.push(m);
      }
      return out.sort((a, b) => Number(b.status === "live") - Number(a.status === "live") || a.start.localeCompare(b.start));
    },
    get(id: string): Match | undefined {
      const e = events.get(id);
      return e && toMatch(e.sb, e.timer);
    },
  };
}
export type FeedStore = ReturnType<typeof createFeedStore>;

/** Match statistics (the "Match" section of /slice/stats), grouped. */
export async function fetchStats(id: string) {
  const rows = await sportsApi<Record<string, string>[]>(ENDPOINTS.slice(id, "stats"));
  const groups: { title: string; stats: { name: string; home: string; away: string }[] }[] = [];
  let section = "";
  for (const r of rows) {
    if (r.SE) { section = r.SE; continue; }
    if (section !== "Match") continue;
    if (r.SF) groups.push({ title: r.SF, stats: [] });
    else if (r.SG && groups.length) groups.at(-1)!.stats.push({ name: r.SG, home: r.SH ?? "", away: r.SI ?? "" });
  }
  return groups.filter((g) => g.stats.length);
}
