"use client";

import { T } from "@/lib/i18n";
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
import { CricketRole, TeamBadge, cx } from "./ui";

// "All" grid icon from the user's hero-assets zip; sport chips use the app's SportIcon (same as Home).
const CHIP_ICON: Record<string, ReactNode> = {
  all: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
};
const ChipIcon = ({ id, size = 18 }: { id: string; size?: number }) => CHIP_ICON[id]
  ? <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{CHIP_ICON[id]}</svg>
  : null;

const lead = (a?: string, b?: string) => (parseFloat(a ?? "") || 0) > (parseFloat(b ?? "") || 0);

/** Compact row (prototype pick "G"): leader's line gets a gold wash; status + note on one small line. */
function LiveRow({ m }: { m: Match }) {
  const team = (s: Side, other: Side) => {
    const ahead = lead(s.score, other.score);
    return (
      <div className={cx("flex h-7 items-center gap-2 rounded-lg px-2", ahead && "bg-[linear-gradient(90deg,rgb(217_171_75/0.22),transparent_80%)]")}>
        <TeamBadge code={s.team.code} tone={s.team.tone} logo={s.team.logo} size={20} />
        <span className={cx("min-w-0 flex-1 truncate text-[13.5px]", ahead ? "font-bold" : "font-medium text-text-2")}>{s.team.name}</span>
        <CricketRole m={m} s={s} size={11} />
        {s.detail && <span className="text-[10.5px] text-text-2 tabular-nums">{s.detail}</span>}
        {/^\d|\//.test(s.score ?? "")
          ? <ScorePop value={s.score!} className={cx("text-right text-[15px] leading-none tabular-nums", ahead ? "font-black text-deep dark:text-white" : "font-bold text-text-2")} />
          : <span className="text-xs font-semibold text-text-2">{s.score}</span>}
      </div>
    );
  };
  return (
    <li>
      <Link href={`/match/${m.id}`} className="block px-2 py-1.5 transition hover:bg-[rgb(52_196_238/0.06)]">
        {team(m.home, m.away)}
        {team(m.away, m.home)}
        <p className="flex items-center gap-1.5 px-2 pt-0.5 text-[10.5px]">
          <span aria-hidden className="relative flex size-1.5 shrink-0"><span className="absolute inset-0 rounded-full bg-live opacity-70 motion-safe:animate-ping" /><span className="relative size-1.5 rounded-full bg-live" /></span>
          <span className="font-bold uppercase text-live">{m.timer || m.clock ? <LiveClock timer={m.timer} fallback={m.clock} /> : "Live"}</span>
          {m.note && <span className="truncate text-text-2">· {m.note}</span>}
        </p>
      </Link>
    </li>
  );
}

function LeagueCard({ name, logo, sport, matches }: { name: string; logo?: string; sport: SportId; matches: Match[] }) {
  return (
    <section className="card-premium mb-3 break-inside-avoid overflow-hidden rounded-2xl glass">
      <LeagueHeader name={name} logo={logo} sport={sport} className="border-b border-line border-l-[3px] border-l-[var(--gold-mid)] bg-surface px-4 py-2.5" />
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
      <div className="relative overflow-hidden rounded-2xl bg-deep px-4 pb-3 pt-3.5 text-white">
        {/* user-supplied hero artwork (public/banners/live-hero.webp): navy/cyan gradient with faint sport line-art */}
        <Image src="/banners/live-hero.webp" alt="" fill sizes="(min-width: 1024px) 860px, 100vw" priority className="object-cover object-left" />
        <div className="relative flex items-baseline gap-2">
          <span className="relative mb-[3px] flex size-2.5 self-center"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff4d57] opacity-70" /><span className="relative inline-flex size-2.5 rounded-full bg-[#ff3341]" /></span>
          <h2 className="text-[17px] font-extrabold tracking-tight"><T>Live now</T></h2>
          <span className="text-accent ml-auto text-[28px] font-black leading-none tabular-nums">{live.length}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">matches</span>
        </div>
        <div role="tablist" aria-label="Filter by sport" className="no-scrollbar relative -mx-4 -mb-5 -mt-2 flex gap-3 overflow-x-auto px-4 py-5">
          {[{ id: "all" as const, label: "All", n: live.length }, ...counts.map(({ s, n }) => ({ id: s.id, label: s.label, n }))].map((c) => {
            const on = only === c.id;
            return (
              // chip spec from the user's zip: 36pt, fully rounded; active = white + navy text + navy count pill;
              // inactive = 12% white fill, 25% white border, 20% white count pill
              <button key={c.id} role="tab" aria-selected={on}
                onClick={(e) => { setOnly(c.id); e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }}
                className={cx("flex h-9 shrink-0 items-center gap-2 rounded-full border pl-3 pr-1.5 text-[12px] font-bold transition",
                  on ? "border-white bg-white text-deep" : "border-white/25 bg-white/12 text-white hover:bg-white/20")}>
                {c.id === "all" ? <ChipIcon id="all" /> : <SportIcon sport={c.id} size={17} />}
                <T>{c.label}</T>
                <span className={cx("flex h-[22px] min-w-[27px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums", on ? "bg-deep text-white" : "bg-white/20 text-white")}>{c.n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!live.length && <p className="py-10 text-center text-sm text-text-2"><T>No live matches right now.</T></p>}

      {shown.map(({ s, n }) => (
        <section key={s.id} aria-labelledby={`h-${s.id}`} className="flex flex-col gap-3 pt-2">
          <h2 id={`h-${s.id}`} className="flex items-center gap-2 px-1">
            <SportIcon sport={s.id} size={18} className="text-deep dark:text-cyan" />
            <span className="text-[15px] font-extrabold uppercase tracking-wide"><T>{s.label}</T></span>
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
