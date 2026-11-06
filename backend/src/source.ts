// Where matches come from. Real: Sports API (all sports but cricket) + Cricbuzz (cricket). Demo: Postgres + mock engine.
import { isCricbuzzId, type CricketFeed } from "./feed/cricbuzz.ts";
import type { FeedStore } from "./feed/store.ts";
import { getCentre, getMatch, listMatches } from "./repo/read.ts";
import type { Match, MatchCentre, MatchStatus, SportId } from "./types.ts";

export interface MatchSource {
  list(f?: { status?: MatchStatus; sport?: SportId }): Promise<Match[]>;
  get(id: string): Promise<Match | undefined>;
  centre(id: string): Promise<MatchCentre | undefined>;
}

export const dbSource: MatchSource = { list: (f) => listMatches(f), get: (id) => getMatch(id), centre: (id) => getCentre(id) };

const filter = (ms: Match[], f: { status?: MatchStatus; sport?: SportId } = {}) =>
  ms.filter((m) => (!f.status || m.status === f.status) && (!f.sport || m.sport === f.sport));

export const feedSource = (store?: FeedStore, cricket?: CricketFeed): MatchSource => ({
  async list(f) {
    const all = [...(store?.list(f) ?? []), ...filter(cricket?.list() ?? [], f)];
    return all.sort((a, b) => Number(b.status === "live") - Number(a.status === "live") || a.start.localeCompare(b.start));
  },
  async get(id) { return isCricbuzzId(id) ? cricket?.get(id) : store?.get(id); },
  async centre(id) { return isCricbuzzId(id) ? cricket?.centre(id) : undefined; },
});
