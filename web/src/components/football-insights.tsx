"use client";
// Football Match Centre: momentum graph, possession donut + key duels, events timeline, period stats, match info.
import { useEffect, useState } from "react";
import type { Incident, Match, MatchInsights, StatGroup } from "@/data/types";
import { API_URL } from "@/lib/config";
import { Icon } from "./icons/Icon";
import { Card, TeamBadge, cx } from "./ui";

const num = (v: string | undefined) => parseFloat(v ?? "") || 0;
const minuteOf = (m: string) => parseInt(m, 10) || 0;
const findStat = (groups: StatGroup[], name: string) => groups.flatMap((g) => g.stats).find((s) => s.name === name);
// for these a smaller number is the better one
const LOWER_BETTER = new Set(["Fouls", "Yellow cards", "Red cards", "Offsides", "Errors leading to shot", "Errors leading to goal", "xGOT faced"]);

/** Live matches refetch every 30s; stats/momentum move slowly so polling is enough (no socket channel). */
function useInsights(match: Match, initial: MatchInsights) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    if (match.status !== "live") return;
    const t = setInterval(async () => {
      const r = await fetch(`${API_URL}/api/v1/matches/${encodeURIComponent(match.id)}/insights`).catch(() => undefined);
      if (r?.ok) setData(((await r.json()) as { data: MatchInsights }).data);
    }, 30_000);
    return () => clearInterval(t);
  }, [match.id, match.status]);
  return data;
}

export function FootballInsights({ match, insights }: { match: Match; insights: MatchInsights }) {
  const d = useInsights(match, insights);
  const top = d.periods[0]?.groups ?? [];
  return (
    <>
      {d.momentum.length > 2 && <Momentum match={match} points={d.momentum} timeline={d.timeline} />}
      {findStat(top, "Ball possession") && <KeyStats match={match} groups={top} />}
      {d.timeline.some((e) => e.type === "event") && <Timeline match={match} items={d.timeline} />}
      {d.periods.length > 0 && <PeriodStats periods={d.periods} />}
      {d.info.length > 0 && <MatchInfo info={d.info} />}
    </>
  );
}

const SectionTitle = ({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) => (
  <div className="mb-3 flex items-center gap-2">
    <span className="bg-gold h-4 w-1 rounded-full" />
    <h3 className="flex-1 text-sm font-bold">{children}</h3>
    {right}
  </div>
);

const TeamTag = ({ s, color }: { s: Match["home"]; color: string }) => (
  <span className="flex items-center gap-1.5 text-xs font-semibold">
    <span className={cx("size-2 rounded-full", color)} />
    <TeamBadge code={s.team.code} tone={s.team.tone} logo={s.team.logo} size={18} />
    {s.team.code}
  </span>
);

/* ---------- momentum ---------- */

function Momentum({ match, points, timeline }: { match: Match; points: MatchInsights["momentum"]; timeline: Incident[] }) {
  const W = 360, H = 132, mid = H / 2, amp = mid - 8;
  const span = Math.max(90, ...points.map((p) => p.minute));
  const bw = W / span;
  const x = (min: number) => ((min - 1) / span) * W;
  const goals = timeline.filter((e): e is Extract<Incident, { type: "event" }> => e.type === "event" && ["goal", "penalty", "own-goal"].includes(e.kind));
  const homeShare = Math.round((points.filter((p) => p.value > 0).length / points.length) * 100);
  return (
    <Card className="px-4 py-3.5">
      <SectionTitle right={<span className="text-[11px] font-semibold tabular-nums"><span className="text-[#2F80ED]">{match.home.team.code} {homeShare}%</span><span className="text-text-2"> · </span><span className="text-[#C9962E]">{100 - homeShare}% {match.away.team.code}</span></span>}>Match momentum</SectionTitle>
      <TeamTag s={match.home} color="bg-[#2F80ED]" />
      <div className="relative my-1.5">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[132px] w-full" aria-label="Match momentum graph" role="img">
          <defs>
            <linearGradient id="mo-home" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34C4EE" /><stop offset="1" stopColor="#1C4594" /></linearGradient>
            <linearGradient id="mo-away" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9AB4B" /><stop offset="1" stopColor="#FBEA99" /></linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} className="stroke-line" strokeWidth={f === 0.5 ? 1 : 0.5} strokeDasharray={f === 0.5 ? undefined : "3 3"} vectorEffect="non-scaling-stroke" />)}
          <line x1={x(46)} x2={x(46)} y1={0} y2={H} className="stroke-text-2/40" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
          {points.map((p, i) => {
            const h = Math.max(1.5, Math.abs(p.value) * amp);
            return <rect key={i} x={x(p.minute) + bw * 0.12} width={bw * 0.76} y={p.value >= 0 ? mid - h : mid} height={h} rx={bw * 0.3} fill={p.value >= 0 ? "url(#mo-home)" : "url(#mo-away)"} />;
          })}
        </svg>
        {goals.map((g, i) => (
          <span key={i} title={`${g.minute} ${g.player}`} className={cx("absolute flex size-5 -translate-x-1/2 items-center justify-center rounded-full bg-surface shadow ring-1 ring-line", g.side === "home" ? "-top-1" : "-bottom-1")} style={{ left: `${(x(minuteOf(g.minute)) / W) * 100}%` }}>
            <Icon name="football" size={13} />
          </span>
        ))}
      </div>
      <TeamTag s={match.away} color="bg-[#D9AB4B]" />
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-text-2 tabular-nums">
        <span>0'</span><span>15'</span><span>30'</span><span className="text-text">HT</span><span>60'</span><span>75'</span><span>{span}'</span>
      </div>
    </Card>
  );
}

/* ---------- possession donut + key duels ---------- */

function Donut({ home }: { home: number }) {
  const r = 40, c = 2 * Math.PI * r, gap = 4;
  const h = (home / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="size-[112px] shrink-0 -rotate-90" aria-hidden>
      <defs>
        <linearGradient id="do-home" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#34C4EE" /><stop offset="1" stopColor="#1C4594" /></linearGradient>
        <linearGradient id="do-away" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBEA99" /><stop offset="1" stopColor="#B8862B" /></linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="url(#do-home)" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${Math.max(0, h - gap)} ${c}`} />
      <circle cx="50" cy="50" r={r} fill="none" stroke="url(#do-away)" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${Math.max(0, c - h - gap)} ${c}`} strokeDashoffset={-h} />
    </svg>
  );
}

function KeyStats({ match, groups }: { match: Match; groups: StatGroup[] }) {
  const poss = num(findStat(groups, "Ball possession")?.home);
  const duels = ["Expected goals (xG)", "Total shots", "Shots on target", "Big chances"]
    .map((n) => findStat(groups, n)).filter((s): s is NonNullable<typeof s> => Boolean(s));
  return (
    <Card className="px-4 py-3.5">
      <SectionTitle>Key stats</SectionTitle>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Donut home={poss} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold leading-none tabular-nums">{poss}%</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-2">Possession</span>
            <span className="text-[#C9962E] text-[11px] font-bold tabular-nums">{100 - poss}%</span>
          </div>
        </div>
        <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
          {duels.map((s) => {
            const a = num(s.home), b = num(s.away), t = a + b || 1;
            return (
              <li key={s.name}>
                <div className="flex items-baseline justify-between text-xs">
                  <b className={cx("text-[15px] tabular-nums", a > b && "text-[#2F80ED]")}>{s.home}</b>
                  <span className="truncate px-1 text-text-2">{s.name.replace("Expected goals (xG)", "xG")}</span>
                  <b className={cx("text-[15px] tabular-nums", b > a && "text-[#C9962E]")}>{s.away}</b>
                </div>
                <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <span className="bg-brand h-full" style={{ width: `${(a / t) * 100}%` }} />
                  <span className="bg-gold-h ml-auto h-full" style={{ width: `${(b / t) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-3 flex justify-between border-t border-line pt-2.5">
        <TeamTag s={match.home} color="bg-[#2F80ED]" /><TeamTag s={match.away} color="bg-[#D9AB4B]" />
      </div>
    </Card>
  );
}

/* ---------- events timeline ---------- */

function EventIcon({ kind }: { kind: Extract<Incident, { type: "event" }>["kind"] }) {
  if (kind === "yellow") return <span className="h-4 w-3 rounded-[3px] bg-[#F5C518] shadow-sm" aria-label="Yellow card" />;
  if (kind === "red") return <span className="h-4 w-3 rounded-[3px] bg-live shadow-sm" aria-label="Red card" />;
  if (kind === "sub") return (
    <svg viewBox="0 0 20 20" className="size-[18px]" aria-label="Substitution"><path d="M6 15V5m0 0L3 8m3-3 3 3" className="stroke-boundary" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 5v10m0 0-3-3m3 3 3-3" className="stroke-live" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
  if (kind === "other") return <span className="size-2 rounded-full bg-text-2" />;
  return (
    <span className="relative flex">
      <Icon name="football" size={18} className={kind === "own-goal" ? "text-live" : undefined} />
      {(kind === "penalty" || kind === "penalty-missed") && <span className={cx("absolute -right-1.5 -top-1 rounded px-0.5 text-[8px] font-bold text-white", kind === "penalty" ? "bg-boundary" : "bg-live")}>P</span>}
    </span>
  );
}

function EventBody({ e, align }: { e: Extract<Incident, { type: "event" }>; align: "left" | "right" }) {
  const scored = e.kind === "goal" || e.kind === "penalty" || e.kind === "own-goal";
  const sub = e.kind === "sub" ? `Out: ${e.playerOut ?? "—"}` : e.assist ? `Assist: ${e.assist}` : e.kind === "penalty-missed" ? "Penalty missed" : e.kind === "own-goal" ? "Own goal" : e.note;
  return (
    <div className={cx("flex min-w-0 items-center gap-2", align === "right" && "flex-row-reverse text-right")}>
      <EventIcon kind={e.kind} />
      <div className="min-w-0">
        <p className={cx("truncate text-[13px]", scored ? "font-bold" : "font-semibold")}>{e.player || "—"}</p>
        {sub && <p className="truncate text-[11px] text-text-2">{sub}</p>}
      </div>
      {scored && e.score && <span className="shrink-0 rounded-md bg-brand-diag px-1.5 py-0.5 text-[11px] font-bold text-white tabular-nums">{e.score}</span>}
    </div>
  );
}

function Timeline({ match, items }: { match: Match; items: Incident[] }) {
  // newest first: periods in reverse, events inside each period in reverse
  const periods: { head?: Extract<Incident, { type: "period" }>; events: Extract<Incident, { type: "event" }>[] }[] = [];
  for (const it of items) {
    if (it.type === "period") periods.push({ head: it, events: [] });
    else (periods.at(-1) ?? (periods.push({ events: [] }), periods.at(-1)!)).events.push(it);
  }
  return (
    <Card className="px-4 py-3.5">
      <SectionTitle right={<span className="flex gap-3"><TeamTag s={match.home} color="bg-[#2F80ED]" /><TeamTag s={match.away} color="bg-[#D9AB4B]" /></span>}>Key events</SectionTitle>
      <div className="relative">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line" aria-hidden />
        {[...periods].reverse().map((p, i) => (
          <div key={i}>
            {[...p.events].reverse().map((e, j) => {
              const goal = e.kind === "goal" || e.kind === "penalty" || e.kind === "own-goal";
              return (
                <div key={j} className={cx("relative grid grid-cols-[1fr_44px_1fr] items-center py-1.5", goal && "rounded-xl bg-boundary/6")}>
                  <div className="min-w-0 pr-1">{e.side === "home" && <EventBody e={e} align="right" />}</div>
                  <span className={cx("z-10 mx-auto flex h-6 min-w-9 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums ring-1", goal ? "bg-brand-diag text-white ring-transparent" : "bg-surface ring-line")}>{e.minute}</span>
                  <div className="min-w-0 pl-1">{e.side === "away" && <EventBody e={e} align="left" />}</div>
                </div>
              );
            })}
            {p.head && (
              <div className="relative z-10 my-2 flex justify-center">
                <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur">
                  {p.head.name}{p.head.score && <span className="ml-1.5 text-[#2F80ED]">{p.head.score}</span>}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- full stats by period ---------- */

function PeriodStats({ periods }: { periods: MatchInsights["periods"] }) {
  const [pi, setPi] = useState(0);
  const [gi, setGi] = useState(0);
  const groups = periods[Math.min(pi, periods.length - 1)]!.groups;
  const g = groups[Math.min(gi, groups.length - 1)]!;
  return (
    <Card className="px-4 py-3.5">
      <SectionTitle>Statistics</SectionTitle>
      {periods.length > 1 && (
        <div className="mb-3 flex rounded-full bg-surface-2 p-1" role="tablist">
          {periods.map((p, i) => (
            <button key={p.name} role="tab" aria-selected={i === pi} onClick={() => setPi(i)}
              className={cx("flex-1 rounded-full py-1.5 text-xs font-semibold transition", i === pi ? "bg-brand text-white shadow" : "text-text-2")}>
              {p.name === "Match" ? "Full match" : p.name}
            </button>
          ))}
        </div>
      )}
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
        {groups.map((x, i) => (
          <button key={x.title} onClick={() => setGi(i)}
            className={cx("shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition", i === gi ? "border-[#D9AB4B] bg-[#FBF3DE] text-[#8F6619]" : "border-line text-text-2")}>
            {x.title}
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-3.5">
        {g.stats.map((s) => {
          const a = num(s.home), b = num(s.away);
          const lower = LOWER_BETTER.has(s.name);
          const lead = a === b ? undefined : (a > b) !== lower ? "home" : "away";
          const pa = Math.max(0, a), pb = Math.max(0, b), t = pa + pb || 1;
          return (
            <li key={s.name}>
              <div className="flex items-center gap-2 text-sm">
                <span className={cx("min-w-11 rounded-md px-1.5 py-0.5 text-center text-[13px] font-bold tabular-nums whitespace-nowrap", lead === "home" ? "bg-brand text-white" : "")}>{s.home}</span>
                <span className="min-w-0 flex-1 truncate text-center text-[13px] text-text-2">{s.name}</span>
                <span className={cx("min-w-11 rounded-md px-1.5 py-0.5 text-center text-[13px] font-bold tabular-nums whitespace-nowrap", lead === "away" ? "bg-gold text-[#3A2A05]" : "")}>{s.away}</span>
              </div>
              <div className="mt-1.5 flex h-1.5 gap-1" aria-hidden>
                <span className="flex flex-1 justify-end overflow-hidden rounded-full bg-surface-2"><span className={cx("rounded-full", lead === "home" ? "bg-brand" : "bg-[#1C4594]/35")} style={{ width: `${(pa / t) * 100}%` }} /></span>
                <span className="flex-1 overflow-hidden rounded-full bg-surface-2"><span className={cx("block h-full rounded-full", lead === "away" ? "bg-gold-h" : "bg-[#D9AB4B]/40")} style={{ width: `${(pb / t) * 100}%` }} /></span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------- match info ---------- */

function MatchInfo({ info }: { info: MatchInsights["info"] }) {
  return (
    <Card className="px-4 py-3.5">
      <SectionTitle>Match info</SectionTitle>
      <dl className="flex flex-col divide-y divide-line">
        {info.map((r) => (
          <div key={r.label} className="flex gap-3 py-2 text-[13px]">
            <dt className="w-20 shrink-0 text-text-2">{r.label}</dt>
            <dd className="line-clamp-2 min-w-0 flex-1 text-right font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
