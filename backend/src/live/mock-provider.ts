// Simulates live action on the seeded matches so the whole realtime path can be exercised without a feed.
import { logger } from "../logger.ts";
import type { Outcome } from "./cricket.ts";
import type { LiveEvent, LiveProvider } from "./provider.ts";

// Rough ODI distribution per delivery.
const OUTCOMES: [Outcome, number][] = [
  [{ kind: "dot", runs: 0 }, 38], [{ kind: "run", runs: 1 }, 34], [{ kind: "run", runs: 2 }, 8], [{ kind: "run", runs: 3 }, 1],
  [{ kind: "four", runs: 4 }, 10], [{ kind: "six", runs: 6 }, 4], [{ kind: "wicket", runs: 0 }, 3], [{ kind: "extra", runs: 1 }, 2],
];
const total = OUTCOMES.reduce((s, [, w]) => s + w, 0);

export function pickOutcome(r = Math.random()): Outcome {
  let x = r * total;
  for (const [o, w] of OUTCOMES) if ((x -= w) < 0) return o;
  return OUTCOMES[0]![0];
}

export function createMockProvider(tickMs: number): LiveProvider {
  let timer: NodeJS.Timeout | undefined;
  let tick = 0;
  const minutes: Record<string, number> = { "ars-che": 73, "bar-rma": 65 };
  const goals: Record<string, [number, number]> = { "ars-che": [2, 1], "bar-rma": [1, 1] };

  return {
    name: "mock",
    start(emit) {
      const run = async (e: LiveEvent) => emit(e).catch((err) => logger.error({ err, e }, "mock event failed"));
      timer = setInterval(() => {
        tick++;
        void run({ type: "cricket:ball", matchId: "ind-aus-odi-2", outcome: pickOutcome() });
        // football clocks advance one "minute" every 3 ticks, capped at 90
        if (tick % 3 === 0) for (const id of Object.keys(minutes)) {
          if (minutes[id]! >= 90) continue;
          minutes[id]!++;
          const patch: { clock: string; homeScore?: string; awayScore?: string } = { clock: `${minutes[id]}'` };
          if (Math.random() < 0.04) {
            const g = goals[id]!; const home = Math.random() < 0.5;
            g[home ? 0 : 1]++;
            patch.homeScore = String(g[0]); patch.awayScore = String(g[1]);
          }
          void run({ type: "match:patch", matchId: id, patch });
        }
      }, tickMs);
      logger.info({ tickMs }, "mock live provider started");
    },
    stop() { clearInterval(timer); },
  };
}
