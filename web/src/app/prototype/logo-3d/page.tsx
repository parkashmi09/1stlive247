"use client";
/* eslint-disable @next/next/no-img-element -- prototype: plain <img> so CSS filters/masks apply to the PNG directly */
// shortcut: throwaway prototype of 3D looks for the brand logo; delete this route once the user picks a letter
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

const SRC = "/logo.png";
/** n stacked 1px shadows = a solid extruded edge, then one soft drop shadow under it */
const extrude = (n: number, c: string, dx = 0, dy = 1) =>
  Array.from({ length: n }, (_, i) => `drop-shadow(${dx}px ${dy}px 0 ${c})`).join(" ") + " drop-shadow(0 8px 10px rgb(1 20 60 / 0.35))";

/** Logo with an optional sheen layer masked to the logo's own shape */
function Logo3D({ style, sheen, className = "w-[300px]" }: { style?: CSSProperties; sheen?: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} style={style}>
      <img src={SRC} alt="1stLive247" className="block h-auto w-full" draggable={false} />
      {sheen && (
        <span aria-hidden className={`pointer-events-none absolute inset-0 ${sheen}`}
          style={{ WebkitMaskImage: `url(${SRC})`, maskImage: `url(${SRC})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }} />
      )}
    </span>
  );
}

function Tilt() {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 22}deg`); el.style.setProperty("--ry", `${x * 26}deg`);
    el.style.setProperty("--sx", `${(x + 0.5) * 100}%`);
  };
  const leave = () => { const el = ref.current; if (!el) return; el.style.setProperty("--rx", "6deg"); el.style.setProperty("--ry", "-14deg"); el.style.setProperty("--sx", "30%"); };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className="flex h-[150px] w-full touch-none items-center justify-center" style={{ perspective: "700px", ["--rx" as string]: "6deg", ["--ry" as string]: "-14deg", ["--sx" as string]: "30%" }}>
      <Logo3D className="w-[280px] transition-transform duration-150 ease-out"
        style={{ transform: "rotateX(var(--rx)) rotateY(var(--ry))", filter: extrude(5, "#0a2a66") }}
        sheen="bg-[radial-gradient(circle_at_var(--sx)_30%,rgb(255_255_255/0.75),transparent_45%)]" />
    </div>
  );
}

const VARIANTS: { title: string; note: string; dark?: boolean; body: ReactNode }[] = [
  { title: "Extruded", note: "Thick navy edge, like a solid 3D block",
    body: <Logo3D style={{ filter: extrude(6, "#0a2a66") }} /> },
  { title: "Tilted", note: "Turned in perspective with a floor shadow",
    body: (
      <div className="flex flex-col items-center" style={{ perspective: "600px" }}>
        <Logo3D style={{ transform: "rotateY(-22deg) rotateX(10deg)", filter: extrude(6, "#0a2a66", -1, 1) }} />
        <span aria-hidden className="-mt-1 h-3 w-56 rounded-[50%] bg-[#012c78]/25 blur-md" />
      </div>
    ) },
  { title: "Glossy shine", note: "A light sweep runs across the logo",
    body: <Logo3D style={{ filter: extrude(3, "#0a2a66") }} sheen="logo-sweep bg-[linear-gradient(105deg,transparent_35%,rgb(255_255_255/0.85)_50%,transparent_65%)] bg-[length:250%_100%]" /> },
  { title: "Embossed plate", note: "Pressed into a raised glass badge",
    body: (
      <span className="glass rounded-[28px] px-7 py-5 shadow-[0_14px_30px_rgb(1_44_120/0.18),inset_0_2px_0_rgb(255_255_255/0.9),inset_0_-4px_10px_rgb(1_44_120/0.12)]">
        <Logo3D className="w-[250px]" style={{ filter: "drop-shadow(0 -1px 0 rgb(1 20 60 / 0.35)) drop-shadow(0 1.5px 0 rgb(255 255 255 / 0.95)) drop-shadow(0 4px 6px rgb(1 20 60 / 0.18))" }} />
      </span>
    ) },
  { title: "Gold rim on navy", note: "Gold outline + depth, for dark headers and splash", dark: true,
    body: <Logo3D style={{ filter: "drop-shadow(1px 0 0 #fbea99) drop-shadow(-1px 0 0 #fbea99) drop-shadow(0 1px 0 #d9ab4b) drop-shadow(0 -1px 0 #fbea99) drop-shadow(0 2px 0 #945d0a) drop-shadow(0 3px 0 #945d0a) drop-shadow(0 4px 0 #6b4207) drop-shadow(0 12px 14px rgb(0 0 0 / 0.5))" }} /> },
  { title: "Floating", note: "Bobs gently, shadow breathes under it",
    body: (
      <div className="flex flex-col items-center gap-3">
        <Logo3D className="logo-float w-[290px]" style={{ filter: extrude(4, "#0a2a66") }} />
        <span aria-hidden className="logo-float-shadow h-3 w-52 rounded-[50%] bg-[#012c78]/30 blur-md" />
      </div>
    ) },
  { title: "Interactive tilt", note: "Drag / move over it: it tilts and the shine follows", body: <Tilt /> },
  { title: "Long shadow", note: "Flat-3D long diagonal shadow",
    body: <Logo3D style={{ filter: extrude(14, "rgb(1 44 120 / 0.16)", 1, 1).replace(" drop-shadow(0 8px 10px rgb(1 20 60 / 0.35))", "") }} /> },
];

export default function Logo3DPrototype() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 pb-32 pt-5">
      {/* shine sweep + float keyframes, local to this prototype */}
      <style>{`
        @keyframes logo-sweep { from { background-position: 150% 0; } to { background-position: -50% 0; } }
        .logo-sweep { animation: logo-sweep 2.6s ease-in-out infinite; }
        @keyframes logo-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .logo-float { animation: logo-float 3s ease-in-out infinite; }
        @keyframes logo-float-shadow { 0%,100% { transform: scaleX(1); opacity: .3; } 50% { transform: scaleX(.8); opacity: .18; } }
        .logo-float-shadow { animation: logo-float-shadow 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .logo-sweep, .logo-float, .logo-float-shadow { animation: none; } }
      `}</style>
      <header>
        <h1 className="text-xl font-bold">3D logo</h1>
        <p className="text-[13px] text-text-2">8 looks, each shown big and at header size. Tell me the letter.</p>
      </header>
      {VARIANTS.map((v, i) => (
        <section key={v.title} className="glass overflow-hidden rounded-3xl">
          <div className="flex items-center gap-3 px-4 pt-4">
            <span className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">{String.fromCharCode(65 + i)}</span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold leading-tight">{v.title}</h2>
              <p className="truncate text-[12px] text-text-2">{v.note}</p>
            </div>
          </div>
          <div className={`mx-4 my-4 flex min-h-[170px] items-center justify-center rounded-2xl ${v.dark ? "bg-[linear-gradient(135deg,#0a3f9c,#010f2c)]" : "bg-white/40"}`}>{v.body}</div>
          {/* header-size preview: how it reads at the real 40px height */}
          <div className="flex h-16 items-center justify-between border-t border-line px-4">
            <span className="relative block h-10 w-[140px]">
              <span className="absolute left-0 top-1/2 flex w-[320px] origin-left -translate-y-1/2 scale-[0.45] justify-start">{v.body}</span>
            </span>
            <span className="text-[11px] font-semibold text-text-2">header size</span>
          </div>
        </section>
      ))}
    </main>
  );
}
