import { test } from "node:test";
import assert from "node:assert/strict";
import type { Match } from "../data/types.ts";
import { searchMatches } from "./search.ts";

const match = (id: string, status: Match["status"], home: string, away: string) => ({
  id, status, sport: "cricket", competition: "2nd ODI · World Cup", start: "2026-11-11T00:00:00Z",
  home: { team: { code: home.slice(0, 3).toUpperCase(), name: home, tone: "navy" } },
  away: { team: { code: away.slice(0, 3).toUpperCase(), name: away, tone: "red" } },
}) as Match;

test("searchMatches: every word must match, live comes first, blank finds nothing", () => {
  const list = [match("a", "finished", "India", "Pakistan"), match("b", "live", "New Zealand", "India"), match("c", "upcoming", "Spain", "Italy")];
  assert.deepEqual(searchMatches(list, "india").map((m) => m.id), ["b", "a"]);
  assert.deepEqual(searchMatches(list, "INDIA pak").map((m) => m.id), ["a"]);
  assert.deepEqual(searchMatches(list, "world cup").map((m) => m.id), ["b", "c", "a"]);
  assert.deepEqual(searchMatches(list, "   "), []);
});
