import type { Metadata } from "next";
import { TopBar } from "@/components/chrome";
import { Icon } from "@/components/icons/Icon";
import { AlertsRow, LanguageChips, SportsEditor, ThemeSegment } from "@/components/more-settings";
import { T } from "@/lib/i18n";

export const metadata: Metadata = { title: "Preferences" };

function Label({ children }: { children: string }) {
  return <h2 className="mb-2 px-1 text-xs font-semibold text-text-2"><T>{children}</T></h2>;
}

export default function PreferencesPage() {
  return (
    <>
      <TopBar variant="back" title="Preferences" backHref="/more" hideShare className="lg:mx-auto lg:max-w-[720px]" />
      <main className="flex flex-col gap-5 px-4 pt-2 lg:mx-auto lg:max-w-[720px]">
        <section><Label>Your sports</Label><SportsEditor /></section>
        <section><Label>Language</Label><LanguageChips /></section>
        <section><Label>Appearance</Label><ThemeSegment /></section>
        <ul className="glass overflow-hidden rounded-2xl">
          <li><AlertsRow icon={<span className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-live text-white"><Icon name="bell" size={16} /></span>} /></li>
        </ul>
      </main>
    </>
  );
}
