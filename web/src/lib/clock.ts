import type { Timer } from "../data/types";

/** Clock text at `nowS` (server-corrected unix seconds), per the Sports API timer docs. */
export function clockLabel(t: Timer, nowS: number): string {
  if (t.mode !== "clock" || !t.running || t.anchorTs == null) return t.mode === "minute" ? t.minuteLabel || t.display : t.display;
  const inStage = Math.max(0, Math.floor(nowS - t.anchorTs));
  // stale anchor (e.g. the match ended and no update arrived): don't invent "90+227'"
  if (inStage > (t.periodLenS ?? 2700) + 30 * 60) return t.minuteLabel || t.display;
  if (t.periodLenS && inStage > t.periodLenS) return `${(t.baseS + t.periodLenS) / 60}+${Math.floor((inStage - t.periodLenS) / 60) + 1}'`; // 45+2'
  return `${Math.floor((t.baseS + inStage) / 60) + 1}'`;
}
