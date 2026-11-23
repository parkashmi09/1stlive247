"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellGold, Logo } from "./brand";
import { Icon, type IconName } from "./icons/Icon";
import type { ReactNode } from "react";

// Solid tab icons (24×24, filled). Drawn for the bar: heavier shapes read better at 20px than the stroke set.
const TAB_ICON: Record<IconName, ReactNode> = {
  home: <path d="M11.3 3.1a1.1 1.1 0 0 1 1.4 0l7.5 6.3c.5.4.8 1 .8 1.6V19a2 2 0 0 1-2 2h-3.5a1 1 0 0 1-1-1v-4.5a1.5 1.5 0 0 0-1.5-1.5h-2A1.5 1.5 0 0 0 9.5 15.5V20a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-8c0-.6.3-1.2.8-1.6l7.5-6.3Z" />,
  live: <><circle cx="12" cy="12" r="3" /><path d="M8.2 7.9a1.05 1.05 0 0 1 1.5 1.5 3.7 3.7 0 0 0 0 5.2 1.05 1.05 0 0 1-1.5 1.5 5.8 5.8 0 0 1 0-8.2Zm7.6 0a5.8 5.8 0 0 1 0 8.2 1.05 1.05 0 0 1-1.5-1.5 3.7 3.7 0 0 0 0-5.2 1.05 1.05 0 0 1 1.5-1.5ZM4.9 4.6a1.05 1.05 0 0 1 1.5 1.5 8.3 8.3 0 0 0 0 11.8 1.05 1.05 0 0 1-1.5 1.5 10.4 10.4 0 0 1 0-14.8Zm14.2 0a10.4 10.4 0 0 1 0 14.8 1.05 1.05 0 0 1-1.5-1.5 8.3 8.3 0 0 0 0-11.8 1.05 1.05 0 0 1 1.5-1.5Z" /></>,
  news: <path fillRule="evenodd" d="M5 3.5h10A1.5 1.5 0 0 1 16.5 5v2.5h3.3a1 1 0 0 1 1 1V18a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 18V5.5A2 2 0 0 1 5 3.5Zm11.5 5.7V18a.8.8 0 0 0 1.6 0V9.2h-1.6ZM6 7h8v4.2H6V7Zm0 6h8v1.6H6V13Zm0 3h5.5v1.6H6V16Z" />,
  // the More tab shows a profile mark, as in the client's reference (the route stays /more)
  // outline ring + head + shoulders, like the reference's profile mark
  more: <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="9.1" /><circle cx="12" cy="10" r="3.1" /><path d="M6.4 18.3c1.3-2 3.3-3 5.6-3s4.3 1 5.6 3" /></g>,
} as Record<string, ReactNode>;
const TabIcon = ({ name }: { name: IconName }) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden className="motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-in-out">{TAB_ICON[name]}</svg>
);

const TABS: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: "/", label: "Home", icon: "home", match: (p) => p === "/" },
  { href: "/live", label: "Live", icon: "live", match: (p) => p.startsWith("/live") || p.startsWith("/match") },
  { href: "/news", label: "News", icon: "news", match: (p) => p.startsWith("/news") },
  { href: "/more", label: "Profile", icon: "more", match: (p) => p.startsWith("/more") },
];

/** Active tab comes from the URL; the fallback (no path yet) renders the same bar without a highlight. */
export function BottomNav() {
  return <NavBar path={usePathname()} />;
}

export function NavBar({ path }: { path?: string }) {
  const active = path === undefined ? -1 : TABS.findIndex((t) => t.match(path));
  return (
    // Thrill bottom nav, measured: outer 80px (pad 4/16/14) with a page-colour fade; inner 62px bar, radius 64, 70% bg + 20px blur,
    // shadow 0 4px 32px 8%; 88×54 pill, radius 46, flat tint, slides on transform; icon 20, label 10/12 bold uppercase, muted #858FA6.
    <nav aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-1 lg:hidden">
      {/* 62px circles spread edge to edge with a 5px inset all round, so the end circles sit concentric with the bar's rounded ends */}
      <div className="glass pointer-events-auto relative mx-auto flex h-[72px] w-full max-w-[360px] items-center justify-between rounded-full p-[5px] backdrop-blur-[20px]">
        {active >= 0 && (
          // glass reference: the 62px brand circle slides to the active slot
          <div aria-hidden className="bg-brand pointer-events-none absolute top-[5px] size-[62px] rounded-full shadow-[0_6px_16px_rgb(52_196_238/0.45)] motion-safe:transition-[left] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ left: `calc(5px + (100% - 10px - 62px) * ${active} / ${TABS.length - 1})` }} />
        )}
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} aria-label={t.label}
              className={`relative z-[1] flex items-center justify-center rounded-full active:scale-95 motion-safe:transition-[color,transform] motion-safe:duration-200 motion-safe:ease-in-out ${on ? "text-white" : "text-[#858FA6]"}`}>
              {/* reference: every inactive icon sits in its own soft round bubble */}
              <span className={`flex size-[62px] items-center justify-center rounded-full motion-safe:transition-colors ${on ? "" : "bg-white/70 shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] dark:bg-white/[0.07] dark:shadow-none"}`}>
                <TabIcon name={t.icon} />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Desktop (lg+) top header: logo + the same four destinations; replaces the bottom bar there. */
export function DesktopNav({ live }: { live?: boolean }) {
  return live ? <DesktopBar path={usePathname()} /> : <DesktopBar />;
}

function DesktopBar({ path }: { path?: string }) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-nav/90 backdrop-blur-md lg:block">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-8 px-6">
        <Link href="/" aria-label="1stLive247 home"><Logo className="h-9 w-auto" /></Link>
        <nav aria-label="Primary" className="flex flex-1 gap-1">
          {TABS.map((t) => {
            const on = path !== undefined && t.match(path);
            return (
              <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-brand text-white" : "text-text-2 hover:bg-surface-2 hover:text-text"}`}>
                <Icon name={t.icon} size={20} active={on && t.icon !== "more"} />
                {t.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/search" aria-label="Search" className="p-1 text-text-2 hover:text-text"><Icon name="search" /></Link>
        <button type="button" aria-label="Notifications, 1 unread" className="p-0.5"><BellGold unread /></button>
      </div>
    </header>
  );
}
