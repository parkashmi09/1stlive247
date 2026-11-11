import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./brand";

// Simple brand marks (single-path, currentColor) for the social row.
const SOCIAL: { label: string; path: ReactNode }[] = [
  { label: "Facebook", path: <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21z" /> },
  { label: "X", path: <path d="M17.6 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.8 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.6 4.7H5.7z" /> },
  { label: "Instagram", path: <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></g> },
  { label: "YouTube", path: <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z" /> },
];

const NAV = [{ label: "Live scores", href: "/live" }, { label: "News", href: "/news" }, { label: "Home", href: "/" }];
// shortcut: legal pages don't exist yet, so these render as plain text; link them once the pages are written.
const LEGAL = ["Privacy Policy", "Cookie Policy", "Terms & Conditions"];

/** Brand footer (Sofascore-style, follows the light/dark theme): logo, socials, links, copyright. No app-store badges until the apps ship. */
export function SiteFooter() {
  return (
    <footer className="-mx-4 -mb-28 mt-2 border-t border-line bg-surface px-5 pb-36 pt-6 text-text md:-mx-10 lg:mx-0 lg:mb-0 lg:rounded-[20px] lg:border lg:pb-8">
      <nav aria-label="Footer" className="flex flex-col border-b border-line pb-4">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="py-2.5 text-sm font-bold uppercase tracking-wide text-text">{n.label}</Link>
        ))}
      </nav>
      <div className="flex flex-col gap-5 border-b border-line py-6">
        <Logo className="h-11 w-auto self-start" />
        <p className="text-sm text-text-2">Live scores, results and sports news. Always on for sports.</p>
        <ul className="flex items-center gap-6" aria-label="Social media">
          {SOCIAL.map((s) => (
            <li key={s.label} aria-label={s.label} title={s.label}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-text" aria-hidden>{s.path}</svg>
            </li>
          ))}
        </ul>
      </div>
      <ul className="flex flex-col gap-3 py-5 text-sm text-text-2">
        {LEGAL.map((l) => <li key={l}>{l}</li>)}
      </ul>
      <p className="text-sm text-text-2">© 2026 1stLive247 – All rights reserved.</p>
    </footer>
  );
}
