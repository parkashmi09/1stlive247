"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Re-mounts on every route so the page content fades/rises in (keyframe page-in in globals.css). */
export function PageIn({ children }: { children: ReactNode }) {
  return <div key={usePathname()} className="motion-safe:animate-[page-in_.25s_ease-out]">{children}</div>;
}
