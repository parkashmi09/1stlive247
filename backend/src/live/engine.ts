// Applies live events: persist in one transaction (row-locked), then broadcast to subscribed rooms.
import type pg from "pg";
import { tx } from "../db/pool.ts";
import { logger } from "../logger.ts";
import { LIVE_ROOM, matchRoom, type Io } from "../realtime/io.ts";
import { getCentreCore, getMatch } from "../repo/read.ts";
import type { CommentaryEntry } from "../types.ts";
import { applyBall, describe, overs, runRate, type Outcome } from "./cricket.ts";
import type { LiveEvent } from "./provider.ts";

type Lock = {
  runs: number; wickets: number; legal_balls: number; max_overs: number; striker_pos: number; non_striker_pos: number;
  bowler_pos: number; extras: number; this_over: { value: string; kind: Outcome["kind"] }[]; fall_of_wickets: string;
};

const name = async (c: pg.PoolClient, table: "batting" | "bowling", id: string, pos: number) =>
  (await c.query<{ name: string }>(`SELECT name FROM ${table} WHERE match_id = $1 AND pos = $2`, [id, pos])).rows[0]?.name ?? "Batter";

/** Returns the new commentary entries (oldest first), or null if the innings is over. */
async function cricketBall(c: pg.PoolClient, id: string, o: Outcome): Promise<CommentaryEntry[] | null> {
  const s = (await c.query<Lock>("SELECT * FROM match_centre WHERE match_id = $1 FOR UPDATE", [id])).rows[0];
  if (!s || s.wickets >= 10 || s.legal_balls >= s.max_overs * 6) return null;

  const r = applyBall({
    runs: s.runs, wickets: s.wickets, legalBalls: s.legal_balls, strikerPos: s.striker_pos, nonStrikerPos: s.non_striker_pos,
    bowlerPos: s.bowler_pos, extras: s.extras, recent: s.this_over,
  }, o);
  const n = r.next;
  const batter = await name(c, "batting", id, r.facedPos);
  const bowler = await name(c, "bowling", id, s.bowler_pos);
  const text = describe(o, batter, bowler);
  const out: CommentaryEntry[] = [{ type: "ball", over: r.label, kind: o.kind, text }];

  // batter + bowler figures
  if (r.legal) {
    await c.query(
      `UPDATE batting SET runs = runs + $3, balls = balls + 1, fours = fours + $4, sixes = sixes + $5,
         dismissal = CASE WHEN $6 THEN $7 ELSE dismissal END
       WHERE match_id = $1 AND pos = $2`,
      [id, r.facedPos, o.kind === "wicket" ? 0 : o.runs, o.kind === "four" ? 1 : 0, o.kind === "six" ? 1 : 0, o.kind === "wicket", `b ${bowler.split(" ").at(-1)}`]);
  }
  await c.query("UPDATE bowling SET balls = balls + $3, runs = runs + $4, wickets = wickets + $5 WHERE match_id = $1 AND pos = $2",
    [id, s.bowler_pos, r.legal ? 1 : 0, o.runs, o.kind === "wicket" ? 1 : 0]);

  let fow = s.fall_of_wickets;
  if (o.kind === "wicket") {
    fow = [fow, `${n.wickets}-${n.runs}`].filter(Boolean).join(", ");
    if (n.wickets < 10) { // next batter walks in on strike
      const pos = (await c.query<{ next: number }>("SELECT COALESCE(MAX(pos), 0) + 1 AS next FROM batting WHERE match_id = $1", [id])).rows[0]!.next;
      await c.query("INSERT INTO batting (match_id, pos, name) VALUES ($1, $2, $3)", [id, pos, `Batter ${pos}`]);
      if (n.strikerPos === r.facedPos) n.strikerPos = pos; else n.nonStrikerPos = pos;
    }
  }

  if (r.overComplete) {
    // next bowler: the next position that did not bowl this over
    const bowlers = (await c.query<{ pos: number }>("SELECT pos FROM bowling WHERE match_id = $1 ORDER BY pos", [id])).rows.map((b) => b.pos);
    n.bowlerPos = bowlers[(bowlers.indexOf(s.bowler_pos) + 1) % bowlers.length] ?? s.bowler_pos;
    const overRuns = n.recent.reduce((t, b) => t + (Number(b.value) || (b.value === "wd" ? 1 : 0)), 0);
    out.push({ type: "over", title: `End of over ${n.legalBalls / 6} · ${overRuns} runs`, summary: `IND ${n.runs}/${n.wickets} · CRR ${runRate(n.runs, n.legalBalls)}` });
  }

  await c.query(
    `UPDATE match_centre SET runs = $2, wickets = $3, legal_balls = $4, striker_pos = $5, non_striker_pos = $6, bowler_pos = $7,
       extras = $8, fall_of_wickets = $9, this_over = $10, latest_over = $11, latest_text = $12, updated_at = now()
     WHERE match_id = $1`,
    [id, n.runs, n.wickets, n.legalBalls, n.strikerPos, n.nonStrikerPos, n.bowlerPos, n.extras, fow, JSON.stringify(n.recent), r.label, text]);
  await c.query(
    `UPDATE matches SET home_score = $2, home_detail = $3, note = $4, updated_at = now() WHERE id = $1`,
    [id, `${n.runs}/${n.wickets}`, `(${overs(n.legalBalls)})`, `CRR ${runRate(n.runs, n.legalBalls)} · Target —`]);
  for (const e of out)
    await c.query("INSERT INTO commentary (match_id, type, over_label, kind, title, body) VALUES ($1,$2,$3,$4,$5,$6)",
      e.type === "ball" ? [id, "ball", e.over, e.kind, null, e.text] : [id, "over", null, null, e.title, e.summary]);
  return out;
}

export function createEngine(io: Io) {
  // Events apply and broadcast strictly in arrival order; overlapping commits could otherwise emit out of order.
  let queue: Promise<void> = Promise.resolve();
  return function handle(e: LiveEvent): Promise<void> {
    const run = queue.then(() => apply(e));
    queue = run.catch(() => {}); // a failed event must not stall the ones behind it
    return run;
  };

  async function apply(e: LiveEvent): Promise<void> {
    let entries: CommentaryEntry[] | null = null;
    if (e.type === "cricket:ball") {
      entries = await tx((c) => cricketBall(c, e.matchId, e.outcome));
      if (!entries) return;
    } else {
      const p = e.patch;
      const r = await tx((c) => c.query(
        `UPDATE matches SET clock = COALESCE($2, clock), note = COALESCE($3, note),
           home_score = COALESCE($4, home_score), away_score = COALESCE($5, away_score), updated_at = now()
         WHERE id = $1`, [e.matchId, p.clock ?? null, p.note ?? null, p.homeScore ?? null, p.awayScore ?? null]));
      if (!r.rowCount) return;
    }

    // broadcast after commit so clients never see uncommitted state
    const match = await getMatch(e.matchId);
    if (!match) return;
    io.to([LIVE_ROOM, matchRoom(e.matchId)]).emit("match:update", match);
    if (entries) {
      const core = await getCentreCore(e.matchId);
      if (core) io.to(matchRoom(e.matchId)).emit("centre:update", core);
      io.to(matchRoom(e.matchId)).emit("commentary:new", { matchId: e.matchId, entries: [...entries].reverse() });
    }
    logger.debug({ type: e.type, matchId: e.matchId }, "live event applied");
  }
}
