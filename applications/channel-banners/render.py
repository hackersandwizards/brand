# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=11", "fonttools>=4", "brotli>=1"]
# ///
"""Render every channel banner into this folder from this repo's lockup and fonts.

Run from the brand repo root:

    uv run applications/channel-banners/render.py

The banners with client logos (profile slide 2, the Featured link) take their marks from clients/.
Layout values are measured from the airy set as shipped.
"""

import argparse
import re
from functools import cache
from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
DOCS = HERE
BRAND = HERE.parents[1]

# (variable font, weight): weights matched to the ink coverage of the Chrome-rendered originals
MONO = (BRAND / "tokens/fonts/jetbrains-mono-latin-wght-normal.woff2", 800)
INTER = (BRAND / "tokens/fonts/inter-latin-wght-normal.woff2", 450)
LOCKUP = BRAND / "logos/lockup-night.png"
LIFT = 0.078  # the wordmark's centre line lies this share of the lockup height below its box centre


# The box a layout's "h" and edges measure the lockup by, in SVG units: the night cut sits so its
# letters land where they sit in it, whatever its own box holds round the wizard.
LAYOUT_BOX = [-1321.814, -288.642, 7988.814, 1489]
NIGHT_BOX = [float(v) for v in re.search(r'viewBox="([^"]+)"', (BRAND / "logos/lockup-night.svg").read_text()).group(1).split()]

BASE = (11, 17, 24)
WHITE = (234, 235, 236)
SUBLINE = (223, 224, 226)
ACCENTS = {"teal": (163, 199, 206), "purple": (190, 133, 242)}
TEAL_GLOW, PURPLE_GLOW = (7, 41, 46), (35, 9, 54)

CLIENTS = BRAND / "clients"


def corner_glows(w, h):
    """Teal top left, purple bottom right: the direction of --gradient-magic, as on slides and devices."""
    return [(0, 0, 0.21 * w, 0.63 * h, TEAL_GLOW, 1), (w, h, 0.25 * w, 0.63 * h, PURPLE_GLOW, 1)]


def headline(x, baseline, size, track, *parts, font=MONO):
    return {"x": x, "baseline": baseline, "size": size, "track": track, "parts": parts, "font": font}


def two_lines(first, second, b1, b2, size, track, x=480):
    return [headline(x, b1, size, track, *first), headline(x, b2, size, track, *second)]


def logos(band, radius, items):
    return {"band": band, "radius": radius, "items": items}


# One grid for every banner: the lockup on top, its left edge on
# the headline's x, the headline's ink top two units below the lockup's ink, a client band one unit
# below the text. The unit is half the wordmark's cap height, the logo's own measure. The group is
# centred in the area every device shows (blind reviews in os docs/tracking/2026-10-31-banner-carousel.md
# and 2026-10-31-channel-banners-live.md: the set reads as one when the logo sits on top everywhere).
LOCKUP_CAP = (79.8, 44)  # lockup height, wordmark cap height in px, measured on the profile render
INK_ALPHA = 5  # lockup pixels up to this alpha are resampling haze above the wizard, not ink


def ink_rows(parts, size, font=MONO):
    """Top and bottom of a line's ink relative to its baseline."""
    f = ImageFont.truetype(BytesIO(sfnt(font[0])), size)
    f.set_variation_by_axes([font[1]])
    _, top, _, bottom = f.getbbox("".join(t for t, _ in parts), anchor="ls")
    return top, bottom


def lockup_rows(lh):
    """Top and bottom of the lockup's ink relative to its anchor, as render() places it."""
    u = lh / LAYOUT_BOX[3]
    lock = Image.open(LOCKUP).convert("RGBA").resize((round(NIGHT_BOX[2] * u), round(NIGHT_BOX[3] * u)), Image.LANCZOS)
    _, a, _, b = lock.getchannel("A").point(lambda v: 255 if v > INK_ALPHA else 0).getbbox()
    top = -lh / 2 - LIFT * lh - (LAYOUT_BOX[1] - NIGHT_BOX[1]) * u
    return top + a, top + b


def grid(size, lh, lines, area=None, band=None, top=None, left=None, glows=None):
    """A surface on the grid. lines: headline dicts, baselines relative to the first line's; band:
    (x0, x1, height, radius, [(file, cx, cy below the band top, h)]); area: the rows every device
    shows, the whole height by default; top fixes the lockup's ink top instead of centring; left
    fixes the lockup's left edge instead of the first line's x."""
    unit = LOCKUP_CAP[1] * lh / LOCKUP_CAP[0] / 2
    lt, lb = lockup_rows(lh)
    t1, _ = ink_rows(lines[0]["parts"], lines[0]["size"], lines[0]["font"])
    _, dn = ink_rows(lines[-1]["parts"], lines[-1]["size"], lines[-1]["font"])
    head = lb - lt + 2 * unit
    body = lines[-1]["baseline"] + dn - t1 + (unit + band[2] if band else 0)
    a0, a1 = area or (0, size[1])
    if top is None:
        top = (a0 + a1 - head - body) / 2  # the lockup's ink top
    b1 = top + head - t1
    s = {
        "size": size,
        "lines": [{**ln, "baseline": b1 + ln["baseline"]} for ln in lines],
        "lockup": {"h": lh, "anchor": top - lt, "left": lines[0]["x"] if left is None else left},
        "top": top,
    }
    if band:
        x0, x1, bh, radius, items = band
        y = b1 + lines[-1]["baseline"] + dn + unit
        s["logos"] = logos((x0, y, x1, y + bh), radius, [(f, cx, y + cy, h) for f, cx, cy, h in items])
    if glows:
        s["glows"] = glows
    return s


def grid_surfaces():
    s2 = grid(
        (1584, 396),
        79.8,
        [headline(479, 0, 49.0, -0.050, ("200+", 1), (" teams trained.", 0))],
        band=(480, 1330, 110, 14, [(f, cx, 54.5, h) for f, cx, h in PROFILE_LOGOS]),
        left=480,
    )
    # slide 1 hangs from slide 2's top, so the lockup and the headline's top stay put across the change;
    # its claim in slide 2's headline size, which fills the slide more (blind review in os
    # docs/tracking/2026-10-31-banner-carousel.md)
    s1 = grid((1584, 396), 79.8, two_lines(*PROFILE_LINES, b1=0, b2=59.3, size=49.0, track=-0.050), top=s2["top"], left=480)
    return {
        # the group centred on the cover, which every device shows nearly whole (x 9 to 1503 measured
        # 31.10.); the page's logo tile covers the lower left up to x 384 in the iPhone app and up
        # to x 458 in a 375 pt mobile browser (os docs/tracking/2026-10-31-channel-banners-live.md)
        "company-cover": grid(
            (1512, 256),
            68,
            [headline(510.5, 0, 40.0, -0.042, ("Agentic engineering", 0)), headline(511.5, 43, 40.0, -0.05, ("training and mentoring.", 1))],
        ),
        "profile-1": s1,
        "profile-2": s2,
        "featured": grid(
            (1200, 627),
            94,
            [headline(79, 0, 59.7, -0.062, ("200+", 1), (" teams trained.", 0))],
            band=(80, 1120, 190, 22, [(f, cx, 94.5, h) for f, cx, h in FEATURED_LOGOS]),
        ),
        "omr": grid(
            (1920, 1080),
            134.8,
            [
                headline(150, 0, 111.6, -0.05, ("KI-Schulungen für", 0)),
                headline(150, 121, 111.6, -0.05, ("Agentic Engineering.", 0)),
                headline(151, 238, 47.5, 0, ("200+ Teams trainiert.", 1), (" 1.000+ Entwickler:innen trainiert.", 2), font=INTER),
            ],
        ),
        # the group centred in the 2560 x 423 strip every device shows; glows on that strip's
        # corners, plus weaker canvas corners
        "youtube": grid(
            (2560, 1440),
            81.6,
            two_lines(*PROFILE_LINES, x=619, b1=0, b2=77, size=71.4, track=-0.057),
            area=(508.5, 931.5),
            glows=[
                (0, 515, 560, 285, TEAL_GLOW, 1),
                (0, 0, 1000, 530, TEAL_GLOW, 0.52),
                (2560, 930, 640, 270, PURPLE_GLOW, 1),
                (2560, 1440, 1000, 450, PURPLE_GLOW, 0.63),
            ],
        ),
    }


PROFILE_LINES = ([("Your whole company unstoppable,", 0)], [("in flow with ", 0), ("agentic engineering.", 1)])
PROFILE_LOGOS = [("mercedes-benz", 569, 63), ("dm", 682.5, 59), ("tchibo", 842, 47), ("vorwerk", 1025, 53), ("bonprix", 1201.5, 45)]
FEATURED_LOGOS = [("mercedes-benz", 188, 78), ("dm", 327.5, 72), ("tchibo", 522.5, 57), ("vorwerk", 747, 64), ("bonprix", 963.5, 55)]


# file name -> (surface, scale)
REPO_FILES = {
    "profile-banner-1-claim-1584x396.png": ("profile-1", 1),
    "profile-banner-2-clients-1584x396.png": ("profile-2", 1),
    "linkedin-company-cover-1512x256.png": ("company-cover", 1),
    "linkedin-company-cover-3024x512.png": ("company-cover", 2),
    "linkedin-featured-link-1200x627.png": ("featured", 1),
    "linkedin-featured-link-2400x1254.png": ("featured", 2),
    "omr-reviews-cover-1920x1080.png": ("omr", 1),
    "youtube-channel-banner-2560x1440.png": ("youtube", 1),
}


def glow_mask(w, h, cx, cy, rx, ry, strength, q=4):
    sw, sh = max(1, w // q), max(1, h // q)
    data = []
    for y in range(sh):
        dy = ((y + 0.5) * h / sh - cy) / ry
        for x in range(sw):
            dx = ((x + 0.5) * w / sw - cx) / rx
            data.append(round(max(0.0, 1 - (dx * dx + dy * dy) ** 0.5) * strength * 255))
    mask = Image.new("L", (sw, sh))
    mask.putdata(data)
    return mask.resize((w, h), Image.BILINEAR)


def background(w, h, glows, k):
    img = Image.new("RGB", (w, h), BASE)
    for cx, cy, rx, ry, delta, strength in glows:
        layer = Image.new("RGB", (w, h), tuple(b + d for b, d in zip(BASE, delta)))
        img = Image.composite(layer, img, glow_mask(w, h, cx * k, cy * k, rx * k, ry * k, strength))
    return img


@cache
def sfnt(path):
    """The brand ships WOFF2; Pillow wheels read it only as plain sfnt."""
    font, buf = TTFont(path), BytesIO()
    font.flavor = None
    font.save(buf)
    return buf.getvalue()


def draw_line(img, line, colors, k, dx):
    path, weight = line["font"]
    font = ImageFont.truetype(BytesIO(sfnt(path)), line["size"] * k)
    font.set_variation_by_axes([weight])
    draw = ImageDraw.Draw(img)
    x, y = (line["x"] + dx) * k, line["baseline"] * k
    track = line["track"] * line["size"] * k
    for text, role in line["parts"]:
        if track == 0:  # proportional face: keep its kerning
            draw.text((x, y), text, font=font, fill=colors[role], anchor="ls")
            x += font.getlength(text)
            continue
        for ch in text:
            draw.text((x, y), ch, font=font, fill=colors[role], anchor="ls")
            x += font.getlength(ch) + track


def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius, fill=255)
    return mask


def render(name, accent="teal", k=1, canvas=None, margin=0, content=True):
    s = SURFACES[name]
    w0, h0 = canvas or s["size"]
    w, h = round(w0 * k), round(h0 * k)
    img = background(w, h, s.get("glows") or corner_glows(w0, h0), k)
    if not content:
        return img
    colors = {0: WHITE, 1: ACCENTS[accent], 2: SUBLINE}
    for line in s["lines"]:
        draw_line(img, line, colors, k, margin)
    if "logos" in s:
        x0, y0, x1, y1 = (round(v * k) for v in s["logos"]["band"])
        x0, x1 = x0 + round(margin * k), x1 + round(margin * k)
        band = Image.new("RGB", (x1 - x0, y1 - y0), (255, 255, 255))
        for file, cx, cy, lh in s["logos"]["items"]:
            src = Image.open(CLIENTS / f"{file}.webp").convert("RGB")
            lw = lh * src.width / src.height
            src = src.resize((round(lw * k), round(lh * k)), Image.LANCZOS)
            band.paste(src, (round((cx + margin - lw / 2) * k) - x0, round((cy - lh / 2) * k) - y0))
        mask = rounded(band, s["logos"]["radius"] * k)
        img.paste(band, (x0, y0), mask)
    lk = s["lockup"]
    lh = lk["h"] * k
    u = lh / LAYOUT_BOX[3]  # px per SVG unit
    lock = Image.open(LOCKUP).convert("RGBA")
    lock = lock.resize((round(NIGHT_BOX[2] * u), round(NIGHT_BOX[3] * u)), Image.LANCZOS)
    x = (lk["left"] + margin) * k
    top = lk["anchor"] * k - lh / 2 - LIFT * lh
    x, top = x - (LAYOUT_BOX[0] - NIGHT_BOX[0]) * u, top - (LAYOUT_BOX[1] - NIGHT_BOX[1]) * u
    img.paste(lock, (round(x), round(top)), lock)
    return img


SURFACES = grid_surfaces()


def build(out, accent):
    out.mkdir(parents=True, exist_ok=True)
    for file, (name, k) in REPO_FILES.items():
        render(name, accent, k).save(out / file, optimize=True)
    # Canva page 4200 x 700: the cover layout on a 1536 x 256 canvas, 12 px each side, scaled
    cv = {"canvas": (1536, 256), "margin": 12, "k": 4200 / 1536}
    render("company-cover", accent, **cv).save(out / "linkedin-company-cover-canva-4200x700.png", optimize=True)
    render("company-cover", accent, content=False, **cv).save(
        out / "linkedin-company-cover-canva-background-4200x700.png", optimize=True
    )


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--accent", choices=ACCENTS, default="teal")
    p.add_argument("--out", type=Path, default=DOCS, help="candidates go elsewhere; the default writes the shipped set")
    a = p.parse_args()
    build(a.out, a.accent)
