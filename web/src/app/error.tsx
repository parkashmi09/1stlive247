"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-lg font-bold">Scores are taking a breather</p>
      <p className="text-sm text-text-2">We couldn’t reach the live service. Check your connection and try again.</p>
      <button type="button" onClick={reset} className="bg-brand rounded-full px-5 py-2 text-sm font-medium text-white">Try again</button>
    </main>
  );
}
