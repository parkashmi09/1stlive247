"use client";

import { useState } from "react";
import type { Featured, Match, Sport, SportId } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { SportIcon } from "../icons/SportIcon";
import { MatchCard } from "../match-cards";
import { FeaturedSlider } from "./FeaturedSlider";
import { cx } from "../ui";

const TABS = [
  { id: "top", label: "Top Events" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function HomeBoard({ sports, initial, featured }: { sports: Sport[]; initial: Match[]; featured: Featured[] }) {
  const matches = useLiveMatches(initial);
  const [sport, setSport] = useState<SportId>("football"); // Home always opens on football
  const [tab, setTab] = useState<TabId>("top");

  const list = matches.filter((m) =>
    m.sport === sport && (tab === "top" || (tab === "live" ? m.status === "live" : m.status === "upcoming")),
  ).slice(0, 30);

  return (
    <div className="flex flex-col gap-4 px-4 pt-2">
      <FeaturedSlider initial={featured} />

      <div role="tablist" aria-label="Sport" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {sports.map((s) => {
          const on = s.id === sport;
          return (
            <button key={s.id} role="tab" aria-selected={on} aria-label={s.label} onClick={() => setSport(s.id)}
              className={cx("flex h-12 shrink-0 items-center justify-center rounded-full transition-all",
                on ? "border-gold gap-3 pl-[23px] pr-6" : "w-12 border border-line bg-surface text-[#98A3A6]")}>
              <SportIcon sport={s.id} active={on} />
              {on && <span className="text-gold text-lg font-semibold">{s.label}</span>}
            </button>
          );
        })}
      </div>

      <div role="tablist" aria-label="Events" className="flex rounded-full bg-surface-2 p-0.5">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={cx("flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition",
              tab === t.id ? "bg-brand text-white" : "text-text-2")}>
            {t.id === "live" && <span className="size-1 rounded-full bg-current" />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {list.length === 0 && <p className="py-10 text-center text-sm text-text-2">No events right now.</p>}
        {list.map((m) => <MatchCard key={m.id} m={m} />)}
      </div>
    </div>
  );
}

