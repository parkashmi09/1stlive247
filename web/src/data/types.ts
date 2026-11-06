import type { IconName } from "@/components/icons/Icon";

export type SportId = "cricket" | "football" | "tennis" | "kabaddi" | "basketball" | "racing" | "f1";
export type Tone = "navy" | "gold" | "red" | "green" | "sky";
export type MatchStatus = "live" | "upcoming" | "finished";

export type Sport = { id: SportId; label: string; icon: IconName };

export type Team = { code: string; name: string; tone: Tone; logo?: string };

export type Side = {
  team: Team;
  /** "186/4", "2", "6 4 4" … */
  score?: string;
  /** "(17.2)", "50 ov", "30" (game points) */
  detail?: string;
  /** win-loss record, e.g. "3-12" */
  record?: string;
  lost?: boolean;
};

/** Match clock anchor from the feed; ticked in the browser (mode "clock") or shown as a label. */
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

/** A Home banner slide: a notable upcoming fixture (from /api/v1/featured). */
export type Featured = { matchId: string; sport: SportId; league: string; home: string; away: string; homeCode: string; awayCode: string; start: string };

export type StatGroup = { title: string; stats: { name: string; home: string; away: string }[] };

/** Football match insights (mirrors backend/src/types.ts). */
export type IncidentKind = "goal" | "penalty" | "penalty-missed" | "own-goal" | "yellow" | "red" | "sub" | "other";
export type Incident =
  | { type: "period"; name: string; score?: string }
  | { type: "event"; side: "home" | "away"; minute: string; kind: IncidentKind; player: string; assist?: string; playerOut?: string; note?: string; score?: string };
export type MatchInsights = {
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
  /** "73'", "Set 3", "2nd Half · 12:36" */
  clock?: string;
  /** ISO start time */
  start: string;
  home: Side;
  away: Side;
  /** one-line context under the teams: "CRR 10.73 · Target —" */
  note?: string;
  /** label above the flags on result cards: "Final" */
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
  innings?: InningsCard[];
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
