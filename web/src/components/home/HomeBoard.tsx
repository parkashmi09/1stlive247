"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { Featured, Match, Sport, SportId } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { SportIcon } from "../icons/SportIcon";
import { LeagueHeader, MatchCard, groupByLeague } from "../match-cards";
import { AdSlot } from "../AdSlot";
import { FeaturedSlider } from "./FeaturedSlider";
import { cx } from "../ui";

const TABS = [
  { id: "top", label: "Top Events" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "finished", label: "Finished" },
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

