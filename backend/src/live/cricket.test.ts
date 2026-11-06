import { test } from "node:test";
import assert from "node:assert/strict";
import { applyBall, ballLabel, overs, runRate, type Innings } from "./cricket.ts";

const base: Innings = { runs: 186, wickets: 4, legalBalls: 104, strikerPos: 4, nonStrikerPos: 6, bowlerPos: 3, extras: 9, recent: [] };

test("overs notation", () => {
  assert.equal(overs(104), "17.2");
  assert.equal(overs(108), "18.0");
  assert.equal(runRate(186, 104), "10.73");
  assert.deepEqual([1, 6, 7, 105].map(ballLabel), ["0.1", "0.6", "1.1", "17.3"]);
});

test("single rotates strike and labels the delivery", () => {
  const r = applyBall(base, { kind: "run", runs: 1 });
  assert.equal(r.label, "17.3");
  assert.equal(r.next.runs, 187);
  assert.deepEqual([r.next.strikerPos, r.next.nonStrikerPos], [6, 4]);
  assert.equal(r.facedPos, 4);
});

test("wide adds an extra but no legal ball", () => {
  const r = applyBall(base, { kind: "extra", runs: 1 });
  assert.equal(r.legal, false);
  assert.equal(r.next.legalBalls, 104);
  assert.equal(r.next.extras, 10);
  assert.equal(r.label, "17.3");
});

test("last ball of the over is labelled x.6, completes the over and swaps ends", () => {
  const r = applyBall({ ...base, legalBalls: 107 }, { kind: "dot", runs: 0 });
  assert.equal(r.label, "17.6");
  assert.equal(r.overComplete, true);
  assert.deepEqual([r.next.strikerPos, r.next.nonStrikerPos], [6, 4]);
});

test("wicket counts and keeps last 6 balls", () => {
  let s = base;
  for (let i = 0; i < 7; i++) s = applyBall(s, { kind: "dot", runs: 0 }).next;
  const r = applyBall(s, { kind: "wicket", runs: 0 });
  assert.equal(r.next.wickets, 5);
  assert.equal(r.next.recent.length, 6);
  assert.equal(r.next.recent.at(-1)?.value, "W");
});
