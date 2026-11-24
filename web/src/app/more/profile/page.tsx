import type { Metadata } from "next";
import { TopBar } from "@/components/chrome";
import { ProfileEditor } from "@/components/profile";

export const metadata: Metadata = { title: "Edit profile" };

export default function ProfilePage() {
  return (
    <>
      <TopBar variant="back" title="Edit profile" backHref="/more" hideShare className="lg:mx-auto lg:max-w-[720px]" />
      <main className="px-4 pt-2 lg:mx-auto lg:max-w-[720px]"><ProfileEditor /></main>
    </>
  );
}
