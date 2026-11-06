import Link from "next/link";
import { sportOf } from "@/data/sports";
import type { NewsArticle } from "@/data/types";
import { TimeAgo } from "./TimeAgo";
import { SportIcon } from "./icons/SportIcon";

/** Image slot — gradient + sport mark until licensed photography is wired in. */
export function ImagePlaceholder({ sport, className, iconSize, corner }: { sport: NewsArticle["sport"]; className: string; iconSize: number; corner?: boolean }) {
  return (
    <div className={`bg-brand-diag flex ${corner ? "items-start justify-end p-5" : "items-center justify-center"} ${className}`} aria-hidden>
      <SportIcon sport={sport} size={iconSize} className="text-white/85" />
    </div>
  );
}

export function NewsHero({ a }: { a: NewsArticle }) {
  return (
    <Link href={`/news/${a.slug}`} className="relative flex h-60 flex-col justify-end gap-2 overflow-hidden rounded-[20px] p-4 text-white">
      <ImagePlaceholder sport={a.sport} className="absolute inset-0" iconSize={96} corner />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-35% to-[#051530]/90" />
      <span className="bg-gold relative w-fit rounded-md px-2 py-0.5 text-xs font-bold uppercase text-[#06121C]">{sportOf(a.sport).label}</span>
      <h3 className="relative text-xl font-bold leading-tight">{a.title}</h3>
      <p className="relative text-xs text-white/70"><TimeAgo iso={a.publishedAt} /></p>
    </Link>
  );
}

export function NewsRow({ a }: { a: NewsArticle }) {
  return (
    <Link href={`/news/${a.slug}`} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
      <ImagePlaceholder sport={a.sport} className="h-[72px] w-[104px] shrink-0 rounded-xl" iconSize={30} />
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold">{a.title}</h3>
        <p className="mt-1.5 text-xs text-text-2">{sportOf(a.sport).label} · <TimeAgo iso={a.publishedAt} /></p>
      </div>
    </Link>
  );
}
