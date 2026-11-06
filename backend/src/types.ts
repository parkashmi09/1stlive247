// API contract. Keep in sync with web/src/data/types.ts.
// shortcut: duplicated across web/ and backend/; move to a shared workspace package once a third consumer appears.

export type SportId = "cricket" | "football" | "tennis" | "kabaddi" | "basketball" | "racing" | "f1";
export type Tone = "navy" | "gold" | "red" | "green" | "sky";
export type MatchStatus = "live" | "upcoming" | "finished";

export type Sport = { id: SportId; label: string; icon: string };
export type Team = { code: string; name: string; tone: Tone; logo?: string };
export type Side = { team: Team; score?: string; detail?: string; record?: string; lost?: boolean };

/** Match clock anchor from the feed; the browser ticks it (mode "clock") or shows the label. */
export type Timer = {
  mode: "clock" | "minute" | "none";
  running: boolean;
  anchorTs: number | null;
  baseS: number;
  periodLenS: number | null;
  serverTs: number;
  display: string;
  minuteLabel: string;
};

/** A Home banner slide: a notable upcoming fixture. */
export type Featured = { matchId: string; sport: SportId; league: string; home: string; away: string; homeCode: string; awayCode: string; start: string };

export type StatGroup = { title: string; stats: { name: string; home: string; away: string }[] };

/** Football/basketball match insights from the Flashscore slices (stats, incidents, momentum). */
export type IncidentKind = "goal" | "penalty" | "penalty-missed" | "own-goal" | "yellow" | "red" | "sub" | "other";
export type Incident =
  | { type: "period"; name: string; score?: string }
  | { type: "event"; side: "home" | "away"; minute: string; kind: IncidentKind; player: string; assist?: string; playerOut?: string; note?: string; score?: string };
export type MatchInsights = {
  /** "Match", "1st Half", "2nd Half" */
  periods: { name: string; groups: StatGroup[] }[];
  timeline: Incident[];
  /** one point per minute, value -1..1: positive = home pressure */
  momentum: { minute: number; value: number }[];
  info: { label: string; value: string }[];
};

export type Match = {
  id: string;
  sport: SportId;
  competition: string;
  status: MatchStatus;
  clock?: string;
  start: string;
  home: Side;
  away: Side;
  note?: string;
  stage?: string;
  timer?: Timer;
};

export type BallKind = "dot" | "run" | "four" | "six" | "wicket" | "extra";
export type Ball = { value: string; kind: BallKind };

export type CommentaryEntry =
  | { type: "ball"; over: string; kind: BallKind; text: string }
  | { type: "over"; title: string; summary: string };

export type BatterRow = { name: string; dismissal: string; r: number; b: number; fours: number; sixes: number };
export type BowlerRow = { name: string; o: string; m: number; r: number; w: number };

/** One innings of a full scorecard. */
export type InningsCard = {
  team: string;
  short: string;
  total: string;
  runRate?: string;
  batting: BatterRow[];
  bowling: BowlerRow[];
  extras: string;
  fallOfWickets: string[];
};

export type Crease = {
  batters: { name: string; r: number; b: number; fours: number; sixes: number; onStrike: boolean }[];
  bowler?: BowlerRow;
};

export type MatchCentre = {
  matchId: string;
  headline: string;
  stats: string[];
  thisOver: Ball[];
  latest: { over: string; text: string };
  commentary: CommentaryEntry[];
  batting: BatterRow[];
  bowling: BowlerRow[];
  extras: string;
  total: string;
  fallOfWickets: string;
  /** every innings (live feed); the demo centre only has the flat fields above */
  innings?: InningsCard[];
  /** ready-made status line, e.g. "Day 2: Stumps - Sri Lanka lead by 193 runs" */
  status?: string;
  crease?: Crease;
};

export type NewsArticle = {
  slug: string;
  sport: SportId;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  readMins: number;
  body: string[];
  quote?: string;
  featured?: boolean;
};

/** Socket.IO event contract (server → client and client → server). */
export interface ServerToClient {
  "match:update": (m: Match) => void;
  "centre:update": (c: Omit<MatchCentre, "commentary">) => void;
  "commentary:new": (e: { matchId: string; entries: CommentaryEntry[] }) => void;
}
export interface ClientToServer {
  "match:subscribe": (p: { id: string }, ack?: (r: { ok: boolean; error?: string }) => void) => void;
  "match:unsubscribe": (p: { id: string }) => void;
  "live:subscribe": (ack?: (r: { ok: boolean }) => void) => void;
}
