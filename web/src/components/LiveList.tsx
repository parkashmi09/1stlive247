"use client";
// Live page, Sofascore-style: hero with per-sport live counts (filter), then one card per competition with dense rows.

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

/** One dense row: clock column, two team lines, score column; result/state note underneath. */
function LiveRow({ m }: { m: Match }) {
  const team = (s: Side, other: Side) => (
    <div className="flex items-center gap-2.5">
      <TeamBadge code={s.team.code} tone={s.team.tone} logo={s.team.logo} size={22} />
      <span className={cx("min-w-0 flex-1 truncate text-sm", lead(s.score, other.score) ? "font-bold" : "font-medium")}>{s.team.name}</span>
      {s.detail && <span className="text-[11px] text-text-2 tabular-nums">{s.detail}</span>}
      {/^\d|\//.test(s.score ?? "")
        ? <ScorePop value={s.score!} className={cx("min-w-8 text-right text-[15px] tabular-nums", lead(s.score, other.score) ? "font-extrabold" : "font-semibold text-text-2")} />
        : <span className="text-xs text-text-2">{s.score}</span>}
    </div>
  );
  return (
    <li>
      <Link href={`/match/${m.id}`} className="group flex gap-3 px-4 py-3 transition hover:bg-[rgb(52_196_238/0.06)]">
        <div className="flex w-11 shrink-0 flex-col items-center justify-center gap-1 border-r border-line pr-3 text-center">
          <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-live" /></span>
          <span className="text-[11px] font-bold leading-tight text-live">
            {m.timer || m.clock ? <LiveClock timer={m.timer} fallback={m.clock} /> : "LIVE"}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {team(m.home, m.away)}
          {team(m.away, m.home)}
          {m.note && <p className="truncate text-[11px] font-medium text-accent">{m.note}</p>}
        </div>
      </Link>
    </li>
  );
}

function LeagueCard({ name, logo, sport, matches }: { name: string; logo?: string; sport: SportId; matches: Match[] }) {
  return (
    <section className="card-premium mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface">
      <LeagueHeader name={name} logo={logo} sport={sport} count={matches.length} className="border-b border-line bg-[rgb(52_196_238/0.05)] px-4 py-2.5" />
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
      <div className="hero-glow relative overflow-hidden rounded-2xl px-5 py-4 text-white shadow-raised">
        <div className="flex items-center gap-3">
          <span className="relative flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff4d57] opacity-70" /><span className="relative inline-flex size-3 rounded-full bg-[#ff3341]" /></span>
          <h2 className="text-xl font-extrabold tracking-tight lg:text-2xl">Live now</h2>
          <span className="text-gold ml-auto text-3xl font-black tabular-nums lg:text-4xl">{live.length}</span>
          <span className="text-xs font-medium text-white/70">matches</span>
        </div>
        <div role="tablist" aria-label="Filter by sport" className="no-scrollbar -mx-5 mt-3.5 flex gap-2 overflow-x-auto px-5">
          {[{ id: "all" as const, label: "All", n: live.length }, ...counts.map(({ s, n }) => ({ id: s.id, label: s.label, n }))].map((c) => {
            const on = only === c.id;
            return (
              <button key={c.id} role="tab" aria-selected={on} onClick={() => setOnly(c.id)}
                className={cx("flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition",
                  on ? "bg-white text-deep shadow-[0_4px_14px_rgb(0_0_0/0.18)]" : "bg-white/12 text-white ring-1 ring-white/25 hover:bg-white/20")}>
                {c.id !== "all" && <SportIcon sport={c.id} size={16} />}
                {c.label}
                <span className={cx("rounded-full px-1.5 text-[11px] font-bold tabular-nums", on ? "bg-deep text-white" : "bg-white/20")}>{c.n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!live.length && <p className="py-10 text-center text-sm text-text-2">No live matches right now.</p>}

      {shown.map(({ s, n }) => (
        <section key={s.id} aria-labelledby={`h-${s.id}`} className="flex flex-col gap-3 pt-2">
          <h2 id={`h-${s.id}`} className="flex items-center gap-2.5">
            <span className="bg-brand flex size-8 items-center justify-center rounded-xl text-white shadow-[0_4px_12px_rgb(1_44_120/0.25)]"><SportIcon sport={s.id} size={17} /></span>
            <span className="text-base font-extrabold">{s.label}</span>
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
