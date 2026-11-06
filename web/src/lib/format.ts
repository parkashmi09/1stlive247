// Fixed time zone so server and client render identical strings (no hydration drift).
const TZ = "Asia/Kolkata";
const day = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: TZ });
const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });

export const formatDay = (iso: string) => day.format(new Date(iso));

const longDay = new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const ord = (n: number) => n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
/** "Sunday 25th Jun 2026" (banner style, as in the Figma). */
export function formatBannerDate(iso: string) {
  const p = Object.fromEntries(longDay.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.weekday} ${ord(Number(p.day))} ${p.month} ${p.year}`;
}
export const formatTime = (iso: string) => time.format(new Date(iso));

/** "3h ago". Server-only: relative to the render time. */
export function timeAgo(iso: string, now = Date.now()) {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}
