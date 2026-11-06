-- 1stLive247 core schema. Shapes mirror the API contract in src/types.ts.

CREATE TABLE sports (
  id          text PRIMARY KEY,                -- 'cricket', 'football', …
  label       text NOT NULL,
  icon        text NOT NULL,
  sort_order  smallint NOT NULL DEFAULT 0
);

CREATE TABLE teams (
  id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code  text NOT NULL,                         -- 'IND'
  name  text NOT NULL,                         -- 'India'
  tone  text NOT NULL CHECK (tone IN ('navy','gold','red','green','sky')),
  UNIQUE (code, name)
);

CREATE TABLE matches (
  id            text PRIMARY KEY,              -- url slug
  sport_id      text NOT NULL REFERENCES sports(id),
  competition   text NOT NULL,
  status        text NOT NULL CHECK (status IN ('live','upcoming','finished')),
  clock         text,
  stage         text,
  note          text,
  start_at      timestamptz NOT NULL,
  home_team_id  bigint NOT NULL REFERENCES teams(id),
  away_team_id  bigint NOT NULL REFERENCES teams(id),
  home_score    text,
  home_detail   text,
  home_record   text,
  home_lost     boolean NOT NULL DEFAULT false,
  away_score    text,
  away_detail   text,
  away_record   text,
  away_lost     boolean NOT NULL DEFAULT false,
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX matches_status_start_idx ON matches (status, start_at);
CREATE INDEX matches_sport_idx ON matches (sport_id);
CREATE INDEX matches_home_team_idx ON matches (home_team_id);
CREATE INDEX matches_away_team_idx ON matches (away_team_id);

-- Ball-by-ball state for cricket matches with live coverage.
CREATE TABLE match_centre (
  match_id         text PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  headline         text NOT NULL,
  runs             integer NOT NULL DEFAULT 0,
  wickets          smallint NOT NULL DEFAULT 0,
  legal_balls      integer NOT NULL DEFAULT 0,
  max_overs        smallint NOT NULL DEFAULT 50,
  striker_pos      smallint NOT NULL DEFAULT 1,     -- batting.pos of the batter on strike
  non_striker_pos  smallint NOT NULL DEFAULT 2,
  bowler_pos       smallint NOT NULL DEFAULT 1,     -- bowling.pos of the current bowler
  extras           integer NOT NULL DEFAULT 0,
  extras_detail    text NOT NULL DEFAULT '',
  fall_of_wickets  text NOT NULL DEFAULT '',
  this_over        jsonb NOT NULL DEFAULT '[]',     -- [{value, kind}]
  latest_over      text,
  latest_text      text,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE batting (
  match_id   text NOT NULL REFERENCES match_centre(match_id) ON DELETE CASCADE,
  pos        smallint NOT NULL,
  name       text NOT NULL,
  dismissal  text NOT NULL DEFAULT 'not out',
  runs       integer NOT NULL DEFAULT 0,
  balls      integer NOT NULL DEFAULT 0,
  fours      integer NOT NULL DEFAULT 0,
  sixes      integer NOT NULL DEFAULT 0,
  PRIMARY KEY (match_id, pos)
);

CREATE TABLE bowling (
  match_id  text NOT NULL REFERENCES match_centre(match_id) ON DELETE CASCADE,
  pos       smallint NOT NULL,
  name      text NOT NULL,
  balls     integer NOT NULL DEFAULT 0,
  maidens   integer NOT NULL DEFAULT 0,
  runs      integer NOT NULL DEFAULT 0,
  wickets   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (match_id, pos)
);

CREATE TABLE commentary (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id    text NOT NULL REFERENCES match_centre(match_id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('ball','over')),
  over_label  text,                               -- '17.2' (type=ball)
  kind        text CHECK (kind IN ('dot','run','four','six','wicket','extra')),
  title       text,                               -- type=over
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX commentary_match_id_idx ON commentary (match_id, id DESC);

CREATE TABLE news (
  slug          text PRIMARY KEY,
  sport_id      text NOT NULL REFERENCES sports(id),
  title         text NOT NULL,
  excerpt       text NOT NULL DEFAULT '',
  body          text[] NOT NULL DEFAULT '{}',
  quote         text,
  author        text NOT NULL,
  read_mins     smallint NOT NULL DEFAULT 3,
  featured      boolean NOT NULL DEFAULT false,
  published_at  timestamptz NOT NULL
);
CREATE INDEX news_published_idx ON news (published_at DESC);
CREATE INDEX news_sport_idx ON news (sport_id);
