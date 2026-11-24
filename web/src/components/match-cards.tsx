import { T } from "@/lib/i18n";
import { Tilt3D } from "./Tilt3D";
import Link from "next/link";
import type { Match, Side, SportId } from "@/data/types";
import { formatDay, formatTime } from "@/lib/format";
import { LiveClock } from "./LiveClock";
import { ScorePop } from "./ScorePop";
import Image from "next/image";
import { SportIcon } from "./icons/SportIcon";
import { CricketRole, HexPlate, LiveBadge, TabPill, TeamBadge, cx } from "./ui";


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
    <Link href={`/match/${m.id}`} className="bg-brand-diag flex w-full shrink-0 snap-center flex-col gap-2.5 rounded-2xl px-3.5 py-3 text-white">
      <div className="flex items-center gap-2"><LiveBadge /><span className="truncate text-xs text-white/65">{m.competition}</span></div>
      {line(m.home)}
      {line(m.away)}
      <div className="border-t border-white/30 pt-2.5"><span className="text-accent text-xs font-medium">{m.note}</span></div>
    </Link>
  );
}

/** Team mark (44px in the Figma card): the raw logo (no circle) or the initials badge when there is none. */
function TeamMark({ team, size = 44 }: { team: Side["team"]; size?: number }) {
  return team.logo
    // multiply drops the white box baked into Cricbuzz .jpg logos on the light glass (dark mode keeps the image as is)
    ? <Tilt3D size={size}><Image src={team.logo} alt="" width={size} height={size} unoptimized className="object-contain mix-blend-multiply dark:mix-blend-normal" style={{ width: size, height: size }} /></Tilt3D>
    : <TeamBadge code={team.code} tone={team.tone} size={size} />;
}

/** Upcoming card (glass reference): league line, both teams' bare logos (no white disc), kick-off time in the middle. */
function UpcomingCard({ m }: { m: Match }) {
  const team = (s: Side, right?: boolean) => (
    <span className={cx("flex min-w-0 flex-1 items-center gap-2", right && "flex-row-reverse text-right")}>
      <span className="shrink-0"><TeamMark team={s.team} size={34} /></span>
      <span className="min-w-0">
        <span className="line-clamp-2 text-[14px] font-semibold leading-tight">{s.team.name}</span>
        {s.record && <span className="block truncate text-[11px] text-text-2">{s.record}</span>}
      </span>
    </span>
  );
  return (
    <Link href={`/match/${m.id}`} className="glass block rounded-2xl px-3.5 py-3 transition active:scale-[0.99]">
      <p className="truncate text-[11px] text-text-2">{m.competition.split(" · ")[0]}</p>
      <div className="mt-2 flex items-center gap-2">
        {team(m.home)}
        <span className="flex shrink-0 flex-col items-center px-1">
          <span className="text-[15px] font-bold tabular-nums">{formatTime(m.start)}</span>
          <span className="text-[10px] text-text-2">{formatDay(m.start)}</span>
        </span>
        {team(m.away, true)}
      </div>
    </Link>
  );
}

/** "Live Match" carousel card, to the client's glass reference: hex status tab on the top edge, bare crests,
 *  flat hex score plate, and an inset panel at the bottom (league, or the cricket note). */
export function LiveGlassCard({ m }: { m: Match }) {
  const cricket = m.sport === "cricket";
  const team = (s: Side, right?: boolean) => (
    // flexible columns: the plate keeps its width and the teams share the rest, so nothing overlaps
    <div className={cx("flex min-w-0 flex-1 flex-col items-center gap-1 text-center", right && "order-3")}>
      <TeamMark team={s.team} size={52} />
      <span className="mt-1 flex max-w-full items-start justify-center gap-1 text-[13px] font-bold leading-tight"><span className="line-clamp-2 break-words">{s.team.name}</span><CricketRole m={m} s={s} /></span>
      {cricket
        ? <span className="text-[14px] font-bold tabular-nums">{s.score ?? <span className="text-[11px] font-normal text-text-2"><T>Yet to bat</T></span>}{s.detail && <span className="ml-1 text-[11px] font-normal text-text-2">{s.detail}</span>}</span>
        : <span className="text-[11px] text-text-2">{right ? "Away" : "At Home"}</span>}
    </div>
  );
  return (
    <Link href={`/match/${m.id}`} className="relative w-[88%] max-w-[360px] shrink-0 snap-center pt-3.5 transition active:translate-y-0.5 md:w-[360px]">
      <TabPill m={m} />
      <div className="glass score-3d flex h-full flex-col rounded-3xl px-3 pb-3 pt-7">
        <div className="mb-3 flex items-start gap-1.5">
          {team(m.home)}
          <div className="order-2 flex shrink-0 justify-center pt-2.5">
            {cricket ? <HexPlate compact>VS</HexPlate> : <HexPlate>{m.home.score ?? 0} - {m.away.score ?? 0}</HexPlate>}
          </div>
          {team(m.away, true)}
        </div>
        <p className={cx("well-3d mt-auto truncate rounded-2xl bg-white/55 px-3.5 py-2.5 text-[12px] font-medium dark:bg-white/[0.06]", cricket && m.note ? "text-note font-semibold" : "text-text-2")}>
          {/* cricket: "<match> · <series>" → series; others: "<league> · <country>" → league */}
          {cricket && m.note ? m.note : cricket ? m.competition.split(" · ").at(-1) : m.competition.split(" · ")[0]}
        </p>
      </div>
    </Link>
  );
}

/**
 * Home match card — built to the designer's "ARI vs LAR" frame (Figma 18:549):
 * 370×120, white, 1px #EEEEEE, radius 12, no shadow; 90px team columns (logo 44, code SemiBold 15,
 * sub Regular 12 #8E8E93); centre: LIVE pill, Regular 15 #8E8E93, Bold 17 #1C1C1E.
 */
export function MatchCard({ m }: { m: Match }) {
  if (m.status === "upcoming") return <UpcomingCard m={m} />;
  const live = m.status === "live", done = m.status === "finished";
  const scored = Boolean(m.home.score || m.away.score);
  const third = scored || Boolean(m.home.record || m.away.record);
  const team = (s: Side) => (
    <div className="flex w-[90px] shrink-0 flex-col items-center gap-1 text-center">
      <TeamMark team={s.team} />
      <span className="flex items-center gap-1 text-[15px] font-semibold leading-tight">{s.team.code}<CricketRole m={m} s={s} /></span>
      {/* same-height slot on both sides so logos line up even when one side is a 2-line score and the other "Yet to bat" */}
      {third && <div className="flex min-h-9 items-start justify-center">
        {scored && s.score
          ? <ScorePop value={s.score} className={cx("font-bold leading-tight tabular-nums", s.score.length > 7 ? "text-[13px]" : "text-lg", s.lost && "text-text-2")} />
          : s.record ? <span className="text-xs text-text-2">{s.record}</span> : scored ? <span className="text-xs text-text-2"><T>Yet to bat</T></span> : null}
      </div>}
    </div>
  );
  return (
    <Link href={`/match/${m.id}`} className="flex min-h-[120px] items-center rounded-xl glass px-4 py-3 transition active:scale-[0.99]">
      {team(m.home)}
      <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
        {live && <LiveBadge />}
        {done && <span className="text-text text-[13px] font-semibold uppercase">{m.stage ?? "Final"}</span>}
        {live
          ? <span className="text-[15px] text-text-2">{(m.clock || m.timer) ? <LiveClock timer={m.timer} fallback={m.clock} /> : formatDay(m.start)}</span>
          : <span className="text-[15px] text-text-2">{formatDay(m.start)}</span>}
        {m.note && <span className="line-clamp-2 text-xs text-text-2">{m.note}</span>}
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

/** Competition header: crest/flag, "League · Country" (no match count; the client asked to drop it). */
export function LeagueHeader({ name, logo, sport, className }: { name: string; logo?: string; sport?: SportId; className?: string }) {
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
    </h3>
  );
}
