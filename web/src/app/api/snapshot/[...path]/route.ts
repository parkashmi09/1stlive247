// Snapshot mode only: answers the browser's /api/v1/* calls (rewritten here by next.config) from web/snapshot,
// in the backend's { data } shape. Outside snapshot mode it is never reached and returns 404.
import type { NextRequest } from "next/server";
import { SNAPSHOT } from "@/lib/config";
import { snapshotGet } from "@/lib/snapshot";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!SNAPSHOT) return Response.json({ error: "not_found" }, { status: 404 });
  const { path } = await params;
  const data = await snapshotGet(`/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`).catch(() => undefined);
  return data === undefined ? Response.json({ error: "not_found" }, { status: 404 }) : Response.json({ data });
}
