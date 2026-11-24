"use client";

import { T } from "@/lib/i18n";
// Premium cricket scorecard: innings switcher, hero total, batting/bowling cards, fall-of-wickets timeline.
import { useState, type ReactNode } from "react";
import type { Crease, InningsCard } from "@/data/types";
import { sr } from "@/lib/cricket";
import { Icon } from "./icons/Icon";
import { BatBallIcon, cx } from "./ui";
import { parseFow } from "@/lib/fow";

const ordinal = (n: number) => ["1st", "2nd", "3rd", "4th"][n] ?? `${n + 1}th`;

export function InningsScorecard({ innings }: { innings: InningsCard[] }) {
  const [active, setActive] = useState(innings.length - 1); // latest innings first
  const inn = innings[Math.min(active, innings.length - 1)];
  if (!inn) return null;
  const teamCount: Record<string, number> = {};
  const labels = innings.map((i) => `${i.short} ${ordinal((teamCount[i.short] = (teamCount[i.short] ?? -1) + 1))}`);
  const top = Math.max(...inn.batting.map((b) => b.r));

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Innings" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {innings.map((i, k) => (
          <button key={k} role="tab" aria-selected={k === active} onClick={() => setActive(k)}
            className={cx("flex shrink-0 flex-col items-start rounded-2xl px-3.5 py-2 text-left transition",
              k === active ? "bg-brand text-white" : "glass text-text-2")}>
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{labels[k]}</span>
            <span className={cx("text-sm font-bold", k === active ? "text-white" : "text-text")}>{i.total.split(" (")[0]}</span>
          </button>
        ))}
      </div>

      <section className="bg-brand-diag relative overflow-hidden rounded-[20px] px-4 py-4 text-white">
        <Icon name="cricket" active size={120} className="pointer-events-none absolute -right-4 -top-3 text-white opacity-10" />
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">{inn.team} · {labels[active]} innings</p>
        <p className="mt-1 text-[34px] font-bold leading-none">{inn.total.split(" (")[0]}</p>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/80">
          <span>{inn.total.match(/\(([^)]+)\)/)?.[1]}</span>
          {inn.runRate && <span>RR <b className="text-accent">{inn.runRate}</b></span>}
          <span>Extras {inn.extras}</span>
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl glass">
        <Head cols={["Batter", "R", "B", "4s", "6s", "SR"]} />
        <ul>
          {inn.batting.map((b) => {
            const notOut = b.dismissal === "not out";
            const best = b.r === top && b.r > 0;
            return (
              <li key={b.name} className={cx("flex items-center gap-1 border-b border-line px-3.5 py-2.5 last:border-0", best && "border-l-[3px] border-l-[#D9AB4B] pl-[11px]")}>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {notOut && <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-boundary" aria-label="batting" />}
                    <span className="truncate">{b.name}</span>
                    {best && <span className="text-accent shrink-0 text-[10px] font-bold uppercase">Top</span>}
                  </p>
                  <p className={cx("truncate text-xs", notOut ? "font-medium text-boundary" : "text-text-2")}>{b.dismissal}</p>
                </div>
                <Num bold>{b.r}</Num><Num muted>{b.b}</Num><Num>{b.fours}</Num><Num>{b.sixes}</Num>
                <Num wide className={Number(sr(b.r, b.b)) >= 100 ? "text-boundary" : undefined}>{sr(b.r, b.b)}</Num>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="overflow-hidden rounded-2xl glass">
        <Head cols={["Bowler", "O", "M", "R", "W", "Econ"]} />
        <ul>
          {inn.bowling.map((b) => (
            <li key={b.name} className="flex items-center gap-1 border-b border-line px-3.5 py-2.5 last:border-0">
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">{b.name}</p>
              <Num>{b.o}</Num><Num muted>{b.m}</Num><Num>{b.r}</Num>
              <span className="w-9 text-right">
                <span className={cx("inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-sm font-bold tabular-nums",
                  b.w >= 3 ? "bg-gold text-[#06121C]" : b.w > 0 ? "bg-surface-2" : "text-text-2")}>{b.w}</span>
              </span>
              <Num wide muted>{econ(b.r, b.o)}</Num>
            </li>
          ))}
        </ul>
      </div>

      {inn.fallOfWickets.length > 0 && <FowChart key={active} inn={inn} />}
    </div>
  );
}

function econ(r: number, o: string) {
  const [ov, b = "0"] = o.split(".");
  const n = Number(ov) + Number(b) / 6;
  return n ? (r / n).toFixed(2) : "0.00";
}

const Head = ({ cols }: { cols: string[] }) => (
  <div className="flex gap-1 bg-surface-2 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-text-2">
    <span className="flex-1">{cols[0]}</span>
    {cols.slice(1).map((c, i) => <span key={c} className={cx("text-right", i === cols.length - 2 ? "w-12" : "w-9")}>{c}</span>)}
  </div>
);

const Num = ({ children, bold, muted, wide, className }: { children: ReactNode; bold?: boolean; muted?: boolean; wide?: boolean; className?: string }) => (
  <span className={cx("text-right text-sm tabular-nums", wide ? "w-12" : "w-9", bold && "text-base font-bold", muted && "text-text-2", className)}>{children}</span>
);

/** Who is batting and bowling right now. */
export function AtTheCrease({ crease }: { crease: Crease }) {
  if (!crease.batters.length && !crease.bowler) return null;
  return (
    <section className="overflow-hidden rounded-2xl glass">
      <h3 className="flex items-center gap-2 border-b border-line px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-primary">
        <span className="size-1.5 animate-pulse rounded-full bg-live" /> At the crease
      </h3>
      {crease.batters.map((p) => (
        <div key={p.name} className="flex items-center gap-2.5 px-3.5 py-2.5">
          <span className={cx("flex size-7 shrink-0 items-center justify-center rounded-full", p.onStrike ? "bg-gold text-[#06121C]" : "bg-surface-2 text-text-2")}>
            <BatBallIcon kind="bat" size={15} className="" />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}{p.onStrike && <span className="text-accent ml-1">*</span>}</p>
          <p className="text-right text-sm tabular-nums"><b className="text-base">{p.r}</b> <span className="text-text-2">({p.b})</span></p>
          <p className="w-14 text-right text-[11px] text-text-2">{p.fours}×4 · {p.sixes}×6</p>
        </div>
      ))}
      {crease.bowler && (
        <div className="flex items-center gap-2.5 border-t border-line bg-surface-2/50 px-3.5 py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-white"><BatBallIcon kind="ball" size={15} /></span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{crease.bowler.name}</p>
          <p className="text-sm tabular-nums">
            <span className="text-text-2">{crease.bowler.o}-{crease.bowler.m}-</span>{crease.bowler.r}-<b className="text-base">{crease.bowler.w}</b>
          </p>
        </div>
      )}
    </section>
  );
}

/** Fall of wickets as a run chart (prototype B, picked 2026-11-24): runs climb over by over, a red ball marks each wicket.
 *  Tap a ball (or a chip) to see who fell, when, and the stand before it. */
function FowChart({ inn }: { inn: InningsCard }) {
  const { wickets, runs, overs } = parseFow(inn.fallOfWickets, inn.total);
  const [sel, setSel] = useState(wickets.length - 1);
  if (!wickets.length) return null;
  const w = wickets[Math.min(sel, wickets.length - 1)];

  const VW = 340, VH = 150, L = 30, R = 10, Tp = 12, B = 22;
  const maxR = Math.max(runs, 1), step = maxR > 400 ? 100 : maxR > 120 ? 50 : 25;
  const top = Math.ceil(maxR / step) * step;
  const x = (o: number) => L + (o / overs) * (VW - L - R);
  const y = (r: number) => Tp + (1 - r / top) * (VH - Tp - B);
  const pts: [number, number][] = [[0, 0], ...wickets.map((k) => [k.ov, k.runs] as [number, number]), [overs, runs]];
  const line = pts.map(([o, r], i) => `${i ? "L" : "M"}${x(o).toFixed(1)} ${y(r).toFixed(1)}`).join(" ");
  const grid = Array.from({ length: top / step + 1 }, (_, i) => i * step);

  return (
    <section className="glass rounded-[20px] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-2"><T>Fall of wickets</T></h3>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-2">
          <span className="h-0.5 w-3 rounded bg-[#1060a0] dark:bg-cyan" /><T>Runs</T>
          <span className="ml-2 size-2.5 rounded-full bg-[#c4000b]" /><T>Wicket</T>
        </span>
      </div>

      <svg viewBox={`0 0 ${VW} ${VH}`} className="block w-full overflow-visible" role="img"
        aria-label={`${inn.team}: ${wickets.map((k) => `${k.runs}-${k.n}`).join(", ")}`}>
        <defs>
          <linearGradient id="fow-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#34c4ee" stopOpacity="0.38" /><stop offset="1" stopColor="#34c4ee" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="fow-ball" cx="0.35" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#ff7a7a" /><stop offset="0.55" stopColor="#c4000b" /><stop offset="1" stopColor="#7a0007" />
          </radialGradient>
        </defs>
        {grid.map((g) => (
          <g key={g}>
            <line x1={L} x2={VW - R} y1={y(g)} y2={y(g)} className="stroke-line" strokeDasharray={g ? "3 4" : undefined} />
            <text x={L - 6} y={y(g) + 3} textAnchor="end" className="fill-text-2 text-[9px] tabular-nums">{g}</text>
          </g>
        ))}
        {[0, overs / 2, overs].map((o, i) => (
          <text key={i} x={x(o)} y={VH - 6} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"} className="fill-text-2 text-[9px] tabular-nums">
            {Math.round(o)} ov
          </text>
        ))}
        {/* guide from the selected wicket down to the axis */}
        <line x1={x(w.ov)} x2={x(w.ov)} y1={y(w.runs)} y2={VH - B} stroke="#c4000b" strokeOpacity="0.45" strokeDasharray="2 3" />
        <path d={`${line} L${x(overs)} ${VH - B} L${x(0)} ${VH - B}Z`} fill="url(#fow-fill)" />
        <path d={line} fill="none" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" pathLength={1}
          className="stroke-[#1060a0] [stroke-dasharray:1] motion-safe:animate-[fow-draw_.9s_ease-out_both] dark:stroke-cyan" />
        {/* selected ball is drawn last so close wickets never hide it */}
        {wickets.map((k, i) => ({ k, i })).sort((a, b) => Number(a.i === sel) - Number(b.i === sel)).map(({ k, i }) => {
          const on = i === sel;
          return (
            <g key={k.n} role="button" tabIndex={0} aria-label={`${k.runs}-${k.n} ${k.name}`} className="cursor-pointer outline-none"
              onClick={() => setSel(i)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(i)}>
              <circle cx={x(k.ov)} cy={y(k.runs)} r="14" fill="transparent" />
              {on && <circle cx={x(k.ov)} cy={y(k.runs)} r="12" fill="#c4000b" opacity="0.18" />}
              <circle cx={x(k.ov)} cy={y(k.runs)} r={on ? 8.5 : 7} fill="url(#fow-ball)" stroke="#fff" strokeWidth="1.5" />
              <text x={x(k.ov)} y={y(k.runs) + 3} textAnchor="middle" fill="#fff" className="pointer-events-none text-[8.5px] font-extrabold">{k.n}</text>
            </g>
          );
        })}
      </svg>

      {/* every wicket as a vertical list; the one picked on the chart is highlighted */}
      <ol className="mt-3 flex flex-col gap-1.5">
        {wickets.map((k, i) => {
          const on = i === sel;
          return (
            <li key={k.n}>
              <button type="button" onClick={() => setSel(i)} aria-pressed={on}
                className={cx("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                  on ? "bg-[#c4000b]/10 ring-1 ring-[#c4000b]/30 dark:bg-[#c4000b]/20" : "active:bg-surface-2")}>
                <span className={cx("flex shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff7a7a,#c4000b_55%,#7a0007)] font-extrabold text-white transition-all",
                  on ? "size-8 text-[13px] shadow-[0_3px_8px_rgb(196_0_11/0.4)]" : "size-6 text-[11px]")}>{k.n}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold">{k.name}</span>
                  <span className="block text-[11px] text-text-2"><T>Over</T> {k.over} · <T>Partnership</T> {k.part}</span>
                </span>
                <span className="text-[16px] font-black tabular-nums">{k.runs}<span className="text-text-2">-{k.n}</span></span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
