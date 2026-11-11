"use client";
// Live page, broadcast-scoreboard style: compact hero with per-sport live counts (filter), navy competition strips, rows with a red live bar and large tabular scores.

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, type ReactNode } from "react";
import { SPORTS } from "@/data/sports";
import type { Match, Side, SportId } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { AdSlot } from "./AdSlot";
import { SportIcon } from "./icons/SportIcon";
import { LiveClock } from "./LiveClock";
import { LeagueHeader, groupByLeague } from "./match-cards";
import { ScorePop } from "./ScorePop";
import { TeamBadge, cx } from "./ui";

// Chip icons from the user's hero-assets zip (24×24 line art, stroke 1.6). currentColor so the active chip turns navy.
const CHIP_ICON: Record<string, ReactNode> = {
  all: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  cricket: <><path d="m14 3 3 3-8.5 12-4-4Z" /><path d="m15.5 4.5 3-3M5.7 15.7l-2 2" /><circle cx="18" cy="18" r="3" /><path d="m16.5 15.4 3 5.2" /></>,
  football: <><circle cx="12" cy="12" r="9" /><path d="m12 7 4.8 3.5-1.8 5.6H9l-1.8-5.6ZM12 7V3m4.8 7.5 3.8-1.3M15 16.1l2.4 3.2M9 16.1l-2.4 3.2m.6-8.8L3.4 9.2" /></>,
  tennis: <g transform="rotate(35 12 12)"><ellipse cx="12" cy="8" rx="5.5" ry="7" /><path d="M9 2.2v11.6M12 1v14m3-12.8v11.6M7 5h10M6.5 8h11M7 11h10m-8 2.9 3 4.1 3-4.1M12 18v5" /></g>,
};
const ChipIcon = ({ id, size = 18 }: { id: string; size?: number }) => CHIP_ICON[id]
  ? <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{CHIP_ICON[id]}</svg>
  : null;

const lead = (a?: string, b?: string) => (parseFloat(a ?? "") || 0) > (parseFloat(b ?? "") || 0);

/** Scoreboard row: red live bar, crests, names, fixed score column; status + note in a tinted footer line. */
function LiveRow({ m }: { m: Match }) {
  const team = (s: Side, other: Side) => {
    const ahead = lead(s.score, other.score);
    return (
      <div className="flex items-center gap-2.5">
        <TeamBadge code={s.team.code} tone={s.team.tone} logo={s.team.logo} size={26} />
        <span className={cx("min-w-0 flex-1 truncate text-[15px]", ahead ? "font-bold" : "font-medium")}>{s.team.name}</span>
        {s.detail && <span className="text-[11px] text-text-2 tabular-nums">{s.detail}</span>}
        <span className="flex w-[72px] items-center justify-end gap-1.5">
          {ahead && <span className="size-1.5 rounded-full bg-[var(--gold-mid)]" aria-hidden />}
          {/^\d|\//.test(s.score ?? "")
            ? <ScorePop value={s.score!} className={cx("text-right text-[19px] leading-none tabular-nums", ahead ? "font-black text-deep dark:text-white" : "font-bold text-text-2")} />
            : <span className="text-xs font-semibold text-text-2">{s.score}</span>}
        </span>
      </div>
    );
  };
  return (
    <li>
      <Link href={`/match/${m.id}`} className="group relative block transition hover:bg-[rgb(52_196_238/0.06)]">
        <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-live shadow-[0_0_8px_rgb(216_6_18/0.6)]" />
        <div className="flex flex-col gap-2 py-3 pl-5 pr-4">
          {team(m.home, m.away)}
          {team(m.away, m.home)}
        </div>
        <p className="flex items-center gap-2 bg-live/[0.05] py-1.5 pl-5 pr-4 text-[11px] dark:bg-live/10">
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-live px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <span className="size-1.5 rounded-full bg-white motion-safe:animate-pulse" />
            {m.timer || m.clock ? <LiveClock timer={m.timer} fallback={m.clock} /> : "Live"}
          </span>
          {m.note && <span className="truncate font-semibold text-[#8F6619] dark:text-[var(--gold-light)]">{m.note}</span>}
        </p>
      </Link>
    </li>
  );
}

function LeagueCard({ name, logo, sport, matches }: { name: string; logo?: string; sport: SportId; matches: Match[] }) {
  return (
    <section className="card-premium mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_4px_16px_rgb(10_31_74/0.06)]">
      <LeagueHeader name={name} logo={logo} sport={sport} count={matches.length} className="border-b border-line border-l-[3px] border-l-[var(--gold-mid)] bg-surface px-4 py-2.5" />
      <ul className="divide-y divide-line">{matches.map((m) => <LiveRow key={m.id} m={m} />)}</ul>
    </section>
  );
}

export function LiveList({ initial }: { initial: Match[] }) {
  const live = useLiveMatches(initial);
  const [only, setOnly] = useState<SportId | "all">("all");
  const counts = SPORTS.map((s) => ({ s, n: live.filter((m) => m.sport === s.id).length })).filter((x) => x.n);
  const shown = only === "all" ? counts : counts.filter((x) => x.s.id === only);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-deep px-4 pb-3 pt-3.5 text-white shadow-raised">
        {/* user-supplied hero artwork (public/banners/live-hero.webp): navy/cyan gradient with faint sport line-art */}
        <Image src="/banners/live-hero.webp" alt="" fill sizes="(min-width: 1024px) 860px, 100vw" priority className="object-cover object-left" />
        <div className="relative flex items-baseline gap-2">
          <span className="relative mb-[3px] flex size-2.5 self-center"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff4d57] opacity-70" /><span className="relative inline-flex size-2.5 rounded-full bg-[#ff3341]" /></span>
          <h2 className="text-[17px] font-extrabold tracking-tight">Live now</h2>
          <span className="text-gold ml-auto text-[28px] font-black leading-none tabular-nums">{live.length}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">matches</span>
        </div>
        <div role="tablist" aria-label="Filter by sport" className="no-scrollbar relative -mx-4 mt-3 flex gap-3 overflow-x-auto px-4">
          {[{ id: "all" as const, label: "All", n: live.length }, ...counts.map(({ s, n }) => ({ id: s.id, label: s.label, n }))].map((c) => {
            const on = only === c.id;
            return (
              // chip spec from the user's zip: 36pt, fully rounded; active = white + navy text + navy count pill;
              // inactive = 12% white fill, 25% white border, 20% white count pill
              <button key={c.id} role="tab" aria-selected={on}
                onClick={(e) => { setOnly(c.id); e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }}
                className={cx("flex h-9 shrink-0 items-center gap-2 rounded-full border pl-3 pr-1.5 text-[12px] font-bold transition",
                  on ? "border-white bg-white text-deep" : "border-white/25 bg-white/12 text-white hover:bg-white/20")}>
                {CHIP_ICON[c.id] ? <ChipIcon id={c.id} /> : <SportIcon sport={c.id as SportId} size={16} />}
                {c.label}
                <span className={cx("flex h-[22px] min-w-[27px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums", on ? "bg-deep text-white" : "bg-white/20 text-white")}>{c.n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!live.length && <p className="py-10 text-center text-sm text-text-2">No live matches right now.</p>}

      {shown.map(({ s, n }) => (
        <section key={s.id} aria-labelledby={`h-${s.id}`} className="flex flex-col gap-3 pt-2">
          <h2 id={`h-${s.id}`} className="flex items-center gap-2 px-1">
            <SportIcon sport={s.id} size={18} className="text-deep dark:text-cyan" />
            <span className="text-[15px] font-extrabold uppercase tracking-wide">{s.label}</span>
            <span className="rounded-full bg-live/10 px-2 py-0.5 text-[11px] font-bold text-live">{n} live</span>
          </h2>
          <div className="md:columns-2 md:gap-3">
            {groupByLeague(live.filter((m) => m.sport === s.id)).map((g, gi, all) => (
              <Fragment key={g.name}>
                <LeagueCard name={g.name} logo={g.logo} sport={s.id} matches={g.matches} />
                {gi % 4 === 3 && gi < all.length - 1 && <AdSlot placement="list-inline" className="mb-3 break-inside-avoid" />}
              </Fragment>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
