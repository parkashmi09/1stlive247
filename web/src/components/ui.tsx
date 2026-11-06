import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Ball, Tone } from "@/data/types";
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

const BALL: Record<Ball["kind"], string> = {
  dot: "bg-surface-2 text-text", run: "bg-surface-2 text-text",
  four: "bg-boundary-soft text-boundary ring-2 ring-inset ring-boundary",
  six: "bg-boundary text-white", wicket: "bg-live text-white", extra: "bg-[#FBF3DE] text-[#8F6619]",
};
export function BallChip({ ball }: { ball: Ball }) {
  return (
    <span className={cx("inline-flex size-8 items-center justify-center rounded-full text-sm font-semibold", BALL[ball.kind])}>
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
