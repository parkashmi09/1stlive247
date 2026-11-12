"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { Featured, Match, Sport, SportId } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { SportIcon } from "../icons/SportIcon";
import { LeagueHeader, MatchCard, groupByLeague } from "../match-cards";
import { AdSlot } from "../AdSlot";
import { FeaturedSlider } from "./FeaturedSlider";
import { cx } from "../ui";

// Status tabs: equal-width pills; active = the More-page gold tile gradient. Mono solid icons take the tab's text colour.
const TABS = [
  { id: "top", label: "Top Events", icon: <path d="M12 2.6c.3 0 .6.2.7.5l2.3 4.9 5.3.6c.7.1 1 .9.5 1.4l-3.9 3.7 1 5.3c.1.7-.6 1.2-1.2.9L12 17.3l-4.7 2.6c-.6.3-1.3-.2-1.2-.9l1-5.3-3.9-3.7c-.5-.5-.2-1.3.5-1.4l5.3-.6 2.3-4.9c.1-.3.4-.5.7-.5Z" /> },
  { id: "live", label: "Live", icon: <path fillRule="evenodd" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-2 6.2v7.6a.6.6 0 0 0 .9.5l6-3.8a.6.6 0 0 0 0-1l-6-3.8a.6.6 0 0 0-.9.5Z" /> },
  { id: "upcoming", label: "Upcoming", icon: <path d="M13.5 2c.3 2.8 1.6 4.6 3.2 6.2 1.8 1.8 3.3 3.6 3.3 6.6A7.5 7.5 0 0 1 12.5 22 7.2 7.2 0 0 1 5 14.9c0-2.4 1.1-4.3 2.6-5.7.2 1.4.8 2.5 1.9 3.2.1-3.3 1.3-6.2 4-8.4Zm-1 9.5c-1.6 1.5-2.4 3-2.4 4.6a2.5 2.5 0 0 0 5 .1c0-1.3-.6-2.3-1.4-3.2-.4.6-.8 1-1.2 1.1 0-1 0-1.8 0-2.6Z" /> },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function HomeBoard({ sports, initial, featured, children }: { sports: Sport[]; initial: Match[]; featured: Featured[]; children?: ReactNode }) {
  const matches = useLiveMatches(initial);
  const [sport, setSport] = useState<SportId>("cricket"); // Home always opens on cricket, Top Events
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
                on ? "bg-brand gap-2 pl-4 pr-[17px] text-white" : "w-[34px] border border-line bg-surface text-[#98A3A6]")}>
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
              className={cx("flex h-9 min-w-0 items-center justify-center gap-1 rounded-full border px-1 text-[12px] font-bold whitespace-nowrap transition md:gap-1.5 md:text-[13px]",
                on ? "bg-gold bg-origin-border border-transparent text-[#5a3a05]" : "border-line bg-surface text-text-2")}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" aria-hidden>{t.icon}</svg>
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

