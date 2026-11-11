// Download every remote image the snapshot references into public/fs/ and point the JSON at the local copy,
// so the deployed site needs no outside host. Run after snapshot.mjs (npm run snapshot does both).
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const WEB = join(import.meta.dirname, "..");
const SNAP = join(WEB, "snapshot");
const HOST = "https://static.flashscore.com/";
const LOCAL = "/fs/";
const files = [join(SNAP, "index.json"), ...(await readdir(join(SNAP, "matches"))).map((f) => join(SNAP, "matches", f)), ...(await readdir(join(SNAP, "news"))).map((f) => join(SNAP, "news", f))];

const urls = new Set();
for (const f of files) for (const m of (await readFile(f, "utf8")).matchAll(/https:\/\/static\.flashscore\.com\/[^"\\]+/g)) urls.add(m[0]);
console.log(`${urls.size} images`);

let next = 0, failed = 0;
const list = [...urls];
await Promise.all(Array.from({ length: 16 }, async () => {
  while (next < list.length) {
    const url = list[next++];
    const rel = url.slice(HOST.length);
    // keep paths inside public/fs/
    if (rel.includes("..")) continue;
    const out = join(WEB, "public", "fs", rel);
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, Buffer.from(await r.arrayBuffer()));
    } catch (err) { failed++; console.warn(`skip ${url}: ${err.message}`); }
  }
}));

for (const f of files) {
  const s = await readFile(f, "utf8");
  if (s.includes(HOST)) await writeFile(f, s.replaceAll(HOST, LOCAL));
}
console.log(`done, ${failed} failed (those keep a broken local path; the UI shows its placeholder)`);
