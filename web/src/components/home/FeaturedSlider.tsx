"use client";
// Home banner slider: the designer's banner frame (Figma 60:1085, 370×155 card inside a 180-tall frame) with real fixtures.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sportOf } from "@/data/sports";
import type { Featured, SportId } from "@/data/types";
import { API_URL } from "@/lib/config";
import { formatBannerDate, formatTime } from "@/lib/format";
import { SportIcon } from "../icons/SportIcon";
import { TeamBadge, cx } from "../ui";
import type { Tone } from "@/data/types";

// Player art per sport: the designer's framed cut-outs (Figma 69:213 / 69:214 / 69:215, each 153×180). A sport without art gets no slide.
// shortcut: no tennis cut-out from the designer yet, so that slide runs without a player image; add it here when it lands.
const ART: Partial<Record<SportId, string | null>> = {
  football: "/banners/football.webp",
  tennis: "/banners/tennis-2.webp",
};
// shortcut: badminton isn't a feed sport yet, so its designer banner runs as a fixed promo slide; move it into ART once the feed has it.
// shortcut: user wants IND v NZ on the cricket slide; the feed has no such fixture, so it is a fixed promo. Swap to a real
// Featured entry (and put cricket back in ART) once the series is in the feed. India flag = feed IND crest until the user's file lands.
const PROMOS = [
  { label: "Cricket", sub: "India tour of New Zealand", art: "/banners/cricket-2.webp", href: "/live",
    teams: [{ name: "India", flag: "https://static.flashscore.com/res/image/data/2PligRmC-vqjYdOL1.png" }, { name: "New Zealand", flag: "/flags/nz.webp" }] },
];
const AUTOPLAY_MS = 5000;
const REFRESH_MS = 5 * 60_000;
// the team row fits ~11 chars per name at the Figma size; longer names show the team code
const fit = (name: string, code: string) => (name.length <= 11 ? name : code);
// how far the player box pops above the 155px card; box keeps the 153×180 ratio and stays flush with the card bottom
const RISE: Partial<Record<SportId, number>> = { football: 19 };
const artBox = (sport: SportId) => { const rise = RISE[sport] ?? 8; return { top: -rise, width: Math.round((155 + rise) * 0.85) }; };
const ORDER = Object.keys(ART);
const withArt = (all: Featured[]) => all.filter((f) => f.sport in ART).sort((a, b) => ORDER.indexOf(a.sport) - ORDER.indexOf(b.sport));

/** Team mark on the banner: the raw crest/flag, no white plate (Figma 63:160); badge fallback when the feed has no logo. */
/** Faint sport marks behind the banner card (same idea as the Live hero). */
function Watermark({ sport }: { sport: SportId }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[155px] overflow-hidden rounded-[20px]">
      <SportIcon sport={sport} size={120} className="absolute -left-6 -top-8 rotate-[-15deg] text-white opacity-[0.08]" />
      <SportIcon sport={sport} size={72} className="absolute bottom-[-18px] left-[42%] rotate-12 text-white opacity-[0.07]" />
    </div>
  );
}

function Mark({ code, tone, logo }: { code: string; tone: Tone; logo?: string }) {
  return logo ? <Flag src={logo} /> : <TeamBadge code={code} tone={tone} size={24} />;
}

/** Every flag in the same 24×16 box. Feed flags are 30×30 PNGs with the flag floating in the middle, so those get zoomed. */
function Flag({ src }: { src: string }) {
  const feed = src.startsWith("http");
  return (
    <span className="h-4 w-6 shrink-0 overflow-hidden rounded-[4px]">
      <Image src={src} alt="" width={24} height={16} className={cx("size-full object-cover object-center", feed && "scale-[1.5]")} unoptimized={feed} />
    </span>
  );
}

function Slide({ f, priority }: { f: Featured; priority: boolean }) {
  return (
    // 155px card; the player box (RISE above) sits flush with the card bottom and pops above its top
    <Link href={`/match/${f.matchId}`} aria-label={`${f.home} vs ${f.away}, ${f.league}`} className="relative mt-[19px] block h-[155px] w-full shrink-0 snap-center">
      <div className="absolute inset-x-0 top-0 h-[155px] rounded-[20px] [background-image:linear-gradient(131deg,#34C4EE_26.6%,#002B77_101%)]" />
      <Watermark sport={f.sport} />
      {ART[f.sport] && (
        <div className="absolute bottom-0 right-0" style={artBox(f.sport)} aria-hidden>
          <Image src={ART[f.sport]!} alt="" fill sizes="160px" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className="object-cover" />
        </div>
      )}
      <div className="absolute left-4 right-[140px] top-4">
        <p className="text-[30px] font-black italic uppercase leading-[0.9] tracking-[-0.8px] text-white">{sportOf(f.sport).label}</p>
        <p className="mt-1 line-clamp-2 text-[14px] font-extrabold italic uppercase leading-[1.1] tracking-[0.2px] text-transparent [-webkit-text-stroke:0.9px_#fff]">{f.league}</p>
      </div>
      <div className="absolute left-4 top-[104px] flex items-center gap-[6px] whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3px] text-white">
        <span>{fit(f.home, f.homeCode)}</span>
        <Mark code={f.homeCode} tone={f.homeTone} logo={f.homeLogo} />
        <span className="text-[13px] font-extrabold normal-case tracking-normal text-black">VS</span>
        <Mark code={f.awayCode} tone={f.awayTone} logo={f.awayLogo} />
        <span>{fit(f.away, f.awayCode)}</span>
      </div>
      <p className="absolute left-4 top-[134px] flex gap-[9px] whitespace-nowrap text-[9px] text-[#06121C]">
        {f.live
          ? <span className="flex items-center gap-1 font-bold uppercase tracking-wide text-live"><span className="size-1.5 rounded-full bg-live" />Live now</span>
          : <><span className="font-semibold">{formatBannerDate(f.start)}</span><span className="font-medium opacity-60">Starts at {formatTime(f.start)}</span></>}
      </p>
    </Link>
  );
}

function PromoSlide({ p }: { p: (typeof PROMOS)[number] }) {
  return (
    <Link href={p.href} aria-label={`${p.label}: ${p.sub}`} className="relative mt-[19px] block h-[155px] w-full shrink-0 snap-center">
      <div className="absolute inset-x-0 top-0 h-[155px] rounded-[20px] [background-image:linear-gradient(131deg,#34C4EE_26.6%,#002B77_101%)]" />
      <Watermark sport="cricket" />
      <div className="absolute bottom-0 right-0" style={artBox("cricket")} aria-hidden>
        <Image src={p.art} alt="" fill sizes="160px" loading="lazy" className="object-cover" />
      </div>
      <div className="absolute left-4 right-[140px] top-4">
        <p className="text-[30px] font-black italic uppercase leading-[0.9] tracking-[-0.8px] text-white">{p.label}</p>
        <p className="mt-1 line-clamp-2 text-[14px] font-extrabold italic uppercase leading-[1.1] tracking-[0.2px] text-transparent [-webkit-text-stroke:0.9px_#fff]">{p.sub}</p>
      </div>
      {p.teams && (
        <div className="absolute left-4 top-[104px] flex items-center gap-[6px] whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3px] text-white">
          <span>{p.teams[0].name}</span><Flag src={p.teams[0].flag} />
          <span className="text-[13px] font-extrabold normal-case tracking-normal text-black">VS</span>
          <Flag src={p.teams[1].flag} /><span>{p.teams[1].name}</span>
        </div>
      )}
      <p className="absolute left-4 top-[134px] text-[9px] font-semibold text-[#06121C]">{p.teams ? "Series fixtures coming soon" : "1stLive247 · Always on for sports"}</p>
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
    const total = slides.length + PROMOS.length;
    if (total < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      const el = track.current;
      if (!el || paused.current) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % total;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length && !PROMOS.length) return null;
  return (
    <section aria-label="Featured matches" aria-roledescription="carousel" className="-mt-4">
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto"
        onPointerEnter={() => (paused.current = true)} onPointerLeave={() => (paused.current = false)}
        onTouchStart={() => (paused.current = true)} onTouchEnd={() => setTimeout(() => (paused.current = false), 4000)}>
        {slides.filter((f) => f.sport === "football").map((f, i) => <Slide key={f.matchId} f={f} priority={i === 0} />)}
        {PROMOS.map((p) => <PromoSlide key={p.label} p={p} />)}
        {slides.filter((f) => f.sport !== "football").map((f) => <Slide key={f.matchId} f={f} priority={false} />)}
      </div>
    </section>
  );
}
