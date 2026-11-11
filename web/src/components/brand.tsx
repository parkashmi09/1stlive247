// Gradient ids come from useId: the bell renders twice (mobile bar + hidden desktop header) and a
// duplicate id would resolve to the hidden copy, leaving the visible one unpainted.
import Image from "next/image";
import { useId } from "react";

/** Brand logo (designer PNG, background removed, 610×160). */
export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return <Image src="/logo.png" alt="1stLive247" width={610} height={160} priority className={className} />;
}

export function BellGold({ unread = false }: { unread?: boolean }) {
  const u = useId();
  return (
    <span className="relative inline-flex size-8">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <path d="M13.3359 26.9991L16.1885 26.9981L18.581 26.9991C19.0573 26.9992 19.9381 26.9668 20.3623 27.0713C20.5935 27.5528 19.4482 28.6217 19.1133 28.9044C18.9938 29.0046 18.86 29.0959 18.7304 29.1827C17.6405 29.9075 16.3068 30.1685 15.0244 29.9063C13.6927 29.636 12.5256 28.8415 11.7851 27.7022C11.643 27.4863 11.448 27.1757 11.7558 27.0147C12.1968 26.9803 12.8809 26.9993 13.3359 26.9991ZM15.7412 2.01275C16.3121 1.9721 16.8844 2.0721 17.4082 2.30279C18.6654 2.85917 19.2482 3.81705 19.7207 5.03716C19.8756 5.14019 20.4705 5.4102 20.6767 5.51568C21.3867 5.87974 22.038 6.34846 22.6084 6.9063C23.3399 7.63761 23.9118 8.51276 24.2871 9.47661C25.4684 12.4699 24.5809 15.3021 25.5429 18.3028C25.8486 19.2562 26.4697 20.0954 27.1113 20.8458C27.5946 21.4109 28.021 21.9621 28.0088 22.7413C28.0777 23.6645 27.1453 24.816 26.2187 24.9405C25.2727 25.0673 23.9033 25.0091 22.9043 25.0088L16.2969 25.0108L9.63181 25.0098L7.55759 25.0127C6.88292 25.0138 6.01226 25.0721 5.39158 24.8106C4.8263 24.5778 4.37737 24.1282 4.14549 23.5626C3.48755 21.9144 4.93058 20.9556 5.74607 19.7237C7.25041 17.5177 6.86931 14.7598 7.06834 12.2422C7.33216 8.90621 9.07289 6.33632 12.2119 5.09087C12.3419 4.90126 12.4456 4.6054 12.5429 4.38579C12.6994 4.03358 12.9028 3.70392 13.1465 3.40533C13.8275 2.55733 14.6741 2.13124 15.7412 2.01275Z" fill={`url(#${u}bell-gold)`} />
        <defs>
          <linearGradient id={`${u}bell-gold`} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBEA99" /><stop offset="0.49" stopColor="#D9AB4B" /><stop offset="1" stopColor="#945D0A" />
          </linearGradient>
        </defs>
      </svg>
      {unread && <span className="absolute right-1 top-0.5 size-2 rounded-full bg-live ring-2 ring-nav" />}
    </span>
  );
}
