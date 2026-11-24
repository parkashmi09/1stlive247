"use client";
// The visitor's chosen sports (from onboarding), in pick order. No accounts yet, so it lives in this browser's localStorage.
// shortcut: per-browser only; move to the user's profile on the backend once signup exists
import { useSyncExternalStore } from "react";
import type { SportId } from "@/data/types";

const KEY = "sports";
const EVENT = "prefs-change";
const NONE: SportId[] = [];
let cache: { raw: string | null; val: SportId[] | null } = { raw: null, val: null };

function read(): SportId[] | null {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch {}
  if (raw !== cache.raw) {
    let val: SportId[] | null = null;
    try { const v = raw && JSON.parse(raw); if (Array.isArray(v)) val = v; } catch {}
    cache = { raw, val };
  }
  return cache.val;
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
};

/** null = not onboarded yet; [] = skipped; otherwise the picked sports, first = default. */
export const useSportPrefs = () => useSyncExternalStore(subscribe, read, () => NONE);

export function saveSportPrefs(sports: SportId[]) {
  try { localStorage.setItem(KEY, JSON.stringify(sports)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** Re-open the onboarding sheet (from the More page). */
export const OPEN_ONBOARDING = "open-onboarding";
