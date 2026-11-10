import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { TopBar } from "@/components/chrome";
import { Icon, type IconName } from "@/components/icons/Icon";
import { SportIcon } from "@/components/icons/SportIcon";
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

const QUICK: { label: string; icon: IconName; tint: Tint; href: string }[] = [
  { label: "Favourites", icon: "star", tint: "gold", href: "/more" },
  { label: "Alerts", icon: "bell", tint: "red", href: "/more" },
  { label: "Live", icon: "live", tint: "blue", href: "/live" },
  { label: "News", icon: "news", tint: "green", href: "/news" },
];

export default function MorePage() {
  return (
    <>
      <TopBar variant="title" title="More" />
      <main className="flex flex-col gap-5 px-4 pt-2 lg:mx-auto lg:max-w-[720px]">
        {/* hero: welcome card (client theme 2) */}
        <Link href="/" className="hero-glow relative flex items-center gap-4 overflow-hidden rounded-[20px] p-5 text-white shadow-raised">
          <SportIcon sport="cricket" size={130} className="pointer-events-none absolute -right-6 -top-6 text-white opacity-[0.07]" />
          <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full p-[2px] [background:var(--grad-gold)]">
            <span className="flex size-full items-center justify-center rounded-full bg-[#0A1F4A]">
              <svg width="28" height="22" viewBox="0 0 20 16" aria-hidden><path d="M2 14h16l1.5-10-5 4L10 1 5.5 8l-5-4z" fill="url(#crown-g)" /><defs><linearGradient id="crown-g" x1="10" y1="1" x2="10" y2="14" gradientUnits="userSpaceOnUse"><stop stopColor="#FBEA99" /><stop offset=".5" stopColor="#D9AB4B" /><stop offset="1" stopColor="#945D0A" /></linearGradient></defs></svg>
            </span>
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="text-gold block text-xs font-semibold uppercase tracking-[0.12em]">Welcome to</span>
            <Logo className="my-0.5 h-9 w-auto" />
            <span className="block text-xs text-white/75">Stay updated. Stay ahead.</span>
          </span>
          <span className="relative flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Icon name="back" size={18} className="rotate-180" />
          </span>
        </Link>

        {/* quick actions */}
        <nav aria-label="Quick actions" className="grid grid-cols-4 gap-2.5">
          {QUICK.map((q) => (
            <Link key={q.label} href={q.href} className="card-premium flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-1 py-3.5">
              <Chip tint={q.tint}><Icon name={q.icon} size={20} /></Chip>
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

        {/* brand footer card (client theme 2) */}
        <section className="hero-glow flex flex-col items-center gap-2 rounded-[20px] px-5 py-6 text-center">
          <Logo className="h-12 w-auto" />
          <p className="text-gold text-[11px] font-semibold uppercase tracking-[0.35em]">Always on for sports</p>
          <p className="text-[11px] text-white/60">Version 0.1</p>
        </section>
      </main>
    </>
  );
}
