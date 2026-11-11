// Freeze the backend's data into web/snapshot/ so the site runs with no API (NEXT_PUBLIC_DATA_SOURCE=snapshot).
// Usage: node scripts/snapshot.mjs [apiBase]   (default: NEXT_PUBLIC_API_URL or the hosted backend)
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = (process.argv[2] ?? process.env.NEXT_PUBLIC_API_URL ?? "http://217.216.78.106:4247") + "/api/v1";
const OUT = join(import.meta.dirname, "..", "snapshot");
const TMP = OUT + ".tmp";

async function get(path, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(BASE + path, { signal: AbortSignal.timeout(60_000) });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return (await r.json()).data;
    } catch (err) {
      if (i >= tries) { console.warn(`skip ${path}: ${err.message}`); return null; }
      await new Promise((res) => setTimeout(res, 1000 * i));
    }
  }
}

// run fn over items, n at a time
async function pool(items, n, fn) {
  let next = 0, done = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
      if (++done % 50 === 0) console.log(`  ${done}/${items.length}`);
    }
  }));
}

const enc = encodeURIComponent;
const [sports, matches, featured, news] = await Promise.all([get("/sports"), get("/matches"), get("/featured"), get("/news")]);
if (!matches?.length) throw new Error(`no matches from ${BASE}; is the backend up and the feed IP allowed?`);
console.log(`${matches.length} matches, ${news?.length ?? 0} articles from ${BASE}`);

// write to a temp dir first so a failed run never wipes the last good snapshot
await rm(TMP, { recursive: true, force: true });
await mkdir(join(TMP, "matches"), { recursive: true });
await mkdir(join(TMP, "news"), { recursive: true });

await pool(matches, 8, async (m) => {
  const [centre, insights] = await Promise.all([get(`/matches/${enc(m.id)}/centre`), get(`/matches/${enc(m.id)}/insights`)]);
  await writeFile(join(TMP, "matches", `${m.id}.json`), JSON.stringify({ match: m, centre, insights }));
});
await pool(news ?? [], 4, async (n) => {
  await writeFile(join(TMP, "news", `${n.slug}.json`), JSON.stringify(await get(`/news/${enc(n.slug)}`)));
});
await writeFile(join(TMP, "index.json"), JSON.stringify({ takenAt: new Date().toISOString(), source: BASE, sports, matches, featured, news }));

await rm(OUT, { recursive: true, force: true });
const { rename } = await import("node:fs/promises");
await rename(TMP, OUT);
console.log(`snapshot saved to ${OUT}`);
