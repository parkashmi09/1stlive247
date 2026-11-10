"use client";

import { useState, type ReactNode } from "react";
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

export function HomeBoard({ sports, initial, featured, children }: { sports: Sport[]; initial: Match[]; featured: Featured[]; children?: ReactNode }) {
  const matches = useLiveMatches(initial);
  const [sport, setSport] = useState<SportId>("football"); // Home always opens on football
  const [tab, setTab] = useState<TabId>("top");

  const list = matches.filter((m) =>
    m.sport === sport && (tab === "top" || (tab === "live" ? m.status === "live" : m.status === "upcoming")),
  ).slice(0, 30);

  return (
    // phone: one column; desktop: match board left, banner + side widgets right
    <div className="flex flex-col gap-4 px-4 pt-2 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6 lg:px-0 lg:pt-0">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1">
        <FeaturedSlider initial={featured} />
        {children}
      </aside>

      <section className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1">

      <div role="tablist" aria-label="Sport" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {sports.map((s) => {
          const on = s.id === sport;
          return (
            <button key={s.id} role="tab" aria-selected={on} aria-label={s.label} onClick={() => setSport(s.id)}
              className={cx("flex h-12 shrink-0 items-center justify-center rounded-full transition-all",
                on ? "bg-brand gap-3 pl-[23px] pr-6 text-white shadow-[0_4px_14px_rgb(1_44_120/0.28)]" : "w-12 border border-line bg-surface text-[#98A3A6]")}>
              <SportIcon sport={s.id} />
              {on && <span className="text-lg font-semibold">{s.label}</span>}
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

      <div className="grid gap-2 lg:grid-cols-2 lg:gap-3">
        {list.length === 0 && <p className="py-10 text-center text-sm text-text-2 lg:col-span-2">No events right now.</p>}
        {list.map((m) => <MatchCard key={m.id} m={m} />)}
      </div>
      </section>
    </div>
  );
}

