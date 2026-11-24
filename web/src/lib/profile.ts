"use client";
// The visitor's profile (name, email, favourite team, photo). No accounts yet, so it lives in localStorage.
// shortcut: per-browser only; move to the backend user record once signup exists
import { useSyncExternalStore } from "react";

export type Profile = { name: string; email: string; team: string; photo?: string };
const KEY = "profile";
const EVENT = "profile-change";
const EMPTY: Profile = { name: "", email: "", team: "" };
let cache: { raw: string | null; val: Profile } = { raw: null, val: EMPTY };

function read(): Profile {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch {}
  if (raw !== cache.raw) {
    let val = EMPTY;
    try { const v = raw && JSON.parse(raw); if (v && typeof v === "object") val = { ...EMPTY, ...v }; } catch {}
    cache = { raw, val };
  }
  return cache.val;
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
};

export const useProfile = () => useSyncExternalStore(subscribe, read, () => EMPTY);

/** Returns false if the browser refused to store it (storage full / blocked). */
export function saveProfile(p: Profile): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { return false; }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

/** Centre-crops an image file to a 256px square JPEG data URL (~20–40 KB), small enough for localStorage. */
export async function photoFromFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not an image");
  const img = await createImageBitmap(file);
  const side = Math.min(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  canvas.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
  img.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
