// Match insights for Flashscore events: raw slice codes -> clean JSON. Mapped from real samples (backend/samples/q9/).
import type { Incident, IncidentKind, MatchInsights, StatGroup } from "../types.ts";
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

type MomentumBody = { findMatchMomentumStatsByMatchId?: { momentum?: { entries?: { timeFrame: { elapsedMinute: number }; momentumValue: number }[] } } };

export function parseMomentum(body: MomentumBody | null): MatchInsights["momentum"] {
  const entries = body?.findMatchMomentumStatsByMatchId?.momentum?.entries ?? [];
  return entries.map((e) => ({ minute: e.timeFrame.elapsedMinute + 1, value: Math.max(-1, Math.min(1, Number(e.momentumValue) || 0)) }));
}

/** All three slices in parallel; a missing slice just leaves its part empty. Throws only when all three fail. */
export async function fetchInsights(id: string): Promise<MatchInsights> {
  const [stats, incidents, momentum] = await Promise.allSettled([
    sportsApi<Row[]>(ENDPOINTS.slice(id, "stats")),
    sportsApi<Row[]>(ENDPOINTS.slice(id, "incidents")),
    sportsApi<MomentumBody>(ENDPOINTS.slice(id, "momentum")),
  ]);
  if (stats.status === "rejected" && incidents.status === "rejected" && momentum.status === "rejected") throw stats.reason;
  const ok = <T>(r: PromiseSettledResult<T>) => (r.status === "fulfilled" ? r.value : null);
  const rows = (v: unknown) => (Array.isArray(v) ? (v as Row[]) : []);
  return {
    periods: parseStats(rows(ok(stats))),
    ...parseIncidents(rows(ok(incidents))),
    momentum: parseMomentum(ok(momentum)),
  };
}
