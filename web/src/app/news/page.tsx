import type { Metadata } from "next";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { TopBar } from "@/components/chrome";
import { NewsHero, NewsRow } from "@/components/news";
import { ListSkeleton, Skeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "News" };

async function Feed() {
  const [hero, ...rest] = await api.news();
  if (!hero) return <p className="py-10 text-center text-sm text-text-2">No stories yet.</p>;
  return (<div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-6"><div className="lg:sticky lg:top-36"><NewsHero a={hero} /></div><div>{rest.map((a) => <NewsRow key={a.slug} a={a} />)}</div></div>);
}

export default function NewsPage() {
  return (
    <>
      <TopBar variant="title" title="News" />
      <main className="flex flex-col gap-3 px-4 pt-2 md:px-0">
        <AdSlot placement="top" />
        <Suspense fallback={<><Skeleton className="h-60" /><ListSkeleton rows={4} h="h-20" /></>}><Feed /></Suspense>
      </main>
    </>
  );
}
