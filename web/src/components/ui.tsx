import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Ball, Match, Side, Tone } from "@/data/types";
import { battingSide } from "@/lib/cricket";
import { Icon } from "./icons/Icon";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function LiveBadge({ soft = false, label = "LIVE" }: { soft?: boolean; label?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1 text-xs font-bold leading-none",
      soft ? "bg-live/10 text-live" : "live-ping bg-[#D80612] text-white")}>
      <span className={cx("size-1.5 rounded-full animate-pulse", soft ? "bg-live" : "bg-white")} />
      {label}
    </span>
  );
}

const TONES: Record<Tone, string> = {
  navy: "bg-[#13306E]", gold: "bg-[#B8862B]", red: "bg-[#E5262E]", green: "bg-boundary", sky: "bg-[#1C4594]",
};

/** Initials badge — stands in for team crests (no licensed logos yet). */
export function TeamBadge({ code, tone, size = 28, logo }: { code: string; tone: Tone; size?: number; logo?: string }) {
  if (logo) {
    return (
      <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-line" style={{ width: size, height: size }}>
        <Image src={logo} alt="" width={Math.round(size * 0.72)} height={Math.round(size * 0.72)} className="object-contain" unoptimized />
      </span>
    );
  }
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-[1.5px] ring-white/90", TONES[tone])}
      // long codes (e.g. "PCBPXI") shrink to stay inside the circle
      style={{ width: size, height: size, fontSize: Math.max(7, size * 0.3 * Math.min(1, 3.4 / code.length)), letterSpacing: code.length > 4 ? "-0.03em" : undefined }}
      aria-hidden
    >
      {code}
    </span>
  );
}

/** Solid bat (currentColor, gold by default) or red ball. */
export function BatBallIcon({ kind, size = 14, className = "text-[var(--gold-mid)]" }: { kind: "bat" | "ball"; size?: number; className?: string }) {
  return kind === "bat"
    ? <svg role="img" aria-label="Batting" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={cx("shrink-0", className)}><path d="M13 5l6 6-8.5 8.5a1.5 1.5 0 0 1-2.1 0l-3.9-3.9a1.5 1.5 0 0 1 0-2.1z" /><path d="M16 8l4.5-4.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
    : <svg role="img" aria-label="Bowling" width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0"><circle cx="12" cy="12" r="10" fill="#D80612" /><path d="M8 3.5c3 5 3 12 0 17M16 3.5c-3 5-3 12 0 17" stroke="#fff" strokeWidth="1.6" strokeDasharray="2 1.6" /></svg>;
}

/** Bat next to the side batting now, ball next to the other; nothing outside live cricket. */
export function CricketRole({ m, s, size }: { m: Match; s: Side; size?: number }) {
  const batting = battingSide(m);
  if (!batting) return null;
  return <BatBallIcon kind={(batting === "home") === (s === m.home) ? "bat" : "ball"} size={size} />;
}

const BALL: Record<Ball["kind"], string> = {
  dot: "bg-surface-2 text-text", run: "bg-surface-2 text-text",
  four: "bg-boundary-soft text-boundary ring-2 ring-inset ring-boundary",
  six: "bg-boundary text-white", wicket: "bg-live text-white", extra: "bg-[#FBF3DE] text-[#8F6619]",
};
export function BallChip({ ball }: { ball: Ball }) {
  return (
    <span className={cx("inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold", BALL[ball.kind])}>
      {ball.value}
    </span>
  );
}

export function PagerDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center justify-center gap-[7px]" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={i === active ? "h-3 w-[31px] rounded-md bg-gold-h" : "size-3 rounded-full bg-surface-2"} />
      ))}
    </div>
  );
}

export function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center">
      <h2 className="flex-1 text-lg font-bold">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-accent">
          See all <Icon name="back" size={14} className="rotate-180" />
        </Link>
      )}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("card-premium rounded-2xl border border-line bg-surface", className)}>{children}</div>;
}

export { cx };
