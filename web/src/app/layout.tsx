import type { Metadata, Viewport } from "next";
import { Inter, Onest } from "next/font/google";
import { Suspense } from "react";
import { BottomNav, DesktopNav, NavBar } from "@/components/BottomNav";
import "./globals.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"] });
// the Figma uses Inter only for the bottom-nav labels
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: { default: "1stLive247 — Live scores & sports news", template: "%s · 1stLive247" },
  description: "Live scores, ball-by-ball commentary and sports news. Always on for sports.",
};

export const viewport: Viewport = { themeColor: "#EFF5FB" };

// Apply a saved theme before first paint so there is no light/dark flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${onest.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <Suspense fallback={<DesktopNav />}>
          <DesktopNav live />
        </Suspense>
        {/* phone: one 480px column; desktop (lg): full-width board, Sofascore-style */}
        <div className="relative mx-auto min-h-dvh max-w-[480px] overflow-x-clip pb-28 lg:max-w-[1280px] lg:px-6 lg:pb-12 lg:pt-4">
          {/* brand glow behind the nav, as in the designer's mockup */}
          <div aria-hidden className="pointer-events-none fixed bottom-0 left-1/2 h-24 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan opacity-25 blur-[100px]" />
          {children}
        </div>
        <Suspense fallback={<NavBar />}>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}
