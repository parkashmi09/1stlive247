import Link from "next/link";
import { BellGold, Logo } from "./brand";
import { Icon } from "./icons/Icon";

type TopBarProps =
  | { variant: "brand" }
  | { variant: "title"; title: string }
  | { variant: "back"; title: string; backHref: string };

export function TopBar(props: TopBarProps) {
  return (
    <header className={`sticky top-0 z-20 flex h-16 items-center gap-3 bg-bg/85 px-4 backdrop-blur-md lg:top-16 lg:px-0 ${props.variant === "brand" ? "lg:hidden" : ""}`}>
      {props.variant === "brand" && (
        <Link href="/" aria-label="1stLive247 home" className="mr-auto"><Logo className="h-10 w-auto" /></Link>
      )}
      {props.variant === "title" && <h1 className="mr-auto text-xl font-bold">{props.title}</h1>}
      {props.variant === "back" && (
        <>
          <Link href={props.backHref} aria-label="Back" className="-ml-1 p-1"><Icon name="back" /></Link>
          <h1 className="flex-1 text-center text-base font-semibold">{props.title}</h1>
          <button type="button" aria-label="Share" className="p-1"><Icon name="share" /></button>
        </>
      )}
      {props.variant === "title" && (
        <Link href="/news" aria-label="Search" className="p-1"><Icon name="search" /></Link>
      )}
      <button type="button" aria-label="Notifications, 1 unread" className="p-0.5 lg:hidden"><BellGold unread /></button>
    </header>
  );
}
