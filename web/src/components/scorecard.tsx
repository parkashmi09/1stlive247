"use client";
// Premium cricket scorecard: innings switcher, hero total, batting/bowling cards, fall-of-wickets timeline.
import { useState, type ReactNode } from "react";
import type { Crease, InningsCard } from "@/data/types";
import { sr } from "@/lib/cricket";
import { Icon } from "./icons/Icon";
import { cx } from "./ui";

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
              k === active ? "bg-brand text-white" : "border border-line bg-surface text-text-2")}>
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
          {inn.runRate && <span>RR <b className="text-gold">{inn.runRate}</b></span>}
          <span>Extras {inn.extras}</span>
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
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
                    {best && <span className="text-gold shrink-0 text-[10px] font-bold uppercase">Top</span>}
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

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
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

      {inn.fallOfWickets.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-2">Fall of wickets</h3>
          <ol className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {inn.fallOfWickets.map((f) => {
              const [score, rest] = [f.split(" (")[0], f.match(/\(([^)]+)\)/)?.[1] ?? ""];
              return (
                <li key={f} className="shrink-0 rounded-xl border border-line bg-surface px-3 py-2">
                  <p className="text-sm font-bold tabular-nums">{score}</p>
                  <p className="text-[11px] text-text-2">{rest}</p>
                </li>
              );
            })}
          </ol>
        </div>
      )}
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
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <h3 className="flex items-center gap-2 border-b border-line px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-primary">
        <span className="size-1.5 animate-pulse rounded-full bg-live" /> At the crease
      </h3>
      {crease.batters.map((p) => (
        <div key={p.name} className="flex items-center gap-2.5 px-3.5 py-2.5">
          <span className={cx("flex size-7 shrink-0 items-center justify-center rounded-full", p.onStrike ? "bg-gold text-[#06121C]" : "bg-surface-2 text-text-2")}>
            <Icon name="cricket" size={15} />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}{p.onStrike && <span className="text-gold ml-1">*</span>}</p>
          <p className="text-right text-sm tabular-nums"><b className="text-base">{p.r}</b> <span className="text-text-2">({p.b})</span></p>
          <p className="w-14 text-right text-[11px] text-text-2">{p.fours}×4 · {p.sixes}×6</p>
        </div>
      ))}
      {crease.bowler && (
        <div className="flex items-center gap-2.5 border-t border-line bg-surface-2/50 px-3.5 py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-white"><Icon name="cricket" active size={15} /></span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{crease.bowler.name}</p>
          <p className="text-sm tabular-nums">
            <span className="text-text-2">{crease.bowler.o}-{crease.bowler.m}-</span>{crease.bowler.r}-<b className="text-base">{crease.bowler.w}</b>
          </p>
        </div>
      )}
    </section>
  );
}
