"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

const TABS = [
  { seg: "", label: "Overview" },
  { seg: "/scorecard", label: "Scorecard" },
  { seg: "/commentary", label: "Commentary" },
];

export function MatchTabs({ id }: { id: string }) {
  const path = usePathname();
  return (
    <nav aria-label="Match sections" className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-2.5">
      {TABS.map((t) => {
        const href = `/match/${id}${t.seg}`;
        const on = path === href;
        return (
          <Link key={t.label} href={href} replace scroll={false} aria-current={on ? "page" : undefined}
            className={cx("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium", on ? "bg-brand text-white" : "text-text-2")}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
