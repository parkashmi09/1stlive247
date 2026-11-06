import { test } from "node:test";
import assert from "node:assert/strict";
import { econ, sr } from "./cricket.ts";
import { timeAgo } from "./format.ts";

test("strike rate", () => {
  assert.equal(sr(52, 38), "136.84");
  assert.equal(sr(0, 0), "0.00");
});

test("economy treats .2 as two balls, not 0.2 overs", () => {
  assert.equal(econ(36, "3.2"), "10.80");
  assert.equal(econ(41, "4"), "10.25");
  assert.equal(econ(5, "0"), "0.00");
});

test("timeAgo", () => {
  const now = Date.parse("2026-11-06T10:00:00Z");
  assert.equal(timeAgo("2026-11-06T09:30:00Z", now), "30m ago");
  assert.equal(timeAgo("2026-11-06T11:00:00Z", now), "Just now");
  assert.equal(timeAgo("2026-11-06T07:00:00Z", now), "3h ago");
  assert.equal(timeAgo("2026-11-04T10:00:00Z", now), "2d ago");
});
