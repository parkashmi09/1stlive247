# Regenerate src/components/icons/Icon.tsx from ../design/icons/*.svg
# Usage (from web/): python3 scripts/gen-icons.py
import pathlib, re, json
root = pathlib.Path(__file__).resolve().parents[2]
d = root / "design/icons"
out = root / "web/src/components/icons/Icon.tsx"
body = lambda p: p.read_text().split('stroke-linejoin="round">')[1].replace("</svg>", "").strip()
names = sorted(p.stem for p in d.glob("*.svg") if not p.stem.endswith("-active"))
fills = {n: re.search(r'<g fill="#F2D27A" stroke="none">(.*?)</g>', (d / f"{n}-active.svg").read_text()).group(1) for n in names}
L = ["// Generated from design/icons by scripts/gen-icons.py — do not edit by hand.", 'import type { ReactNode, SVGProps } from "react";', "", "const strokes = {"]
L += [f"  {json.dumps(n)}: <>{body(d / f'{n}.svg')}</>," for n in names]
L += ["} as const;", "", "const duotone: Record<IconName, ReactNode> = {"]
L += [f"  {json.dumps(n)}: <>{fills[n]}</>," for n in names]
L += ["};", "", "export type IconName = keyof typeof strokes;", "",
      "type Props = SVGProps<SVGSVGElement> & { name: IconName; active?: boolean; size?: number };", "",
      "/** 24px custom icon, 1.75 stroke, currentColor. `active` adds the gold duotone fill. */",
      "export function Icon({ name, active, size = 24, ...rest }: Props) {", "  return (",
      '    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>',
      '      {active && <g fill="var(--gold-mid)" stroke="none">{duotone[name]}</g>}', "      {strokes[name]}", "    </svg>", "  );", "}", ""]
out.write_text("\n".join(L))
print(f"wrote {len(names)} icons -> {out}")
