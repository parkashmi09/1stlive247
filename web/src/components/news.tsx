import Image from "next/image";
import Link from "next/link";
import { sportOf } from "@/data/sports";
import type { NewsArticle } from "@/data/types";
import { TimeAgo } from "./TimeAgo";
import { SportIcon } from "./icons/SportIcon";

// Article photos in public/news/<slug>.webp. shortcut: hand-kept list while news is seeded demo data; move to an `image` field once a news API exists.
const NEWS_IMAGES = new Set(["venue-ready-series-opener", "india-clinch-thriller-final-over", "new-look-batting-order", "late-winner-title-race", "pkl-raiders-to-watch", "five-set-classic"]);

/** Image slot: the article photo when we have one, else gradient + sport mark. */
export function ImagePlaceholder({ sport, slug, className, iconSize, corner, sizes = "(min-width: 1024px) 720px, 100vw" }: { sport: NewsArticle["sport"]; slug?: string; className: string; iconSize: number; corner?: boolean; sizes?: string }) {
  if (slug && NEWS_IMAGES.has(slug)) {
    return (
      // next/image fill needs a positioned parent; the hero passes "absolute", the others get "relative"
      <div className={`${className.includes("absolute") ? "" : "relative"} overflow-hidden bg-brand-diag ${className}`} aria-hidden>
        <Image src={`/news/${slug}.webp`} alt="" fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`bg-brand-diag flex ${corner ? "items-start justify-end p-5" : "items-center justify-center"} ${className}`} aria-hidden>
      <SportIcon sport={sport} size={iconSize} className="text-white/85" />
    </div>
  );
}

export function NewsHero({ a }: { a: NewsArticle }) {
  return (
    // 16:10 cover anchored to the top so the subject (trophy, players) isn't cropped; text sits on a bottom-only scrim
    <Link href={`/news/${a.slug}`} className="relative flex aspect-[16/10] flex-col justify-end gap-1.5 overflow-hidden rounded-[20px] p-4 text-white shadow-raised lg:aspect-[16/9]">
      <ImagePlaceholder sport={a.sport} slug={a.slug} className="absolute inset-0 [&_img]:object-top" iconSize={96} corner />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#051530]/95 via-[#051530]/55 to-transparent" />
      <span className="bg-gold relative w-fit rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#06121C]">{sportOf(a.sport).label}</span>
      <h3 className="relative line-clamp-2 text-[17px] font-extrabold leading-snug lg:text-xl">{a.title}</h3>
      <p className="relative text-[11px] font-medium text-white/70"><TimeAgo iso={a.publishedAt} /></p>
    </Link>
  );
}

export function NewsRow({ a }: { a: NewsArticle }) {
  return (
    <Link href={`/news/${a.slug}`} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
      <ImagePlaceholder sport={a.sport} slug={a.slug} className="h-[72px] w-[104px] shrink-0 rounded-xl" iconSize={30} sizes="104px" />
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold">{a.title}</h3>
        <p className="mt-1.5 text-xs text-text-2">{sportOf(a.sport).label} · <TimeAgo iso={a.publishedAt} /></p>
      </div>
    </Link>
  );
}
