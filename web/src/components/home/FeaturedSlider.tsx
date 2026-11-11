"use client";
// Home banner slider: the designer's banner frame (Figma 60:1085, 370×155 card inside a 180-tall frame) with real fixtures.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sportOf } from "@/data/sports";
import type { Featured, SportId } from "@/data/types";
import { API_URL } from "@/lib/config";
import { formatBannerDate, formatTime } from "@/lib/format";
import { TeamBadge } from "../ui";

// Player art per sport (designer PNGs, Figma 60:1088 / 61:61 / 63:168). A sport without art gets no slide.
// shortcut: badminton isn't a feed sport yet, so its art waits here until it is.
const ART: Partial<Record<SportId | "badminton", string>> = {
  football: "/banners/football.webp",
  cricket: "/banners/cricket.webp",
  badminton: "/banners/badminton.webp",
};
const AUTOPLAY_MS = 5000;
const REFRESH_MS = 5 * 60_000;
// the team row fits ~11 chars per name at the Figma size; longer names show the team code
const fit = (name: string, code: string) => (name.length <= 11 ? name : code);
const withArt = (all: Featured[]) => all.filter((f) => ART[f.sport]);

function Slide({ f, priority }: { f: Featured; priority: boolean }) {
  return (
    // 180px tall: the 155px card plus the 25px the player runs past its bottom edge
    <Link href={`/match/${f.matchId}`} aria-label={`${f.home} vs ${f.away}, ${f.league}`} className="relative block h-[180px] w-full shrink-0 snap-center">
      <div className="absolute inset-x-0 top-0 h-[155px] rounded-[20px] [background-image:linear-gradient(131deg,#34C4EE_26.6%,#002B77_101%)]" />
      <div className="absolute right-0 top-0 h-[180px] w-[153px]" aria-hidden>
        <Image src={ART[f.sport]!} alt="" fill sizes="153px" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className="object-contain object-right-bottom" />
      </div>
      <div className="absolute left-4 right-[150px] top-4">
        <p className="text-[30px] font-black italic uppercase leading-[0.9] tracking-[-0.8px] text-white">{sportOf(f.sport).label}</p>
        <p className="mt-1 line-clamp-2 text-[14px] font-extrabold italic uppercase leading-[1.1] tracking-[0.2px] text-transparent [-webkit-text-stroke:0.9px_#fff]">{f.league}</p>
      </div>
      <div className="absolute left-4 top-[104px] flex items-center gap-[6px] whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3px] text-white">
        <span>{fit(f.home, f.homeCode)}</span>
        <TeamBadge code={f.homeCode} tone={f.homeTone} logo={f.homeLogo} size={24} />
        <span className="text-[13px] font-extrabold normal-case tracking-normal text-black">VS</span>
        <TeamBadge code={f.awayCode} tone={f.awayTone} logo={f.awayLogo} size={24} />
        <span>{fit(f.away, f.awayCode)}</span>
      </div>
      <p className="absolute left-4 top-[134px] flex gap-[9px] whitespace-nowrap text-[9px] text-[#06121C]">
        <span className="font-semibold">{formatBannerDate(f.start)}</span>
        <span className="font-medium opacity-60">Starts at {formatTime(f.start)}</span>
      </p>
    </Link>
  );
}

export function FeaturedSlider({ initial }: { initial: Featured[] }) {
  const [slides, setSlides] = useState(() => withArt(initial));
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  // keep slides fresh: fixtures start, new ones become "next"
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const r = await fetch(`${API_URL}/api/v1/featured`, { cache: "no-store" });
        if (r.ok) { const next = withArt(((await r.json()) as { data: Featured[] }).data); if (next.length) setSlides(next); }
      } catch { /* keep current slides */ }
    }, REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  // autoplay; pauses while the user touches/hovers, off for reduced motion
  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      const el = track.current;
      if (!el || paused.current) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % slides.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  return (
    <section aria-label="Featured matches" aria-roledescription="carousel">
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto"
        onPointerEnter={() => (paused.current = true)} onPointerLeave={() => (paused.current = false)}
        onTouchStart={() => (paused.current = true)} onTouchEnd={() => setTimeout(() => (paused.current = false), 4000)}>
        {slides.map((f, i) => <Slide key={f.matchId} f={f} priority={i === 0} />)}
      </div>
    </section>
  );
}
