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
    <nav aria-label="Match sections" className="glass no-scrollbar mx-4 mb-3 flex gap-1 overflow-x-auto rounded-full p-1">
      {TABS.map((t) => {
        const href = `/match/${id}${t.seg}`;
        const on = path === href;
        return (
          <Link key={t.label} href={href} replace scroll={false} aria-current={on ? "page" : undefined}
            className={cx("flex-1 shrink-0 rounded-full px-3.5 py-2 text-center text-[13px] font-semibold", on ? "bg-brand text-white" : "text-text-2")}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
