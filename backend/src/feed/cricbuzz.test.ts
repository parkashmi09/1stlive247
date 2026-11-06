import { test } from "node:test";
import assert from "node:assert/strict";
import { nameKey } from "./logos.ts";
import { ballKind, cbToMatch, commToBalls, mergeBalls, teamScore, toCommentary, type CbBall, type CbScoreboard } from "./cricbuzz.ts";

// Shapes taken from real responses in samples/cb.
const sb: CbScoreboard = {
  match_id: 170700, series: "Sri Lanka tour of Pakistan, 2026", match_desc: "3-Day Warm-up Match", format: "TEST", state: "Stumps",
  status: "Day 2: Stumps - Sri Lanka lead by 193 runs", complete: false, start_ts: 1793766600000,
  team1: "Pakistan Cricket Board Patrons XI", team1_short: "PCBPXI", team2: "Sri Lanka", team2_short: "SL",
  innings: [
    { innings: 1, team: "SL", runs: 223, wkts: 7, overs: 58, declared: true },
    { innings: 2, team: "PCBPXI", runs: 151, wkts: 8, overs: 16 },
    { innings: 3, team: "SL", runs: 121, wkts: 6, overs: 38 },
  ],
};

test("scoreboard -> Match: test-match scores, break state, status line", () => {
  const m = cbToMatch(sb);
  assert.equal(m.id, "cb-170700");
  assert.equal(m.status, "live");
  assert.equal(m.away.score, "223/7d & 121/6");
  assert.equal(m.away.detail, "(38)");
  assert.equal(m.home.score, "151/8");
  assert.equal(m.clock, "Stumps");
  assert.equal(m.note, "Day 2: Stumps - Sri Lanka lead by 193 runs");
  assert.equal(teamScore([{ innings: 1, team: "X", runs: 245, wkts: 10, overs: 50 }], "X"), "245");
});

test("commentary: drops notes, keeps the full-feed copy of a ball, adds over summary, newest first", () => {
  const balls: CbBall[] = [
    { ts: 1, innings: null, over: null, text: "<b>Teams:</b>", src: "comm" },
    { ts: 2, innings: 1, over: 86.5, text: "Saleem Safi to Madhevere, no run", src: "full" },
    { ts: 3, innings: 1, over: 86.6, text: "Saleem Safi to Madhevere, no run", events: ["over-break"], src: "comm" },
    { ts: 4, innings: 1, over: 86.6, text: "Saleem Safi to Madhevere, <b>2 runs</b>", events: ["over-break"], src: "full", team: "ZIM",
      over_summary: { score: 326, wickets: 5, overNum: 86.6, runs: 3, o_summary: "1 0 0 0 0 2 ", batStrikerNames: ["Wessly Madhevere"], bowlNames: ["Saleem Safi"] } },
  ];
  const c = toCommentary(balls);
  assert.deepEqual(c.map((e) => (e.type === "ball" ? `${e.over}:${e.kind}` : "OVER")), ["OVER", "86.6:run", "86.5:dot"]);
  assert.equal(c[1]?.type === "ball" && c[1].text, "Saleem Safi to Madhevere, 2 runs");
  assert.equal(c[0]?.type === "over" && c[0].title, "End of over 87 · 3 runs");
});

test("ball kinds from events and text", () => {
  const k = (text: string, events?: string[]) => ballKind({ ts: 0, innings: 1, over: 1.1, text, events });
  assert.equal(k("x", ["FOUR"]), "four");
  assert.equal(k("x", ["six"]), "six");
  assert.equal(k("x", ["WICKET"]), "wicket");
  assert.equal(k("Starc to Kohli, wide"), "extra");
  assert.equal(k("Starc to Kohli, 1 run"), "run");
  assert.equal(k("Starc to Kohli, no run"), "dot");
  assert.equal(k("Safi to Madhevere, no run, full and well wide of off stump"), "dot");
  assert.equal(k("Starc to Kohli, leg byes, 1 run"), "extra");
});

test("comm slice merges new balls and attaches the over separator", () => {
  const balls = commToBalls({ matchCommentary: {
    a: { commType: "commentary", inningsId: 1, timestamp: 10, commText: "Safi to Madhevere, 2 runs", ballMetric: 86.6, event: ["over-break", "two"], teamName: "ZIM" },
    b: { commType: "over-separator", inningsId: 1, timestamp: 12, overSeparator: { overNumber: 87, overSummary: "1 0 0 0 0 2 ", overRuns: 3,
      batTeamObj: { teamName: "ZIM", teamScore: "326-5" }, bowlerObj: { playerName: "Safi", playerScore: "16-4-44-1" } } },
  } });
  assert.equal(balls.length, 1);
  assert.equal(balls[0]?.over_summary?.score, 326);
  const merged = mergeBalls([{ ts: 1, innings: 1, over: 86.6, text: "old", src: "full" }], balls);
  assert.equal(merged.length, 1);
  assert.equal(merged[0]?.text, "Safi to Madhevere, 2 runs");
});

test("logos: Cricbuzz names find Flashscore logos after normalizing", () => {
  const index = new Map([[nameKey("Sri Lanka"), "https://x/sl.png"], [nameKey("India W"), "https://x/inw.png"]]);
  const m = cbToMatch({ ...sb, team1: "India Women", team1_short: "INDW" }, (n) => index.get(nameKey(n)));
  assert.equal(m.away.team.logo, "https://x/sl.png");
  assert.equal(m.home.team.logo, "https://x/inw.png");
  assert.equal(cbToMatch(sb).home.team.logo, undefined); // unknown team keeps its initials badge
});

test("logos: h2h rows become name -> full Flashscore logo URL", async () => {
  const { logosFromH2h } = await import("./logos.ts");
  const pairs = logosFromH2h([{ FH: "New Zealand", EC: "llwpiGXg-zmDbXBOa.png", FK: "India", ED: "norj22Ea-2ur67bOJ.png" }, { KA: "Overall" }]);
  assert.deepEqual(pairs, [
    ["New Zealand", "https://static.flashscore.com/res/image/data/llwpiGXg-zmDbXBOa.png"],
    ["India", "https://static.flashscore.com/res/image/data/norj22Ea-2ur67bOJ.png"],
  ]);
});
