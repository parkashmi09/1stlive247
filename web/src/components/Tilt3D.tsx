"use client";
// Team logos in 3D (prototype "interactive tilt", picked 2026-11-24): a thick edge under the logo, a slight resting tilt,
// and the logo turns toward the finger / mouse while it moves over it. Touch scrolling is not blocked.
import { useRef, type PointerEvent, type ReactNode } from "react";

const REST = "rotateX(8deg) rotateY(-10deg)";
/** stacked 1px shadows follow the logo's own shape = a solid edge; thinner for small logos so they stay crisp */
const edge = (size: number) => {
  const n = size >= 40 ? 4 : size >= 26 ? 2 : 1;
  return Array.from({ length: n }, () => "drop-shadow(0 1px 0 rgb(60 70 90 / 0.5))").join(" ") + ` drop-shadow(0 ${Math.round(size / 9)}px ${Math.round(size / 8)}px rgb(1 20 60 / 0.28))`;
};

export function Tilt3D({ size, children }: { size: number; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-y * 40).toFixed(1)}deg) rotateY(${(x * 40).toFixed(1)}deg) scale(1.06)`;
  };
  const rest = () => { if (ref.current) ref.current.style.transform = REST; };
  return (
    <span className="inline-flex shrink-0" style={{ perspective: `${Math.max(200, size * 6)}px` }} onPointerMove={move} onPointerLeave={rest} onPointerCancel={rest}>
      <span ref={ref} className="inline-flex transition-transform duration-150 ease-out" style={{ transform: REST, filter: edge(size) }}>{children}</span>
    </span>
  );
}
