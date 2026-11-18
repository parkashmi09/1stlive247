import type { Metadata } from "next";
import { Suspense } from "react";
import { TopBar } from "@/components/chrome";
import { SearchBoard } from "@/components/SearchBoard";
import { ListSkeleton, Skeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Search" };

async function Results() {
  const [matches, news] = await Promise.all([api.matches(), api.news().catch(() => [])]);
  return <SearchBoard matches={matches} news={news} />;
}

export default function SearchPage() {
  return (
    <>
      <TopBar variant="title" title="Search" hideSearch />
      <main className="flex flex-col gap-4 px-4 pt-2 md:px-0">
        <Suspense fallback={<><Skeleton className="h-11" /><ListSkeleton rows={4} h="h-20" /></>}><Results /></Suspense>
      </main>
    </>
  );
}
