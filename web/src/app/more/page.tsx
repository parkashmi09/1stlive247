import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { TopBar } from "@/components/chrome";
import { Icon, type IconName } from "@/components/icons/Icon";
import { RowBody, ShareRow } from "@/components/more-settings";
import { ProfileCard } from "@/components/profile";
import { T } from "@/lib/i18n";

export const metadata: Metadata = { title: "More" };

// Design C ("clean settings", picked 2026-11-23): profile, a Preferences row (its own page: sports, language, theme, alerts), then app links.
const Sq = ({ c, children }: { c: string; children: ReactNode }) => (
  <span className={`flex size-[30px] shrink-0 items-center justify-center rounded-lg text-white ${c}`}>{children}</span>
);
const sq = (name: IconName, c: string) => <Sq c={c}><Icon name={name} size={16} /></Sq>;

function SectionTitle({ children }: { children: string }) {
  return <h2 className="px-1 text-[17px] font-bold"><T>{children}</T></h2>;
}
function List({ children }: { children: ReactNode }) {
  return <ul className="glass divide-y divide-line overflow-hidden rounded-2xl">{children}</ul>;
}
function LinkRow({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <li><Link href={href} className="flex h-12 items-center gap-3 pl-3 pr-4 transition active:bg-surface-2"><RowBody icon={icon} label={label} /></Link></li>
  );
}

export default function MorePage() {
  return (
    <>
      <TopBar variant="title" title="More" className="lg:mx-auto lg:max-w-[720px]" />
      <main className="flex flex-col gap-5 px-4 pt-2 lg:mx-auto lg:max-w-[720px]">
        {/* welcome banner: user's artwork (public/banners/more-stadium.webp) with the logo overlaid in code; no arrow */}
        <Link href="/" aria-label="1stLive247 home" className="relative block aspect-[370/150] overflow-hidden rounded-[20px] bg-deep">
          <Image src="/banners/more-stadium.webp" alt="" fill sizes="(min-width: 1024px) 720px, 100vw" priority className="object-cover" />
          <span className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2"><Logo className="h-9 w-auto" /></span>
          <span className="absolute bottom-4 left-4 flex flex-col text-white drop-shadow-[0_1px_6px_rgb(0_0_0/0.6)]">
            <span className="text-[15px] font-extrabold leading-tight"><T>Live scores, news & stats.</T></span>
            <span className="text-[12px] font-semibold text-white/85"><T>Stay updated. Stay ahead.</T></span>
          </span>
        </Link>

        <ProfileCard />

        <List>
          <LinkRow href="/more/preferences" icon={sq("settings", "bg-deep")} label="Preferences" />
          <LinkRow href="/live" icon={sq("star", "bg-[#D9AB4B]")} label="Favourites" />
        </List>

        <SectionTitle>App</SectionTitle>
        <div className="-mt-2">
          <List>
            <li><ShareRow icon={sq("share", "bg-boundary")} /></li>
            <LinkRow href="/" icon={sq("news", "bg-[#64748b]")} label="About" />
            <LinkRow href="/" icon={sq("settings", "bg-[#64748b]")} label="Privacy & terms" />
          </List>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
