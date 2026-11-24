"use client";
// Profile card on the More page + the edit-profile form.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { T, useT } from "@/lib/i18n";
import { initials, isEmail, photoFromFile, saveProfile, useProfile, type Profile } from "@/lib/profile";
import { cx } from "./ui";

export function Avatar({ p, size }: { p: Profile; size: number }) {
  return p.photo
    // eslint-disable-next-line @next/next/no-img-element -- local data URL, nothing for next/image to optimise
    ? <img src={p.photo} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover ring-4 ring-white/70" style={{ width: size, height: size }} />
    : p.name.trim()
      ? <span className="bg-brand-diag flex shrink-0 items-center justify-center rounded-full font-extrabold text-white ring-4 ring-white/70"
          style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials(p.name)}</span>
      : <GuestAvatar size={size} />;
}

/** Default avatar for a guest (no name, no photo): player silhouette on the brand gradient with a gold collar. */
function GuestAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="shrink-0 rounded-full ring-4 ring-white/70">
      <defs>
        <linearGradient id="ga-bg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#34C4EE" /><stop offset="0.92" stopColor="#012C78" /></linearGradient>
        <linearGradient id="ga-gold" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FBEA99" /><stop offset="0.49" stopColor="#D9AB4B" /><stop offset="1" stopColor="#945D0A" /></linearGradient>
        <clipPath id="ga-clip"><circle cx="32" cy="32" r="32" /></clipPath>
      </defs>
      <g clipPath="url(#ga-clip)">
        <rect width="64" height="64" fill="url(#ga-bg)" />
        <circle cx="50" cy="12" r="14" fill="#fff" opacity="0.08" />
        {/* shoulders (jersey) + gold V collar */}
        <path d="M8 66c1-13 10-20 24-20s23 7 24 20z" fill="#fff" opacity="0.95" />
        <path d="M24 47.5 32 56l8-8.5c-2.4-.9-5-1.4-8-1.4s-5.6.5-8 1.4z" fill="url(#ga-gold)" />
        {/* head */}
        <circle cx="32" cy="29" r="11" fill="#fff" opacity="0.95" />
      </g>
    </svg>
  );
}

export function ProfileCard() {
  const p = useProfile();
  const t = useT();
  return (
    <Link href="/more/profile" className="glass flex items-center gap-4 rounded-3xl p-4 transition active:scale-[0.99]">
      <Avatar p={p} size={56} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-extrabold">{p.name || t("Guest")}</span>
        <span className="block truncate text-xs text-text-2">{p.email || p.team || t("Add your name and photo")}</span>
      </span>
      <span className="bg-brand shrink-0 rounded-full px-4 py-2 text-[13px] font-bold text-white"><T>Edit</T></span>
    </Link>
  );
}

const field = "glass h-12 w-full rounded-2xl px-4 text-[15px] text-text outline-none placeholder:text-text-2 focus:ring-2 focus:ring-cyan";

export function ProfileEditor() {
  const saved = useProfile();
  const t = useT();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  // draft starts from the saved profile; null = untouched, so a late hydration of `saved` still shows
  const [draft, setDraft] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const p = draft ?? saved;
  const set = (patch: Partial<Profile>) => { setDraft({ ...p, ...patch }); setError(""); };

  const onPhoto = async (f: File | undefined) => {
    if (!f) return;
    try { set({ photo: await photoFromFile(f) }); } catch { setError(t("Please pick an image file.")); }
    if (file.current) file.current.value = "";
  };
  const save = () => {
    const clean = { ...p, name: p.name.trim().slice(0, 40), email: p.email.trim(), team: p.team.trim().slice(0, 40) };
    if (clean.email && !isEmail(clean.email)) return setError(t("Enter a valid email."));
    if (!saveProfile(clean)) return setError(t("Couldn't save on this device."));
    router.push("/more");
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <div className="flex flex-col items-center gap-3 pt-2">
        <Avatar p={p} size={104} />
        <div className="flex gap-2">
          <button type="button" onClick={() => file.current?.click()} className="bg-brand rounded-full px-4 py-2 text-[13px] font-bold text-white">
            <T>{p.photo ? "Change photo" : "Add photo"}</T>
          </button>
          {p.photo && (
            <button type="button" onClick={() => set({ photo: undefined })} className="glass rounded-full px-4 py-2 text-[13px] font-bold text-live">
              <T>Remove photo</T>
            </button>
          )}
        </div>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="px-1 text-xs font-semibold text-text-2"><T>Name</T></span>
        <input className={field} value={p.name} maxLength={40} autoComplete="name" placeholder={t("Your name")} onChange={(e) => set({ name: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="px-1 text-xs font-semibold text-text-2"><T>Email</T></span>
        <input className={field} type="email" value={p.email} autoComplete="email" inputMode="email" placeholder="name@example.com" onChange={(e) => set({ email: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="px-1 text-xs font-semibold text-text-2"><T>Favourite team</T></span>
        <input className={field} value={p.team} maxLength={40} placeholder={t("e.g. India, Real Madrid")} onChange={(e) => set({ team: e.target.value })} />
      </label>

      {error && <p role="alert" className="px-1 text-sm font-semibold text-live">{error}</p>}

      <button type="submit" disabled={!draft} className={cx("bg-brand h-12 rounded-full text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-50")}>
        <T>Save</T>
      </button>
    </form>
  );
}
