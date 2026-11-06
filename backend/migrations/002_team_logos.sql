-- Team logos harvested from the Sports API (Flashscore) so feeds without logos (Cricbuzz) can show them.
CREATE TABLE team_logos (
  sport       text NOT NULL,
  name_key    text NOT NULL,          -- normalized team name (see feed/logos.ts nameKey)
  name        text NOT NULL,
  logo        text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sport, name_key)
);
