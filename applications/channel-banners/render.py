# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=11", "fonttools>=4", "brotli>=1", "resvg-py>=0.5"]
# ///
"""Render every channel banner into this folder from this repo's lockup and fonts.

Run from the brand repo root:

    uv run applications/channel-banners/render.py

The banners with client logos (profile slide 2, the Featured link) take their marks from
@hackersandwizards/testimonials, a devDependency: run `bun install` first.
The profile banners take the claim from verbal/verbal.json in two rows: after a claim change, run
this and read each of them for the safe area.
Layout values are measured from the airy set as shipped; an ink box in a comment is this render's
pixels brighter than 70 of 255, a few px narrower than the alpha box the grid centres. The run
prints each file's ink box as left, top, right, bottom, the last two one past the ink, as the
comments give them.
"""

import argparse
import json
import re
from functools import cache
from io import BytesIO
from pathlib import Path
from runpy import run_path

from fontTools.ttLib import TTFont

from PIL import Image, ImageChops, ImageDraw, ImageFont
from resvg_py import svg_to_bytes

HERE = Path(__file__).resolve().parent
DOCS = HERE
BRAND = HERE.parents[1]

# (variable font, weight): weights matched to the ink coverage of the Chrome-rendered originals
MONO = (BRAND / "tokens/fonts/jetbrains-mono-latin-wght-normal.woff2", 800)
MONO_SUB = (MONO[0], 500)  # a subline in Mono, at the label role's weight (tokens.css)
LOCKUP = BRAND / "logos/lockup-night.png"
LIFT = 0.078  # the wordmark's centre line lies this share of the lockup height below its box centre


# The box a layout's "h" and edges measure the lockup by, in SVG units: the night cut sits so its
# letters land where they sit in it, whatever its own box holds round the wizard.
LAYOUT_BOX = [-1321.814, -288.642, 7988.814, 1489]
NIGHT_BOX = [float(v) for v in re.search(r'viewBox="([^"]+)"', (BRAND / "logos/lockup-night.svg").read_text()).group(1).split()]

WHITE = (234, 235, 236)
SUBLINE = (223, 224, 226)
# on night the accent takes its night tone, as the website and the apps do
COLORS = run_path(str(BRAND / "generated/tokens.py"))["COLORS"]
ACCENTS = {"teal": COLORS["--color-teal-night"], "purple": COLORS["--color-purple-night"]}
BASE = tuple(int(COLORS["--color-night"][i : i + 2], 16) for i in (1, 3, 5))
TEAL_GLOW, PURPLE_GLOW = (7, 41, 46), (35, 9, 54)

TESTIMONIALS = BRAND / "node_modules/@hackersandwizards/testimonials"
CLIENTS = TESTIMONIALS / "marks"
# A file may sit under several companies; one allowed entry releases it.
SHOWN = {m["file"] for m in json.loads((TESTIMONIALS / "data/marks.json").read_text()) if m["surface"] == "allowed"}


def corner_glows(w, h):
    """Teal top left, purple bottom right: the direction of --gradient-magic, as on slides and devices."""
    return [(0, 0, 0.21 * w, 0.63 * h, TEAL_GLOW, 1), (w, h, 0.25 * w, 0.63 * h, PURPLE_GLOW, 1)]


def headline(x, baseline, size, track, *parts, font=MONO):
    return {"x": x, "baseline": baseline, "size": size, "track": track, "parts": parts, "font": font}


def claim_block(size, step, track, x=480):
    """The claim in two rows, step apart, and the descriptor under it at DESCRIPTOR's share of
    the claim size, in the subline's weight and colour."""
    first, second = PROFILE_LINES
    d = DESCRIPTOR[1] * size
    return [
        headline(x, 0, size, track, *first),
        headline(x, step, size, track, *second),
        headline(x, step + DESCRIPTOR[2] * size, d, 0, (DESCRIPTOR[0], 2), font=MONO_SUB),
    ]


def logos(band, radius, items):
    return {"band": band, "radius": radius, "items": items}


# One grid for every banner: the lockup on top, its left edge on the headline's x, the headline's
# ink top two units below the lockup's ink, a client band one unit below the text. The unit is half
# the wordmark's cap height, the logo's own measure. The group is centred in the area every device
# shows; the set reads as one when the logo sits on top everywhere.
LOCKUP_CAP = (79.8, 44)  # lockup height, wordmark cap height in px, measured on the profile render
INK_ALPHA = 5  # lockup pixels up to this alpha are resampling haze above the wizard, not ink


def ink_rows(parts, size, font=MONO):
    """Top and bottom of a line's ink relative to its baseline."""
    f = ImageFont.truetype(BytesIO(sfnt(font[0])), size)
    f.set_variation_by_axes([font[1]])
    _, top, _, bottom = f.getbbox("".join(t for t, _ in parts), anchor="ls")
    return top, bottom


def line_cols(line):
    """Left and right of a line's ink, as draw_line sets it."""
    f = ImageFont.truetype(BytesIO(sfnt(line["font"][0])), line["size"])
    f.set_variation_by_axes([line["font"][1]])
    text = "".join(t for t, _ in line["parts"])
    if not line["track"]:
        a, _, b, _ = f.getbbox(text, anchor="ls")
        return line["x"] + a, line["x"] + b
    step = line["track"] * line["size"]
    x = line["x"] + sum(f.getlength(ch) + step for ch in text[:-1])
    return line["x"] + f.getbbox(text[0], anchor="ls")[0], x + f.getbbox(text[-1], anchor="ls")[2]


@cache
def lockup_ink(lh):
    """The lockup's ink box at height lh, in px from the resized night cut's top left."""
    u = lh / LAYOUT_BOX[3]
    lock = Image.open(LOCKUP).convert("RGBA").resize((round(NIGHT_BOX[2] * u), round(NIGHT_BOX[3] * u)), Image.LANCZOS)
    return lock.getchannel("A").point(lambda v: 255 if v > INK_ALPHA else 0).getbbox()


def lockup_cols(lh):
    """Left and right of the lockup's ink relative to its left edge, as render() places it."""
    a, _, b, _ = lockup_ink(lh)
    shift = -(LAYOUT_BOX[0] - NIGHT_BOX[0]) * lh / LAYOUT_BOX[3]
    return shift + a, shift + b


def lockup_rows(lh):
    """Top and bottom of the lockup's ink relative to its anchor, as render() places it."""
    _, a, _, b = lockup_ink(lh)
    top = -lh / 2 - LIFT * lh - (LAYOUT_BOX[1] - NIGHT_BOX[1]) * lh / LAYOUT_BOX[3]
    return top + a, top + b


def grid(size, lh, lines, area=None, band=None, top=None, left=None, glows=None, floor=None):
    """A surface on the grid. lines: headline dicts, baselines relative to the first line's; band:
    (x0, x1, height, radius, [(file, cx, cy below the band top, h)]); area: the rows every device
    shows, the whole height by default; top fixes the lockup's ink top instead of centring; left
    fixes the lockup's left edge instead of the first line's x; floor centres the group's ink on
    the width instead, its left edge at floor or right of it (where a profile photo ends)."""
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
    if floor is not None:
        lx = lines[0]["x"] if left is None else left
        l0, l1 = lockup_cols(lh)
        cols = [line_cols(ln) for ln in lines] + [(lx + l0, lx + l1)]
        x0, x1 = min(c[0] for c in cols), max(c[1] for c in cols)
        dx = max((size[0] - x1 - x0) / 2, floor - x0)
        lines = [{**ln, "x": ln["x"] + dx} for ln in lines]
        left = lx + dx
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
    # its claim in slide 2's headline size, which fills the slide more: ink x 469 to 1288, rows 49 to 333
    s1 = grid((1584, 396), 79.8, claim_block(49.0, 59.3, -0.050), top=s2["top"], left=480)
    return {
        # the group centred on the cover, which every device shows nearly whole (x 9 to 1503 measured
        # 31.10.); the page's logo tile covers the lower left up to x 384 in the iPhone app and up
        # to x 458 in a 375 pt mobile browser
        "company-cover": grid(
            (1512, 256),
            68,
            [headline(510.5, 0, 40.0, -0.042, ("Agentic engineering", 0)), headline(511.5, 43, 40.0, -0.05, ("training and mentoring.", 1))],
        ),
        # LinkedIn's profile banner is judged in the iPhone app and the desktop site on a laptop, where
        # the photo ends left of x 427 and x 336 (measured on real screenshots); LinkedIn's mobile
        # browser layout, whose photo covers the line's start, is not a target
        "profile-1": s1,
        "profile-2": s2,
        # The X header: profile slide 1 at its own size, centred in rows 60 to 440, which X Help
        # says every screen shows (60 px may be cropped top and bottom); the profile photo's circle
        # covers the lower left, centre x 210 to 234, y 500, radius 170 to 174 at 1440, 390 and 440 px
        # (measured 1.11. on x.com logged out), so the group centres on the width right of x 384:
        # ink x 384 to 1202, rows 109 to 392
        "x-profile": grid((1500, 500), 79.8, claim_block(49.0, 59.3, -0.050), area=(60, 440), floor=384),
        # The XING cover: at 1024 px XING crops it centred to 976 x 220, so rows 172 to 468 show on
        # every desktop; a 390 px phone shows it whole. The photo covers x < 323 below row 309 at 1024
        # px, and x 67 to 441 below row 363 on the phone (measured 8.11. on xing.com logged out). The
        # group sits right of the phone's photo, in the desktop rows, at 0.9 of slide 1's size:
        # ink x 470 to 1198, rows 193 to 447
        "xing-profile": grid((1312, 639), 71.8, claim_block(44.1, 53.4, -0.050), area=(172, 468), floor=470),
        # The Sessionize cover: Sessionize serves 2000 x 500 and shows it full width, 224 px high below
        # 832 px, 288 below 992, 400 above, centred (object-fit cover), so a 375 px phone shows x 581 to 1419
        # and a 2560 px screen rows 94 to 406; the round photo overlaps the bottom 32 px (measured 1.11. on
        # sessionize.com). The group centred in that box, nearly filling the phone's width so the small line
        # stays legible there: ink x 612 to 1385, rows 120 to 380
        "sessionize-profile": grid(
            (2000, 500), 73.3, claim_block(45.0, 54.5, -0.050), area=(94, 406), floor=0
        ),
        # The Brella cover (Digitale Leute Summit 2026): Brella asks for 2000 x 800; how much of it
        # Brella shows on desktop and phone is not measured yet, so the group sits centred in the full
        # frame at 1.5 times the Sessionize cover: ink x 521 to 1476, rows 236 to 565
        "brella-profile": grid(
            (2000, 800), 92.85, claim_block(57.0, 69.0, -0.050), floor=0
        ),
        # The Facebook profile cover: Facebook Help (facebook.com/help/220070894714080, read 6.11.)
        # asks only for at least 720 px wide; its 2.4:1 and 16:9 crops (help/125379114252045) are for
        # Pages. Measured 6.11. on facebook.com logged out: desktop shows it whole in a 940 x 348 frame
        # (2.70:1) at 1024, 1440 and 1920 px, the photo's circle over x 32 to 208 from row 243; a 375 px
        # phone (m.facebook.com) whole at 375 x 139, the photo over x 12 to 108 from row 99 and the white
        # sheet from row 120. Here: the photo below row 517 (desktop) and 528 (phone), the sheet below 640.
        # The group at 1.15 times the Brella cover, centred on the width and in rows 0 to 640: ink x 453
        # to 1544, rows 131 to 509
        "facebook-profile": grid(
            (2000, 740), 106.8, claim_block(65.5, 79.4, -0.050), area=(0, 640), floor=0
        ),
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
                headline(151, 238, 47.5, 0, ("200+ Teams", 1), (" und 1.000+ Entwickler:innen trainiert.", 2), font=MONO_SUB),
            ],
        ),
        # the group centred in the 2560 x 423 strip every device shows, on the width too (ink x 735 to
        # 1822, rows 563 to 877); glows on that strip's
        # corners, plus weaker canvas corners
        "youtube": grid(
            (2560, 1440),
            73.4,
            claim_block(64.3, 69.3, -0.057),
            floor=0,
            area=(508.5, 931.5),
            glows=[
                (0, 515, 560, 285, TEAL_GLOW, 1),
                (0, 0, 1000, 530, TEAL_GLOW, 0.52),
                (2560, 930, 640, 270, PURPLE_GLOW, 1),
                (2560, 1440, 1000, 450, PURPLE_GLOW, 0.63),
            ],
        ),
    }


def claim_lines():
    """verbal.json's English claim in two rows, broken at the space that leaves the longer row
    shortest, its word in the accent."""
    claim = json.loads((BRAND / "verbal/verbal.json").read_text())["claim"]
    words = claim["en"].split(" ")
    rows = min(([" ".join(words[:i]), " ".join(words[i:])] for i in range(1, len(words))), key=lambda r: max(map(len, r)))
    word = claim["word"]["en"]

    def parts(text):
        before, hit, after = text.partition(word)
        return [(t, role) for t, role in ((before, 0), (hit, 1), (after, 0)) if t]

    return parts(rows[0]), parts(rows[1])


PROFILE_LINES = claim_lines()
# the line under the claim on the profile banners: its text, its size and its baseline's distance
# below the claim's second row, both as shares of the claim size
DESCRIPTOR = ("Training and mentoring in agentic engineering", 0.62, 1.11)
PROFILE_LOGOS = [("mercedes-benz.webp", 569, 63), ("dm.svg", 682.5, 71), ("tchibo.svg", 842, 47), ("vorwerk.svg", 1025, 53), ("bonprix.webp", 1201.5, 45)]
FEATURED_LOGOS = [("mercedes-benz.webp", 188, 78), ("dm.svg", 327.5, 88), ("tchibo.svg", 522.5, 57), ("vorwerk.svg", 747, 64), ("bonprix.webp", 963.5, 55)]
for _file in {f for f, *_ in PROFILE_LOGOS + FEATURED_LOGOS} - SHOWN:
    raise SystemExit(f"{_file}: testimonials' marks.json allows no surface to show it")


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
    "x-profile-header-1500x500.png": ("x-profile", 1),
    "xing-profile-cover-1312x639.png": ("xing-profile", 1),
    "sessionize-profile-cover-2000x500.png": ("sessionize-profile", 1),
    "brella-profile-cover-2000x800.png": ("brella-profile", 1),
    "facebook-profile-cover-2000x740.png": ("facebook-profile", 1),
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
        if track == 0:  # untracked: draw the run whole, keeping its kerning
            draw.text((x, y), text, font=font, fill=colors[role], anchor="ls")
            x += font.getlength(text)
            continue
        for ch in text:
            draw.text((x, y), ch, font=font, fill=colors[role], anchor="ls")
            x += font.getlength(ch) + track


def brand_corner(im, radius):
    """The brand corner (--radius-brand, 20px 5px): radius top left and bottom right, a quarter of it elsewhere."""
    box = (0, 0, im.width - 1, im.height - 1)
    big, small = Image.new("L", im.size, 0), Image.new("L", im.size, 0)
    ImageDraw.Draw(big).rounded_rectangle(box, radius, fill=255, corners=(True, False, True, False))
    ImageDraw.Draw(small).rounded_rectangle(box, radius / 4, fill=255, corners=(False, True, False, True))
    return ImageChops.multiply(big, small)


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
            path = CLIENTS / file
            if path.suffix == ".svg":
                path = BytesIO(svg_to_bytes(svg_path=str(path), height=round(lh * k * 4), background="white"))
            src = Image.open(path).convert("RGBA")  # raster marks have transparent grounds
            lw = lh * src.width / src.height
            src = src.resize((round(lw * k), round(lh * k)), Image.LANCZOS)
            band.paste(src, (round((cx + margin - lw / 2) * k) - x0, round((cy - lh / 2) * k) - y0), src)
        mask = brand_corner(band, s["logos"]["radius"] * k)
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
        img = render(name, accent, k)
        img.save(out / file, optimize=True)
        print(file, "ink", img.convert("L").point(lambda v: 255 * (v > 70)).getbbox())
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
