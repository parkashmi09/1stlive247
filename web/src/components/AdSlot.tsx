// Reserved ad space (IAB sizes per view). Placeholder for now: swap the inner box for the real ad tag here only.
const SIZE = {
  "list-inline": "h-[100px] max-w-[320px] md:h-[90px] md:max-w-[728px]",
  top: "hidden h-[90px] max-w-[728px] md:flex lg:max-w-[970px]",
  side: "hidden h-[250px] max-w-[300px] lg:flex",
  match: "h-[50px] max-w-[320px] md:h-[90px] md:max-w-[728px]",
} as const;

export type AdPlacement = keyof typeof SIZE;

export function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  return (
    <div role="complementary" aria-label="Advertisement" data-ad={placement}
      className={`relative mx-auto flex w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface ring-1 ring-line [background-image:repeating-linear-gradient(135deg,transparent_0_10px,rgb(52_196_238/0.05)_10px_20px)] ${SIZE[placement]} ${className}`}>
      <span className="absolute left-2 top-2 rounded bg-text-2/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-text-2">Ad</span>
      <span className="text-[11px] font-medium tracking-wide text-text-2/80">Advertisement</span>
    </div>
  );
}
