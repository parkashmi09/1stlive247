import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { TopBar } from "@/components/chrome";
import { Icon, type IconName } from "@/components/icons/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "More" };

// icon chip tints: brand blue, gold, live red, green
const TINT = {
  blue: "bg-cyan/15 text-deep dark:text-cyan",
  gold: "bg-[#D9AB4B]/15 text-[#945D0A] dark:text-[#FBEA99]",
  red: "bg-live/10 text-live",
  green: "bg-boundary/12 text-boundary",
} as const;
type Tint = keyof typeof TINT;

const Moon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
  </svg>
);

const Chevron = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

function Chip({ tint, children }: { tint: Tint; children: ReactNode }) {
  return <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TINT[tint]}`}>{children}</span>;
}

function Row({ icon, tint, title, sub, trailing, href }: { icon: ReactNode; tint: Tint; title: string; sub?: string; trailing?: ReactNode; href?: string }) {
  const body = (
    <>
      <Chip tint={tint}>{icon}</Chip>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        {sub && <span className="block truncate text-xs text-text-2">{sub}</span>}
      </span>
      {trailing ?? <span className="text-text-2"><Chevron /></span>}
    </>
  );
  const cls = "flex items-center gap-3 px-4 py-3 transition active:bg-surface-2";
  return <li className="border-b border-line last:border-0">{href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-text-2">{title}</h2>
      <ul className="overflow-hidden rounded-2xl border border-line bg-surface">{children}</ul>
    </section>
  );
}

// Solid custom marks for the quick tiles (24×24, filled, white) on a gradient chip each.
const SOLID = {
  star: <path d="M12 2.6c.3 0 .6.2.7.5l2.3 4.9 5.3.6c.7.1 1 .9.5 1.4l-3.9 3.7 1 5.3c.1.7-.6 1.2-1.2.9L12 17.3l-4.7 2.6c-.6.3-1.3-.2-1.2-.9l1-5.3-3.9-3.7c-.5-.5-.2-1.3.5-1.4l5.3-.6 2.3-4.9c.1-.3.4-.5.7-.5Z" />,
  bell: <><path d="M12 2.5a1.3 1.3 0 0 1 1.3 1.3v.6A6.5 6.5 0 0 1 18.5 11v3.6l1.6 2.2c.5.7 0 1.7-.9 1.7H4.8c-.9 0-1.4-1-.9-1.7l1.6-2.2V11a6.5 6.5 0 0 1 5.2-6.6v-.6A1.3 1.3 0 0 1 12 2.5Z" /><path d="M9.5 20h5a2.5 2.5 0 0 1-5 0Z" /></>,
  live: <><circle cx="12" cy="12" r="3.2" /><path d="M7.4 7.4a1 1 0 0 1 1.4 1.4 4.5 4.5 0 0 0 0 6.4 1 1 0 0 1-1.4 1.4 6.5 6.5 0 0 1 0-9.2Zm9.2 0a6.5 6.5 0 0 1 0 9.2 1 1 0 0 1-1.4-1.4 4.5 4.5 0 0 0 0-6.4 1 1 0 0 1 1.4-1.4ZM4.2 4.2a1 1 0 0 1 1.4 1.4 9 9 0 0 0 0 12.8 1 1 0 0 1-1.4 1.4 11 11 0 0 1 0-15.6Zm15.6 0a11 11 0 0 1 0 15.6 1 1 0 0 1-1.4-1.4 9 9 0 0 0 0-12.8 1 1 0 0 1 1.4-1.4Z" /></>,
  news: <path fillRule="evenodd" d="M4.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v2h3a1 1 0 0 1 1 1v10a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18V5a1.5 1.5 0 0 1 1.5-1.5ZM17 9v9a1 1 0 0 0 2 0V9h-2ZM6 7h8v4H6V7Zm0 6h8v1.6H6V13Zm0 3h5v1.6H6V16Z" />,
} as const;
const SOLID_BG = {
  star: "bg-gold text-[#5a3a05]",
  bell: "bg-[linear-gradient(135deg,#ff5a62,#c4000b)] text-white",
  live: "bg-brand-diag text-white",
  news: "bg-[linear-gradient(135deg,#34d399,#047857)] text-white",
} as const;
function SolidIcon({ name }: { name: keyof typeof SOLID }) {
  return <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>{SOLID[name]}</svg>;
}

const QUICK: { label: string; icon: keyof typeof SOLID; href: string }[] = [
  { label: "Favourites", icon: "star", href: "/more" },
  { label: "Alerts", icon: "bell", href: "/more" },
  { label: "Live", icon: "live", href: "/live" },
  { label: "News", icon: "news", href: "/news" },
];

export default function MorePage() {
  return (
    <>
      <TopBar variant="title" title="More" className="lg:mx-auto lg:max-w-[720px]" />
      <main className="flex flex-col gap-5 px-4 pt-2 lg:mx-auto lg:max-w-[720px]">
        {/* hero: light card so the blue + gold logo reads */}
        <Link href="/" className="card-premium relative flex items-center gap-4 overflow-hidden rounded-[20px] border border-line bg-surface p-5">
          <span className="bg-brand-diag pointer-events-none absolute -right-10 -top-12 size-40 rounded-full opacity-15 blur-2xl" aria-hidden />
          <span className="relative min-w-0 flex-1">
            <Logo className="h-11 w-auto" />
            <span className="mt-3 block text-sm font-medium text-text-2">Live scores, news and stats. Stay updated, stay ahead.</span>
          </span>
          <span className="bg-gold relative flex size-10 shrink-0 items-center justify-center rounded-full text-[#012c78] shadow-[0_4px_14px_rgb(217_171_75/0.45)]">
            <Icon name="back" size={18} className="rotate-180" />
          </span>
        </Link>

        {/* quick actions */}
        <nav aria-label="Quick actions" className="grid grid-cols-4 gap-2.5">
          {QUICK.map((q) => (
            <Link key={q.label} href={q.href} className="card-premium flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-1 py-3.5">
              <span className={`flex size-11 items-center justify-center rounded-2xl shadow-[0_6px_16px_rgb(1_44_120/0.18)] ${SOLID_BG[q.icon]}`}><SolidIcon name={q.icon} /></span>
              <span className="text-xs font-semibold">{q.label}</span>
            </Link>
          ))}
        </nav>

        <Section title="Preferences">
          <Row icon={<Icon name="bell" size={20} />} tint="red" title="Notifications" sub="Goals, wickets and full-time alerts" />
          <Row icon={<Icon name="globe" size={20} />} tint="blue" title="Language"
            trailing={<span className="flex items-center gap-1 text-sm text-text-2">English <Chevron size={16} /></span>} />
          <Row icon={<Moon />} tint="blue" title="Dark mode" sub="Easy on the eyes at night" trailing={<ThemeToggle />} />
        </Section>

        <Section title="App">
          <Row icon={<Icon name="share" size={20} />} tint="green" title="Share app" sub="Invite friends to 1stLive247" />
          <Row icon={<Icon name="settings" size={20} />} tint="blue" title="Settings" />
          <Row icon={<Icon name="news" size={20} />} tint="gold" title="About 1stLive247" />
        </Section>

        <SiteFooter />
      </main>
    </>
  );
}
