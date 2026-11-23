import Link from "next/link";
import { BellGold, Logo } from "./brand";
import { Icon } from "./icons/Icon";

type TopBarProps =
  | { variant: "brand" }
  | { variant: "title"; title: string }
  | { variant: "back"; title: string; backHref: string };

export function TopBar(props: TopBarProps & { className?: string; hideSearch?: boolean }) {
  return (
    <header className={`sticky top-0 z-20 flex h-16 items-center gap-3 bg-bg/30 px-4 backdrop-blur-xl md:px-0 lg:top-16 ${props.variant === "brand" ? "lg:hidden" : ""} ${props.className ?? ""}`}>
      {props.variant === "brand" && (
        <Link href="/" aria-label="1stLive247 home" className="mr-auto"><Logo className="h-10 w-auto" /></Link>
      )}
      {props.variant === "title" && <h1 className="mr-auto text-xl font-bold">{props.title}</h1>}
      {props.variant === "back" && (
        <>
          <Link href={props.backHref} aria-label="Back" className="glass flex size-10 items-center justify-center rounded-full"><Icon name="back" size={20} /></Link>
          <h1 className="flex-1 text-center text-[17px] font-bold">{props.title}</h1>
          <button type="button" aria-label="Share" className="glass flex size-10 items-center justify-center rounded-full"><Icon name="share" size={20} /></button>
        </>
      )}
      {props.variant === "title" && !props.hideSearch && (
        <Link href="/search" aria-label="Search" className="p-1"><Icon name="search" /></Link>
      )}
      <button type="button" aria-label="Notifications, 1 unread" className="p-0.5 lg:hidden"><BellGold unread /></button>
    </header>
  );
}
