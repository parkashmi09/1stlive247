"use client";
// Match Centre live state: one socket subscription in the layout, shared by the header and every tab.
import { createContext, use, type ReactNode } from "react";
import type { Match, MatchCentre, StatGroup } from "@/data/types";
import { useMatchFeed } from "@/lib/live";
import { Commentary, LatestUpdate, MatchStats, RecentBalls, ScoreHeader, Scorecard } from "./match-centre";
import { AtTheCrease, InningsScorecard } from "./scorecard";

const Ctx = createContext<{ match: Match; centre?: MatchCentre; stats?: StatGroup[] } | null>(null);
const useFeed = () => {
  const v = use(Ctx);
  if (!v) throw new Error("useFeed must be used inside <MatchLive>");
  return v;
};

export function MatchLive({ match, centre, stats, children }: { match: Match; centre?: MatchCentre; stats?: StatGroup[]; children: ReactNode }) {
  return <Ctx value={{ ...useMatchFeed(match, centre), stats }}>{children}</Ctx>;
}

export function LiveScoreHeader() {
  const { match, centre } = useFeed();
  return <ScoreHeader m={match} stats={centre?.stats} />;
}

const NoCoverage = () => <p className="py-8 text-center text-sm text-text-2">Detailed coverage for this match is coming soon.</p>;

export function OverviewTab() {
  const { centre: c, stats } = useFeed();
  if (!c) return stats?.length ? <MatchStats groups={stats} /> : <NoCoverage />;
  return (
    <>
      {c.crease && <AtTheCrease crease={c.crease} />}
      {c.thisOver.length > 0 && <RecentBalls c={c} />}
      {c.latest.text && <LatestUpdate c={c} />}
      {c.commentary.length > 0 && <Commentary items={c.commentary.slice(0, 6)} />}
    </>
  );
}

export function ScorecardTab() {
  const { centre: c } = useFeed();
  if (!c) return <NoCoverage />;
  return c.innings?.length ? <InningsScorecard innings={c.innings} /> : <Scorecard c={c} />;
}

export function CommentaryTab() {
  const { centre: c } = useFeed();
  if (!c) return <NoCoverage />;
  return (<>{c.thisOver.length > 0 && <RecentBalls c={c} />}{c.commentary.length ? <Commentary items={c.commentary} /> : <NoCoverage />}</>);
}
