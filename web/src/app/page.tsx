import { Suspense } from "react";
import { TopBar } from "@/components/chrome";
import { HomeBoard } from "@/components/home/HomeBoard";
import { ListSkeleton, Skeleton } from "@/components/Skeleton";
import { SPORTS } from "@/data/sports";
import { api } from "@/lib/api";

async function Board() {
  const [matches, featured] = await Promise.all([api.matches(), api.featured().catch(() => [])]);
  return <HomeBoard sports={SPORTS} initial={matches} featured={featured} />;
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
