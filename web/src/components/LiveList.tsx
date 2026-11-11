"use client";
// Live page, broadcast-scoreboard style: compact hero with per-sport live counts (filter), navy competition strips, rows with a red live bar and large tabular scores.

import Link from "next/link";
import { Fragment, useState } from "react";
import { SPORTS } from "@/data/sports";
import type { Match, Side, SportId } from "@/data/types";
import { useLiveMatches } from "@/lib/live";
import { AdSlot } from "./AdSlot";
import { SportIcon } from "./icons/SportIcon";
import { LiveClock } from "./LiveClock";
import { LeagueHeader, groupByLeague } from "./match-cards";
import { ScorePop } from "./ScorePop";
import { TeamBadge, cx } from "./ui";

const lead = (a?: string, b?: string) => (parseFloat(a ?? "") || 0) > (parseFloat(b ?? "") || 0);

/** Scoreboard row: red live bar on the left, two team lines with large tabular scores, clock + note underneath. */
function LiveRow({ m }: { m: Match }) {
  const team = (s: Side, other: Side) => {
    const ahead = lead(s.score, other.score);
    return (
      <div className="flex items-center gap-2.5">
        <TeamBadge code={s.team.code} tone={s.team.tone} logo={s.team.logo} size={24} />
        <span className={cx("min-w-0 flex-1 truncate text-[15px]", ahead ? "font-bold text-text" : "font-medium text-text")}>{s.team.name}</span>
        {s.detail && <span className="text-[11px] text-text-2 tabular-nums">{s.detail}</span>}
        {/^\d|\//.test(s.score ?? "")
          ? <ScorePop value={s.score!} className={cx("min-w-9 text-right text-[19px] leading-none tabular-nums", ahead ? "font-black text-deep dark:text-white" : "font-bold text-text-2")} />
          : <span className="text-xs font-semibold text-text-2">{s.score}</span>}
      </div>
    );
  };
  return (
    <li>
      <Link href={`/match/${m.id}`} className="group relative flex flex-col gap-2 py-3 pl-5 pr-4 transition hover:bg-[rgb(52_196_238/0.06)]">
        <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-live shadow-[0_0_8px_rgb(216_6_18/0.6)]" />
        {team(m.home, m.away)}
        {team(m.away, m.home)}
        <p className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 font-bold uppercase tracking-wide text-live">
            <span className="size-1.5 rounded-full bg-live motion-safe:animate-pulse" />
            {m.timer || m.clock ? <LiveClock timer={m.timer} fallback={m.clock} /> : "Live"}
          </span>
          {m.note && <span className="truncate font-medium text-accent">· {m.note}</span>}
        </p>
      </Link>
    </li>
  );
}

function LeagueCard({ name, logo, sport, matches }: { name: string; logo?: string; sport: SportId; matches: Match[] }) {
  return (
    <section className="card-premium mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface">
      <LeagueHeader name={name} logo={logo} sport={sport} count={matches.length} className="bg-brand-diag px-4 py-2 text-white [&_span]:text-white [&>span:last-child]:bg-white/20 [&>span:last-child]:ring-0" />
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
      <div className="hero-glow relative overflow-hidden rounded-2xl px-4 pb-3 pt-3.5 text-white shadow-raised">
        {/* faint sport marks in the background, one per sport that is live */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {counts.slice(0, 5).map(({ s }, i) => (
            <SportIcon key={s.id} sport={s.id} size={64 + (i % 2) * 24}
              className={cx("absolute text-white opacity-[0.08]", ["-right-3 -top-4 rotate-12", "left-[38%] -bottom-6 -rotate-12", "right-[26%] -top-5 rotate-6", "-left-4 -bottom-5 rotate-[20deg]", "right-[52%] -top-7 -rotate-6"][i])} />
          ))}
        </div>
        <div className="relative flex items-baseline gap-2">
          <span className="relative mb-[3px] flex size-2.5 self-center"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff4d57] opacity-70" /><span className="relative inline-flex size-2.5 rounded-full bg-[#ff3341]" /></span>
          <h2 className="text-[17px] font-extrabold tracking-tight">Live now</h2>
          <span className="text-gold ml-auto text-[28px] font-black leading-none tabular-nums">{live.length}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">matches</span>
        </div>
        <div role="tablist" aria-label="Filter by sport" className="no-scrollbar relative -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4">
          {[{ id: "all" as const, label: "All", n: live.length }, ...counts.map(({ s, n }) => ({ id: s.id, label: s.label, n }))].map((c) => {
            const on = only === c.id;
            return (
              <button key={c.id} role="tab" aria-selected={on} onClick={() => setOnly(c.id)}
                className={cx("flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition",
                  on ? "bg-white text-deep shadow-[0_4px_14px_rgb(0_0_0/0.18)]" : "bg-white/12 text-white ring-1 ring-white/25 hover:bg-white/20")}>
                {c.id !== "all" && <SportIcon sport={c.id} size={14} />}
                {c.label}
                <span className={cx("rounded-full px-1.5 text-[10px] font-bold tabular-nums", on ? "bg-deep text-white" : "bg-white/20")}>{c.n}</span>
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
