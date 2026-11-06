"use client";

import { useSyncExternalStore } from "react";

const isDark = () => document.documentElement.dataset.theme === "dark";

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("theme", next); } catch {}
  };
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="Dark mode" onClick={toggle}
      className={`flex h-[26px] w-11 items-center rounded-full px-[3px] transition-colors ${dark ? "justify-end bg-deep" : "justify-start bg-surface-2"}`}>
      <span className={`size-5 rounded-full shadow ${dark ? "bg-gold" : "bg-white"}`} />
    </button>
  );
}
