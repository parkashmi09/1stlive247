import { test } from "node:test";
import assert from "node:assert/strict";
import { toMatch, type ApiTimer, type Scoreboard } from "./store.ts";

// Shapes copied from real /live and /timer responses (samples/).
const football: Scoreboard = {
  event_id: "tni1yitT", sport: "football", status: "live", start_ts: 1793917800,
  home: "Botafogo SP", away: "Londrina", home_short: "BOT", away_short: "LON", home_score: "3", away_score: "0", minute: "",
  league: "BRAZIL: Serie B", home_logo: "https://static.flashscore.com/a.png",
};
const clock: ApiTimer = { mode: "clock", running: true, anchor_ts: 1793921647, base_s: 2700, period_len_s: 2700, server_ts: 1793921900, display: "49:13", minute_label: "50'" };

test("football live scoreboard + timer -> Match", () => {
  const m = toMatch(football, clock)!;
  assert.equal(m.id, "tni1yitT");
  assert.equal(m.competition, "Serie B · Brazil");
  assert.equal(m.clock, "50'");
  assert.deepEqual([m.home.team.code, m.home.score, m.away.score], ["BOT", "3", "0"]);
  assert.equal(m.home.team.logo, "https://static.flashscore.com/a.png");
  assert.equal(m.timer?.anchorTs, 1793921647);
});

test("tennis doubles: array short codes, stage text as clock", () => {
  const m = toMatch({ ...football, sport: "tennis", home: "Carle M. L./Pigossi L.", home_short: ["CAR", "PAP"], minute: "-1" },
    { ...clock, mode: "none", running: false, anchor_ts: null, display: "Set 2", minute_label: "" })!;
  assert.equal(m.home.team.code, "CAR/PAP");
  assert.equal(m.clock, "Set 2");
});

test("upcoming hides scores; finished marks the loser; unsupported sports are dropped", () => {
  assert.equal(toMatch({ ...football, status: "scheduled" })!.home.score, undefined);
  const fin = toMatch({ ...football, status: "finished" })!;
  assert.equal(fin.away.lost, true);
  assert.equal(fin.stage, "Final");
  assert.equal(toMatch({ ...football, sport: "hockey" }), undefined);
  assert.equal(toMatch({ ...football, sport: "motorsport", home: undefined as unknown as string }), undefined);
});
