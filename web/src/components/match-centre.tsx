import type { BallKind, CommentaryEntry, Match, MatchCentre } from "@/data/types";
import { econ, sr } from "@/lib/cricket";
import { Icon } from "./icons/Icon";
import { LiveClock } from "./LiveClock";
import { ScorePop } from "./ScorePop";
import { BallChip, Card, LiveBadge, TeamBadge, cx } from "./ui";

export function ScoreHeader({ m, stats }: { m: Match; stats?: string[] }) {
  const side = (s: Match["home"], align: "items-start" | "items-end") => (
    <div className={cx("flex flex-col gap-1", align)}>
      <TeamBadge code={s.team.code} tone={s.team.tone} logo={s.team.logo} size={56} />
      <span className="text-sm font-semibold uppercase">{s.team.name}</span>
      {s.score
        ? /\/|^\d/.test(s.score) ? <ScorePop value={s.score} className="text-[32px] font-bold leading-none" /> : <span className="text-gold text-xl font-bold">{s.score}</span>
        : <span className="text-sm font-medium text-white/60">{m.status === "upcoming" ? "—" : "Yet to bat"}</span>}
      {s.detail && <span className="text-xs text-white/70">{s.detail}</span>}
    </div>
  );
  return (
    <section className="hero-glow flex flex-col items-center gap-3 px-4 py-4 text-white">
      <p className="text-sm text-white/70">{m.competition}</p>
      {m.status === "live" && (
        <p className="flex items-center gap-2"><LiveBadge />{(m.clock || m.timer) && <span className="text-sm font-semibold"><LiveClock timer={m.timer} fallback={m.clock} /></span>}</p>
      )}
      <div className="flex w-full items-start justify-between">{side(m.home, "items-start")}{side(m.away, "items-end")}</div>
      {m.note && m.sport === "cricket" && <p className="text-gold text-center text-sm font-semibold">{m.note}</p>}
      {stats && (
        <p className="flex items-center gap-3.5 rounded-full border border-[#D9AB4B]/50 bg-white/10 px-4 py-2 text-xs">
          {stats.map((s, i) => <span key={s} className={i ? "border-l border-[#D9AB4B]/50 pl-3.5" : undefined}>{s}</span>)}
        </p>
      )}
    </section>
  );
}

export function RecentBalls({ c }: { c: MatchCentre }) {
  return (
    <Card className="flex items-center gap-2 px-3.5 py-3">
      <span className="flex-1 text-xs font-bold text-text-2">This over</span>
      {c.thisOver.map((b, i) => <BallChip key={i} ball={b} />)}
    </Card>
  );
}

export function LatestUpdate({ c }: { c: MatchCentre }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#D9AB4B]/50 bg-surface px-3.5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FBF3DE]"><Icon name="lightning" active size={18} className="text-[#8F6619]" /></span>
      <div className="min-w-0"><p className="text-xs font-bold text-accent">Latest update{c.latest.over && ` · ${c.latest.over}`}</p><p className="line-clamp-3 text-sm">{c.latest.text}</p></div>
    </div>
  );
}

/** Cricbuzz ball lines read "Bowler to Batter, result, description"; anything else is shown as plain text. */
function splitBall(text: string) {
  const [who, result = "", ...rest] = text.split(", ");
  return / to /.test(who) && result ? { who, result, desc: rest.join(", ") } : { who: "", result: "", desc: text };
}

function ballValue(kind: BallKind, result: string) {
  if (kind === "wicket") return "W";
  if (kind === "four") return "4";
  if (kind === "six") return "6";
  if (kind === "dot") return "0";
  if (kind === "extra") return /wide/i.test(result) ? "wd" : /no ball/i.test(result) ? "nb" : /leg bye/i.test(result) ? "lb" : /bye/i.test(result) ? "b" : "+";
  return result.match(/\d+/)?.[0] ?? "•";
}

const RESULT_TONE: Partial<Record<BallKind, string>> = { four: "font-bold uppercase text-boundary", six: "font-bold uppercase text-boundary", wicket: "font-bold uppercase text-live", extra: "font-semibold text-[#8F6619]" };
const ROW_TINT: Partial<Record<BallKind, string>> = { four: "bg-boundary/8", six: "bg-boundary/8", wicket: "bg-live/8" };

function OverSummary({ title, summary }: { title: string; summary: string }) {
  const [over, runs] = title.split(" · ");
  const [score, ...players] = summary.split(" · ");
  return (
    <li className="bg-brand-diag px-4 py-3 text-white">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide">{over}</span>
        {runs && <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase">{runs}</span>}
        <span className="ml-auto text-sm font-bold tabular-nums">{score}</span>
      </div>
      {players.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/75">{players.map((p) => <span key={p}>{p}</span>)}</div>
      )}
    </li>
  );
}

export function Commentary({ items }: { items: CommentaryEntry[] }) {
  return (
    <ol className="overflow-hidden rounded-2xl border border-line bg-surface">
      {items.map((e, i) => {
        if (e.type === "over") return <OverSummary key={i} title={e.title} summary={e.summary} />;
        const { who, result, desc } = splitBall(e.text);
        return (
          <li key={i} className={cx("flex gap-3 border-b border-line px-4 py-3.5 last:border-0", ROW_TINT[e.kind])}>
            <div className="flex w-10 shrink-0 flex-col items-center gap-1.5">
              <span className="text-xs font-bold tabular-nums text-text-2">{e.over}</span>
              <BallChip ball={{ value: ballValue(e.kind, result), kind: e.kind }} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              {who && <p className="text-[13px] font-semibold">{who}, <span className={RESULT_TONE[e.kind] ?? "font-medium text-text-2"}>{result}</span></p>}
              {desc && <p className={cx("text-sm leading-snug", who ? "mt-1 text-text/70" : "text-text")}>{desc}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Table({ head, rows, foot }: { head: string[]; rows: { name: string; sub?: string; cells: (string | number)[] }[]; foot?: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <table className="w-full text-right text-sm tabular-nums">
        <thead className="bg-surface-2 text-xs font-bold text-text-2">
          <tr>{head.map((h, i) => <th key={h} scope="col" className={cx("px-1.5 py-2 font-bold first:pl-3.5 first:text-left last:pr-3.5", i === 0 && "w-full")}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-line last:border-0">
              <th scope="row" className="py-2.5 pl-3.5 text-left font-semibold">
                {r.name}
                {r.sub && <span className={cx("block text-xs font-normal", r.sub === "not out" ? "text-boundary" : "text-text-2")}>{r.sub}</span>}
              </th>
              {r.cells.map((c, i) => <td key={i} className={cx("px-1.5 last:pr-3.5", i === 0 && "font-semibold")}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {foot && (
        <dl className="flex flex-col gap-1 border-t border-line px-3.5 py-3 text-sm">
          {foot.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4"><dt className={k === "Total" ? "font-semibold" : undefined}>{k}</dt><dd className={k === "Total" ? "text-lg font-bold text-primary" : "text-text-2"}>{v}</dd></div>
          ))}
        </dl>
      )}
    </div>
  );
}


export function Scorecard({ c }: { c: MatchCentre }) {
  return (
    <div className="flex flex-col gap-3">
      <Table head={["Batter", "R", "B", "4s", "6s", "SR"]}
        rows={c.batting.map((b) => ({ name: b.name, sub: b.dismissal, cells: [b.r, b.b, b.fours, b.sixes, sr(b.r, b.b)] }))}
        foot={[["Extras", c.extras], ["Total", c.total], ["Fall of wickets", c.fallOfWickets]]} />
      <Table head={["Bowler", "O", "M", "R", "W", "Econ"]}
        rows={c.bowling.map((b) => ({ name: b.name, cells: [b.o, b.m, b.r, b.w, econ(b.r, b.o)] }))} />
    </div>
  );
}

