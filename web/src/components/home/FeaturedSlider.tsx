"use client";
// Home banner slider — the designer's "Football Championship Banner" (Figma 18:500) filled with real upcoming fixtures.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sportOf } from "@/data/sports";
import type { Featured } from "@/data/types";
import { API_URL } from "@/lib/config";
import { formatBannerDate, formatTime } from "@/lib/format";

// Slide artwork, cycled per slide. Add the next designs here (public/banners/…).
const BANNER_IMAGES = ["/banners/banner-football-1.png"];
const AUTOPLAY_MS = 5000;
// the pill fits ~11 chars per side at the Figma size; longer names show the team code
const fit = (name: string, code: string) => (name.length <= 11 ? name : code);
const REFRESH_MS = 5 * 60_000;

function Slide({ f, image, priority }: { f: Featured; image: string; priority: boolean }) {
  return (
    <Link href={`/match/${f.matchId}`} aria-label={`${f.home} vs ${f.away}, ${f.league}`}
      className="relative block h-48 w-full shrink-0 snap-center overflow-hidden rounded-2xl [background-image:linear-gradient(115deg,#34C4EE_0%,#002B77_100%)]">
      <div className="absolute inset-y-0 right-0 w-[152px] overflow-hidden" aria-hidden>
        {/* Figma: 180px-wide image offset -13px inside the 152px clip */}
        <div className="absolute inset-y-0 -left-[13px] w-[180px]">
          <Image src={image} alt="" fill sizes="180px" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className="object-cover object-center" unoptimized />
        </div>
      </div>
      <div className="relative flex h-full flex-col p-3 pt-[15px]">
        <p className="text-[41px] font-black uppercase leading-[1.05] tracking-[-0.6px] text-white">{sportOf(f.sport).label}</p>
        <p className="w-[220px] truncate text-[22px] font-light uppercase leading-[1.25] tracking-[4.8px] text-[#06121C]">{f.league}</p>
        <p className="mt-2 flex w-fit max-w-[210px] items-center gap-[7px] rounded-full bg-white px-2.5 py-[5px] text-[11px] font-bold uppercase tracking-[0.37px] text-[#06121C]">
          <span className="truncate">{fit(f.home, f.homeCode)}</span>
          <span className="bg-gold shrink-0 rounded-full px-[7px] py-[3px] font-[family-name:var(--font-inter)] text-[10px] font-extrabold normal-case leading-none text-black">vs</span>
          <span className="truncate">{fit(f.away, f.awayCode)}</span>
        </p>
        <p className="mt-auto flex w-fit flex-col gap-px rounded-[10px] bg-white/15 py-[7px] pl-[7px] pr-3 text-[9px] text-[#06121C]">
          <span className="font-semibold">{formatBannerDate(f.start)}</span>
          <span className="font-medium opacity-60">Starts at {formatTime(f.start)}</span>
        </p>
      </div>
    </Link>
  );
}

// for now Home shows a single banner: the headline football fixture (falls back to the first slide)
const onlyFootball = (all: Featured[]) => { const f = all.find((s) => s.sport === "football") ?? all[0]; return f ? [f] : []; };

export function FeaturedSlider({ initial }: { initial: Featured[] }) {
  const [slides, setSlides] = useState(() => onlyFootball(initial));
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  // keep slides fresh: fixtures start, new ones become "next"
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const r = await fetch(`${API_URL}/api/v1/featured`, { cache: "no-store" });
        if (r.ok) { const next = ((await r.json()) as { data: Featured[] }).data; if (next.length) setSlides(onlyFootball(next)); }
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
    <section aria-label="Featured matches" aria-roledescription="carousel" className="flex flex-col gap-2.5">
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto"
        onPointerEnter={() => (paused.current = true)} onPointerLeave={() => (paused.current = false)}
        onTouchStart={() => (paused.current = true)} onTouchEnd={() => setTimeout(() => (paused.current = false), 4000)}>
        {slides.map((f, i) => <Slide key={f.matchId} f={f} image={BANNER_IMAGES[i % BANNER_IMAGES.length]!} priority={i === 0} />)}
      </div>
    </section>
  );
}
