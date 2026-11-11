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
      <TopBar variant="title" title="More" className="lg:mx-auto lg:max-w-[720px]" />
      <main className="flex flex-col gap-5 px-4 pt-2 lg:mx-auto lg:max-w-[720px]">
        {/* hero: the logo is blue + gold, so it sits on a white plate instead of the blue gradient */}
        <Link href="/" className="hero-glow relative flex flex-col gap-4 overflow-hidden rounded-[20px] p-4 text-white shadow-raised">
          <SportIcon sport="cricket" size={150} className="pointer-events-none absolute -bottom-10 -right-8 text-white opacity-[0.07]" />
          <span className="relative flex items-center justify-center rounded-2xl bg-white px-4 py-4 shadow-[0_6px_20px_rgb(1_44_120/0.25)]">
            <Logo className="h-12 w-auto" />
          </span>
          <span className="relative flex items-center gap-3 px-1">
            <span className="min-w-0 flex-1">
              <span className="text-gold block text-[11px] font-bold uppercase tracking-[0.14em]">Welcome</span>
              <span className="block text-[15px] font-semibold">Stay updated. Stay ahead.</span>
            </span>
            <span className="bg-gold flex size-9 shrink-0 items-center justify-center rounded-full text-[#012c78]">
              <Icon name="back" size={18} className="rotate-180" />
            </span>
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

        <p className="pb-2 text-center text-[11px] text-text-2">1stLive247 · Version 0.1</p>
      </main>
    </>
  );
}
