// Pure cricket scoring rules. No I/O — the engine persists what these return.
import type { Ball, BallKind } from "../types.ts";

export type Outcome = { kind: BallKind; runs: number };

export type Innings = {
  runs: number;
  wickets: number;
  legalBalls: number;
  strikerPos: number;
  nonStrikerPos: number;
  bowlerPos: number;
  extras: number;
  recent: Ball[]; // last 6 deliveries, oldest first
};

/** Cricket notation: 104 legal balls -> "17.2". */
export const overs = (legalBalls: number) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

/** Label of the n-th legal delivery (1-based): 1 -> "0.1", 6 -> "0.6", 7 -> "1.1". */
export const ballLabel = (n: number) => `${Math.floor((n - 1) / 6)}.${((n - 1) % 6) + 1}`;

export const runRate = (runs: number, legalBalls: number) => (legalBalls ? (runs / (legalBalls / 6)).toFixed(2) : "0.00");

export type BallResult = {
  next: Innings;
  /** label of this delivery, e.g. "17.3"; wides keep the same ball number */
  label: string;
  legal: boolean;
  /** batter who faced it (before any strike change) */
  facedPos: number;
  overComplete: boolean;
};

export function applyBall(s: Innings, o: Outcome): BallResult {
  const legal = o.kind !== "extra";
  const legalBalls = s.legalBalls + (legal ? 1 : 0);
  // a wide carries the number of the ball that will be re-bowled
  const label = ballLabel(s.legalBalls + 1);
  const overComplete = legal && legalBalls % 6 === 0;

  let striker = s.strikerPos, non = s.nonStrikerPos;
  // odd runs (incl. a run off a wide) swap ends
  if (o.kind !== "wicket" && o.runs % 2 === 1) [striker, non] = [non, striker];
  // end of over swaps ends again
  if (overComplete) [striker, non] = [non, striker];

  const value = o.kind === "wicket" ? "W" : o.kind === "extra" ? "wd" : String(o.runs);
  return {
    label,
    legal,
    facedPos: s.strikerPos,
    overComplete,
    next: {
      ...s,
      runs: s.runs + o.runs,
      wickets: s.wickets + (o.kind === "wicket" ? 1 : 0),
      legalBalls,
      strikerPos: striker,
      nonStrikerPos: non,
      extras: s.extras + (o.kind === "extra" ? o.runs : 0),
      recent: [...s.recent, { value, kind: o.kind }].slice(-6),
    },
  };
}

/** Commentary line for an outcome. Event words lead so the UI can bold them. */
export function describe(o: Outcome, batter: string, bowler: string): string {
  const lines: Record<BallKind, string[]> = {
    dot: [`${bowler} to ${batter}, good length, defended.`, `Beaten outside off! ${bowler} finds the edge-free zone.`],
    run: [`${batter} works it into the gap for ${o.runs === 1 ? "a single" : o.runs === 2 ? "two" : `${o.runs} runs`}.`, `Pushed to cover, ${batter} takes ${o.runs}.`],
    four: [`FOUR! ${batter} drives through extra cover, races away.`, `FOUR! Short from ${bowler}, pulled hard to the fence.`],
    six: [`SIX! ${batter} steps out and lofts ${bowler} over long-on.`, `SIX! Picked up off the pads, deep into the stands.`],
    wicket: [`OUT! ${batter} edges ${bowler} and is caught at slip.`, `OUT! ${bowler} hits the top of off. ${batter} has to go.`],
    extra: [`Wide. ${bowler} strays down the leg side.`],
  };
  const pool = lines[o.kind];
  return pool[(o.runs + batter.length) % pool.length]!;
}
