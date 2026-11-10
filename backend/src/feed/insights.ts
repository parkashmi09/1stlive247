// Match insights for Flashscore events: raw slice codes -> clean JSON. Mapped from real samples (backend/samples/q9/).
import type { H2hMatch, Incident, IncidentKind, MatchInsights, StatGroup } from "../types.ts";
import { ENDPOINTS, sportsApi } from "./sports-api.ts";

type Row = Record<string, string | string[]>;
const list = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const str = (v: string | string[] | undefined) => list(v)[0] ?? "";

/** stats slice: SE = period ("Match", "1st Half"…), SF = group, SG/SH/SI = name/home/away. */
export function parseStats(rows: Row[]): MatchInsights["periods"] {
  const periods: MatchInsights["periods"] = [];
  for (const r of rows) {
    if (r.SE) periods.push({ name: str(r.SE), groups: [] });
    else if (r.SF) periods.at(-1)?.groups.push({ title: str(r.SF), stats: [] });
    else if (r.SG) periods.at(-1)?.groups.at(-1)?.stats.push({ name: str(r.SG), home: str(r.SH), away: str(r.SI) });
  }
  return periods
    .map((p) => ({ ...p, groups: p.groups.filter((g: StatGroup) => g.stats.length) }))
    .filter((p) => p.groups.length);
}

function kindOf(ik: string[]): IncidentKind {
  const [first = "", second = ""] = ik;
  if (first === "Penalty Awarded") return second === "Penalty" ? "penalty" : second === "Penalty missed" ? "penalty-missed" : "other";
  if (/own goal/i.test(first)) return "own-goal";
  if (first === "Goal") return "goal";
  if (/red card/i.test(first)) return "red"; // also "Yellow Card / Red Card" (second yellow)
  if (/yellow card/i.test(first)) return "yellow";
  if (/^substitution/i.test(first)) return "sub";
  return "other";
}

const INFO: Record<string, string> = { REF: "Referee", VEN: "Venue", TWN: "City", CAP: "Capacity" };

/** incidents slice: AC rows open a period (IG/IH = its score); IA = side 1/2, IB = minute, IK/IF = types/players (arrays when paired). */
export function parseIncidents(rows: Row[]): Pick<MatchInsights, "timeline" | "info"> {
  const timeline: Incident[] = [];
  const info: MatchInsights["info"] = [];
  for (const r of rows) {
    if (r.AC) {
      timeline.push({ type: "period", name: str(r.AC), ...(r.IG !== undefined && { score: `${str(r.IG)} - ${str(r.IH)}` }) });
    } else if (r.IK) {
      const ik = list(r.IK), names = list(r.IF);
      const kind = kindOf(ik);
      const at = (label: string) => names[ik.indexOf(label)] || undefined;
      const player = kind === "sub" ? at("Substitution - In") : kind === "goal" ? at("Goal") : names.at(-1);
      timeline.push({
        type: "event", side: str(r.IA) === "2" ? "away" : "home", minute: str(r.IB), kind,
        player: player || names.find(Boolean) || "",
        ...(kind === "goal" && at("Assistance") && { assist: at("Assistance") }),
        ...(kind === "sub" && at("Substitution - Out") && { playerOut: at("Substitution - Out") }),
        ...((r.IL || kind === "other") && { note: str(r.IL) || ik.join(" · ") }),
        ...(r.INX !== undefined && { score: `${str(r.INX)} - ${str(r.IOX)}` }),
      });
    } else if (r.MIT) {
      const keys = list(r.MIT), vals = list(r.MIV);
      const v = (k: string) => vals[keys.indexOf(k)] ?? "";
      for (const k of Object.keys(INFO)) {
        const val = k === "REF" && v("RCC") ? `${v(k)} (${v("RCC")})` : v(k);
        if (val) info.push({ label: INFO[k]!, value: val });
      }
      if (r.TA) info.push({ label: "TV", value: str(r.TA) });
    }
  }
  return { timeline, info };
}

/** periods slice: BA/BB = period 1 home/away, BC/BD = period 2, … (pairs of letters), spread over several rows. */
export function parsePeriods(rows: Row[]): MatchInsights["scores"] {
  const cell: Record<string, string> = {};
  for (const r of rows) for (const [k, v] of Object.entries(r)) if (/^B[A-Z]$/.test(k)) cell[k] = str(v);
  const out: MatchInsights["scores"] = [];
  for (let i = 0; i < 13; i++) {
    const h = cell["B" + String.fromCharCode(65 + 2 * i)], a = cell["B" + String.fromCharCode(66 + 2 * i)];
    if (h === undefined && a === undefined) break;
    out.push({ home: h ?? "", away: a ?? "" });
  }
  return out;
}

type MomentumBody = { findMatchMomentumStatsByMatchId?: { momentum?: { entries?: { timeFrame: { elapsedMinute: number }; momentumValue: number }[] } } };

export function parseMomentum(body: MomentumBody | null): MatchInsights["momentum"] {
  const entries = body?.findMatchMomentumStatsByMatchId?.momentum?.entries ?? [];
  return entries.map((e) => ({ minute: e.timeFrame.elapsedMinute + 1, value: Math.max(-1, Math.min(1, Number(e.momentumValue) || 0)) }));
}

const LOGO = "https://static.flashscore.com/res/image/data/";
const RESULT: Record<string, H2hMatch["result"]> = { w: "w", wo: "w", d: "d", l: "l", lo: "l" }; // wo/lo = won/lost after extra time or penalties

/** h2h slice: KA = tab, KB = section, rows: KC start, KJ/KK home/away ("*" marks the winner), KL score, EC/ED logo files, WIS result. */
export function parseH2h(rows: Row[], perSection = 10): MatchInsights["h2h"] {
  const tabs: MatchInsights["h2h"] = [];
  for (const r of rows) {
    if (r.KA) tabs.push({ name: str(r.KA), sections: [] });
    else if (r.KB) tabs.at(-1)?.sections.push({ title: str(r.KB), matches: [] });
    else if (r.KC) {
      const sec = tabs.at(-1)?.sections.at(-1);
      if (!sec || sec.matches.length >= perSection) continue;
      const h = str(r.KJ), a = str(r.KK);
      sec.matches.push({
        id: str(r.KP), start: new Date(Number(str(r.KC)) * 1000).toISOString(), league: str(r.KF),
        home: h.replace(/^\*/, ""), away: a.replace(/^\*/, ""),
        ...(r.EC && { homeLogo: LOGO + str(r.EC) }), ...(r.ED && { awayLogo: LOGO + str(r.ED) }),
        score: str(r.KL),
        ...(h.startsWith("*") ? { winner: "home" as const } : a.startsWith("*") ? { winner: "away" as const } : {}),
        ...(RESULT[str(r.WIS)] && { result: RESULT[str(r.WIS)] }),
      });
    }
  }
  return tabs.map((t) => ({ ...t, sections: t.sections.filter((x) => x.matches.length) })).filter((t) => t.sections.length);
}

type OddsItem = { value?: string; opening?: string; change?: { type?: string } | null };
type OddsBody = { findEventById?: { updateLiveOddsOverview?: Partial<Record<"home" | "draw" | "away", OddsItem>> | null } };

export function parseOdds(body: OddsBody | null): MatchInsights["odds"] {
  const o = body?.findEventById?.updateLiveOddsOverview;
  if (!o?.home?.value || !o.draw?.value || !o.away?.value) return undefined;
  const item = (i: OddsItem) => ({
    value: i.value!, ...(i.opening && { opening: i.opening }),
    ...(i.change?.type === "UP" ? { change: "up" as const } : i.change?.type === "DOWN" ? { change: "down" as const } : {}),
  });
  return { home: item(o.home), draw: item(o.draw), away: item(o.away) };
}

/** All slices in parallel; a missing slice just leaves its part empty. Throws only when every slice fails. */
export async function fetchInsights(id: string): Promise<MatchInsights> {
  const settled = await Promise.allSettled([
    sportsApi<Row[]>(ENDPOINTS.slice(id, "stats")),
    sportsApi<Row[]>(ENDPOINTS.slice(id, "incidents")),
    sportsApi<MomentumBody>(ENDPOINTS.slice(id, "momentum")),
    sportsApi<Row[]>(ENDPOINTS.slice(id, "h2h"), { timeoutMs: 15_000 }),
    sportsApi<OddsBody>(ENDPOINTS.slice(id, "odds")),
    sportsApi<Row[]>(ENDPOINTS.slice(id, "periods")),
  ]);
  if (settled.every((r) => r.status === "rejected")) throw (settled[0] as PromiseRejectedResult).reason;
  const [stats, incidents, momentum, h2h, oddsRes, periods] = settled;
  const ok = <T>(r: PromiseSettledResult<T>) => (r.status === "fulfilled" ? r.value : null);
  const odds = parseOdds(ok(oddsRes) as OddsBody | null);
  const rows = (v: unknown) => (Array.isArray(v) ? (v as Row[]) : []);
  return {
    periods: parseStats(rows(ok(stats))),
    scores: parsePeriods(rows(ok(periods))),
    ...parseIncidents(rows(ok(incidents))),
    momentum: parseMomentum(ok(momentum) as MomentumBody | null),
    h2h: parseH2h(rows(ok(h2h))),
    ...(odds && { odds }),
  };
}
