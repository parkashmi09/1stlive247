import type { Match } from "@/data/types";

/** Strike rate: runs per 100 balls. */
export const sr = (runs: number, balls: number) => (balls ? ((runs / balls) * 100).toFixed(2) : "0.00");

/** Economy: runs per over. Overs use cricket notation, so "3.2" means 3 overs + 2 balls. */
export function econ(runs: number, overs: string) {
  const [o, b = "0"] = overs.split(".");
  const n = Number(o) + Number(b) / 6;
  return n ? (runs / n).toFixed(2) : "0.00";
}

/** Side batting now: the feed puts the overs (`detail`) only on the batting side of a live cricket match. */
export function battingSide(m: Pick<Match, "sport" | "status" | "home" | "away">) {
  if (m.sport !== "cricket" || m.status !== "live" || !m.home.detail === !m.away.detail) return undefined;
  return m.home.detail ? "home" as const : "away" as const;
}
