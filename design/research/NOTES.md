# Research notes — 1stLive247

These are patterns only. We copy no logos, colours or exact layouts. Brand look comes from `../client-reference/*.png`.
Screenshots: `flashscore-*.png`, `cricbuzz-*.png`, `sofascore-*.png` (390 and 1440 wide, 2026-11-06).

## Home
- Put the most important info in the first scroll (the "five-second rule"). Order: hero live match, then the sport rail, then live matches, then top stories. [lollypop/cricket.com](https://lollypop.design/projects/cricket-com/)
- Use a horizontal strip of live mini-scores across the top on desktop (Sofascore header).
- Use one card system with one grid, shared by mobile and web, so the cards are reusable. [lollypop](https://lollypop.design/projects/cricket-com/)
- Make the cards bigger than competitors' cards. Use a numeric display face for scores (cricket.com pairs Oswald with Montserrat).

## Live list
- Filter chips: All / Live (n) / Upcoming / Finished. Live gets the count and a red tint (Sofascore, client theme 1).
- Group rows under a competition header (league plus a country chip) that can collapse (Flashscore, Sofascore).
- Row layout: status or time column on the left, two stacked team lines, score right-aligned, star to follow.
- Cricket rows put the score and overs on one team line and "Yet to bat" on the other (client theme 1).

## Match centre
- Keep the score header pinned on every tab. [Matchday case study](https://contra.com/p/FEEeF3Xr-matchday-designing-the-ultimate-football-live-app)
- Football tabs: Summary/Events, Lineups (formation pitch), Stats (two-sided bars), H2H. [Sportmonks](https://docs.sportmonks.com/football-widgets/our-widgets/livescore-widgets/match-centre)
- Cricket tabs: Overview, Scorecard, Commentary, Stats, Lineups (client theme 1).
- Overview shows a CRR / target / overs-left pill row, a recent-balls strip, and a latest-update card.

## Scorecard
- Batting table: R, B, 4s, 6s, SR. Bowling table: O, M, R, W, Econ. [blog](https://ball-by-ball-commentary.pages.dev/blog/beyond-commentary-what-you-really-get-from-top-cricket-scoreboards.html)
- Sections below the tables: Extras, Total, Fall of wickets, Partnerships. Use a sticky innings switcher.

## Commentary
- Commentary is its own tab, the full match is one scroll, and every over ends with an over-summary row. [blog](https://ball-by-ball-commentary.pages.dev/blog/beyond-commentary-what-you-really-get-from-top-cricket-scoreboards.html)
- Each row has the over.ball number in a mono column, then the text. A FOUR gets a green outline chip, a SIX a green filled chip, a WICKET a red chip, and the text is bolder.
- Sub-tabs: Commentary / Key moments / Stats / News (client theme 1).

## News
- One featured hero card (image, sport tag, headline, time), then list rows: a 16:10 thumbnail on the left, a 2-line headline, and the time.
- Sport chip filter at the top. Tag colours stay inside the brand palette.

## More / settings
- A welcome card in navy and gold at the top, then a grouped list: icon, label, chevron or toggle (client theme 2).
- Per-event notification toggles (goals, wickets, start, full time). [Matchday](https://contra.com/p/FEEeF3Xr-matchday-designing-the-ultimate-football-live-app)

## Pitfalls seen
- Flashscore, Cricbuzz and Sofascore all lose density to ads and banners. Keep ad slots only in the desktop right rail.
- A tall persistent header wastes mobile height, so the top bar should be 56px or less.
