// Cricket-only feed from the in-house Cricbuzz API (CRICBUZZ_API_KEY). Same pattern as the Flashscore feed:
// bootstrap /live/cricket, keep fresh from /stream, fetch heavy parts (scorecard, commentary) only for watched matches.
import { config } from "../config.ts";
import { logger } from "../logger.ts";
import type { Ball, BallKind, CommentaryEntry, InningsCard, Match, MatchCentre, Side, Tone } from "../types.ts";

export const CB_PREFIX = "cb-";
export const isCricbuzzId = (id: string) => id.startsWith(CB_PREFIX);
const rawId = (id: string) => id.slice(CB_PREFIX.length);

// ---------- raw shapes (from samples/cb) ----------
type Innings = { innings: number; team: string; runs: number; wkts: number; overs: number; declared?: boolean };
type Player = { name: string; runs: number; balls: number; fours: number; sixes: number; strikeRate: string };
type Bowler = { name: string; overs: number; maidens: number; runs: number; wickets: number; economy: number };
export type CbScoreboard = {
  match_id: number; series: string; match_desc: string; format: string; state: string; status: string; complete: boolean;
  start_ts: number; team1: string; team1_short: string; team2: string; team2_short: string;
  innings: Innings[]; bat_score?: number; bat_wkts?: number; overs?: number; target?: number | null; crr?: number; rrr?: number;
  striker?: Player | null; non_striker?: Player | null; bowler?: Bowler | null; partnership?: { runs: number; balls: number } | null;
  recent_overs?: string; latest_ball?: { text: string; over: number | null } | null;
};
export type CbBall = {
  ts: number; innings: number | null; over: number | null; text: string; events?: string[]; team?: string; ball?: number | null; src?: string;
  over_summary?: { score: number; wickets: number; overNum: number; runs: number; o_summary: string; batStrikerNames?: string[]; bowlNames?: string[] } | null;
};
type CbScorecard = {
  scoreCard: {
    inningsId: number;
    batTeamDetails: { batTeamName: string; batTeamShortName: string; batsmenData: Record<string, { batName: string; runs: number; balls: number; fours: number; sixes: number; outDesc: string; isCaptain?: boolean; isKeeper?: boolean }> };
    bowlTeamDetails: { bowlersData: Record<string, { bowlName: string; overs: number; maidens: number; runs: number; wickets: number; economy: number }> };
    scoreDetails: { runs: number; wickets: number; overs: number; isDeclared?: boolean; runRate?: number };
    extrasData: { total: number; byes: number; legByes: number; wides: number; noBalls: number; penalty: number };
    wicketsData?: Record<string, { batName: string; wktOver: number; wktRuns: number; wktNbr: number }>;
  }[];
};

// ---------- mapping (pure, unit-tested) ----------
const TONES: Tone[] = ["navy", "gold", "red", "green", "sky"];
const toneOf = (s: string) => TONES[[...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % TONES.length]!;
export const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const fmtOvers = (o: number) => String(Math.round(o * 10) / 10);

/** "223/7d & 121/6" for one team across its innings. */
export function teamScore(innings: Innings[], short: string): string | undefined {
  const mine = innings.filter((i) => i.team === short);
  if (!mine.length) return undefined;
  return mine.map((i) => `${i.runs}${i.wkts >= 10 ? "" : `/${i.wkts}`}${i.declared ? "d" : ""}`).join(" & ");
}

export function cbToMatch(sb: CbScoreboard, logoOf: (name: string) => string | undefined = () => undefined): Match {
  const status = sb.complete ? "finished" : sb.innings.length || sb.state === "In Progress" ? "live" : "upcoming";
  const cur = sb.innings.at(-1);
  const side = (name: string, short: string): Side => {
    const score = teamScore(sb.innings, short);
    const logo = logoOf(name);
    return {
      team: { code: short, name, tone: toneOf(name), ...(logo && { logo }) },
      ...(score && { score }),
      ...(cur?.team === short && status === "live" && { detail: `(${fmtOvers(cur.overs)})` }),
    };
  };
  const breakState = /stumps|lunch|tea|break|rain|delay|drinks/i.test(sb.state) ? sb.state : undefined;
  return {
    id: CB_PREFIX + sb.match_id,
    sport: "cricket",
    competition: `${sb.match_desc} · ${sb.series}`,
    status,
    start: new Date(sb.start_ts).toISOString(),
    home: side(sb.team1, sb.team1_short),
    away: side(sb.team2, sb.team2_short),
    clock: breakState ?? sb.format,
    ...(sb.status && { note: sb.status }),
    ...(status === "finished" && { stage: "Result" }),
  };
}

export function ballKind(b: CbBall): BallKind {
  const ev = (b.events ?? []).map((e) => e.toUpperCase());
  if (ev.includes("WICKET")) return "wicket";
  if (ev.includes("SIX")) return "six";
  if (ev.includes("FOUR")) return "four";
  // Cricbuzz text is "Bowler to Batter, <result>, <description>": judge only the result part,
  // so "no run, full and well wide of off stump" is a dot ball, not a wide.
  const t = stripHtml(b.text).toLowerCase();
  const result = (t.includes(" to ") ? t.split(",").slice(1, 3).join(",") : t).trim();
  if (/^no run/.test(result)) return "dot";
  if (/^(wides?|no ball|leg byes?|byes?)\b/.test(result)) return "extra";
  return /\b\d+ runs?\b|\b(1|one) run\b/.test(result) ? "run" : "dot";
}

/** Newest-first ball-by-ball list: drops non-ball notes and duplicate "comm" copies of balls the full feed has. */
export function toCommentary(balls: CbBall[], limit = 80): CommentaryEntry[] {
  const key = (b: CbBall) => `${b.innings}:${b.over}`;
  const fullKeys = new Set(balls.filter((b) => b.over != null && b.src === "full").map(key));
  const seen = new Set<string>();
  const out: CommentaryEntry[] = [];
  for (const b of [...balls].sort((a, z) => z.ts - a.ts)) {
    if (b.over == null || (b.src === "comm" && fullKeys.has(key(b))) || seen.has(key(b))) continue;
    seen.add(key(b));
    const s = b.over_summary;
    if (s) out.push({
      type: "over",
      title: `End of over ${Math.ceil(s.overNum)} · ${s.runs} run${s.runs === 1 ? "" : "s"}`,
      summary: [`${b.team ?? ""} ${s.score}/${s.wickets}`.trim(), ...(s.batStrikerNames ?? []), ...(s.bowlNames ?? [])].join(" · "),
    });
    out.push({ type: "ball", over: fmtOvers(b.over), kind: ballKind(b), text: stripHtml(b.text) });
    if (out.length >= limit) break;
  }
  return out;
}

type CbComm = {
  matchCommentary?: Record<string, {
    commType: string; inningsId: number; timestamp: number; commText?: string; ballMetric?: number | null; event?: string[]; teamName?: string;
    overSeparator?: { overNumber: number; overSummary: string; overRuns: number; batTeamObj?: { teamName: string; teamScore: string };
      batStrikerObj?: { playerName: string; playerScore: string }; batNonStrikerObj?: { playerName: string; playerScore: string }; bowlerObj?: { playerName: string; playerScore: string } } | null;
  }>;
};

/** Latest-overs slice -> the same ball shape as full_commentary (over separators become the ball's over_summary). */
export function commToBalls(c: CbComm): CbBall[] {
  const entries = Object.values(c.matchCommentary ?? {});
  const balls: CbBall[] = entries.filter((e) => e.commType === "commentary" && e.ballMetric != null).map((e) => ({
    ts: e.timestamp, innings: e.inningsId, over: e.ballMetric!, text: e.commText ?? "", events: e.event ?? [], team: e.teamName, src: "full",
  }));
  for (const e of entries) {
    const o = e.overSeparator;
    if (e.commType !== "over-separator" || !o) continue;
    const last = balls.find((b) => b.innings === e.inningsId && Math.abs((b.over ?? 0) - (o.overNumber - 0.4)) < 0.05);
    if (!last) continue;
    const [score, wickets] = (o.batTeamObj?.teamScore ?? "0-0").split("-").map(Number);
    last.over_summary = {
      score: score ?? 0, wickets: wickets ?? 0, overNum: last.over!, runs: o.overRuns, o_summary: o.overSummary,
      batStrikerNames: [o.batStrikerObj, o.batNonStrikerObj].filter((x) => x).map((x) => `${x!.playerName} ${x!.playerScore}`),
      bowlNames: o.bowlerObj ? [`${o.bowlerObj.playerName} ${o.bowlerObj.playerScore}`] : [],
    };
  }
  return balls;
}

/** Merge newer balls over older ones (same innings + over = same ball; newest wins). */
export function mergeBalls(older: CbBall[], newer: CbBall[]): CbBall[] {
  const key = (b: CbBall) => `${b.innings}:${b.over}:${b.src === "comm" ? "c" : "f"}`;
  const map = new Map(older.map((b) => [key(b), b]));
  for (const b of newer) map.set(key(b), b);
  return [...map.values()];
}

/** "1 0 W 4 0 2" -> balls of the latest over. */
export function recentBalls(summary: string): Ball[] {
  return summary.trim().split(/\s+/).filter(Boolean).slice(-6).map((v) => ({
    value: v,
    kind: v === "W" ? "wicket" : v === "6" ? "six" : v === "4" ? "four" : v === "0" ? "dot" : /wd|nb|lb|b/i.test(v) ? "extra" : "run",
  }));
}

export function toInnings(sc: CbScorecard): InningsCard[] {
  return sc.scoreCard.map((inn) => {
    const d = inn.scoreDetails, x = inn.extrasData;
    return {
      team: inn.batTeamDetails.batTeamName,
      short: inn.batTeamDetails.batTeamShortName,
      total: `${d.runs}${d.wickets >= 10 ? "" : `/${d.wickets}`}${d.isDeclared ? "d" : ""} (${fmtOvers(d.overs)} ov)`,
      runRate: d.runRate != null ? d.runRate.toFixed(2) : undefined,
      batting: Object.values(inn.batTeamDetails.batsmenData).filter((b) => b.balls > 0 || b.outDesc).map((b) => ({
        name: b.batName + (b.isCaptain ? " (c)" : "") + (b.isKeeper ? " (wk)" : ""),
        dismissal: !b.outDesc || /^batting$/i.test(b.outDesc) ? "not out" : b.outDesc, r: b.runs, b: b.balls, fours: b.fours, sixes: b.sixes,
      })),
      bowling: Object.values(inn.bowlTeamDetails.bowlersData).map((b) => ({ name: b.bowlName, o: fmtOvers(b.overs), m: b.maidens, r: b.runs, w: b.wickets })),
      extras: `${x.total} (b ${x.byes}, lb ${x.legByes}, w ${x.wides}, nb ${x.noBalls}${x.penalty ? `, p ${x.penalty}` : ""})`,
      fallOfWickets: Object.values(inn.wicketsData ?? {}).sort((a, z) => a.wktNbr - z.wktNbr).map((w) => `${w.wktNbr}-${w.wktRuns} (${w.batName}, ${fmtOvers(w.wktOver)})`),
    };
  });
}

const BALL_VALUE: Record<BallKind, (text: string) => string> = {
  dot: () => "0", four: () => "4", six: () => "6", wicket: () => "W", extra: () => "wd",
  run: (t) => /\b(\d) runs?\b/.exec(t)?.[1] ?? "1",
};
/** Balls of the most recent over, oldest first (fallback when the scoreboard has no recent_overs). */
function lastOverBalls(commentary: CommentaryEntry[]): Ball[] {
  const balls = commentary.filter((c): c is Extract<CommentaryEntry, { type: "ball" }> => c.type === "ball");
  const over = balls[0]?.over.split(".")[0];
  return balls.filter((b) => b.over.split(".")[0] === over).slice(0, 6).reverse().map((b) => ({ value: BALL_VALUE[b.kind](b.text), kind: b.kind }));
}

export function toCentre(sb: CbScoreboard, innings: InningsCard[], commentary: CommentaryEntry[]): MatchCentre {
  const last = innings.at(-1);
  const lastOver = commentary.find((c): c is Extract<CommentaryEntry, { type: "ball" }> => c.type === "ball");
  const summary = sb.recent_overs?.split("|").at(-1) ?? "";
  const thisOver = summary.trim() ? recentBalls(summary) : lastOverBalls(commentary);
  const crease = [sb.striker, sb.non_striker].filter((p): p is Player => !!p?.name);
  return {
    matchId: CB_PREFIX + sb.match_id,
    headline: `${sb.match_desc} · ${sb.series}`,
    stats: [
      sb.crr != null ? `CRR ${sb.crr.toFixed(2)}` : undefined,
      sb.target ? `Target ${sb.target}` : sb.format,
      sb.rrr ? `RRR ${sb.rrr.toFixed(2)}` : sb.partnership ? `P'ship ${sb.partnership.runs}(${sb.partnership.balls})` : undefined,
    ].filter((s): s is string => !!s),
    thisOver,
    latest: { over: lastOver?.over ?? "", text: lastOver?.text ?? stripHtml(sb.latest_ball?.text ?? sb.status) },
    commentary,
    batting: last?.batting ?? [],
    bowling: last?.bowling ?? [],
    extras: last?.extras ?? "",
    total: last?.total ?? "",
    fallOfWickets: last?.fallOfWickets.join(", ") ?? "",
    innings,
    status: sb.status,
    crease: {
      batters: crease.map((p, i) => ({ name: p.name, r: p.runs, b: p.balls, fours: p.fours, sixes: p.sixes, onStrike: i === 0 })),
      ...(sb.bowler?.name && { bowler: { name: sb.bowler.name, o: fmtOvers(sb.bowler.overs), m: sb.bowler.maidens, r: sb.bowler.runs, w: sb.bowler.wickets } }),
    },
  };
}

// ---------- client + live store ----------
async function cb<T>(path: string): Promise<T> {
  const r = await fetch(config.CRICBUZZ_BASE_URL.replace(/\/$/, "") + path, {
    headers: { "X-API-Key": config.CRICBUZZ_API_KEY!, accept: "application/json" }, signal: AbortSignal.timeout(10_000),
  });
  const body = (await r.json().catch(() => null)) as T & { ok?: boolean; error?: string };
  if (!r.ok || body?.ok === false) throw Object.assign(new Error(`Cricbuzz ${r.status} on ${path}: ${body?.error ?? r.statusText}`), { status: r.status });
  return body;
}

export function createCricketFeed(opts: {
  onMatch: (m: Match) => void;
  onCentre: (id: string, c: MatchCentre, fresh: CommentaryEntry[]) => void;
  isWatched: (id: string) => boolean;
  /** team logo by name (from the Flashscore logo index); Cricbuzz itself has none */
  logoOf?: (name: string) => string | undefined;
}) {
  const toMatch = (sb: CbScoreboard) => cbToMatch(sb, opts.logoOf);
  const boards = new Map<string, CbScoreboard>();
  // per-match cache of the heavy parts, refreshed while someone is watching
  const parts = new Map<string, { innings: InningsCard[]; inningsAt: number; balls: CbBall[] }>();
  let abort: AbortController | undefined;
  let timer: NodeJS.Timeout | undefined;

  async function loadParts(id: string, force = false) {
    const p = parts.get(id);
    const raw = rawId(id);
    const needCard = force || !p || Date.now() - p.inningsAt > 20_000; // docs: scorecard every ~15-30 s
    const card = needCard ? await cb<CbScorecard>(`/event/${raw}/slice/scorecard`).then(toInnings).catch(() => p?.innings ?? []) : p!.innings;
    // whole match once, then only the latest overs (small) merged on top
    const balls = p
      ? mergeBalls(p.balls, await cb<CbComm>(`/event/${raw}/slice/comm`).then(commToBalls).catch(() => []))
      : await cb<{ innings: Record<string, CbBall[]> }>(`/event/${raw}/slice/full_commentary`).then((f) => Object.values(f.innings).flat()).catch(() => []);
    const next = { innings: card, inningsAt: needCard ? Date.now() : p!.inningsAt, balls };
    parts.set(id, next);
    return next;
  }

  async function centre(id: string): Promise<MatchCentre | undefined> {
    const sb = boards.get(id) ?? (await cb<CbScoreboard>(`/event/${rawId(id)}/scoreboard`).catch(() => undefined));
    if (!sb) return undefined;
    const p = parts.get(id) ?? (await loadParts(id, true));
    return toCentre(sb, p.innings, toCommentary(p.balls));
  }

  async function onScoreboard(sb: CbScoreboard) {
    const id = CB_PREFIX + sb.match_id;
    boards.set(id, sb);
    opts.onMatch(toMatch(sb));
    if (!opts.isWatched(id)) return;
    const before = new Set(toCommentary(parts.get(id)?.balls ?? []).map((c) => JSON.stringify(c)));
    const p = await loadParts(id);
    const all = toCommentary(p.balls);
    opts.onCentre(id, toCentre(sb, p.innings, all), all.filter((c) => !before.has(JSON.stringify(c))));
  }

  async function stream() {
    while (abort && !abort.signal.aborted) {
      try {
        const r = await fetch(`${config.CRICBUZZ_BASE_URL.replace(/\/$/, "")}/stream?sport=cricket&include_scoreboard=1`, {
          headers: { "X-API-Key": config.CRICBUZZ_API_KEY!, accept: "text/event-stream" }, signal: abort.signal,
        });
        if (!r.ok || !r.body) throw new Error(`stream ${r.status}`);
        logger.info("cricbuzz stream connected");
        let buf = "";
        const dec = new TextDecoder();
        for await (const chunk of r.body) {
          buf += dec.decode(chunk, { stream: true });
          let i;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const block = buf.slice(0, i); buf = buf.slice(i + 2);
            const data = /^event: update$/m.test(block) ? /^data: (.+)$/m.exec(block)?.[1] : undefined;
            const sb = data ? (JSON.parse(data) as { scoreboard?: CbScoreboard }).scoreboard : undefined;
            if (sb) void onScoreboard(sb).catch((err) => logger.warn({ err: String(err) }, "cricbuzz update failed"));
          }
        }
        throw new Error("stream ended");
      } catch (err) {
        if (abort?.signal.aborted) return;
        logger.warn({ err: String(err) }, "cricbuzz stream dropped; reconnecting in 3s");
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  async function refreshList() {
    const live = await cb<{ events: { scoreboard: CbScoreboard }[] }>("/live/cricket");
    for (const e of live.events) boards.set(CB_PREFIX + e.scoreboard.match_id, e.scoreboard);
    return live.events.length;
  }

  return {
    async start() {
      abort = new AbortController();
      try { logger.info({ matches: await refreshList() }, "cricbuzz bootstrapped"); }
      catch (err) { logger.warn({ err: String(err) }, "cricbuzz bootstrap failed"); }
      void stream();
      timer = setInterval(() => { void refreshList().catch(() => {}); }, 5 * 60_000);
    },
    stop() { abort?.abort(); clearInterval(timer); },
    list: () => [...boards.values()].map(toMatch),
    get: (id: string) => { const sb = boards.get(id); return sb && toMatch(sb); },
    centre,
  };
}
export type CricketFeed = ReturnType<typeof createCricketFeed>;
