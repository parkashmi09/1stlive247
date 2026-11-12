"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { Featured, Match, Sport, SportId } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { SportIcon } from "../icons/SportIcon";
import { LeagueHeader, MatchCard, groupByLeague } from "../match-cards";
import { AdSlot } from "../AdSlot";
import { FeaturedSlider } from "./FeaturedSlider";
import { cx } from "../ui";

// Status tabs: equal-width pills with always-coloured icons. Star + flame are the designer's vectors (Figma 68:193 / 68:204).
const TABS = [
  { id: "top", label: "Top Events", viewBox: "0 0 25.8867 24.6818", icon: <path d="M12.7366 0.01411C13.0577 -0.0326744 13.268 0.0320975 13.4823 0.280551C13.8093 0.659516 13.96 1.2825 14.1625 1.74248C14.413 2.31169 16.8724 8.08707 16.9092 8.1101C17.0252 8.18272 18.6334 8.27701 18.8863 8.29594C20.0458 8.38285 21.2038 8.53069 22.3625 8.63091C22.8697 8.67476 23.3764 8.73498 23.8829 8.77616C24.3045 8.81044 24.73 8.81669 25.1482 8.88707C25.3014 8.91285 25.4463 8.95832 25.578 9.04232C25.7261 9.13673 25.832 9.26822 25.8701 9.44135C25.901 9.58176 25.8922 9.73044 25.8133 9.85335C25.5117 10.323 24.6804 10.9278 24.2453 11.3127L20.5285 14.5823C20.219 14.8551 19.6616 15.2946 19.4096 15.6174C19.309 15.7463 19.5717 16.6208 19.6223 16.8277C19.7034 17.1587 19.7876 17.5288 19.8652 17.8721L20.9412 22.6423C21.1388 23.5131 21.5783 24.4212 20.4378 24.6731C18.9353 23.8917 17.1077 22.7315 15.6214 21.8497L14.0616 20.9279C13.769 20.7563 13.348 20.5344 13.0936 20.3301C13.0447 20.3046 12.9746 20.2608 12.9196 20.2904C12.4304 20.5542 11.954 20.8586 11.4772 21.1443L7.68661 23.3919C7.15508 23.7093 5.91108 24.5077 5.41014 24.6818C5.01148 24.5788 4.63798 24.3984 4.71636 23.9015C4.86858 22.9365 5.11105 21.9719 5.32608 21.0169L6.54961 15.6246L2.83201 12.3543C1.99195 11.6256 1.14626 10.9018 0.327046 10.149C-0.0136135 9.83591 -0.146717 9.49154 0.216046 9.12357C0.300483 9.03794 0.386015 8.95638 0.508983 8.92735C1.13839 8.80385 1.80411 8.77726 2.44539 8.71888L6.7088 8.32069C7.2208 8.27404 8.44011 8.20223 8.91836 8.10654C9.17217 7.76276 9.5202 6.87513 9.70339 6.44919L11.467 2.34316C11.7425 1.70002 12.0472 0.894369 12.3974 0.29581C12.4792 0.155954 12.5962 0.0890256 12.7366 0.01411Z" fill="#FFD65F" /> },
  { id: "live", label: "Live", viewBox: "0 0 24 24", icon: <><circle cx="12" cy="12" r="10" fill="#22c55e" /><path d="M10 8.5v7l5.5-3.5z" fill="#fff" /></> },
  { id: "upcoming", label: "Upcoming", viewBox: "0 0 20.6006 31.2508", icon: <><path d="M6.44148 16.8298C5.26601 12.6055 5.80636 8.08794 7.94495 4.26013C8.93329 2.50739 9.92482 1.39314 11.3336 0C11.4003 1.00147 11.3847 2.01139 11.4689 3.01257C11.6685 5.38813 12.0885 7.65019 13.2813 9.74304C15.2677 13.2281 19.2664 15.2018 20.3117 19.2513C21.6424 24.2641 18.1732 28.4638 14.0576 30.8033C13.8347 30.9295 13.5211 31.1417 13.2909 31.2251L13.2393 31.1939C13.2406 31.1008 13.2982 31.032 13.3468 30.9554C14.8072 28.653 14.7262 26.1089 13.6179 23.7063C13.3927 24.6124 12.9878 25.5779 12.1569 26.0898C12.0242 26.1715 11.8827 26.2231 11.7435 26.2973L11.6826 26.2793C11.6339 26.1286 11.7655 25.8217 11.8034 25.6574C12.384 23.1379 11.3387 20.7304 9.87411 18.7264C9.72132 18.5173 9.53323 18.279 9.38717 18.0655C9.42761 18.4326 9.39354 18.9592 9.36198 19.3334C9.21801 21.0415 8.76789 22.8889 7.67298 24.2453C7.37132 24.619 7.05076 24.9324 6.74029 25.2938C6.58304 25.4769 6.3977 25.78 6.26439 25.99C5.18767 28.0251 6.07211 29.5841 7.28782 31.2508C4.79607 29.9404 2.40436 28.2487 0.975731 25.7415C0.0697934 24.1516 -0.272738 21.8373 0.237106 20.0724C0.268356 19.9315 0.300262 19.7617 0.350856 19.6289L0.384012 19.4491C0.98845 17.5958 1.90454 15.8593 3.09292 14.3141C3.19992 14.1722 3.62814 13.6222 3.7597 13.5682C3.86514 13.7446 3.97392 14.2876 4.0712 14.5162C4.44726 15.4001 4.87792 16.0014 5.7297 16.4828C5.98923 16.6295 6.21445 16.7088 6.44148 16.8298Z" fill="url(#tab-flame)" /><defs><linearGradient id="tab-flame" x1="14.1476" y1="-2.26438" x2="1.98758" y2="26.5356" gradientUnits="userSpaceOnUse"><stop stopColor="#F0483B" /><stop offset="1" stopColor="#FCA82E" /></linearGradient></defs></> },
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
              className={cx("flex h-9 min-w-0 items-center justify-center gap-1 rounded-full border px-1 text-[12px] font-semibold whitespace-nowrap transition md:gap-1.5 md:text-[13px]",
                on ? "bg-brand bg-origin-border border-transparent text-white" : "border-line bg-surface text-text")}>
              <svg viewBox={t.viewBox} className="h-4 w-auto shrink-0" aria-hidden>{t.icon}</svg>
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

