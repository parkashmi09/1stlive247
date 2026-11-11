"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Every new page opens at the very top (Next's own scroll stops short under the sticky header); back/forward keep their position. */
export function ScrollToTop() {
  const path = usePathname();
  const popped = useRef(false);
  useEffect(() => {
    const onPop = () => { popped.current = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (popped.current) { popped.current = false; return; }
    window.scrollTo(0, 0);
  }, [path]);
  return null;
}
