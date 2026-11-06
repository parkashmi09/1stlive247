// Seeds demo data (the same set the UI was designed with). Idempotent: wipes and re-inserts.
import type pg from "pg";
import { pool, tx } from "./pool.ts";

const SPORTS = [
  ["cricket", "Cricket", "cricket"], ["football", "Football", "football"], ["tennis", "Tennis", "tennis"],
  ["kabaddi", "Kabaddi", "kabaddi"], ["basketball", "Basketball", "basketball"], ["racing", "Racing", "racing"], ["f1", "F1", "f1"],
] as const;

type T = [code: string, name: string, tone: string];
type SideSeed = { t: T; score?: string; detail?: string; record?: string; lost?: boolean };
type MatchSeed = { id: string; sport: string; competition: string; status: string; clock?: string; stage?: string; note?: string; start: string; home: SideSeed; away: SideSeed };

const IND: T = ["IND", "India", "navy"], AUS: T = ["AUS", "Australia", "gold"];
const ARI: T = ["ARI", "Arizona", "red"], LAR: T = ["LAR", "Los Angeles", "navy"];

const MATCHES: MatchSeed[] = [
  { id: "ind-aus-odi-2", sport: "cricket", competition: "2nd ODI · Australia Tour of India", status: "live", start: "2026-11-06T08:30:00Z",
    home: { t: IND, score: "186/4", detail: "(17.2)" }, away: { t: AUS, score: "Yet to bat" }, note: "CRR 10.73 · Target —" },
  { id: "ind-aus-odi-1", sport: "cricket", competition: "1st ODI · Australia Tour of India", status: "finished", stage: "Final", start: "2026-12-25T08:30:00Z",
    home: { t: IND, score: "287/6", detail: "50 ov" }, away: { t: AUS, score: "245/9", detail: "50 ov", lost: true }, note: "India won by 42 runs" },
  { id: "ari-lar", sport: "football", competition: "Gridiron · Week 18", status: "live", clock: "Q3", start: "2027-01-04T04:30:00Z",
    home: { t: ARI, record: "3-12" }, away: { t: LAR, record: "11-4" } },
  { id: "ari-lar-2", sport: "football", competition: "Gridiron · Week 18", status: "upcoming", start: "2027-01-04T04:30:00Z",
    home: { t: ARI, record: "3-12" }, away: { t: LAR, record: "11-4" } },
  { id: "ars-che", sport: "football", competition: "Premier League", status: "live", clock: "73'", start: "2026-11-06T15:00:00Z",
    home: { t: ["ARS", "Arsenal", "red"], score: "2" }, away: { t: ["CHE", "Chelsea", "sky"], score: "1" }, note: "HT 1–0 · Emirates" },
  { id: "bar-rma", sport: "football", competition: "La Liga", status: "live", clock: "65'", start: "2026-11-06T16:00:00Z",
    home: { t: ["BAR", "Barcelona", "red"], score: "1" }, away: { t: ["RMA", "Real Madrid", "sky"], score: "1" }, note: "HT 0–1 · Camp Nou" },
  { id: "djo-alc", sport: "tennis", competition: "US Open · Men's Singles · QF", status: "live", clock: "Set 3", start: "2026-11-06T17:00:00Z",
    home: { t: ["ND", "N. Djokovic", "navy"], score: "6 4 4", detail: "30" }, away: { t: ["CA", "C. Alcaraz", "red"], score: "4 6 3", detail: "15" }, note: "Djokovic serving" },
  { id: "ben-dab", sport: "kabaddi", competition: "Pro Kabaddi · Season 12", status: "live", clock: "2nd Half · 12:36", start: "2026-11-06T14:00:00Z",
    home: { t: ["BEN", "Bengaluru", "red"], score: "28" }, away: { t: ["DAB", "Dabang Delhi", "gold"], score: "24" }, note: "Bengaluru lead by 4" },
];

const CENTRE = {
  matchId: "ind-aus-odi-2", headline: "2nd ODI · Australia Tour of India",
  runs: 186, wickets: 4, legalBalls: 104, extras: 9, extrasDetail: "wd 5, lb 4", fow: "1-68, 2-96, 3-118, 4-121",
  strikerPos: 4, nonStrikerPos: 6, bowlerPos: 3,
  thisOver: [{ value: "1", kind: "run" }, { value: "4", kind: "four" }, { value: "0", kind: "dot" }, { value: "1", kind: "run" }, { value: "6", kind: "six" }, { value: "1", kind: "run" }],
  latest: ["17.2", "Shreyas Iyer works it through the covers for a single. Tidy over from Cummins."],
  batting: [
    ["Rohit Sharma", "c Carey b Starc", 42, 30, 5, 1], ["Shubman Gill", "c Smith b Cummins", 34, 27, 4, 1], ["Virat Kohli", "b Zampa", 18, 15, 2, 0],
    ["Shreyas Iyer", "not out", 52, 38, 5, 2], ["Hardik Pandya", "lbw b Hazlewood", 0, 2, 0, 0], ["KL Rahul", "not out", 31, 24, 2, 1],
  ] as const,
  bowling: [["Mitchell Starc", 24, 0, 41, 1], ["Josh Hazlewood", 24, 0, 38, 1], ["Pat Cummins", 24, 0, 38, 1], ["Adam Zampa", 20, 0, 36, 1]] as const,
  commentary: [ // oldest first
    ["ball", "15.3", "run", null, "Worked off the pads to deep square leg for one."],
    ["ball", "15.4", "wicket", null, "OUT! Edged and taken at first slip. Pandya lbw b Hazlewood 0 (2)."],
    ["ball", "16.3", "six", null, "SIX! Steps out and lofts it over long-on."],
    ["ball", "16.5", "dot", null, "Back of a length, punched straight to point."],
    ["ball", "16.6", "four", null, "FOUR! Driven on the up through extra cover, races away."],
    ["over", null, null, "End of over 17 · 9 runs", "IND 184/4 · Iyer 51* (37) · Rahul 31* (23) · Cummins 4-0-38-1"],
    ["ball", "17.1", "dot", null, "Good length outside off, defended back to the bowler."],
    ["ball", "17.2", "run", null, "Shreyas Iyer works it through the covers for a single."],
  ] as const,
};

const NEWS = [
  { slug: "india-clinch-thriller-final-over", sport: "cricket", featured: true, title: "India clinch a thriller against Australia in the final over",
    excerpt: "The lower order held its nerve to seal the series with two balls to spare.", publishedAt: "2026-11-06T08:00:00Z", author: "Sports Desk", readMins: 4,
    body: ["India held their nerve in a tense finish, with the lower order seeing the side home with two balls to spare. The win seals the series and keeps the home record intact this season.",
      "The chase was built on a steady middle-order stand before a late flurry of boundaries swung momentum."], quote: "We trusted the process right till the last ball." },
  { slug: "new-look-batting-order", sport: "cricket", title: "Captain hints at a new-look batting order for the home series", excerpt: "", publishedAt: "2026-11-06T07:00:00Z", author: "Sports Desk", readMins: 3, body: ["Selection talk is heating up ahead of the home summer."] },
  { slug: "late-winner-title-race", sport: "football", title: "Late winner keeps the title race alive going into the final month", excerpt: "", publishedAt: "2026-11-06T06:00:00Z", author: "Football Desk", readMins: 3, body: ["A stoppage-time header changed the shape of the table."] },
  { slug: "pkl-raiders-to-watch", sport: "kabaddi", title: "Pro Kabaddi Season 12: five raiders to watch this year", excerpt: "", publishedAt: "2026-11-06T04:00:00Z", author: "Kabaddi Desk", readMins: 5, body: ["Pace, reach and nerve: the raiders set to define the season."] },
  { slug: "five-set-classic", sport: "tennis", title: "Five-set classic sends the defending champion through", excerpt: "", publishedAt: "2026-11-06T02:00:00Z", author: "Tennis Desk", readMins: 4, body: ["Four hours and fifty minutes of shot-making under the lights."] },
];

async function team(c: pg.PoolClient, [code, name, tone]: T) {
  const r = await c.query<{ id: string }>(
    `INSERT INTO teams (code, name, tone) VALUES ($1,$2,$3)
     ON CONFLICT (code, name) DO UPDATE SET tone = EXCLUDED.tone RETURNING id`, [code, name, tone]);
  return r.rows[0]!.id;
}

export async function seed() {
  await tx(async (c) => {
    await c.query("TRUNCATE news, commentary, batting, bowling, match_centre, matches, teams, sports RESTART IDENTITY CASCADE");
    for (const [i, [id, label, icon]] of SPORTS.entries())
      await c.query("INSERT INTO sports (id, label, icon, sort_order) VALUES ($1,$2,$3,$4)", [id, label, icon, i]);
    for (const m of MATCHES) {
      const [h, a] = [await team(c, m.home.t), await team(c, m.away.t)];
      await c.query(
        `INSERT INTO matches (id, sport_id, competition, status, clock, stage, note, start_at, home_team_id, away_team_id,
           home_score, home_detail, home_record, home_lost, away_score, away_detail, away_record, away_lost)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [m.id, m.sport, m.competition, m.status, m.clock ?? null, m.stage ?? null, m.note ?? null, m.start, h, a,
          m.home.score ?? null, m.home.detail ?? null, m.home.record ?? null, !!m.home.lost,
          m.away.score ?? null, m.away.detail ?? null, m.away.record ?? null, !!m.away.lost]);
    }
    const x = CENTRE;
    await c.query(
      `INSERT INTO match_centre (match_id, headline, runs, wickets, legal_balls, striker_pos, non_striker_pos, bowler_pos,
         extras, extras_detail, fall_of_wickets, this_over, latest_over, latest_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [x.matchId, x.headline, x.runs, x.wickets, x.legalBalls, x.strikerPos, x.nonStrikerPos, x.bowlerPos,
        x.extras, x.extrasDetail, x.fow, JSON.stringify(x.thisOver), x.latest[0], x.latest[1]]);
    for (const [i, [name, dismissal, r, b, f, s]] of x.batting.entries())
      await c.query("INSERT INTO batting VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", [x.matchId, i + 1, name, dismissal, r, b, f, s]);
    for (const [i, [name, balls, m, r, w]] of x.bowling.entries())
      await c.query("INSERT INTO bowling VALUES ($1,$2,$3,$4,$5,$6,$7)", [x.matchId, i + 1, name, balls, m, r, w]);
    for (const [type, over, kind, title, body] of x.commentary)
      await c.query("INSERT INTO commentary (match_id, type, over_label, kind, title, body) VALUES ($1,$2,$3,$4,$5,$6)", [x.matchId, type, over, kind, title, body]);
    for (const n of NEWS)
      await c.query(
        `INSERT INTO news (slug, sport_id, title, excerpt, body, quote, author, read_mins, featured, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [n.slug, n.sport, n.title, n.excerpt, n.body, n.quote ?? null, n.author, n.readMins, !!n.featured, n.publishedAt]);
  });
}

if (import.meta.main) {
  await seed();
  console.log("seeded");
  await pool.end();
}
