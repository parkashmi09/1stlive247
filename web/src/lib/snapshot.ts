// Offline data source: answers api.ts paths from web/snapshot/ (made by scripts/snapshot.mjs) instead of the backend.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const DIR = join(process.cwd(), "snapshot");
const read = (f: string) => readFile(join(DIR, f), "utf8").then(JSON.parse, () => undefined);

type Row = { status?: string; sport?: string };
let index: Promise<{ matches: Row[]; featured: unknown[]; news: Row[] }> | undefined;

/** Same contract as the REST `data` field; undefined means 404. */
export async function snapshotGet(path: string): Promise<unknown> {
  const url = new URL(path, "http://x");
  const q = Object.fromEntries(url.searchParams);
  const filter = (rows: Row[]) => rows.filter((r) => (!q.status || r.status === q.status) && (!q.sport || r.sport === q.sport));
  const [, kind, id, part] = url.pathname.split("/").map(decodeURIComponent);
  // ids are [A-Za-z0-9_-] per the backend's validation; refuse anything else so a path can't escape DIR
  if (id && !/^[A-Za-z0-9_-]+$/.test(id)) return undefined;
  const idx = await (index ??= read("index.json"));
  if (!idx) throw new Error("snapshot/index.json missing: run `npm run snapshot`");

  if (kind === "featured") return idx.featured;
  if (kind === "matches" && !id) return filter(idx.matches);
  if (kind === "matches") {
    const f = await read(`matches/${id}.json`);
    return (part ? f?.[part] : f?.match) ?? undefined;
  }
  if (kind === "news" && !id) return filter(idx.news);
  if (kind === "news") return (await read(`news/${id}.json`)) ?? undefined;
  return undefined;
}
