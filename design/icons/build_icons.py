"""Generates design/icons/*.svg (default) and *-active.svg (gold duotone). Run: python3 build_icons.py"""
import math, pathlib

OUT = pathlib.Path(__file__).parent
GOLD = "#F2D27A"

def poly(pts):
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + "Z"

def star():
    return poly([(12 + (9 if i % 2 == 0 else 4) * math.sin(i * math.pi / 5),
                  12.6 - (9 if i % 2 == 0 else 4) * math.cos(i * math.pi / 5)) for i in range(10)])

def gear():
    pts = []
    for i in range(8):
        a = i * math.pi / 4
        for da, r in ((-0.2, 9), (0.2, 9), (0.32, 7), (math.pi / 4 - 0.32, 7)):
            pts.append((12 + r * math.cos(a + da), 12 + r * math.sin(a + da)))
    return poly(pts)

def pentagon(r):
    return [(12 + r * math.sin(i * 2 * math.pi / 5), 12 - r * math.cos(i * 2 * math.pi / 5)) for i in range(5)]

ball_lines = " ".join(f"M{x:.2f} {y:.2f}L{12 + 9 * (x - 12) / 3.4:.2f} {12 + 9 * (y - 12) / 3.4:.2f}" for x, y in pentagon(3.4))

# name: (stroke paths, duotone fill path)
ICONS = {
    "home": ("M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
             "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"),
    "live": ('<circle cx="12" cy="12" r="2"/>M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8',
             '<circle cx="12" cy="12" r="3.2"/>'),
    "news": ("M4 4h13v16H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2h-1M8 8h5M8 12h5M8 16h3",
             "M4 4h13v16H6a2 2 0 0 1-2-2z"),
    "videos": ("M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM10 9v6l5-3z",
               "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"),
    "scores": ("M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8M9.5 18h5",
               "M7 4h10v5a5 5 0 0 1-10 0z"),
    "more": ('<circle cx="6" cy="12" r="1.25"/><circle cx="12" cy="12" r="1.25"/><circle cx="18" cy="12" r="1.25"/>',
             '<rect x="2.5" y="7.5" width="19" height="9" rx="4.5"/>'),
    "search": ('<circle cx="11" cy="11" r="6.5"/>M20 20l-4.4-4.4', '<circle cx="11" cy="11" r="6.5"/>'),
    "bell": ("M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0",
             "M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"),
    "share": ('<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/>M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1',
              '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/>'),
    "back": ("M15 5l-7 7 7 7M8 12h12", '<circle cx="12" cy="12" r="9.5"/>'),
    "settings": (gear() + '<circle cx="12" cy="12" r="2.8"/>', gear()),
    "star": (star(), star()),
    "cricket": ("M13 5l6 6-8.5 8.5a1.5 1.5 0 0 1-2.1 0l-3.9-3.9a1.5 1.5 0 0 1 0-2.1zM16 8l4.5-4.5" + '<circle cx="5.5" cy="5.5" r="2"/>',
                "M13 5l6 6-8.5 8.5a1.5 1.5 0 0 1-2.1 0l-3.9-3.9a1.5 1.5 0 0 1 0-2.1z"),
    "football": ('<circle cx="12" cy="12" r="9"/>' + poly(pentagon(3.4)) + ball_lines, poly(pentagon(3.4))),
    "tennis": ('<circle cx="12" cy="12" r="9"/>M6 4.8c3 2.6 3 11.8 0 14.4M18 4.8c-3 2.6-3 11.8 0 14.4',
               '<circle cx="12" cy="12" r="9"/>'),
    "basketball": ('<circle cx="12" cy="12" r="9"/>M3 12h18M12 3v18M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8',
                   '<circle cx="12" cy="12" r="9"/>'),
    "racing": ("M6 21h12M8 21c.5-3.5 2.5-5 4-6.5-1.5.5-3.5.5-5-.5L5.5 12l2-3.5L11 5l1-2.5 1.5 2.5c3.5.5 6 3.5 6 8V21"
               + '<circle cx="10.5" cy="8.5" r=".6"/>',
               "M8 21c.5-3.5 2.5-5 4-6.5-1.5.5-3.5.5-5-.5L5.5 12l2-3.5L11 5l1-2.5 1.5 2.5c3.5.5 6 3.5 6 8V21z"),
    "f1": ("M5 21V3.5M5 4h14l-2.5 5 2.5 5H5" + '<path d="M5 4h4.5v5H5zM14 4h3.5L15.5 9H14zM9.5 9H14v5H9.5z" fill="currentColor" stroke="none"/>',
           "M5 4h14l-2.5 5 2.5 5H5z"),
    "kabaddi": ('<circle cx="14.5" cy="4.5" r="1.8"/>M13.5 8 10.5 13l3 3-1 5M13.5 8l5 1.5M12 10.5 7 9.5M10.5 13 6 17.5',
                '<circle cx="14.5" cy="4.5" r="2.6"/>'),
    "stats": ('<rect x="4" y="12" width="3.5" height="8" rx="1"/><rect x="10.25" y="5" width="3.5" height="15" rx="1"/><rect x="16.5" y="9" width="3.5" height="11" rx="1"/>',
              '<rect x="4" y="12" width="3.5" height="8" rx="1"/><rect x="10.25" y="5" width="3.5" height="15" rx="1"/><rect x="16.5" y="9" width="3.5" height="11" rx="1"/>'),
    "lightning": ("M13 2 4 14h7l-1 8 9-12h-7z", "M13 2 4 14h7l-1 8 9-12h-7z"),
    "globe": ('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/>M3 12h18M4.6 7h14.8M4.6 17h14.8',
              '<circle cx="12" cy="12" r="9"/>'),
}

def body(spec):
    """Split mixed spec: raw '<...>' elements stay, path data gets wrapped."""
    out, buf, i = [], "", 0
    while i < len(spec):
        if spec[i] == "<":
            j = spec.index(">", i) + 1
            if buf.strip(): out.append(f'<path d="{buf.strip()}"/>'); buf = ""
            out.append(spec[i:j]); i = j
        else:
            buf += spec[i]; i += 1
    if buf.strip(): out.append(f'<path d="{buf.strip()}"/>')
    return "".join(out)

HEAD = ('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" '
        'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">')

for name, (stroke, fill) in ICONS.items():
    (OUT / f"{name}.svg").write_text(f"{HEAD}{body(stroke)}</svg>\n")
    (OUT / f"{name}-active.svg").write_text(f'{HEAD}<g fill="{GOLD}" stroke="none">{body(fill)}</g>{body(stroke)}</svg>\n')

assert len(ICONS) == 22, len(ICONS)
print(f"wrote {len(ICONS) * 2} svgs")
