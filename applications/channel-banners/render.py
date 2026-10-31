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
    return [(w, 0, 0.21 * w, 0.63 * h, TEAL_GLOW, 1), (0, h, 0.25 * w, 0.63 * h, PURPLE_GLOW, 1)]


def headline(x, baseline, size, track, *parts, font=MONO):
    return {"x": x, "baseline": baseline, "size": size, "track": track, "parts": parts, "font": font}


def two_lines(first, second, x=480, b1=138, b2=191, size=43.8, track=-0.039):
    return [headline(x, b1, size, track, *first), headline(x, b2, size, track, *second)]


def logos(band, radius, items):
    return {"band": band, "radius": radius, "items": items}


# "align": the lockup's left or right edge on the same edge of the content block
SURFACES = {
    "company-cover": {
        "size": (1512, 256),
        "lines": [
            headline(359, 119, 43.8, -0.042, ("Agentic engineering", 0)),
            headline(360, 167, 43.8, -0.05, ("training and mentoring.", 1)),
        ],
        # beside the text: the wordmark's centre line on the middle of cap top to last baseline
        "lockup": {"h": 78.5, "right": 1439, "anchor": 127.0},
    },
    "featured": {
        "size": (1200, 627),
        "lines": [headline(79, 137, 59.7, -0.062, ("200+", 1), (" teams trained.", 0))],
        "logos": logos(
            (80, 210, 1120, 400),
            22,
            [("mercedes-benz", 188, 304.5, 78), ("dm", 327.5, 304.5, 72), ("tchibo", 522.5, 304.5, 57), ("vorwerk", 747, 304.5, 64), ("bonprix", 963.5, 304.5, 55)],
        ),
        "lockup": {"h": 94, "anchor": 529.2, "align": "right"},
    },
    "omr": {
        "size": (1920, 1080),
        "lines": [
            headline(150, 329, 111.6, -0.05, ("KI-Schulungen für", 0)),
            headline(150, 450, 111.6, -0.05, ("Agentic Engineering.", 0)),
            headline(151, 567, 47.5, 0, ("200+ Teams trainiert.", 1), (" 1.000+ Entwickler:innen trainiert.", 2), font=INTER),
        ],
        "lockup": {"h": 134.8, "anchor": 861.2, "align": "left"},
    },
    "youtube": {
        "size": (2560, 1440),
        # glows on the corners of the 2560 x 423 strip every device shows, plus weaker canvas corners
        "glows": [
            (2560, 515, 560, 285, TEAL_GLOW, 1),
            (2560, 0, 1000, 530, TEAL_GLOW, 0.52),
            (0, 930, 640, 270, PURPLE_GLOW, 1),
            (0, 1440, 1000, 450, PURPLE_GLOW, 0.63),
        ],
        "lines": two_lines(
            [("Your whole company unstoppable,", 0)],
            [("in flow with ", 0), ("agentic engineering.", 1)],
            x=619, b1=654, b2=731, size=71.4, track=-0.057,
        ),
        "lockup": {"h": 81.6, "anchor": 857.9, "align": "left"},
    },
}

# Profile slides: one grid for both. The lockup sits at the same pixel on both, the headline's ink
# top the same distance below the lockup's ink, the client band one unit below the headline on
# slide 2. The unit is half the wordmark's cap height, the logo's own measure; the logo-to-text gap
# counts in units. Both slides hang from one top that centres slide 2's group, the taller one, in
# the canvas: the phone app and the desktop show the whole canvas and the profile photo stays left
# of the column (blind review in os docs/tracking/2026-10-31-banner-carousel.md).
PROFILE_LOCKUP_H, PROFILE_X = 79.8, 480
PROFILE_CAP = 44  # wordmark cap height in px at this lockup height, measured on the render
PROFILE_UNIT = PROFILE_CAP / 2
PROFILE_GAP = 2  # units between the lockup and the headline
S1_LINES = ([("Your whole company unstoppable,", 0)], [("in flow with ", 0), ("agentic engineering.", 1)])
S1_TYPE, S1_LEAD = (480, 43.8, -0.039), 53
S2_LINE, S2_TYPE = [("200+", 1), (" teams trained.", 0)], (479, 49.0, -0.050)
S2_BAND_H, S2_BAND_RIGHT, S2_LOGO_CY = 110, 1330, 54.5  # logo centre line below the band top
S2_LOGOS = [("mercedes-benz", 569, 63), ("dm", 682.5, 59), ("tchibo", 842, 47), ("vorwerk", 1025, 53), ("bonprix", 1201.5, 45)]


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
    _, a, _, b = lock.getchannel("A").getbbox()
    top = -lh / 2 - LIFT * lh - (LAYOUT_BOX[1] - NIGHT_BOX[1]) * u
    return top + a, top + b


def profile_slides():
    lt, lb = lockup_rows(PROFILE_LOCKUP_H)
    t1, _ = ink_rows(S1_LINES[0], S1_TYPE[1])
    t2, d2 = ink_rows(S2_LINE, S2_TYPE[1])
    head = lb - lt + PROFILE_GAP * PROFILE_UNIT
    top = (396 - head - (d2 - t2 + PROFILE_UNIT + S2_BAND_H)) / 2  # the lockup's ink top
    lockup = {"h": PROFILE_LOCKUP_H, "anchor": top - lt, "left": PROFILE_X}
    cap = top + head  # the headline's ink top
    b1, b2 = cap - t1, cap - t2
    band = b2 + d2 + PROFILE_UNIT
    x1, size1, track1 = S1_TYPE
    x2, size2, track2 = S2_TYPE
    return {
        "profile-1": {
            "size": (1584, 396),
            "lines": two_lines(*S1_LINES, x=x1, b1=b1, b2=b1 + S1_LEAD, size=size1, track=track1),
            "lockup": lockup,
        },
        "profile-2": {
            "size": (1584, 396),
            "lines": [headline(x2, b2, size2, track2, *S2_LINE)],
            "logos": logos(
                (PROFILE_X, band, S2_BAND_RIGHT, band + S2_BAND_H),
                14,
                [(f, cx, band + S2_LOGO_CY, lh) for f, cx, lh in S2_LOGOS],
            ),
            "lockup": lockup,
        },
    }


# file name -> (surface, scale, canvas width or None, margin)
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


def draw_line(img, ink, line, colors, k, dx):
    path, weight = line["font"]
    font = ImageFont.truetype(BytesIO(sfnt(path)), line["size"] * k)
    font.set_variation_by_axes([weight])
    draw, mark = ImageDraw.Draw(img), ImageDraw.Draw(ink)
    x, y = (line["x"] + dx) * k, line["baseline"] * k
    track = line["track"] * line["size"] * k
    for text, role in line["parts"]:
        if track == 0:  # proportional face: keep its kerning
            draw.text((x, y), text, font=font, fill=colors[role], anchor="ls")
            mark.text((x, y), text, font=font, fill=255, anchor="ls")
            x += font.getlength(text)
            continue
        for ch in text:
            draw.text((x, y), ch, font=font, fill=colors[role], anchor="ls")
            mark.text((x, y), ch, font=font, fill=255, anchor="ls")
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
    ink = Image.new("L", (w, h), 0)  # every element except the lockup, to find the content block
    colors = {0: WHITE, 1: ACCENTS[accent], 2: SUBLINE}
    for line in s["lines"]:
        draw_line(img, ink, line, colors, k, margin)
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
        ink.paste(255, (x0, y0), mask)
    lk = s["lockup"]
    lh = lk["h"] * k
    u = lh / LAYOUT_BOX[3]  # px per SVG unit
    lw = LAYOUT_BOX[2] * u
    lock = Image.open(LOCKUP).convert("RGBA")
    lock = lock.resize((round(NIGHT_BOX[2] * u), round(NIGHT_BOX[3] * u)), Image.LANCZOS)
    left, _, right, _ = ink.point(lambda v: 255 if v > 110 else 0).getbbox()
    if "right" in lk:  # beside the text, at a fixed edge
        x = (lk["right"] + margin) * k - lw
    elif "left" in lk:  # at a fixed edge, the same on every slide of a set
        x = (lk["left"] + margin) * k
    else:
        x = left if lk["align"] == "left" else right - lw
    top = lk["anchor"] * k - lh / 2 - LIFT * lh
    x, top = x - (LAYOUT_BOX[0] - NIGHT_BOX[0]) * u, top - (LAYOUT_BOX[1] - NIGHT_BOX[1]) * u
    img.paste(lock, (round(x), round(top)), lock)
    return img


SURFACES.update(profile_slides())


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
