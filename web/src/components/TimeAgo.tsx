"use client";

import { useSyncExternalStore } from "react";
import { formatDay, timeAgo } from "@/lib/format";

const tick = (cb: () => void) => {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
};

/** Static shell shows the date; the browser swaps in "3h ago" and keeps it fresh each minute. */
export function TimeAgo({ iso }: { iso: string }) {
  const label = useSyncExternalStore(tick, () => timeAgo(iso), () => formatDay(iso));
  return <time dateTime={iso}>{label}</time>;
}
