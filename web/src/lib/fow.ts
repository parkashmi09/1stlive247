// Parses the feed's fall-of-wickets strings ("79-1 (Sam Konstas, 24.4)" or "1-79 (…)") and the innings total ("278 (111.1 ov)").

export type FowPoint = { n: number; runs: number; name: string; over: string; ov: number; part: number };

/** "24.4" overs -> 24.667 (balls are sixths of an over) */
export const toOvers = (o: string) => { const [a, b = "0"] = o.split("."); return Number(a) + Number(b) / 6; };

export function parseFow(list: string[], total: string): { wickets: FowPoint[]; runs: number; overs: number } {
  const wickets: FowPoint[] = [];
  for (const f of list) {
    const m = f.match(/^(\d+)-(\d+)\s*\(([^,]+),\s*([\d.]+)\)/);
    if (!m) continue;
    // the feed writes "wkt-runs" (1-79); the runs are always the larger number after the first wicket
    let [n, runs] = [Number(m[1]), Number(m[2])];
    if (n > runs || n > 10) [n, runs] = [runs, n];
    wickets.push({ n, runs, name: m[3].trim(), over: m[4], ov: toOvers(m[4]), part: 0 });
  }
  wickets.sort((a, b) => a.n - b.n);
  wickets.forEach((w, i) => { w.part = w.runs - (i ? wickets[i - 1].runs : 0); });
  const runs = Math.max(Number(total.match(/^(\d+)/)?.[1] ?? 0), wickets.at(-1)?.runs ?? 0);
  const overs = Math.max(toOvers(total.match(/\(([\d.]+)\s*ov/i)?.[1] ?? "0"), wickets.at(-1)?.ov ?? 0, 1);
  return { wickets, runs, overs };
}
