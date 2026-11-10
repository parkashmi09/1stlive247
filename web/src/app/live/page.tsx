import type { Metadata } from "next";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { TopBar } from "@/components/chrome";
import { LiveList } from "@/components/LiveList";
import { ListSkeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Live Scores" };

async function Live() {
  return <LiveList initial={await api.matches({ status: "live" })} />;
}

export default function LivePage() {
  return (
    <>
      <TopBar variant="title" title="Live Scores" className="lg:hidden" />
      <main className="flex flex-col gap-3 px-4 pt-2 md:px-0">
        <AdSlot placement="top" />
        <Suspense fallback={<ListSkeleton rows={4} />}><Live /></Suspense>
      </main>
    </>
  );
}
