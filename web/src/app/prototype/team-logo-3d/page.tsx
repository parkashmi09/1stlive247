"use client";
/* eslint-disable @next/next/no-img-element -- prototype: plain <img> so CSS filters/3D transforms apply to the feed PNGs */
// shortcut: throwaway prototype of 3D team-logo looks in the live card; delete this route once the user picks a letter
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

type Team = { name: string; logo?: string };
type M = { home: { team: Team; score?: string }; away: { team: Team; score?: string }; clock?: string };

/** n stacked 1px shadows = a solid extruded edge following the logo's own shape, then a soft drop shadow */
const extrude = (n: number, c: string) =>
  Array.from({ length: n }, () => `drop-shadow(0 1px 0 ${c})`).join(" ") + " drop-shadow(0 8px 8px rgb(1 20 60 / 0.3))";

type Side = "home" | "away";
type Look = { title: string; note: string; render: (src: string, side: Side) => React.ReactNode };

const img = (src: string, style?: CSSProperties, cls = "size-[56px]") => <img src={src} alt="" className={`${cls} object-contain`} style={style} draggable={false} />;

function TiltLogo({ src }: { src: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `rotateX(${-((e.clientY - r.top) / r.height - 0.5) * 40}deg) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 40}deg)`;
  };
  return (
    <span className="touch-none p-2" style={{ perspective: "300px" }} onPointerMove={move} onPointerLeave={() => { if (ref.current) ref.current.style.transform = "rotateX(10deg) rotateY(-12deg)"; }}>
      <span ref={ref} className="block transition-transform duration-150" style={{ transform: "rotateX(10deg) rotateY(-12deg)" }}>{img(src, { filter: extrude(4, "rgb(60 70 90 / 0.55)") })}</span>
    </span>
  );
}

const LOOKS: Look[] = [
  { title: "Extruded", note: "Logo gets a solid edge underneath, like a thick sticker",
    render: (src) => img(src, { filter: extrude(5, "rgb(60 70 90 / 0.55)") }) },
  { title: "Facing each other", note: "Both logos turn toward the score, with floor shadows",
    render: (src, side) => (
      <span className="flex flex-col items-center" style={{ perspective: "260px" }}>
        {img(src, { transform: `rotateY(${side === "home" ? 28 : -28}deg)`, filter: extrude(4, "rgb(60 70 90 / 0.5)") })}
        <span aria-hidden className="-mt-0.5 h-2 w-12 rounded-[50%] bg-[#012c78]/25 blur-[3px]" />
      </span>
    ) },
  { title: "Medallion", note: "Logo sits on a raised glass coin",
    render: (src) => (
      <span className="flex size-[72px] items-center justify-center rounded-full bg-[linear-gradient(160deg,#ffffff,#dfe9f6)] shadow-[0_8px_14px_rgb(1_44_120/0.22),inset_0_2px_0_#fff,inset_0_-4px_8px_rgb(1_44_120/0.15)] ring-1 ring-white">
        {img(src, { filter: "drop-shadow(0 2px 2px rgb(1 20 60 / 0.3))" }, "size-[46px]")}
      </span>
    ) },
  { title: "Floating", note: "Logos hover and bob, shadow breathes below",
    render: (src, side) => (
      <span className="flex flex-col items-center gap-1.5">
        <span className="tl-float" style={{ animationDelay: side === "away" ? "-1.5s" : "0s" }}>{img(src, { filter: extrude(3, "rgb(60 70 90 / 0.5)") })}</span>
        <span aria-hidden className="tl-shadow h-2 w-10 rounded-[50%] bg-[#012c78]/30 blur-[3px]" style={{ animationDelay: side === "away" ? "-1.5s" : "0s" }} />
      </span>
    ) },
  { title: "On a pedestal", note: "Logo stands on a small podium with a reflection",
    render: (src) => (
      <span className="flex flex-col items-center">
        {img(src, { filter: "drop-shadow(0 3px 2px rgb(1 20 60 / 0.3))" }, "relative z-[1] size-[52px]")}
        <span aria-hidden className="-mt-2 h-4 w-16 rounded-[50%] bg-[linear-gradient(180deg,#ffffff,#c9d8ec)] shadow-[0_4px_8px_rgb(1_44_120/0.25)] ring-1 ring-white" />
        <span aria-hidden className="mt-0.5 h-4 w-12 overflow-hidden opacity-25 [mask-image:linear-gradient(180deg,#000,transparent)]">{img(src, { transform: "scaleY(-1)" }, "size-[52px] -mt-9")}</span>
      </span>
    ) },
  { title: "3D spin on load", note: "Logos flip in once when the card appears (tap to replay)",
    render: (src) => <span className="tl-spin inline-block" style={{ perspective: "300px" }}>{img(src, { filter: extrude(4, "rgb(60 70 90 / 0.5)") })}</span> },
  { title: "Interactive tilt", note: "Move a finger / mouse over a logo: it tilts in 3D",
    render: (src) => <TiltLogo src={src} /> },
];

function Card({ m, look }: { m: M; look: Look }) {
  const [k, setK] = useState(0); // remount to replay the spin
  return (
    <div key={k} onClick={() => setK(k + 1)} className="glass flex items-center justify-between rounded-[28px] px-4 py-6">
      {(["home", "away"] as const).map((side, i) => {
        const s = m[side];
        return (
          <div key={side} className={`flex w-[110px] flex-col items-center gap-2 text-center ${i ? "order-3" : "order-1"}`}>
            <span className="flex h-[84px] items-center justify-center">{s.team.logo ? look.render(s.team.logo, side) : null}</span>
            <span className="line-clamp-2 text-[13px] font-bold leading-tight">{s.team.name}</span>
          </div>
        );
      })}
      <span className="order-2 shrink-0 whitespace-nowrap text-[26px] font-black tabular-nums">{m.home.score ?? "-"} - {m.away.score ?? "-"}</span>
    </div>
  );
}

export default function TeamLogo3D() {
  const [m, setM] = useState<M | null>(null);
  useEffect(() => {
    // real live match with both logos (sample if the feed has none)
    fetch("/api/v1/matches").then((r) => r.json()).then((j: { data: (M & { status: string; sport: string })[] }) => {
      const ok = (x: M & { status: string }) => x.status === "live" && x.home.team.logo && x.away.team.logo && x.home.team.logo !== x.away.team.logo;
      setM(j.data.find((x) => ok(x) && x.sport === "football") ?? j.data.find(ok) ?? null);
    }).catch(() => {});
  }, []);
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 pb-32 pt-5">
      <style>{`
        @keyframes tl-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .tl-float { animation: tl-float 3s ease-in-out infinite; display: inline-block; }
        @keyframes tl-shadow { 0%,100% { transform: scaleX(1); opacity: .3; } 50% { transform: scaleX(.75); opacity: .15; } }
        .tl-shadow { animation: tl-shadow 3s ease-in-out infinite; }
        @keyframes tl-spin { from { transform: rotateY(-180deg) scale(.6); opacity: 0; } to { transform: none; opacity: 1; } }
        .tl-spin > * { animation: tl-spin .9s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .tl-float, .tl-shadow, .tl-spin > * { animation: none; } }
      `}</style>
      <header>
        <h1 className="text-xl font-bold">3D team logos</h1>
        <p className="text-[13px] text-text-2">7 looks on a real live match from the feed. Tell me the letter.</p>
      </header>
      {!m && <p className="py-10 text-center text-sm text-text-2">Loading a live match…</p>}
      {m && LOOKS.map((look, i) => (
        <section key={look.title} className="flex flex-col gap-2">
          <div className="flex items-center gap-3 px-1">
            <span className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">{String.fromCharCode(65 + i)}</span>
            <span className="min-w-0"><span className="block text-[15px] font-bold leading-tight">{look.title}</span><span className="block truncate text-[12px] text-text-2">{look.note}</span></span>
          </div>
          <Card m={m} look={look} />
        </section>
      ))}
    </main>
  );
}
