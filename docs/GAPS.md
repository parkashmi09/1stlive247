# 1stLive247: data and UI gaps (vs Sofascore)

Status: **draft, 2026-11-11**. [x] = done in code; backend parts are live only after deploy.

- **Sources:** our backend code, the local `backend/samples/`, and a screen-by-screen check of the running app (mobile and desktop).
- **Not checked yet:** the API docs pages (`9070/{cricbuzz,flashscore}/#/docs`). They need the user's login.
- **To do after login:** confirm the endpoint list there, and add any endpoint that is missing here (for example standings, team, league or search endpoints).

Rule: **only data our two APIs give.** Sofascore is the target for look and depth, not a data source.

Legend:
- ✅ we use it
- 🟡 the API has it, but we don't map or show it
- ❌ no API source known

---

## 1. API coverage

### Flashscore Sports API (`:9232`). All sports except cricket

| Endpoint / slice | Data in it | Status | Where it should show |
|---|---|---|---|
| `/live/{sport}`, `/upcoming/{sport}` | scoreboard | ✅ | lists |
| scoreboard `league_logo`, `country`, `country_flag` | league crest and country flag | 🟡 | Sofascore-style **league group headers** in lists |
| scoreboard `home_flag`, `away_flag`, `home_country` | player nationality (tennis) | 🟡 | tennis rows and header |
| scoreboard `stage_code`, `stage_start_ts` | current period | 🟡 | correct clock and period label |
| `/event/{id}/timer` `stage`, `elapsed_s` | "2nd half", "Q3" | 🟡 | header period label (the basketball clock is wrong today: "6'") |
| `slice/periods` `BA`/`BB`, `BC`/`BD`, … | **score per period**: sets, quarters, halves | 🟡 | tennis set table, basketball quarter table, football HT score |
| `slice/periods` `RC`/`RD`/`RB` | set durations (tennis) | 🟡 | tennis set table |
| `slice/core` `DM` | "First leg result: 3-0" | 🟡 | header note |
| `slice/core` `DX` | feature flags (which slices exist) | 🟡 | show only the tabs that have data |
| `slice/stats` | stats per period | ✅ | Statistics tab |
| `slice/incidents` | goals, cards, subs, match info | ✅ | Timeline |
| `slice/momentum` `momentum.entries` | momentum graph | ✅ | |
| `slice/momentum` `matchEvents.entries` | goal markers on the graph | 🟡 | momentum graph |
| `slice/odds` | live 1X2 odds | ✅ | win probability |
| `slice/h2h` | head-to-head, last matches, W/D/L form | ✅ | H2H tab |
| `slice/h2h` `KM`, `RPA`/`RPB` | HT score, penalty score | 🟡 | H2H rows |
| `slice/pbp` | **tennis point by point** (`HC`…`HL`, "15:0, 30:0") | 🟡 | tennis "Point by point" tab, live game score |
| `slice/player_stats` | rating + ~90 stats per player, **`name` is null** | 🟡 | player ratings (needs names from lineups, see below) |
| `slice/lineups` | lineups | ❌ "not published" on every sample so far | Lineups tab (hide it until the API publishes it) |
| `slice/commentary` | text commentary | ❌ not published in samples | |
| `/sports` | **34 sports** (hockey, baseball, volleyball, handball, darts, golf, esports, …) | 🟡 we map 6 | more sports in the selector (hockey and rugby icons already exist in Figma) |
| standings / table | ❌ none known | | League page, Standings tab. **Check the docs.** |
| team / player / league pages | ❌ none known | | **Check the docs.** |
| finished results by date | ❌ only "dropped off /live" | | date strip, Results. **Check the docs.** |

### Cricbuzz (`:9228`). Cricket only

| Endpoint / slice | Data in it | Status | Where it should show |
|---|---|---|---|
| `/live/cricket`, `/stream` | scoreboard | ✅ | |
| scoreboard `toss_winner`, `toss_decision` | toss | 🟡 | Overview: match info |
| scoreboard `last_wicket`, `rem_runs_to_win`, `other_bowler` | | 🟡 | Overview: crease card |
| scoreboard `result` | result text | 🟡 | **this is the cause of "LIVE + won by"**: use `complete`/`result` for the status |
| `slice/scorecard` | innings, batting, bowling, FoW | ✅ | Scorecard |
| scorecard: batsman `strikeRate`, `dots`, `mins`; bowler `economy`, `wides`, `no_balls`, `dots` | | 🟡 | Scorecard columns (SR and Econ are shown today only where we compute them) |
| scorecard `ppData` | powerplays | 🟡 | Scorecard |
| scorecard `matchHeader` | venue (city, country), toss, **player of the match**, series | 🟡 | Overview: match info |
| `slice/partnerships` | partnerships per innings | 🟡 never fetched | Scorecard: Partnerships section |
| `slice/win_probability` | win % | 🟡 never fetched | Overview: win probability (same card as football) |
| `slice/quick_access` | ? | 🟡 never fetched. **Check the docs.** | |
| `slice/comm`, `full_commentary` | ball by ball | ✅ | Commentary |
| comm `miniscore` | partnership, CRR, RRR | ✅ partly | |
| over `o_summary` | over summary | 🟡 | Commentary: over separators |

---

## 2. UI gaps per screen (mobile, tablet, desktop)

### All screens
- [x] **Tablet layout (768–1023px)** doesn't exist yet. Tablets get the stretched phone column.
- [x] **Ad slots.** Standard placeholder slots are needed in every view (see §3).
- [ ] Search: the icon exists but has no function. Client-side search over loaded teams and leagues is possible.
- [ ] Favourites: the star is shown but does nothing. Store favourites in localStorage, add a "Favourites" filter.

### Home
- [x] Matches are a flat list. Sofascore **groups them by league**, with a crest or flag header and a count (needs `league_logo`/`country_flag`).
- [ ] No date strip (Yesterday / Today / Tomorrow). Upcoming data can fill the future days. Past days need a results source (check the docs).
- [ ] Desktop: no left sidebar (sports with live counts + top leagues). The v1 Figma (frame 6:2) already has it.
- [x] Finished tab missing (we do have finished matches).

### Live
- [x] Group by league as well.
- [x] Cricket shows "LIVE" with "won by" (status bug, see Cricbuzz `result`/`complete` above).

### Match Centre: football
- [x] HT score in the header (`periods`).
- [x] Goal markers on the momentum graph.
- [ ] Lineups tab: hidden until the API publishes lineups.
- [ ] Desktop: the page is one 880px column. Sofascore uses 2 columns (header + tabs on the left, info / H2H / odds on the right).

### Match Centre: tennis (weakest screen)
- [x] Set-by-set score table (`periods`). [ ] Current game points and serve indicator (`pbp`).
- [ ] Point-by-point tab (`pbp`).
- [x] Player flags (`home_flag`/`away_flag`) instead of initials.
- [x] The "Last 10 balls" stat label is shown as-is. It is a feed label, so rename or hide it for tennis.

### Match Centre: basketball
- [x] Quarter score table (`periods`).
- [ ] Correct period + clock ("Q3 6:12"), from the timer `stage`.
- [ ] Player stats: `player_stats` without names is not usable yet.

### Match Centre: cricket
- [ ] Toss, venue, player of the match (scorecard `matchHeader`, scoreboard `toss_*`).
- [ ] Partnerships (`slice/partnerships`).
- [ ] Win probability (`slice/win_probability`).
- [ ] SR, Econ, dots columns from the feed.

### News
- [ ] Demo data only. There is no news API (❌).

### More
- [ ] OK. Settings rows that have no function should be labelled "Soon" or removed.

---

## 3. Ad slots (dummy for now)

One `AdSlot` component that renders a labelled placeholder ("Advertisement · 728×90"). It comes in fixed IAB sizes, so swapping in a real ad later is a single change.

| View | Slot | Size |
|---|---|---|
| Mobile | in the list, after every 6th match card | 320×100 |
| Mobile | Match Centre, under the score header | 320×50 |
| Tablet | top of the list | 728×90 |
| Desktop | top leaderboard under the header | 970×90 |
| Desktop | side column, after the news card (sticky) | 300×250 |
| Desktop | Match Centre, side column | 300×600 |

---

## 4. Order of work

1. **Backend, mapping only, no new endpoints:**
   - periods → per-period scores
   - timer stage → period label
   - scoreboard league crest + flag + tennis flags
   - Cricbuzz `result`/`complete` status fix, toss, venue, player of the match
   - partnerships, win_probability

   **User pushes and deploys.**
2. **Responsive layout skill + tablet breakpoint + `AdSlot`** across all views.
3. **Lists:** league grouping, date strip, Finished tab, favourites.
4. **Match Centre:**
   - tennis (sets, pbp)
   - basketball (quarters)
   - cricket extras
   - football HT + goal markers
   - desktop 2-column
5. **After the docs check:** standings, league and team pages, if the API has them.
