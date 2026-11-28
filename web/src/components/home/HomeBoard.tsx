"use client";

import { T } from "@/lib/i18n";
import Link from "next/link";
import { Fragment, useRef, useState, type ReactNode } from "react";
import type { Featured, Match, Sport, SportId } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { Icon } from "../icons/Icon";
import { SportIcon } from "../icons/SportIcon";
import { LeagueHeader, LiveGlassCard, MatchCard, groupByLeague } from "../match-cards";
import { AdSlot } from "../AdSlot";
import { FeaturedSlider } from "./FeaturedSlider";
import { cx } from "../ui";
import { useSportPrefs } from "@/lib/prefs";

// Status tabs (prototype pick "M5"): Live gets the wide slot with its count; picked Top/Upcoming go brand gold, picked Live goes red.
// Icons: MingCute live-fill (Apache-2.0), Phosphor clock-fill (MIT), designer gradient flame for Top (Figma 68:204), always full colour.
const TABS = [
  { id: "live", label: "Live", tint: "#ef4444", viewBox: "0 0 24 24", d: "M13.95 7H19c1.146.046 1.954.853 2 2v10c-.034.856-.535 1.621-1.368 1.898A2 2 0 0 1 19 21H5a2.1 2.1 0 0 1-.919-.223C3.403 20.426 3.03 19.747 3 19V9c.046-1.147.854-1.954 2-2h3.636L7.05 5.414c-.295-.338-.394-.795-.163-1.201c.133-.233.357-.405.616-.474c.359-.094.691.024.962.261l2.475 2.474a.51.51 0 0 0 .429.141a.5.5 0 0 0 .277-.141l3.889-3.888c.338-.295.795-.395 1.201-.163c.594.339.637 1.092.213 1.577Zm-3.678 4.015c-.276.062-.523.24-.668.484c-.35.588-.35 4.44 0 5.029c.183.307.523.504.88.509c.49.008 1.473-.579 1.897-.812a21 21 0 0 0 1.762-1.081c.2-.137.435-.276.592-.464a1.054 1.054 0 0 0 0-1.333c-.223-.267-.582-.461-.867-.65a21 21 0 0 0-2.195-1.267c-.301-.15-.636-.355-.97-.421a1 1 0 0 0-.431.006" },
  { id: "top", label: "Top", tint: "#F97316", viewBox: "0 0 20.6006 31.2508", fill: "url(#tab-flame)", d: "M6.44148 16.8298C5.26601 12.6055 5.80636 8.08794 7.94495 4.26013C8.93329 2.50739 9.92482 1.39314 11.3336 0C11.4003 1.00147 11.3847 2.01139 11.4689 3.01257C11.6685 5.38813 12.0885 7.65019 13.2813 9.74304C15.2677 13.2281 19.2664 15.2018 20.3117 19.2513C21.6424 24.2641 18.1732 28.4638 14.0576 30.8033C13.8347 30.9295 13.5211 31.1417 13.2909 31.2251L13.2393 31.1939C13.2406 31.1008 13.2982 31.032 13.3468 30.9554C14.8072 28.653 14.7262 26.1089 13.6179 23.7063C13.3927 24.6124 12.9878 25.5779 12.1569 26.0898C12.0242 26.1715 11.8827 26.2231 11.7435 26.2973L11.6826 26.2793C11.6339 26.1286 11.7655 25.8217 11.8034 25.6574C12.384 23.1379 11.3387 20.7304 9.87411 18.7264C9.72132 18.5173 9.53323 18.279 9.38717 18.0655C9.42761 18.4326 9.39354 18.9592 9.36198 19.3334C9.21801 21.0415 8.76789 22.8889 7.67298 24.2453C7.37132 24.619 7.05076 24.9324 6.74029 25.2938C6.58304 25.4769 6.3977 25.78 6.26439 25.99C5.18767 28.0251 6.07211 29.5841 7.28782 31.2508C4.79607 29.9404 2.40436 28.2487 0.975731 25.7415C0.0697934 24.1516 -0.272738 21.8373 0.237106 20.0724C0.268356 19.9315 0.300262 19.7617 0.350856 19.6289L0.384012 19.4491C0.98845 17.5958 1.90454 15.8593 3.09292 14.3141C3.19992 14.1722 3.62814 13.6222 3.7597 13.5682C3.86514 13.7446 3.97392 14.2876 4.0712 14.5162C4.44726 15.4001 4.87792 16.0014 5.7297 16.4828C5.98923 16.6295 6.21445 16.7088 6.44148 16.8298Z" },
  { id: "upcoming", label: "Upcoming", tint: "#2563eb", viewBox: "0 0 256 256", d: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m56 112h-56a8 8 0 0 1-8-8V72a8 8 0 0 1 16 0v48h48a8 8 0 0 1 0 16" },
] as const;
type TabId = (typeof TABS)[number]["id"] | "finished"; // "finished" is reached from the filter sheet

const MAIN = new Set<SportId>(["cricket", "football", "tennis", "racing", "basketball", "kabaddi", "f1"]);

const STATUSES: { id: TabId; label: string }[] = [
  { id: "top", label: "All" }, { id: "live", label: "Live" }, { id: "upcoming", label: "Upcoming" }, { id: "finished", label: "Finished" },
];

function Leagues({ matches, sport, ads }: { matches: Match[]; sport: SportId; ads?: boolean }) {
  const groups = groupByLeague(matches);
  return (
    <div className="md:columns-2 md:gap-3">
      {groups.map((g, gi) => (
        <Fragment key={g.name}>
          <section className="mb-4 flex break-inside-avoid flex-col gap-2">
            <LeagueHeader name={g.name} logo={g.logo} sport={sport} />
            {g.matches.map((m) => <MatchCard key={m.id} m={m} />)}
          </section>
          {ads && gi % 3 === 2 && gi < groups.length - 1 && <AdSlot placement="list-inline" className="mb-4 break-inside-avoid" />}
        </Fragment>
      ))}
    </div>
  );
}

export function HomeBoard({ sports: allSports, initial, featured, children }: { sports: Sport[]; initial: Match[]; featured: Featured[]; children?: ReactNode }) {
  const matches = useLiveMatches(initial);
  // Home opens on the visitor's first onboarding pick (cricket if none); their picks lead the tab row
  const prefs = useSportPrefs();
  const [picked, setSport] = useState<SportId | null>(null);
  const sport = picked ?? prefs?.[0] ?? "cricket";
  const count = (id: SportId) => matches.filter((m) => m.sport === id).length;
  const rank = (id: SportId) => { const i = prefs?.indexOf(id) ?? -1; return i < 0 ? 99 : i; };
  // slider order: the visitor's picks, then the main seven, then the rest by how much is on
  const sports = [...allSports].sort((a, b) => rank(a.id) - rank(b.id) || Number(!MAIN.has(a.id)) - Number(!MAIN.has(b.id)) || (MAIN.has(a.id) ? 0 : count(b.id) - count(a.id)));
  // client: the slider starts with the main sports + picks; "More" adds every other sport into the same horizontal slider
  const [showAll, setShowAll] = useState(false);
  const rowSports = showAll ? sports : sports.filter((s) => MAIN.has(s.id) || prefs?.includes(s.id) || s.id === sport);
  const hidden = sports.length - rowSports.length;
  const [tab, setTab] = useState<TabId>("top");

  const sheet = useRef<HTMLDialogElement>(null);

  const ofSport = matches.filter((m) => m.sport === sport);
  // Top Events: live in the "Live Match" carousel, then upcoming; finished get their own section so the 30-card cap can't push them out
  const top = tab === "top";
  const liveNow = top ? ofSport.filter((m) => m.status === "live").slice(0, 10) : [];
  const list = ofSport.filter((m) => m.status === (top ? "upcoming" : tab)).slice(0, 30);
  const finished = top ? ofSport.filter((m) => m.status === "finished").slice(0, 12) : [];
  const filtered = sport !== "cricket" || tab !== "top";

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 md:px-0 lg:pt-0">
      <div className="flex gap-2">
        <Link href="/search" className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full glass px-3.5 text-sm text-text-2">
          <Icon name="search" size={18} className="shrink-0" /><span className="truncate"><T>Search teams, leagues, news</T></span>
        </Link>
        <button type="button" aria-label="Filter sports" aria-haspopup="dialog" onClick={() => sheet.current?.showModal()}
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full glass text-text-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>
          {filtered && <span className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-live ring-2 ring-surface" />}
        </button>
      </div>

      <dialog ref={sheet} aria-label="Filter sports" onClick={(e) => { if (e.target === e.currentTarget) sheet.current?.close(); }}
        className="mx-auto mb-0 mt-auto max-h-[88dvh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-surface-solid text-text backdrop:bg-black/50 md:m-auto md:rounded-2xl">
        <div className="flex flex-col gap-4 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold"><T>Filter</T></h2>
            <button type="button" onClick={() => { setSport(null); setTab("top"); }} className="text-sm font-semibold text-accent"><T>Reset</T></button>
          </div>
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-text-2"><T>Sport</T></legend>
            {[...sports].sort((a, b) => Number(!count(a.id)) - Number(!count(b.id))).map((s) => {
              const n = count(s.id);
              return (
                <button key={s.id} type="button" disabled={!n} aria-pressed={s.id === sport} onClick={() => { setSport(s.id); sheet.current?.close(); }}
                  className={cx("flex h-11 min-w-0 items-center gap-2 rounded-xl border px-3 text-[13px] font-semibold disabled:opacity-45",
                    s.id === sport ? "bg-brand bg-origin-border border-transparent text-white" : "glass")}>
                  <SportIcon sport={s.id} size={16} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-left"><T>{s.label}</T></span>
                  <span className="text-[11px] font-bold tabular-nums opacity-70">{n || "Soon"}</span>
                </button>
              );
            })}
          </fieldset>
          <fieldset className="grid grid-cols-4 gap-2">
            <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-text-2"><T>Status</T></legend>
            {STATUSES.map((s) => (
              <button key={s.id} type="button" aria-pressed={s.id === tab} onClick={() => setTab(s.id)}
                className={cx("h-9 min-w-0 rounded-full border text-[12px] font-bold", s.id === tab ? "bg-gold bg-origin-border border-transparent text-[#5a3a05]" : "glass text-text-2")}>
                <T>{s.label}</T>
              </button>
            ))}
          </fieldset>
          <button type="button" onClick={() => sheet.current?.close()} className="bg-brand h-11 rounded-full text-sm font-bold text-white">
            Show {liveNow.length + list.length + finished.length} matches
          </button>
        </div>
      </dialog>

    {/* phone: one column; desktop: match board left, banner + side widgets right */}
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1">
        <FeaturedSlider initial={featured} />
        {children}
        <AdSlot placement="side" />
      </aside>

      <section className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1">

      <div role="tablist" aria-label="Sport" className="no-scrollbar -mx-4 -my-5 flex gap-2 overflow-x-auto px-4 py-5 md:mx-0 md:px-0">
        {rowSports.map((s) => {
          const on = s.id === sport;
          return (
            <button key={s.id} role="tab" aria-selected={on} aria-label={s.label} onClick={() => setSport(s.id)}
              className={cx("relative flex h-10 shrink-0 items-center justify-center gap-2 rounded-full pl-3.5 pr-4 transition-all active:translate-y-px",
                on ? "gel-pill-on" : "gel-pill")}>
              {/* wet highlight across the top half */}
              <span className={cx("relative flex", on ? "gel-icon-on" : "gel-icon")}>
                <SportIcon sport={s.id} size={19} />
              </span>
              <span className="relative text-[13px] font-semibold"><T>{s.label}</T></span>
            </button>
          );
        })}
        {(hidden > 0 || showAll) && (
          <button type="button" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}
            className="gel-pill relative flex h-10 shrink-0 items-center justify-center gap-2 rounded-full pl-3.5 pr-4 transition-all active:translate-y-px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="gel-icon relative">
              {showAll
                ? <path d="M7 12a1.6 1.6 0 0 1 1.6-1.6h6.8a1.6 1.6 0 0 1 0 3.2H8.6A1.6 1.6 0 0 1 7 12Z" />
                : <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><path d="M17.25 13a1.4 1.4 0 0 1 1.4 1.4v1.45h1.45a1.4 1.4 0 0 1 0 2.8h-1.45v1.45a1.4 1.4 0 0 1-2.8 0v-1.45H14.4a1.4 1.4 0 0 1 0-2.8h1.45V14.4a1.4 1.4 0 0 1 1.4-1.4Z" /></>}
            </svg>
            <span className="relative text-[13px] font-semibold"><T>{showAll ? "Less" : "More"}</T></span>
            {!showAll && <span className="relative rounded-full bg-surface-2 px-1.5 text-[10px] font-bold tabular-nums">+{hidden}</span>}
          </button>
        )}
      </div>

      <div role="tablist" aria-label="Events" className="grid grid-cols-[1.5fr_1fr_1fr] gap-2">
        {TABS.map((t) => {
          const on = tab === t.id, live = t.id === "live";
          const n = live ? ofSport.filter((m) => m.status === "live").length : 0;
          return (
            <button key={t.id} role="tab" aria-selected={on} onClick={() => setTab(t.id)}
              className={cx("flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl px-1 text-[12px] font-bold whitespace-nowrap transition md:text-[13px]",
                !on ? "glass text-text-2" : live ? "bg-[linear-gradient(135deg,#ef4444,#b91c1c)] text-white shadow-[0_8px_18px_rgb(239_68_68/0.33)]" : "bg-gold text-[#5a3a05] shadow-[0_8px_18px_rgb(180_130_30/0.35)]")}>
              <span className="relative flex shrink-0" style={{ color: on ? undefined : t.tint }}>
                {live && n > 0 && <span aria-hidden className="absolute inset-0 animate-ping rounded-full border-2 border-current opacity-40" />}
                <svg viewBox={t.viewBox} className={cx(live || "fill" in t ? "size-5" : "size-4", "fill" in t && "drop-shadow-[0_1px_1.5px_rgb(90_58_5/0.55)]")} aria-hidden>
                  {"fill" in t && <defs><linearGradient id="tab-flame" x1="14.1476" y1="-2.26438" x2="1.98758" y2="26.5356" gradientUnits="userSpaceOnUse"><stop stopColor="#F0483B" /><stop offset="1" stopColor="#FCA82E" /></linearGradient></defs>}
                  <path fill={"fill" in t ? t.fill : "currentColor"} d={t.d} {...("fill" in t && { stroke: "#fff", strokeWidth: 1.6, paintOrder: "stroke" })} />
                </svg>
              </span>
              {live ? (
                <span className="flex min-w-0 flex-col items-start leading-tight">
                  <span className="tabular-nums">{n} <T>{n === 1 ? "match" : "matches"}</T></span>
                  <span className="text-[10px] uppercase opacity-80"><T>Live now</T></span>
                </span>
              ) : <T>{t.label}</T>}
            </button>
          );
        })}
      </div>

      {liveNow.length + list.length + finished.length === 0 && <p className="py-10 text-center text-sm text-text-2"><T>{ofSport.length ? "No events right now." : "Coming soon."}</T></p>}
      {liveNow.length > 0 && (
        <section aria-labelledby="h-live-now" className="flex flex-col gap-2.5">
          <h2 id="h-live-now" className="px-1 text-[17px] font-bold"><T>Live Match</T> ({liveNow.length})</h2>
          {/* padded scroller (cancelled by negative margins) so the card shadows aren't clipped into a hard edge */}
          <div className="no-scrollbar -mx-4 -my-4 flex snap-x gap-3 overflow-x-auto px-4 py-4 pb-9 -mb-7 md:-mx-4 md:px-4">
            {liveNow.map((m) => <LiveGlassCard key={m.id} m={m} />)}
          </div>
        </section>
      )}
      {top && list.length > 0 && <h2 className="-mb-2 px-1 text-[17px] font-bold"><T>Upcoming</T> ({list.length})</h2>}
      <Leagues matches={list} sport={sport} ads />
      {finished.length > 0 && (
        <section aria-labelledby="h-finished" className="flex flex-col gap-3">
          <h2 id="h-finished" className="flex items-center gap-2 px-1 text-[15px] font-extrabold uppercase tracking-wide">
            <T>Finished</T> <span className="rounded-full glass px-2 py-0.5 text-[11px] font-semibold text-text-2 ring-1 ring-line">{finished.length}</span>
          </h2>
          <Leagues matches={finished} sport={sport} />
        </section>
      )}
      </section>
    </div>
    </div>
  );
}

