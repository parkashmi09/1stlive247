import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { TopBar } from "@/components/chrome";
import { LiveScoreHeader, MatchLive } from "@/components/match-live";
import { MatchTabs } from "@/components/MatchTabs";
import { ListSkeleton, Skeleton } from "@/components/Skeleton";
import { api, matchTitle } from "@/lib/api";

type Params = LayoutProps<"/match/[id]">["params"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: await matchTitle((await params).id) };
}

async function Feed({ params, children }: { params: Params; children: ReactNode }) {
  const { id } = await params;
  const [match, centre] = await Promise.all([api.match(id), api.centre(id)]);
  if (!match) notFound();
  const stats = centre ? undefined : await api.stats(id).catch(() => undefined);
  return (
    <MatchLive match={match} centre={centre} stats={stats}>
      {centre && <MatchTabs id={id} />}
      <LiveScoreHeader />
      <div className="flex flex-col gap-3 px-4 pt-3">{children}</div>
    </MatchLive>
  );
}

export default function MatchLayout({ params, children }: LayoutProps<"/match/[id]">) {
  return (
    <>
      <TopBar variant="back" title="Match Centre" backHref="/live" />
      <main>
        <Suspense fallback={<div className="flex flex-col gap-3"><Skeleton className="mx-4 h-72" /><div className="px-4"><ListSkeleton /></div></div>}>
          <Feed params={params}>{children}</Feed>
        </Suspense>
      </main>
    </>
  );
}
