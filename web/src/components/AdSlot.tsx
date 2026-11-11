import Image from "next/image";
import Link from "next/link";

// Reserved ad space (IAB sizes per view). Placeholder for now: swap the inner box for the real ad tag here only.
const SIZE = {
  "list-inline": "aspect-[16/5] rounded-lg md:aspect-auto md:h-[90px] md:max-w-[728px] md:rounded-md",
  top: "hidden rounded-lg h-[90px] md:flex lg:h-[130px]",
  side: "hidden aspect-[6/5] rounded-lg lg:flex",
  match: "aspect-[32/5] rounded-lg md:aspect-auto md:h-[100px]",
} as const;

export type AdPlacement = keyof typeof SIZE;

/** In-house 1stLive247 promo: background art from public/ads, text drawn here so it stays sharp and spelled right. */
function PromoMobile() {
  return (
    <Link href="/live" className="absolute inset-0 md:hidden" aria-label="1stLive247: live scores, every ball. Watch live">
      <Image src="/ads/ad-320x100.webp" alt="" fill sizes="(max-width: 767px) 100vw, 1px" className="object-cover object-left" priority={false} />
      <div className="absolute inset-y-0 left-[40%] right-2.5 flex items-center justify-between gap-2">
        <div className="flex flex-col whitespace-nowrap leading-none">
          <span className="mb-1 text-[9px] font-bold tracking-wide text-white/85">1stLive247</span>
          <span className="text-[15px] font-extrabold italic tracking-tight text-white">LIVE SCORES.</span>
          <span className="text-gold pr-0.5 text-[15px] font-extrabold italic tracking-tight">EVERY BALL.</span>
        </div>
        <span className="bg-gold shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#012c78] shadow-[0_0_12px_rgb(242_210_122/0.45)]">
          WATCH LIVE
        </span>
      </div>
      <span className="absolute left-1.5 top-1.5 rounded bg-black/35 px-1 py-px text-[8px] font-bold uppercase tracking-wider text-white/80">Ad</span>
    </Link>
  );
}

/** One-line strip for the Match Centre slot (mobile 32:5). */
function PromoStrip() {
  return (
    <Link href="/live" className="absolute inset-0 md:hidden" aria-label="1stLive247: every ball live. Watch live">
      <Image src="/ads/ad-320x50.webp" alt="" fill sizes="(max-width: 767px) 100vw, 1px" className="object-cover object-center" priority={false} />
      <div className="absolute inset-0 flex items-center justify-between gap-2 pl-3 pr-2.5 whitespace-nowrap">
        <span className="text-[10px] font-bold tracking-wide text-white/85">1stLive247</span>
        <span className="text-[15px] font-extrabold italic leading-none tracking-tight text-white">
          EVERY BALL. <span className="text-gold pr-0.5">LIVE.</span>
        </span>
        <span className="bg-gold shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#012c78] shadow-[0_0_12px_rgb(242_210_122/0.45)]">
          WATCH LIVE
        </span>
      </div>
      <span className="absolute left-1 top-0.5 rounded bg-black/35 px-1 text-[7px] font-bold uppercase tracking-wider text-white/80">Ad</span>
    </Link>
  );
}

/** Tablet/desktop leaderboard: 728×90 art for list/match slots, the panoramic art for the full-width top slot. */
function PromoWide({ wide = false }: { wide?: boolean }) {
  return (
    <Link href="/live" className="@container absolute inset-0 hidden md:block" aria-label="1stLive247: every goal live. Watch live">
      {/* the art is 3:1; this crop keeps the footballer in frame */}
      {wide
        ? <Image src="/ads/ad-top-wide.webp" alt="" fill sizes="(min-width: 768px) 1280px, 1px" className="object-cover object-[center_51%]" priority={false} />
        : <Image src="/ads/ad-728x90.webp" alt="" fill sizes="(min-width: 768px) 970px, 1px" className="object-cover object-[center_32%]" priority={false} />}
      {/* narrow (one masonry column, ~380px): drop the logo and shrink so the button always fits */}
      <div className="absolute inset-0 flex items-center whitespace-nowrap pl-4 pr-3 @[600px]:pl-6 @[600px]:pr-5">
        <span className="hidden text-[12px] font-bold tracking-wide text-white/85 @[600px]:inline @[1000px]:text-[15px]">1stLive247</span>
        <span className="text-[19px] @[600px]:ml-6 @[600px]:text-[26px] @[1000px]:ml-8 @[1000px]:text-[34px] font-extrabold italic leading-none tracking-tight text-white">
          EVERY GOAL. <span className="text-gold pr-1">LIVE.</span>
        </span>
        <span className="bg-gold ml-auto shrink-0 rounded-full px-3.5 py-2 text-[11px] font-extrabold tracking-wide text-[#012c78] @[600px]:px-5 @[600px]:py-2.5 @[600px]:text-[13px] @[1000px]:px-7 @[1000px]:py-3 @[1000px]:text-[15px] shadow-[0_0_16px_rgb(242_210_122/0.45)]">
          WATCH LIVE
        </span>
      </div>
      <span className="absolute left-2 top-1.5 rounded bg-black/35 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-white/80">Ad</span>
    </Link>
  );
}

/** Desktop sidebar box (6:5): art keeps the top and bottom 40% empty for the text. */
function PromoSide() {
  return (
    <Link href="/live" className="absolute inset-0 hidden lg:block" aria-label="1stLive247: live scores, every ball. Watch live">
      <Image src="/ads/ad-side.webp" alt="" fill sizes="(min-width: 1024px) 400px, 1px" className="object-cover" priority={false} />
      <div className="absolute inset-x-4 top-3 flex items-center justify-between">
        <span className="text-[13px] font-bold tracking-wide text-white/90">1stLive247</span>
        <span className="flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
          <span className="size-1.5 animate-pulse rounded-full bg-white" />LIVE
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3">
        <p className="text-[30px] font-extrabold italic leading-[1.05] tracking-tight text-white">
          LIVE SCORES.<br /><span className="text-gold pr-1">EVERY BALL.</span>
        </p>
        <span className="bg-gold rounded-full py-2.5 text-center text-[14px] font-extrabold tracking-wide text-[#012c78] shadow-[0_0_16px_rgb(242_210_122/0.45)]">
          WATCH LIVE
        </span>
      </div>
      <span className="absolute bottom-1 right-2 text-[8px] font-bold uppercase tracking-wider text-white/50">Ad</span>
    </Link>
  );
}

export function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  return (
    <div role="complementary" aria-label="Advertisement" data-ad={placement}
      className={`relative mx-auto flex w-full shrink-0 items-center justify-center overflow-hidden bg-surface ring-1 ring-line [background-image:repeating-linear-gradient(135deg,transparent_0_10px,rgb(52_196_238/0.05)_10px_20px)] ${SIZE[placement]} ${className}`}>
      <span className="absolute left-2 top-2 rounded bg-text-2/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-text-2">Ad</span>
      <span className="text-[11px] font-medium tracking-wide text-text-2/80">Advertisement</span>
      {placement === "list-inline" && <PromoMobile />}
      {placement === "match" && <PromoStrip />}
      {placement === "side" ? <PromoSide /> : <PromoWide wide={placement === "top"} />}
    </div>
  );
}
