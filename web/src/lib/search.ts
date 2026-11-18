import type { Match, NewsArticle } from "@/data/types";

const hit = (text: string, q: string) => {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = text.toLowerCase();
  return words.length > 0 && words.every((w) => hay.includes(w));
};

const RANK: Record<Match["status"], number> = { live: 0, upcoming: 1, finished: 2 };

/** Matches whose teams or league contain every typed word; live first. */
export const searchMatches = (list: Match[], q: string) => list
  .filter((m) => hit(`${m.home.team.name} ${m.home.team.code} ${m.away.team.name} ${m.away.team.code} ${m.competition}`, q))
  .sort((a, b) => RANK[a.status] - RANK[b.status]);

export const searchNews = (list: NewsArticle[], q: string) => list.filter((a) => hit(a.title, q));
