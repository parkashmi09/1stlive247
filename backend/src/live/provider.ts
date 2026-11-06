// A live data source pushes normalized events; the engine persists and broadcasts them.
// Real feeds (the in-house Sports API) implement the same interface.
import type { Outcome } from "./cricket.ts";

export type LiveEvent =
  | { type: "cricket:ball"; matchId: string; outcome: Outcome }
  | { type: "match:patch"; matchId: string; patch: { clock?: string; note?: string; homeScore?: string; awayScore?: string } };

export interface LiveProvider {
  name: string;
  start(emit: (e: LiveEvent) => Promise<void>): void;
  stop(): void;
}
