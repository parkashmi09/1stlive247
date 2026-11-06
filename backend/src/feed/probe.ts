// Saves one real response per endpoint to backend/samples/ so the feed mapping is written against real payloads.
// Usage: npm run feed:probe [sport]   (default: cricket)
import { mkdir, writeFile } from "node:fs/promises";
import { ENDPOINTS, SLICES, sportsApi } from "./sports-api.ts";

const sport = process.argv[2] ?? "cricket";
const out = new URL("../../samples/", import.meta.url);
await mkdir(out, { recursive: true });

async function save(name: string, path: string) {
  try {
    const data = await sportsApi(path);
    await writeFile(new URL(`${name}.json`, out), JSON.stringify(data, null, 2));
    console.log("ok  ", path);
    return data;
  } catch (err) {
    console.log("FAIL", path, (err as Error).message);
  }
}

await save("sports", ENDPOINTS.sports());
const live = await save(`live-${sport}`, ENDPOINTS.live(sport));
await save(`upcoming-${sport}`, ENDPOINTS.upcoming(sport));

// first event id we can find in the live payload
const id = JSON.stringify(live ?? {}).match(/"(?:id|event_id|eventId)"\s*:\s*"?([\w-]+)"?/)?.[1];
if (id) {
  await save(`event-${sport}-scoreboard`, ENDPOINTS.scoreboard(id));
  await save(`event-${sport}-timer`, ENDPOINTS.timer(id));
  for (const s of SLICES) await save(`event-${sport}-${s}`, ENDPOINTS.slice(id, s));
} else console.log("no live event id found; event endpoints skipped");
