import { test } from "node:test";
import assert from "node:assert/strict";
import type { Timer } from "../data/types.ts";
import { clockLabel } from "./clock.ts";
import { formatBannerDate } from "./format.ts";

const t: Timer = { mode: "clock", running: true, anchorTs: 1000, baseS: 2700, periodLenS: 2700, serverTs: 1000, display: "45:00", minuteLabel: "46'" };

test("clock label: running, stoppage, paused, minute and stage modes", () => {
  assert.equal(clockLabel(t, 1000 + 600), "56'");
  assert.equal(clockLabel(t, 1000 + 2700 + 90), "90+2'");
  assert.equal(clockLabel({ ...t, running: false, display: "HT" }, 5000), "HT");
  assert.equal(clockLabel({ ...t, mode: "minute", minuteLabel: "Q4 8'" }, 5000), "Q4 8'");
  assert.equal(clockLabel({ ...t, mode: "none", display: "Set 2" }, 5000), "Set 2");
  assert.equal(clockLabel(t, 1000 + 4 * 3600), "46'"); // stale anchor falls back to the feed label
});

test("banner date like the Figma: weekday, ordinal day, month, year (IST)", () => {
  assert.equal(formatBannerDate("2026-11-06T19:30:00Z"), "Saturday 7th Nov 2026"); // 01:00 IST next day
  assert.equal(formatBannerDate("2026-11-01T06:00:00Z"), "Sunday 1st Nov 2026");
  assert.equal(formatBannerDate("2026-11-12T06:00:00Z"), "Thursday 12th Nov 2026");
});
