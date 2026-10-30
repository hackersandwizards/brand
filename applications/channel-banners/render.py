# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=11", "fonttools>=4", "brotli>=1"]
# ///
"""Render every channel banner into this folder, and the upload copies, from this repo's lockup and fonts.

Run from the brand repo root:

    uv run applications/channel-banners/render.py [--clients-out DIR]

The banners with client logos (profile slide 2, the Featured link) never enter this repo, since
trainers read it: they render only with --clients-out, into the folder it names, from the marks
in clients/. Layout values are measured from the airy set as shipped.
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
UPLOAD = Path.home() / "Downloads/stand-entscheidungen/_hochladen"

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

# Slides in upload order. The upload folder gets exactly these, numbered from 1.
SLIDES = ["profile-1", "profile-2"]


def corner_glows(w, h):
    return [(w, 0, 0.21 * w, 0.63 * h, TEAL_GLOW, 1), (0, h, 0.25 * w, 0.63 * h, PURPLE_GLOW, 1)]


def headline(x, baseline, size, track, *parts, font=MONO):
    return {"x": x, "baseline": baseline, "size": size, "track": track, "parts": parts, "font": font}


def two_lines(first, second, x=480, b1=138, b2=191, size=43.8, track=-0.039):
    return [headline(x, b1, size, track, *first), headline(x, b2, size, track, *second)]


def logos(band, radius, items):
    return {"band": band, "radius": radius, "items": items}


# "align": the lockup's left or right edge on the same edge of the content block
PROFILE_LOCKUP = {"h": 79.8}
S2_HEAD = (479, 110, 49.0, -0.050)
SURFACES = {
    "profile-1": {
        "size": (1584, 396),
        "lines": two_lines([("Your whole company unstoppable,", 0)], [("in flow with ", 0), ("agentic engineering.", 1)]),
        "lockup": {**PROFILE_LOCKUP, "anchor": 306.9, "align": "left"},
    },
    "profile-2": {
        "size": (1584, 396),
        "lines": [headline(*S2_HEAD, ("200+", 1), (" teams trained.", 0))],
        "logos": logos(
            (480, 150, 1330, 260),
            14,
            [("mercedes-benz", 592.5, 204.5, 78), ("tchibo", 801, 204.5, 56), ("dm", 1008.5, 204.5, 68), ("obi", 1216.5, 204.5, 38)],
        ),
        "lockup": {**PROFILE_LOCKUP, "anchor": 328.9, "align": "right"},
    },
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
            [("mercedes-benz", 220.5, 304.5, 130), ("tchibo", 473, 304.5, 68), ("dm", 725.5, 304.5, 112), ("obi", 978, 304.5, 52)],
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
UPLOAD_FILES = {
    "linkedin-unternehmen-titelbild-1128x191.png": ("linkedin-company-cover-1512x256.png", (1128, 191)),
    "linkedin-unternehmen-titelbild-2256x382.png": ("linkedin-company-cover-3024x512.png", (2256, 382)),
    "linkedin-featured-1200x627.png": ("linkedin-featured-link-1200x627.png", None),
    "omr-titelbild-1920x1080.png": ("omr-reviews-cover-1920x1080.png", None),
    "youtube-kanalbanner-2560x1440.png": ("youtube-channel-banner-2560x1440.png", None),
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
    else:
        x = left if lk["align"] == "left" else right - lw
    top = lk["anchor"] * k - lh / 2 - LIFT * lh
    x, top = x - (LAYOUT_BOX[0] - NIGHT_BOX[0]) * u, top - (LAYOUT_BOX[1] - NIGHT_BOX[1]) * u
    img.paste(lock, (round(x), round(top)), lock)
    return img


def build(out, accent, upload, clients_out=None):
    out.mkdir(parents=True, exist_ok=True)
    if clients_out:
        clients_out.mkdir(parents=True, exist_ok=True)
    where = {}
    for file, (name, k) in REPO_FILES.items():
        where[file] = clients_out if "logos" in SURFACES[name] else out
        if where[file]:
            render(name, accent, k).save(where[file] / file, optimize=True)
    # Canva page 4200 x 700: the cover layout on a 1536 x 256 canvas, 12 px each side, scaled
    cv = {"canvas": (1536, 256), "margin": 12, "k": 4200 / 1536}
    render("company-cover", accent, **cv).save(out / "linkedin-company-cover-canva-4200x700.png", optimize=True)
    render("company-cover", accent, content=False, **cv).save(
        out / "linkedin-company-cover-canva-background-4200x700.png", optimize=True
    )
    if not upload:
        return
    if not UPLOAD.is_dir():
        print(f"skipped the upload copies: {UPLOAD} does not exist")
        return
    for old in UPLOAD.glob("linkedin-profilbanner-folie-*.png"):
        old.unlink()
    files = {n: f for f, (n, k) in REPO_FILES.items() if k == 1}
    for i, name in enumerate(SLIDES, 1):
        if where[files[name]]:
            Image.open(where[files[name]] / files[name]).save(
                UPLOAD / f"linkedin-profilbanner-folie-{i}-1584x396.png", optimize=True
            )
    for dest, (src, size) in UPLOAD_FILES.items():
        if where[src]:
            im = Image.open(where[src] / src)
            (im.resize(size, Image.LANCZOS) if size else im).save(UPLOAD / dest, optimize=True)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--accent", choices=ACCENTS, default="teal")
    p.add_argument("--out", type=Path, default=DOCS, help="candidates go elsewhere; the default writes the shipped set")
    p.add_argument("--clients-out", type=Path, help="where the banners with client logos go; without it they are skipped")
    a = p.parse_args()
    build(a.out, a.accent, upload=a.out == DOCS, clients_out=a.clients_out)
