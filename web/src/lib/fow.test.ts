import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFow, toOvers } from "./fow.ts";

test("parses wickets, stands and the innings total", () => {
  const r = parseFow(["1-79 (Sam Konstas, 24.4)", "2-101 (Josh Philippe, 32.1)", "junk"], "278 (111.1 ov)");
  assert.deepEqual(r.wickets.map((w) => [w.n, w.runs, w.name, w.part]), [[1, 79, "Sam Konstas", 79], [2, 101, "Josh Philippe", 22]]);
  assert.equal(r.runs, 278);
  assert.equal(r.overs, toOvers("111.1"));
});

test("live innings total with wickets, and an early low-score wicket", () => {
  const r = parseFow(["1-11 (Angus Lovell, 4.4)", "2-72 (Marnus Labuschagne, 19.6)"], "106/2 (32.4 ov)");
  assert.deepEqual(r.wickets.map((w) => [w.n, w.runs]), [[1, 11], [2, 72]]);
  assert.equal(r.runs, 106);
  assert.equal(toOvers("19.6"), 20);
});
