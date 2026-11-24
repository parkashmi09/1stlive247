"use client";
// Interactive pieces of the More page (design C, "clean settings").
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { LANGS, setLang, T, useLang, useT } from "@/lib/i18n";
import { saveSportPrefs, useSportPrefs } from "@/lib/prefs";
import { SPORTS, sportOf } from "@/data/sports";
import type { SportId } from "@/data/types";
import { SportIcon } from "./icons/SportIcon";
import { cx } from "./ui";

export function LanguageChips() {
  const lang = useLang();
  return (
    <div role="radiogroup" aria-label="Language" className="flex flex-wrap gap-2">
      {LANGS.map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={l.id === lang} onClick={() => setLang(l.id)}
          className={cx("h-9 rounded-full border px-4 text-[13px] font-semibold transition active:scale-95",
            l.id === lang ? "bg-brand bg-origin-border border-transparent text-white" : "glass text-text")}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

// Theme: "light" | "dark" | "auto" in localStorage; the layout script applies it before paint.
// shortcut: "auto" reads the OS setting when chosen and on each load, not live while the page is open
type Theme = "light" | "dark" | "auto";
const THEMES: Theme[] = ["light", "dark", "auto"];
const THEME_EVENT = "theme-change";
const readTheme = (): Theme => {
  try { const t = localStorage.getItem("theme"); if (t === "dark" || t === "auto") return t; } catch {}
  return "light";
};
const subTheme = (cb: () => void) => { window.addEventListener(THEME_EVENT, cb); return () => window.removeEventListener(THEME_EVENT, cb); };

function pickTheme(next: Theme) {
  const dark = next === "dark" || (next === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("theme", next); } catch {}
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeSegment() {
  const theme = useSyncExternalStore(subTheme, readTheme, () => "light" as Theme);
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t("Appearance")} className="flex rounded-full bg-surface-2 p-1">
      {THEMES.map((x) => (
        <button key={x} type="button" role="radio" aria-checked={x === theme} onClick={() => pickTheme(x)}
          className={cx("h-8 flex-1 rounded-full text-[13px] font-bold transition", x === theme ? "bg-surface-solid text-text shadow-sm" : "text-text-2")}>
          {t(x[0].toUpperCase() + x.slice(1))}
        </button>
      ))}
    </div>
  );
}

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
);
const rowCls = "flex h-12 w-full items-center gap-3 pl-3 pr-4 text-left transition active:bg-surface-2";

/** Settings row body: coloured square icon, label, trailing value (chevron by default). */
export function RowBody({ icon, label, end }: { icon: ReactNode; label: string; end?: ReactNode }) {
  return (
    <>
      {icon}
      <span className="flex-1 text-[15px] font-medium"><T>{label}</T></span>
      {end ?? <span className="text-text-2"><Chevron /></span>}
    </>
  );
}

// shortcut: alerts switch is only remembered in this browser; wire it to push notifications once the backend sends them
export function AlertsRow({ icon }: { icon: ReactNode }) {
  const [on, setOn] = useState(() => { try { return localStorage.getItem("alerts") !== "off"; } catch { return true; } });
  const toggle = () => { setOn(!on); try { localStorage.setItem("alerts", on ? "off" : "on"); } catch {} };
  return (
    <div className={rowCls}>
      <RowBody icon={icon} label="Notifications" end={
        <button type="button" role="switch" aria-checked={on} aria-label="Notifications" onClick={toggle}
          className={cx("flex h-[26px] w-11 shrink-0 items-center rounded-full px-[3px] transition-colors", on ? "bg-brand justify-end" : "justify-start bg-surface-2")}>
          <span className="size-5 rounded-full bg-white shadow" />
        </button>} />
    </div>
  );
}

/** Native share sheet where available, else copy the link. */
export function ShareRow({ icon }: { icon: ReactNode }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const data = { title: "1stLive247", text: t("Live scores, news & stats."), url: location.origin };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(data.url);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch {} // user closed the share sheet
  };
  return (
    <button type="button" onClick={share} className={rowCls}>
      <RowBody icon={icon} label="Share app" end={copied ? <span className="text-sm font-semibold text-boundary"><T>Link copied</T></span> : undefined} />
    </button>
  );
}

/** Follow/unfollow sports inline, and pick which one Home opens on. Saves on every tap. */
export function SportsEditor() {
  const prefs = useSportPrefs() ?? [];
  const t = useT();
  const toggle = (id: SportId) => {
    const next = prefs.includes(id) ? prefs.filter((x) => x !== id) : [...prefs, id];
    if (next.length) saveSportPrefs(next); // keep at least one followed sport
  };
  return (
    <div className="glass flex flex-col gap-4 rounded-2xl p-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-text-2">{t("Tap to follow or unfollow.")}</p>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((s) => {
            const on = prefs.includes(s.id);
            return (
              <button key={s.id} type="button" aria-pressed={on} onClick={() => toggle(s.id)}
                className={cx("flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition active:scale-95",
                  on ? "bg-brand bg-origin-border border-transparent text-white" : "glass text-text-2")}>
                <SportIcon sport={s.id} size={15} />{t(s.label)}
              </button>
            );
          })}
        </div>
      </div>
      {prefs.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-text-2">{t("Opens first")}</p>
          <div role="radiogroup" aria-label={t("Opens first")} className="flex flex-wrap gap-2">
            {prefs.map((id, i) => (
              <button key={id} type="button" role="radio" aria-checked={i === 0} onClick={() => saveSportPrefs([id, ...prefs.filter((x) => x !== id)])}
                className={cx("h-8 rounded-full border px-3 text-[12px] font-bold transition", i === 0 ? "bg-gold bg-origin-border border-transparent text-[#5a3a05]" : "glass text-text-2")}>
                {t(sportOf(id).label)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
