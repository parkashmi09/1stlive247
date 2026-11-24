"use client";

import { T, useT } from "@/lib/i18n";
import { useState } from "react";
import type { Match, NewsArticle } from "@/data/types";
import { searchMatches, searchNews } from "@/lib/search";
import { Icon } from "./icons/Icon";
import { MatchCard } from "./match-cards";
import { NewsRow } from "./news";

export function SearchBoard({ matches, news }: { matches: Match[]; news: NewsArticle[] }) {
  const t = useT();
  const [q, setQ] = useState("");
  const typed = q.trim().length > 0;
  const foundMatches = searchMatches(matches, q).slice(0, 40);
  const foundNews = searchNews(news, q);

  return (
    <>
      <label className="flex h-11 items-center gap-2 rounded-full glass px-3.5 focus-within:border-cyan">
        <Icon name="search" size={18} className="shrink-0 text-text-2" />
        <span className="sr-only"><T>Search teams, leagues, news</T></span>
        <input type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search teams, leagues, news")}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-2" />
      </label>

      {!typed && <p className="py-10 text-center text-sm text-text-2"><T>Type a team, league or headline.</T></p>}
      {typed && !foundMatches.length && !foundNews.length && <p className="py-10 text-center text-sm text-text-2">No matches found for &ldquo;{q.trim()}&rdquo;.</p>}

      {foundMatches.length > 0 && (
        <section aria-labelledby="h-found-matches" className="flex flex-col gap-2">
          <h2 id="h-found-matches" className="px-1 text-sm font-bold"><T>Matches</T></h2>
          <div className="grid gap-2 md:grid-cols-2 md:gap-3">{foundMatches.map((m) => <MatchCard key={m.id} m={m} />)}</div>
        </section>
      )}
      {foundNews.length > 0 && (
        <section aria-labelledby="h-found-news" className="flex flex-col gap-1">
          <h2 id="h-found-news" className="px-1 text-sm font-bold"><T>News</T></h2>
          {foundNews.map((a) => <NewsRow key={a.slug} a={a} />)}
        </section>
      )}
    </>
  );
}
