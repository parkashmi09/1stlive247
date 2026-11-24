"use client";
// First-visit onboarding in 3 steps: language -> sports followed -> which sport Home opens on.
import { useEffect, useRef, useState } from "react";
import type { SportId } from "@/data/types";
import { SPORTS, sportOf } from "@/data/sports";
import { LANGS, setLang, useLang, useT } from "@/lib/i18n";
import { OPEN_ONBOARDING, saveSportPrefs, useSportPrefs } from "@/lib/prefs";
import { SportIcon } from "./icons/SportIcon";
import { Logo } from "./brand";
import { cx } from "./ui";

const STEPS = 3;
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5 9-10" /></svg>
);

export function Onboarding() {
  const prefs = useSportPrefs();
  const lang = useLang();
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<SportId[]>([]);
  const [first, setFirst] = useState<SportId | null>(null);

  useEffect(() => {
    const open = () => {
      setStep(0); setPicked(prefs ?? []); setFirst(prefs?.[0] ?? null);
      if (!ref.current?.open) ref.current?.showModal();
    };
    if (prefs === null) open();
    window.addEventListener(OPEN_ONBOARDING, open);
    return () => window.removeEventListener(OPEN_ONBOARDING, open);
  }, [prefs]);

  // functional update so quick taps don't drop a pick; `def` falls back to the first pick if `first` was removed
  const toggle = (id: SportId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const close = (sports: SportId[]) => { saveSportPrefs(sports); ref.current?.close(); };
  const def = first && picked.includes(first) ? first : picked[0];
  const finish = () => close(def ? [def, ...picked.filter((s) => s !== def)] : picked);
  const next = () => (step < STEPS - 1 ? setStep(step + 1) : finish());
  const canNext = step !== 1 || picked.length > 0;

  const title = [t("Choose your language"), t("Pick the sports you follow"), t("Which sport should open first?")][step];
  const sub = [t("You can change it any time in More."), t("Pick as many as you like."), t("Home will always open on this sport.")][step];

  return (
    <dialog ref={ref} aria-labelledby="onb-title" onCancel={(e) => { e.preventDefault(); close(prefs ?? []); }}
      className="m-auto h-dvh max-h-none w-full max-w-none bg-bg text-text backdrop:bg-black/50 md:h-[720px] md:max-h-[90dvh] md:max-w-[480px] md:rounded-3xl">
      <div className="flex h-full flex-col gap-5 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
        <div className="flex h-10 items-center justify-between">
          {step > 0
            ? <button type="button" onClick={() => setStep(step - 1)} aria-label={t("Back")} className="glass flex size-10 items-center justify-center rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 6-6 6 6 6" /></svg>
              </button>
            : <Logo className="h-9 w-auto" />}
          <button type="button" onClick={() => close(prefs ?? [])} className="text-sm font-semibold text-text-2">{t("Skip")}</button>
        </div>

        {/* progress: one segment per step, filled up to the current one */}
        <div className="flex flex-col gap-2">
          <div role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1} aria-label={t("Step")} className="flex gap-1.5">
            {Array.from({ length: STEPS }, (_, i) => (
              <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span className={cx("bg-brand block h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out", i <= step ? "w-full" : "w-0")} />
              </span>
            ))}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-2">{t("Step")} {step + 1} / {STEPS}</span>
        </div>

        {/* key re-mounts the body so each step slides in */}
        <div key={step} className="flex min-h-0 flex-1 flex-col gap-5 motion-safe:animate-[onb-in_.35s_cubic-bezier(.2,.8,.2,1)]">
          <div>
            <h2 id="onb-title" className="text-[26px] font-extrabold leading-tight">{title}</h2>
            <p className="mt-1 text-sm text-text-2">{sub}</p>
          </div>

          <div className="no-scrollbar -mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
            {step === 0 && (
              <div className="flex flex-col gap-2.5">
                {LANGS.map((l) => {
                  const on = l.id === lang;
                  return (
                    <button key={l.id} type="button" aria-pressed={on} onClick={() => setLang(l.id)}
                      className={cx("flex h-14 items-center justify-between rounded-2xl border px-5 text-[16px] font-bold transition active:scale-[0.98]",
                        on ? "bg-brand bg-origin-border border-transparent text-white shadow-[0_6px_16px_rgb(1_44_120/0.3)]" : "glass text-text")}>
                      {l.label}
                      <span className={cx("flex size-6 items-center justify-center rounded-full", on ? "bg-white text-deep" : "ring-2 ring-line")}>{on && <Check />}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-2.5">
                {SPORTS.map((s) => {
                  const on = picked.includes(s.id);
                  return (
                    <button key={s.id} type="button" aria-pressed={on} onClick={() => toggle(s.id)}
                      className={cx("relative flex h-[104px] flex-col items-start justify-between rounded-2xl border p-4 text-left text-[15px] font-bold transition active:scale-[0.97]",
                        on ? "bg-brand bg-origin-border border-transparent text-white shadow-[0_6px_16px_rgb(1_44_120/0.3)]" : "glass text-text")}>
                      <SportIcon sport={s.id} size={30} className={on ? "" : "text-text-2"} />
                      <span className="w-full truncate">{t(s.label)}</span>
                      {on && <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-white text-deep"><Check /></span>}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div role="radiogroup" aria-labelledby="onb-title" className="flex flex-col gap-2.5">
                {picked.map((id) => {
                  const on = id === def;
                  return (
                    <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setFirst(id)}
                      className={cx("flex h-16 items-center gap-4 rounded-2xl border px-5 text-[16px] font-bold transition active:scale-[0.98]",
                        on ? "bg-brand bg-origin-border border-transparent text-white shadow-[0_6px_16px_rgb(1_44_120/0.3)]" : "glass text-text")}>
                      <SportIcon sport={id} size={26} className={on ? "" : "text-text-2"} />
                      <span className="flex-1 text-left">{t(sportOf(id).label)}</span>
                      <span className={cx("flex size-6 items-center justify-center rounded-full", on ? "bg-white text-deep" : "ring-2 ring-line")}>{on && <Check />}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button type="button" disabled={!canNext} onClick={next}
          className="bg-brand h-12 shrink-0 rounded-full text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-50">
          {!canNext ? t("Pick at least one sport") : step < STEPS - 1 ? t("Continue") : t("Let's go")}
        </button>
      </div>
    </dialog>
  );
}
