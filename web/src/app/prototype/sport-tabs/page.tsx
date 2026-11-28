"use client";
// shortcut: throwaway prototype of 10 3D sport-tab looks; delete this route once the user picks a letter
import { useState, type CSSProperties } from "react";
import { SportIcon } from "@/components/icons/SportIcon";
import { SPORTS } from "@/data/sports";
import { cx } from "@/components/ui";
import type { SportId } from "@/data/types";

type Look = { cls?: string; style?: CSSProperties };
type Variant = {
  title: string; note: string;
  chip: (on: boolean) => Look;
  icon?: (on: boolean) => CSSProperties;
  row?: Look; gloss?: boolean; gold?: boolean; tiles?: boolean;
};

const NAVY = "rgb(1 44 120 / ";
const MUTED = "#7b8aa0";
/** stacked hard shadows = a thick, extruded glyph */
const extrude = (c: string): CSSProperties => ({ filter: `drop-shadow(0 1px 0 ${c}) drop-shadow(0 2px 0 ${c}) drop-shadow(0 4px 3px rgb(0 0 0 / 0.28))` });
/** light edge below + dark edge above = a glyph pressed into the surface */
const engrave: CSSProperties = { filter: `drop-shadow(0 1px 0 rgb(255 255 255 / 0.85)) drop-shadow(0 -1px 0 ${NAVY}0.22))` };
const SHORT: Partial<Record<SportId, string>> = { racing: "Racing", basketball: "Basket" };

const VARIANTS: Variant[] = [
  {
    title: "Keycap", note: "Solid bottom edge, presses down on tap",
    chip: (on) => on
      ? { cls: "bg-brand text-white active:translate-y-[3px]", style: { boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.4), 0 4px 0 #011d52, 0 9px 14px ${NAVY}0.3)` } }
      : { cls: "bg-surface-solid active:translate-y-[3px]", style: { color: MUTED, boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.9), 0 4px 0 ${NAVY}0.2), 0 7px 10px ${NAVY}0.1)` } },
    icon: (on) => (on ? extrude("rgb(1 29 82 / 0.6)") : engrave),
  },
  {
    title: "Gel pill", note: "Glossy candy button with a wet highlight", gloss: true,
    chip: (on) => on
      ? { cls: "text-white", style: { background: "linear-gradient(180deg,#7fdcf8 0%,var(--cyan) 42%,#0b5fb4 100%)", boxShadow: `inset 0 2px 1px rgb(255 255 255 / 0.6), inset 0 -5px 7px ${NAVY}0.45), 0 7px 12px rgb(26 159 216 / 0.4)` } }
      : { style: { color: MUTED, background: `linear-gradient(180deg,var(--surface-solid),${NAVY}0.1))`, boxShadow: `inset 0 2px 1px rgb(255 255 255 / 0.9), inset 0 -4px 6px ${NAVY}0.14), 0 5px 9px ${NAVY}0.14)` } },
    icon: (on) => (on ? extrude("rgb(1 44 120 / 0.5)") : engrave),
  },
  {
    title: "Soft clay", note: "Raised from the page; the active one is pressed in",
    chip: (on) => on
      ? { cls: "text-primary", style: { background: "var(--bg)", boxShadow: `inset 4px 4px 8px ${NAVY}0.24), inset -4px -4px 8px var(--glass-border)` } }
      : { style: { color: MUTED, background: "var(--bg)", boxShadow: `5px 5px 10px ${NAVY}0.2), -5px -5px 10px var(--glass-border)` } },
    icon: () => engrave,
  },
  {
    title: "Orbs", note: "Each sport is a lit sphere",
    chip: (on) => on
      ? { cls: "text-white", style: { background: "radial-gradient(120% 150% at 22% 12%,#a5eaff 0%,var(--cyan) 30%,var(--deep) 100%)", boxShadow: `0 8px 12px ${NAVY}0.35), inset 0 -3px 6px rgb(0 0 0 / 0.25)` } }
      : { style: { color: "#5d6c84", background: "radial-gradient(circle at 30% 24%,#ffffff 0%,#dce8f6 45%,#a3b7d2 100%)", boxShadow: `0 6px 9px ${NAVY}0.22), inset 0 -3px 5px ${NAVY}0.18)` } },
    icon: (on) => (on ? extrude("rgb(1 29 82 / 0.55)") : engrave),
  },
  {
    title: "Gold coin", note: "Active is a minted gold coin, the rest silver",
    chip: (on) => on
      ? { cls: "bg-gold", style: { color: "#3d2a00", boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.75), inset 0 -3px 4px rgb(148 93 10 / 0.6), 0 3px 0 #7a4c08, 0 9px 12px rgb(148 93 10 / 0.35)" } }
      : { style: { color: "#56627a", background: "linear-gradient(180deg,#ffffff,#d5dde8 50%,#9aa7b8)", boxShadow: `inset 0 1px 0 #fff, 0 3px 0 #7d8a9c, 0 7px 10px ${NAVY}0.16)` } },
    icon: () => ({ filter: "drop-shadow(0 1px 0 rgb(255 255 255 / 0.7)) drop-shadow(0 -1px 0 rgb(0 0 0 / 0.25))" }),
  },
  {
    title: "Glass bubble", note: "Thick glass with a specular shine", gloss: true,
    chip: (on) => on
      ? { cls: "text-white", style: { background: `linear-gradient(180deg,rgb(52 196 238 / 0.92),${NAVY}0.94))`, border: "1px solid rgb(255 255 255 / 0.55)", boxShadow: `inset 0 -6px 10px rgb(0 0 0 / 0.25), 0 9px 16px ${NAVY}0.3)` } }
      : { cls: "glass", style: { color: MUTED, boxShadow: `inset 0 -6px 10px ${NAVY}0.12), inset 0 5px 8px rgb(255 255 255 / 0.8), 0 8px 14px ${NAVY}0.14)` } },
    icon: (on) => (on ? extrude("rgb(1 29 82 / 0.5)") : engrave),
  },
  {
    title: "Icon tiles", note: "App-icon tiles with extruded glyphs and labels", tiles: true,
    chip: (on) => on
      ? { cls: "bg-brand-diag text-white", style: { boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.45), 0 5px 0 #011d52, 0 11px 16px ${NAVY}0.3)`, transform: "translateY(-2px)" } }
      : { cls: "bg-surface-solid", style: { color: MUTED, boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.9), 0 4px 0 ${NAVY}0.18), 0 8px 12px ${NAVY}0.1)` } },
    icon: (on) => extrude(on ? "rgb(1 29 82 / 0.65)" : `${NAVY}0.25)`),
  },
  {
    title: "Navy + gold tilt", note: "Chips lean back; the active one stands up in navy and gold", gold: true,
    row: { style: { perspective: "420px" } },
    chip: (on) => on
      ? { style: { color: "var(--gold-light)", background: "linear-gradient(180deg,#0a3f9c,var(--deep))", boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.3), 0 4px 0 #010f2c, 0 10px 14px rgb(1 15 44 / 0.4)", transform: "translateY(-2px) scale(1.04)" } }
      : { cls: "bg-surface-solid", style: { color: MUTED, transform: "rotateX(32deg)", boxShadow: `0 5px 0 ${NAVY}0.22), 0 9px 10px ${NAVY}0.12)` } },
    icon: (on) => (on ? extrude("rgb(60 36 0 / 0.7)") : engrave),
  },
  {
    title: "Floating", note: "Active chip lifts off the row and casts a floor shadow",
    chip: (on) => on
      ? { cls: "bg-brand-diag text-white", style: { transform: "translateY(-5px)", boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.45), 0 16px 12px -7px ${NAVY}0.5)` } }
      : { cls: "glass", style: { color: MUTED } },
    icon: (on) => (on ? extrude("rgb(1 29 82 / 0.6)") : {}),
  },
  {
    title: "Carved track", note: "A groove cut into the page with a raised slider",
    row: { cls: "rounded-full p-[5px] !gap-1", style: { background: `${NAVY}0.08)`, boxShadow: `inset 0 3px 6px ${NAVY}0.28), inset 0 -1px 0 rgb(255 255 255 / 0.8)` } },
    chip: (on) => on
      ? { cls: "bg-brand text-white", style: { boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.4), 0 3px 0 #011d52, 0 6px 9px ${NAVY}0.35)` } }
      : { style: { color: MUTED } },
    icon: (on) => (on ? extrude("rgb(1 29 82 / 0.6)") : engrave),
  },
];

function Tabs({ v }: { v: Variant }) {
  const [sport, setSport] = useState<SportId>("cricket");
  return (
    // vertical padding leaves room for the bottom edges and lifted shadows
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-4 pt-3">
      <div role="tablist" aria-label="Sport" className={cx("flex w-max items-center gap-2", v.row?.cls)} style={v.row?.style}>
        {SPORTS.map((s) => {
          const on = s.id === sport;
          const c = v.chip(on);
          return (
            <button key={s.id} role="tab" aria-selected={on} aria-label={s.label} onClick={() => setSport(s.id)}
              className={cx("relative flex shrink-0 items-center justify-center transition-all duration-200",
                v.tiles ? "size-[64px] flex-col gap-1.5 rounded-2xl" : "h-10 gap-2 rounded-full pl-3.5 pr-4", c.cls)}
              style={c.style}>
              {v.gloss && <span aria-hidden className="pointer-events-none absolute inset-x-[10%] top-[3px] h-[42%] rounded-full" style={{ background: "linear-gradient(180deg,rgb(255 255 255 / 0.7),rgb(255 255 255 / 0))" }} />}
              <span className="relative flex" style={v.icon?.(on)}><SportIcon sport={s.id} size={v.tiles ? 24 : 19} active={v.gold && on} /></span>
              {<span className={cx("relative font-semibold", v.tiles ? "text-[11px] leading-none" : "text-[13px]")}>{v.tiles ? SHORT[s.id] ?? s.label : s.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SportTabsPrototype() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-4 pb-32 pt-5">
      <header>
        <h1 className="text-xl font-bold text-text">3D sport tabs</h1>
        <p className="text-[13px] text-text-2">10 looks. Tap a sport in each to see its active state, then tell me the letter.</p>
      </header>
      {VARIANTS.map((v, i) => (
        <section key={v.title} className="glass rounded-3xl px-4 pt-4">
          <div className="flex items-center gap-3">
            <span className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">{String.fromCharCode(65 + i)}</span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold leading-tight text-text">{v.title}</h2>
              <p className="truncate text-[12px] text-text-2">{v.note}</p>
            </div>
          </div>
          <Tabs v={v} />
        </section>
      ))}
    </main>
  );
}
