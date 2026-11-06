"use client";
// Ticks a match clock locally from the feed's anchor — no polling.
import { useSyncExternalStore } from "react";
import type { Timer } from "@/data/types";
import { clockLabel } from "@/lib/clock";

const subscribe = (cb: () => void) => { const t = setInterval(cb, 1000); return () => clearInterval(t); };

export function LiveClock({ timer, fallback }: { timer?: Timer; fallback?: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () => (timer ? clockLabel(timer, Date.now() / 1000) : fallback ?? ""),
    () => fallback ?? timer?.minuteLabel ?? timer?.display ?? "", // matches SSR output
  );
  return <>{label}</>;
}
