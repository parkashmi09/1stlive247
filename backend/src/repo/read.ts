// Read models: SQL rows -> API contract shapes (src/types.ts). All queries are parameterized.
import type pg from "pg";
import { pool, snapshot } from "../db/pool.ts";
import { overs, runRate } from "../live/cricket.ts";
import type { Ball, BatterRow, BowlerRow, CommentaryEntry, Match, MatchCentre, MatchStatus, NewsArticle, Sport, SportId } from "../types.ts";

type Db = Pick<pg.Pool | pg.PoolClient, "query">;

const MATCH_SQL = `
  SELECT m.*, ht.code AS h_code, ht.name AS h_name, ht.tone AS h_tone,
         at.code AS a_code, at.name AS a_name, at.tone AS a_tone
  FROM matches m
  JOIN teams ht ON ht.id = m.home_team_id
  JOIN teams at ON at.id = m.away_team_id`;

type MatchRow = Record<string, unknown> & { id: string; start_at: Date };

const opt = <T>(v: T | null) => (v ?? undefined) as T | undefined;

function toMatch(r: MatchRow): Match {
  const side = (p: "home" | "away", t: "h" | "a") => ({
    team: { code: r[`${t}_code`] as string, name: r[`${t}_name`] as string, tone: r[`${t}_tone`] as Match["home"]["team"]["tone"] },
    score: opt(r[`${p}_score`] as string | null),
    detail: opt(r[`${p}_detail`] as string | null),
    record: opt(r[`${p}_record`] as string | null),
    lost: (r[`${p}_lost`] as boolean) || undefined,
  });
  return {
    id: r.id,
    sport: r.sport_id as SportId,
    competition: r.competition as string,
    status: r.status as MatchStatus,
    clock: opt(r.clock as string | null),
    stage: opt(r.stage as string | null),
    note: opt(r.note as string | null),
    start: r.start_at.toISOString(),
    home: side("home", "h"),
    away: side("away", "a"),
  };
}

export async function listSports(db: Db = pool): Promise<Sport[]> {
  return (await db.query<Sport>("SELECT id, label, icon FROM sports ORDER BY sort_order")).rows;
}

export async function listMatches(f: { status?: MatchStatus; sport?: SportId } = {}, db: Db = pool): Promise<Match[]> {
  const r = await db.query<MatchRow>(
    `${MATCH_SQL} WHERE ($1::text IS NULL OR m.status = $1) AND ($2::text IS NULL OR m.sport_id = $2)
     ORDER BY (m.status = 'live') DESC, m.start_at`,
    [f.status ?? null, f.sport ?? null]);
  return r.rows.map(toMatch);
}

export async function getMatch(id: string, db: Db = pool): Promise<Match | undefined> {
  const r = await db.query<MatchRow>(`${MATCH_SQL} WHERE m.id = $1`, [id]);
  return r.rows[0] && toMatch(r.rows[0]);
}

type CentreRow = {
  match_id: string; headline: string; runs: number; wickets: number; legal_balls: number; max_overs: number;
  extras: number; extras_detail: string; fall_of_wickets: string; this_over: Ball[]; latest_over: string | null; latest_text: string | null;
};

/** Centre without commentary (what live `centre:update` events carry). */
export async function getCentreCore(id: string, db: Db = pool): Promise<Omit<MatchCentre, "commentary"> | undefined> {
  const c = (await db.query<CentreRow>("SELECT * FROM match_centre WHERE match_id = $1", [id])).rows[0];
  if (!c) return undefined;
  const [bat, bowl] = await Promise.all([
    db.query<{ name: string; dismissal: string; runs: number; balls: number; fours: number; sixes: number }>(
      "SELECT name, dismissal, runs, balls, fours, sixes FROM batting WHERE match_id = $1 ORDER BY pos", [id]),
    db.query<{ name: string; balls: number; maidens: number; runs: number; wickets: number }>(
      "SELECT name, balls, maidens, runs, wickets FROM bowling WHERE match_id = $1 AND balls > 0 ORDER BY pos", [id]),
  ]);
  const ballsLeft = c.max_overs * 6 - c.legal_balls;
  return {
    matchId: c.match_id,
    headline: c.headline,
    stats: [`CRR ${runRate(c.runs, c.legal_balls)}`, "Target —", `${overs(ballsLeft)} ov left`],
    thisOver: c.this_over,
    latest: { over: c.latest_over ?? "", text: c.latest_text ?? "" },
    batting: bat.rows.map((b): BatterRow => ({ name: b.name, dismissal: b.dismissal, r: b.runs, b: b.balls, fours: b.fours, sixes: b.sixes })),
    bowling: bowl.rows.map((b): BowlerRow => ({ name: b.name, o: overs(b.balls), m: b.maidens, r: b.runs, w: b.wickets })),
    extras: `${c.extras}${c.extras_detail ? ` (${c.extras_detail})` : ""}`,
    total: `${c.runs}/${c.wickets} (${overs(c.legal_balls)})`,
    fallOfWickets: c.fall_of_wickets,
  };
}

type CommentaryRow = { type: "ball" | "over"; over_label: string | null; kind: Ball["kind"] | null; title: string | null; body: string };
export const toEntry = (r: CommentaryRow): CommentaryEntry =>
  r.type === "over" ? { type: "over", title: r.title ?? "", summary: r.body } : { type: "ball", over: r.over_label ?? "", kind: r.kind ?? "dot", text: r.body };

/** Newest first. */
export async function listCommentary(id: string, limit = 50, db: Db = pool): Promise<CommentaryEntry[]> {
  const r = await db.query<CommentaryRow>(
    "SELECT type, over_label, kind, title, body FROM commentary WHERE match_id = $1 ORDER BY id DESC LIMIT $2", [id, limit]);
  return r.rows.map(toEntry);
}

export function getCentre(id: string): Promise<MatchCentre | undefined> {
  return snapshot(async (c) => {
    const core = await getCentreCore(id, c);
    return core && { ...core, commentary: await listCommentary(id, 50, c) };
  });
}

type NewsRow = { slug: string; sport_id: SportId; title: string; excerpt: string; body: string[]; quote: string | null; author: string; read_mins: number; featured: boolean; published_at: Date };
const toNews = (n: NewsRow): NewsArticle => ({
  slug: n.slug, sport: n.sport_id, title: n.title, excerpt: n.excerpt, body: n.body, quote: n.quote ?? undefined,
  author: n.author, readMins: n.read_mins, featured: n.featured || undefined, publishedAt: n.published_at.toISOString(),
});

export async function listNews(f: { sport?: SportId; limit?: number } = {}, db: Db = pool): Promise<NewsArticle[]> {
  const r = await db.query<NewsRow>(
    "SELECT * FROM news WHERE ($1::text IS NULL OR sport_id = $1) ORDER BY featured DESC, published_at DESC LIMIT $2",
    [f.sport ?? null, f.limit ?? 30]);
  return r.rows.map(toNews);
}

export async function getNews(slug: string, db: Db = pool): Promise<NewsArticle | undefined> {
  const r = await db.query<NewsRow>("SELECT * FROM news WHERE slug = $1", [slug]);
  return r.rows[0] && toNews(r.rows[0]);
}
