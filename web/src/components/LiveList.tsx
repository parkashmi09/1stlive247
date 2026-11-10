"use client";

import { SPORTS } from "@/data/sports";
import type { Match } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { SportIcon } from "./icons/SportIcon";
import { MatchRow } from "./match-cards";

export function LiveList({ initial }: { initial: Match[] }) {
  const live = useLiveMatches(initial);
  if (!live.length) return <p className="py-10 text-center text-sm text-text-2">No live matches right now.</p>;
  return SPORTS.map((s) => {
    const list = live.filter((m) => m.sport === s.id);
    if (!list.length) return null;
    return (
      <section key={s.id} aria-labelledby={`h-${s.id}`} className="grid gap-2 lg:grid-cols-2 lg:gap-3">
        <h2 id={`h-${s.id}`} className="flex items-center gap-2 pt-1.5 text-xs font-bold uppercase text-primary lg:col-span-2">
          <SportIcon sport={s.id} size={18} />
          <span className="flex-1">{s.label}</span>
          <span className="font-normal normal-case text-text-2">{list.length} live</span>
        </h2>
        {list.map((m) => <MatchRow key={m.id} m={m} />)}
      </section>
    );
  });
}
