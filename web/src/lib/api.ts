// REST client for the 1stLive247 backend. Responses are uncached: live data is read at request time.
import { cacheLife } from "next/cache";
import { API_URL } from "./config";
import type { Featured, Match, MatchCentre, MatchInsights, MatchStatus, NewsArticle, SportId, StatGroup } from "@/data/types";


async function get<T>(path: string): Promise<T>;
async function get<T>(path: string, opts: { allow404: true }): Promise<T | undefined>;
async function get<T>(path: string, opts?: { allow404: true }) {
  const r = await fetch(`${API_URL}/api/v1${path}`, { cache: "no-store" });
  if (r.status === 404 && opts?.allow404) return undefined;
  if (!r.ok) throw new Error(`API ${r.status} on ${path}`);
  return ((await r.json()) as { data: T }).data;
}

const qs = (o: Record<string, string | undefined>) => {
  const p = new URLSearchParams(Object.entries(o).filter((e): e is [string, string] => !!e[1]));
  return p.size ? `?${p}` : "";
};

export const api = {
  featured: () => get<Featured[]>("/featured"),
  matches: (f: { status?: MatchStatus; sport?: SportId } = {}) => get<Match[]>(`/matches${qs(f)}`),
  match: (id: string) => get<Match>(`/matches/${encodeURIComponent(id)}`, { allow404: true }),
  centre: (id: string) => get<MatchCentre>(`/matches/${encodeURIComponent(id)}/centre`, { allow404: true }),
  insights: async (id: string) => {
    const path = `/matches/${encodeURIComponent(id)}`;
    // shortcut: falls back to the old /stats endpoint until the /insights backend is deployed; delete after deploy
    return (await get<MatchInsights>(`${path}/insights`, { allow404: true }))
      ?? (await get<StatGroup[]>(`${path}/stats`, { allow404: true }).then((g) => g && { periods: [{ name: "Match", groups: g }], timeline: [], momentum: [], info: [] }));
  },
  news: (f: { sport?: SportId } = {}) => get<NewsArticle[]>(`/news${qs(f)}`),
  article: (slug: string) => get<NewsArticle>(`/news/${encodeURIComponent(slug)}`, { allow404: true }),
};

/** Titles for <head>: cached so metadata doesn't block the static shell (names rarely change). */
export async function matchTitle(id: string) {
  "use cache";
  cacheLife("minutes");
  const m = await api.match(id);
  return m ? `${m.home.team.name} vs ${m.away.team.name}` : "Match";
}

export async function articleMeta(slug: string) {
  "use cache";
  cacheLife("minutes");
  const a = await api.article(slug);
  return { title: a?.title ?? "News", description: a?.excerpt };
}
