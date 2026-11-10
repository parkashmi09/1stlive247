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
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] md:max-w-none lg:hidden border-t border-line bg-nav pb-[max(12px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_16px_rgb(10_31_74/0.06)]">
      <ul className="flex">
        {TABS.map((t) => {
          const on = path !== undefined && t.match(path);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} aria-current={on ? "page" : undefined}
                className={`flex flex-col items-center gap-1 font-[family-name:var(--font-inter)] text-xs ${on ? "font-semibold text-text" : "font-medium text-muted"}`}>
                <Icon name={t.icon} active={on && t.icon !== "more"} className={on ? "text-[var(--gold-mid)]" : undefined} {...(on && t.icon === "more" && { strokeWidth: 2.6 })} />
                {t.label}
                <span className={`h-[3px] w-6 rounded-sm ${on ? "bg-gold-h" : ""}`} />
              </Link>
            </li>
          );
        })}
      </ul>
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
