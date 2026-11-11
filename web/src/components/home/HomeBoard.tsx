"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { Featured, Match, Sport, SportId } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { SportIcon } from "../icons/SportIcon";
import { LeagueHeader, MatchCard, groupByLeague } from "../match-cards";
import { AdSlot } from "../AdSlot";
import { FeaturedSlider } from "./FeaturedSlider";
import { cx } from "../ui";

// Status tabs: equal-width pills with always-coloured icons (user picked this over the segmented pill).
const TABS = [
  { id: "top", label: "Top Events", color: "text-[#D9AB4B]", icon: <path d="M12 3.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { id: "live", label: "Live", color: "text-[#22c55e]", icon: <><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M10 8.5v7l5.5-3.5z" fill="#fff" /></> },
  { id: "upcoming", label: "Upcoming", color: "text-[#f97316]", icon: <path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 .5-6 1-9.5z" fill="currentColor" /> },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function HomeBoard({ sports, initial, featured, children }: { sports: Sport[]; initial: Match[]; featured: Featured[]; children?: ReactNode }) {
  const matches = useLiveMatches(initial);
  const [sport, setSport] = useState<SportId>("football"); // Home always opens on football
  const [tab, setTab] = useState<TabId>("top");

  const list = matches.filter((m) =>
    m.sport === sport && (tab === "top" || m.status === tab),
  ).slice(0, 30);
  const groups = groupByLeague(list);

  return (
    // phone: one column; desktop: match board left, banner + side widgets right
    <div className="flex flex-col gap-4 px-4 pt-2 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start md:px-0 lg:gap-6 lg:pt-0">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1">
        <FeaturedSlider initial={featured} />
        {children}
        <AdSlot placement="side" />
      </aside>

      <section className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1">

      <div role="tablist" aria-label="Sport" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {sports.map((s) => {
          const on = s.id === sport;
          return (
            <button key={s.id} role="tab" aria-selected={on} aria-label={s.label} onClick={() => setSport(s.id)}
              className={cx("flex h-[34px] shrink-0 items-center justify-center rounded-full transition-all",
                on ? "bg-brand gap-2 pl-4 pr-[17px] text-white shadow-[0_3px_10px_rgb(1_44_120/0.28)]" : "w-[34px] border border-line bg-surface text-[#98A3A6]")}>
              <SportIcon sport={s.id} size={17} />
              {on && <span className="text-[13px] font-semibold">{s.label}</span>}
            </button>
          );
        })}
      </div>

      <div role="tablist" aria-label="Events" className="grid grid-cols-3 gap-2">
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} role="tab" aria-selected={on} onClick={() => setTab(t.id)}
              className={cx("flex h-9 min-w-0 items-center justify-center gap-1 rounded-full border px-1 text-[12px] font-semibold whitespace-nowrap transition md:gap-1.5 md:text-[13px]",
                on ? "bg-brand bg-origin-border border-transparent text-white shadow-[0_3px_10px_rgb(1_44_120/0.28)]" : "border-line bg-surface text-text")}>
              <svg viewBox="0 0 24 24" className={cx("size-4 shrink-0", t.color)} aria-hidden>{t.icon}</svg>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="md:columns-2 md:gap-3">
        {list.length === 0 && <p className="py-10 text-center text-sm text-text-2">No events right now.</p>}
        {groups.map((g, gi) => (
          <Fragment key={g.name}>
            <section className="mb-4 flex break-inside-avoid flex-col gap-2">
              <LeagueHeader name={g.name} logo={g.logo} sport={sport} count={g.matches.length} />
              {g.matches.map((m) => <MatchCard key={m.id} m={m} />)}
            </section>
            {gi % 3 === 2 && gi < groups.length - 1 && <AdSlot placement="list-inline" className="mb-4 break-inside-avoid" />}
          </Fragment>
        ))}
      </div>
      </section>
    </div>
  );
}

