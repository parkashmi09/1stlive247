import Link from "next/link";
import type { Match, Side } from "@/data/types";
import { formatDay, formatTime } from "@/lib/format";
import { Icon } from "./icons/Icon";
import { LiveClock } from "./LiveClock";
import { ScorePop } from "./ScorePop";
import Image from "next/image";
import { LiveBadge, TeamBadge, cx } from "./ui";

const cardBase = "card-premium block rounded-2xl border border-line bg-surface active:scale-[0.99]";

/** Dense list row used on Live: header, two team lines, note (Flashscore-style density). */
export function MatchRow({ m }: { m: Match }) {
  const line = (s: Side) => (
    <div className="flex items-center gap-2.5">
      <TeamBadge code={s.team.code} tone={s.team.tone} logo={s.team.logo} />
      <span className="flex-1 text-sm font-semibold">{s.team.name}</span>
      {s.detail && <span className="text-xs text-text-2">{s.detail}</span>}
      {/^\d|\//.test(s.score ?? "")
        ? <ScorePop value={s.score!} className="text-xl font-semibold tabular-nums" />
        : <span className="text-xs text-text-2">{s.score}</span>}
    </div>
  );
  return (
    <Link href={`/match/${m.id}`} className={cx(cardBase, "flex flex-col gap-2.5 px-3.5 py-3")}>
      <div className="flex items-center gap-2">
        {m.status === "live" ? <LiveBadge /> : <span className="text-xs font-semibold text-text-2">{formatTime(m.start)}</span>}
        <span className="flex-1 truncate text-xs text-text-2">{m.competition}</span>
        {m.status === "live" && (m.clock || m.timer) && <span className="text-xs font-bold text-live"><LiveClock timer={m.timer} fallback={m.clock} /></span>}
      </div>
      {line(m.home)}
      {line(m.away)}
      {m.note && (
        <div className="flex items-center gap-2 border-t border-line pt-2.5">
          <span className="flex-1 text-xs font-medium text-accent">{m.note}</span>
          <Icon name="star" size={18} className="text-text-2" />
        </div>
      )}
    </Link>
  );
}

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
          : <span className="line-clamp-2 text-xs text-text-2">{m.note ?? m.competition}</span>}
      </div>
      {team(m.away)}
    </Link>
  );
}
