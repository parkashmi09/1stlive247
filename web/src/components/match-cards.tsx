import Link from "next/link";
import type { Match, Side, SportId } from "@/data/types";
import { formatDay, formatTime } from "@/lib/format";
import { LiveClock } from "./LiveClock";
import { ScorePop } from "./ScorePop";
import Image from "next/image";
import { SportIcon } from "./icons/SportIcon";
import { LiveBadge, TeamBadge, cx } from "./ui";


/** Carousel slide: live match on the brand gradient (designer dark Home). */
export function LiveHeroCard({ m }: { m: Match }) {
  const line = (s: Side) => (
    <div className="flex items-center gap-2.5">
      <TeamBadge code={s.team.code} tone={s.team.tone} logo={s.team.logo} />
      <span className="flex-1 text-sm font-semibold">{s.team.name}</span>
      {s.detail && <span className="text-xs text-white/65">{s.detail}</span>}
      <span className={/\//.test(s.score ?? "") ? "text-xl font-semibold" : "text-xs text-white/65"}>{s.score}</span>
    </div>
  );
  return (
    <Link href={`/match/${m.id}`} className="bg-brand-diag flex w-full shrink-0 snap-center flex-col gap-2.5 rounded-2xl px-3.5 py-3 text-white shadow-raised">
      <div className="flex items-center gap-2"><LiveBadge /><span className="truncate text-xs text-white/65">{m.competition}</span></div>
      {line(m.home)}
      {line(m.away)}
      <div className="border-t border-white/30 pt-2.5"><span className="text-gold text-xs font-medium">{m.note}</span></div>
    </Link>
  );
}

/** 44px team mark as in the Figma card: the raw logo (no circle) or the initials badge when there is none. */
function TeamMark({ team }: { team: Side["team"] }) {
  return team.logo
    ? <Image src={team.logo} alt="" width={44} height={44} unoptimized className="size-11 object-contain" />
    : <TeamBadge code={team.code} tone={team.tone} size={44} />;
}

/**
 * Home match card — built to the designer's "ARI vs LAR" frame (Figma 18:549):
 * 370×120, white, 1px #EEEEEE, radius 12, no shadow; 90px team columns (logo 44, code SemiBold 15,
 * sub Regular 12 #8E8E93); centre: LIVE pill, Regular 15 #8E8E93, Bold 17 #1C1C1E.
 */
export function MatchCard({ m }: { m: Match }) {
  const live = m.status === "live", done = m.status === "finished";
  const scored = Boolean(m.home.score || m.away.score);
  const third = scored || Boolean(m.home.record || m.away.record);
  const team = (s: Side) => (
    <div className="flex w-[90px] shrink-0 flex-col items-center gap-1 text-center">
      <TeamMark team={s.team} />
      <span className="text-[15px] font-semibold leading-tight">{s.team.code}</span>
      {/* same-height slot on both sides so logos line up even when one side is a 2-line score and the other "Yet to bat" */}
      {third && <div className="flex min-h-9 items-start justify-center">
        {scored && s.score
          ? <ScorePop value={s.score} className={cx("font-bold leading-tight tabular-nums", s.score.length > 7 ? "text-[13px]" : "text-lg", s.lost && "text-text-2")} />
          : s.record ? <span className="text-xs text-text-2">{s.record}</span> : scored ? <span className="text-xs text-text-2">Yet to bat</span> : null}
      </div>}
    </div>
  );
  return (
    <Link href={`/match/${m.id}`} className="flex min-h-[120px] items-center rounded-xl border border-line bg-surface px-4 py-3 transition active:scale-[0.99]">
      {team(m.home)}
      <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
        {live && <LiveBadge />}
        {done && <span className="text-gold text-[13px] font-semibold uppercase">{m.stage ?? "Final"}</span>}
        {live
          ? <span className="text-[15px] text-text-2">{(m.clock || m.timer) ? <LiveClock timer={m.timer} fallback={m.clock} /> : formatDay(m.start)}</span>
          : <span className="text-[15px] text-text-2">{formatDay(m.start)}</span>}
        {!live && !done
          ? <span className="text-[17px] font-bold">{formatTime(m.start)}</span>
          : m.note && <span className="line-clamp-2 text-xs text-text-2">{m.note}</span>}
      </div>
      {team(m.away)}
    </Link>
  );
}

/** Matches grouped by competition, first-seen order kept (the feed already sorts by start). */
export function groupByLeague(list: Match[]) {
  const groups = new Map<string, { name: string; logo?: string; matches: Match[] }>();
  for (const m of list) {
    // cricket competition is "<match desc> · <series>": the series is the group
    const key = m.sport === "cricket" ? m.competition.split(" · ").at(-1)! : m.competition;
    const g = groups.get(key) ?? { name: key, logo: m.leagueLogo, matches: [] };
    g.matches.push(m);
    groups.set(key, g);
  }
  return [...groups.values()];
}

/** Sofascore-style competition header: crest/flag, "League · Country", match count. */
export function LeagueHeader({ name, logo, sport, count, className }: { name: string; logo?: string; sport?: SportId; count: number; className?: string }) {
  const [league, country] = name.split(" · ");
  return (
    <h3 className={cx("flex items-center gap-2.5 px-1 pt-1", className)}>
      {logo
        ? <Image src={logo} alt="" width={22} height={22} unoptimized className="size-[22px] shrink-0 rounded object-contain" />
        : <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-cyan/15 text-deep dark:text-cyan" aria-hidden>{sport && <SportIcon sport={sport} size={13} />}</span>}
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[13px] font-bold">{league}</span>
        {country && <span className="block truncate text-[11px] text-text-2">{country}</span>}
      </span>
      <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-text-2 ring-1 ring-line">{count}</span>
    </h3>
  );
}
