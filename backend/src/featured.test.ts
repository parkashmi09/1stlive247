import { test } from "node:test";
import assert from "node:assert/strict";
import { pickFeatured } from "./featured.ts";
import type { Match } from "./types.ts";

const now = Date.parse("2026-11-06T00:00:00Z");
const m = (id: string, sport: Match["sport"], competition: string, inHours: number, status: Match["status"] = "upcoming"): Match => ({
  id, sport, competition, status, start: new Date(now + inHours * 3600_000).toISOString(),
  home: { team: { code: "AAA", name: `${id} home`, tone: "navy" } }, away: { team: { code: "BBB", name: `${id} away`, tone: "gold" } },
});

test("one slide per sport, big tournaments first, soonest wins ties", () => {
  const out = pickFeatured([
    m("lowleague", "football", "Primera B · Colombia", 1),
    m("mongolia", "football", "Premier League · Mongolia", 1),
    m("afcw", "football", "AFC Champions League Women · Asia", 1),
    m("buli2", "football", "2. Bundesliga · Germany", 1),
    m("epl-late", "football", "Premier League · England", 20),
    m("epl-soon", "football", "Premier League · England", 5),
    m("odi", "cricket", "One Day International · World", 8),
    m("t10", "cricket", "T10 League · UAE", 2),
    m("atp", "tennis", "ATP Finals · World", 3),
    m("nba", "basketball", "NBA · USA", 4),
    m("live", "football", "Champions League · Europe", 1, "live"),
    m("far", "football", "Champions League · Europe", 100),
  ], now);
  assert.deepEqual(out.map((f) => f.matchId), ["epl-soon", "odi", "nba"]);
  assert.equal(out[0]?.league, "Premier League");
});

test("tennis label shows the tour", () => {
  const [f] = pickFeatured([m("wta", "tennis", "Hong Kong (Hong Kong), hard · Wta - Singles", 2)], now);
  assert.equal(f?.league, "WTA · Hong Kong");
});
