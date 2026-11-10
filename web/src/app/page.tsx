import Link from "next/link";
import { Suspense } from "react";
import { TopBar } from "@/components/chrome";
import { HomeBoard } from "@/components/home/HomeBoard";
import { NewsRow } from "@/components/news";
import { ListSkeleton, Skeleton } from "@/components/Skeleton";
import { SPORTS } from "@/data/sports";
import { api } from "@/lib/api";

async function Board() {
  const [matches, featured, news] = await Promise.all([api.matches(), api.featured().catch(() => []), api.news().catch(() => [])]);
  return (
    <HomeBoard sports={SPORTS} initial={matches} featured={featured}>
      {/* desktop-only side widget, like Sofascore's middle column */}
      {news.length > 0 && (
        <section aria-labelledby="h-news" className="hidden rounded-2xl border border-line bg-surface px-4 pt-3 lg:block">
          <h2 id="h-news" className="flex items-center text-sm font-bold">
            <span className="flex-1">Latest News</span>
            <Link href="/news" className="text-xs font-semibold text-accent">See all</Link>
          </h2>
          {news.slice(0, 5).map((a) => <NewsRow key={a.slug} a={a} />)}
        </section>
      )}
    </HomeBoard>
  );
}

export default function Home() {
  return (
    <>
      <TopBar variant="brand" />
      <main>
        <Suspense fallback={<div className="flex flex-col gap-4 px-4 pt-2"><Skeleton className="h-48" /><Skeleton className="h-12" /><ListSkeleton /></div>}>
          <Board />
        </Suspense>
      </main>
    </>
  );
}
