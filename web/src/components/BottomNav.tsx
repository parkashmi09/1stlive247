"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellGold, Logo } from "./brand";
import { Icon, type IconName } from "./icons/Icon";

const TABS: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: "/", label: "Home", icon: "home", match: (p) => p === "/" },
  { href: "/live", label: "Live", icon: "live", match: (p) => p.startsWith("/live") || p.startsWith("/match") },
  { href: "/news", label: "News", icon: "news", match: (p) => p.startsWith("/news") },
  { href: "/more", label: "More", icon: "more", match: (p) => p.startsWith("/more") },
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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-[linear-gradient(180deg,transparent_14%,var(--bg)_52%)] px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-1 lg:hidden">
      <div className="pointer-events-auto relative mx-auto grid h-[62px] w-full max-w-[448px] grid-cols-4 overflow-hidden rounded-[64px] bg-nav/70 px-3.5 py-1 shadow-[0_4px_32px_rgb(0_0_0/0.08)] backdrop-blur-[20px] md:max-w-[640px] dark:bg-nav/70 dark:shadow-[0_4px_32px_rgb(0_0_0/0.4)]">
        {active >= 0 && (
          // centred under the active column: left = inner padding + column centre - half the pill
          <div aria-hidden className="bg-brand pointer-events-none absolute top-1 h-[54px] w-[88px] rounded-[46px] opacity-90 motion-safe:transition-[left] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ left: `calc(14px + (100% - 28px) * ${active + 0.5} / ${TABS.length} - 44px)` }} />
        )}
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined}
              className={`relative z-[1] flex flex-col items-center justify-center gap-2 rounded-xl font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase leading-3 active:scale-95 motion-safe:transition-[color,transform] motion-safe:duration-200 motion-safe:ease-in-out ${on ? "text-white" : "text-[#858FA6]"}`}>
              <Icon name={t.icon} size={20} active={on && t.icon !== "more"} className={`motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-in-out ${on ? "text-[var(--gold-light)]" : ""}`} {...(on && t.icon === "more" && { strokeWidth: 2.6 })} />
              <span className="max-w-full truncate">{t.label}</span>
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
        <button type="button" aria-label="Notifications, 1 unread" className="p-0.5"><BellGold unread /></button>
      </div>
    </header>
  );
}
