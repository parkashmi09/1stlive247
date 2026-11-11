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
    // Thrill-style bar (measured), floated and rounded per the user: glass, a soft tinted pill slides (transform, 300ms) behind the active tab,
    // icon + label recolour over 200ms. Our colours: gold active, brand-tinted pill, nav glass.
    <nav aria-label="Primary"
      className="fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-30 mx-auto max-w-[456px] rounded-[28px] border border-white/70 bg-nav/85 shadow-[0_10px_34px_rgb(1_44_120/0.16),inset_0_1px_0_rgb(255_255_255/0.9)] backdrop-blur-2xl md:max-w-[640px] lg:hidden dark:border-white/10 dark:bg-nav/75 dark:shadow-[0_10px_34px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.08)]">
      <ul className="relative flex px-3 py-1">
        {active >= 0 && (
          // 72×52 pill in the theme's brand gradient at 90% over blur (same as the app's active pills); no glow; slides on left
          <li aria-hidden className="bg-brand pointer-events-none absolute top-1/2 h-[52px] w-[72px] -translate-y-1/2 rounded-[26px] border border-white/20 opacity-90 backdrop-blur-md motion-safe:transition-[left] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ left: `calc(12px + (100% - 24px) * ${active + 0.5} / ${TABS.length} - 36px)` }} />
        )}
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <li key={t.href} className="relative flex-1">
              <Link href={t.href} aria-current={on ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2 font-[family-name:var(--font-inter)] text-[11px] active:scale-95 motion-safe:transition-[color,transform] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(.4,0,.2,1)] ${on ? "font-semibold text-white" : "font-medium text-muted"}`}>
                <Icon name={t.icon} active={on && t.icon !== "more"} className={`motion-safe:transition-[color,transform] motion-safe:duration-200 ${on ? "text-[var(--gold-light)]" : ""}`} {...(on && t.icon === "more" && { strokeWidth: 2.6 })} />
                {t.label}
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
