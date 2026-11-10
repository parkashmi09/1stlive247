import { test } from "node:test";
import assert from "node:assert/strict";
import { parseH2h, parseIncidents, parseMomentum, parseOdds, parsePeriods, parseStats } from "./insights.ts";

// Rows trimmed from real slices of event Q9XxIJ2F (Adelaide W 0-1 Wellington Phoenix W) and two other live matches.
test("stats: every period, empty groups dropped", () => {
  const p = parseStats([
    { SE: "Match" }, { SF: "Top stats" }, { SD: "12", SG: "Ball possession", SH: "55%", SI: "45%" }, { SF: "Empty" },
    { SE: "1st Half" }, { SF: "Top stats" }, { SD: "34", SG: "Total shots", SH: "4", SI: "4" },
  ]);
  assert.deepEqual(p.map((x) => x.name), ["Match", "1st Half"]);
  assert.deepEqual(p[0]!.groups, [{ title: "Top stats", stats: [{ name: "Ball possession", home: "55%", away: "45%" }] }]);
});

test("incidents: goal+assist, card, sub, penalties, periods, match info", () => {
  const { timeline, info } = parseIncidents([
    { AC: "1st Half", IG: "0", IH: "1" },
    { IA: "2", IB: "15'", INX: "0", IOX: "1", IF: ["Yallop T.", "Woods M."], IK: ["Goal", "Assistance"] },
    { IA: "1", IB: "23'", IF: "Murray H.", IK: "Yellow Card", IL: "Foul" },
    { IA: "2", IB: "46'", IF: ["Pickett K.", "Elliott M."], IK: ["Substitution - Out", "Substitution - In"] },
    { IA: "2", IB: "11'", INX: "0", IOX: "1", IF: ["Deni Junior", "Deni Junior"], IK: ["Penalty Awarded", "Penalty"] },
    { IA: "1", IB: "42'", IF: ["", ""], IK: ["Penalty Awarded", "Penalty missed"] },
    { MIT: ["REF", "RCO", "RTY", "RCC", "VEN", "TWN", "CAP"], MIV: ["Mossin I.", "24", "23", "Aus", "ServiceFM Stadium", "Adelaide", "7 000"], TA: "Channel 10 (Aus)" },
    { A1: "d966531c" },
  ]);
  assert.deepEqual(timeline[0], { type: "period", name: "1st Half", score: "0 - 1" });
  assert.deepEqual(timeline[1], { type: "event", side: "away", minute: "15'", kind: "goal", player: "Yallop T.", assist: "Woods M.", score: "0 - 1" });
  assert.deepEqual(timeline[2], { type: "event", side: "home", minute: "23'", kind: "yellow", player: "Murray H.", note: "Foul" });
  assert.deepEqual(timeline[3], { type: "event", side: "away", minute: "46'", kind: "sub", player: "Elliott M.", playerOut: "Pickett K." });
  assert.equal(timeline[4]!.type === "event" && timeline[4]!.kind, "penalty");
  assert.equal(timeline[5]!.type === "event" && timeline[5]!.kind, "penalty-missed");
  assert.deepEqual(info, [
    { label: "Referee", value: "Mossin I. (Aus)" }, { label: "Venue", value: "ServiceFM Stadium" },
    { label: "City", value: "Adelaide" }, { label: "Capacity", value: "7 000" }, { label: "TV", value: "Channel 10 (Aus)" },
  ]);
});

test("momentum: minute = elapsed + 1, values clamped; missing slice -> []", () => {
  const m = parseMomentum({ findMatchMomentumStatsByMatchId: { momentum: { entries: [
    { timeFrame: { elapsedMinute: 0 }, momentumValue: -0.45 }, { timeFrame: { elapsedMinute: 1 }, momentumValue: 1.7 },
  ] } } });
  assert.deepEqual(m, [{ minute: 1, value: -0.45 }, { minute: 2, value: 1 }]);
  assert.deepEqual(parseMomentum(null), []);
});

test("h2h: tabs/sections, winner star stripped, result codes, logo urls, per-section cap", () => {
  const row = { KC: "1793541600", KP: "GnxSGsUI", KF: "ISL", KJ: "Inter Kashi", KK: "*Goa", KL: "1:2", EC: "a.png", ED: "b.png", WIS: "w", KS: "away" };
  const t = parseH2h([
    { SA: "1" }, { KA: "Overall", IS: "" }, { KB: "Last matches: Goa" },
    row, { ...row, KP: "x2", KJ: "Goa", KK: "SC Delhi", KL: "1:1", WIS: "d" }, { ...row, KP: "x3", WIS: "lo" },
    { KB: "Head-to-head matches" }, { ...row, KP: "x4", WIS: undefined as unknown as string },
    { KA: "Goa - Home", IS: "" }, { KB: "Empty" },
  ], 2);
  assert.deepEqual(t.map((x) => x.name), ["Overall"]);
  assert.deepEqual(t[0]!.sections.map((s) => s.matches.length), [2, 1]);
  assert.deepEqual(t[0]!.sections[0]!.matches[0], {
    id: "GnxSGsUI", start: "2026-11-01T14:00:00.000Z", league: "ISL", home: "Inter Kashi", away: "Goa",
    homeLogo: "https://static.flashscore.com/res/image/data/a.png", awayLogo: "https://static.flashscore.com/res/image/data/b.png",
    score: "1:2", winner: "away", result: "w",
  });
  assert.equal(t[0]!.sections[0]!.matches[1]!.result, "d");
  assert.equal(t[0]!.sections[1]!.matches[0]!.result, undefined);
});

test("odds: 1X2 with opening + direction; incomplete -> undefined", () => {
  const item = (value: string, type: string) => ({ value, opening: "2.0", change: { type } });
  assert.deepEqual(parseOdds({ findEventById: { updateLiveOddsOverview: { home: item("1.5", "DOWN"), draw: item("4.0", "UP"), away: item("6.0", "NONE") } } }), {
    home: { value: "1.5", opening: "2.0", change: "down" }, draw: { value: "4.0", opening: "2.0", change: "up" }, away: { value: "6.0", opening: "2.0" },
  });
  assert.equal(parseOdds({ findEventById: { updateLiveOddsOverview: null } }), undefined);
  assert.equal(parseOdds(null), undefined);
});

test("periods: letter pairs across rows -> per-period scores, in order", () => {
  // real tennis sample shape (backend/samples/event-tennis-periods.json)
  assert.deepEqual(parsePeriods([{ AC: "18", BA: "6", BB: "4", RC: "0:37" }, { BC: "2", BD: "1", RD: "0:11" }, { RB: "0:48" }, { TVB: "x" }]),
    [{ home: "6", away: "4" }, { home: "2", away: "1" }]);
  assert.deepEqual(parsePeriods([]), []);
});
