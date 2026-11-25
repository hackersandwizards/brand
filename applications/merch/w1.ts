// Print files and mockups for the surfaces that carry the wordmark alone (design guide, logo table):
// shirt T12, hoodie H12, stickers P10, L13, B16 and the laptop lid sticker D1; and the second sticker,
// the wizard alone, die-cut with a white border, Z1 and Z2. The outline cut goes on the Purple Love and Stargazer
// shirts and hoodies, the night cut on the Night stickers. The chest prints are sized by width; the
// back neck and the stickers keep the letter height the lockup files had, so the finest slit stays
// where the print check measured it. Logos come from this repo's logos/.
// Run: bun applications/merch/w1.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { colors } from "../../generated/tokens";
import { browser } from "../backgrounds/render";
import { type Print, TEXTILE, wear } from "./mockup";
import { dilate, erode, type Mask, trace } from "./mask";

const DIR = import.meta.dir;
const LOGOS = join(DIR, "../../logos");
// Mockups for review only, outside git.
const MOCKUPS = join(DIR, "../../captures/merch");
mkdirSync(MOCKUPS, { recursive: true });
const NIGHT = colors["--color-night"]!;
const CUT = "#EC008C";
// lockup and compact lockup widths in the D files, in brand units (wordmark: 6571)
const LOCKUP_UNITS = 7988.814;

type Point = { x: number; y: number };
type Cut = { svg: string; vbX: number; vbY: number; vbW: number; vbH: number };
function cut(name: string): Cut {
  const svg = readFileSync(join(LOGOS, `${name}.svg`), "utf8");
  const [vbX, vbY, vbW, vbH] = svg
    .match(/viewBox="([^"]+)"/)![1]
    .split(/\s+/)
    .map(Number);
  return { svg, vbX, vbY, vbW, vbH };
}
const night = cut("wordmark-night");
const outline = cut("wordmark-outline");

// The cut nested at x/y mm, its letters as wide as a 6571-unit wordmark of `wm` mm.
function placeWordmark(c: Cut, { x, y }: Point, wm: number) {
  const k = wm / 6571;
  const w = c.vbW * k;
  const h = c.vbH * k;
  const body = c.svg.replace(
    /^<svg[^>]*>/,
    `<svg x="${x}" y="${y}" width="${+w.toFixed(3)}" height="${+h.toFixed(3)}" viewBox="${c.vbX} ${c.vbY} ${c.vbW} ${c.vbH}" overflow="visible">`,
  );
  return { body, w, h };
}

// Textile print: the wordmark alone on a transparent file with 0.5 mm air, as the D files had.
function textilePrint(c: Cut, wm: number) {
  const p = placeWordmark(c, { x: 0.5, y: 0.5 }, wm);
  const W = +(p.w + 1).toFixed(3);
  const H = +(p.h + 1).toFixed(3);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${p.body}</svg>`,
    W,
    H,
  };
}

// Kiss-cut sticker: Night to the edge with 3 mm bleed, 3 mm air round the wordmark, 3 mm corners,
// the cut line as a 0.25 mm magenta stroke in the group `CutContour`.
function stickerPrint(wm: number) {
  const p = placeWordmark(night, { x: 3, y: 3 }, wm);
  const w = +(p.w + 6).toFixed(3);
  const h = +(p.h + 6).toFixed(3);
  const W = w + 6;
  const H = h + 6;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="-3 -3 ${W} ${H}"><rect x="-3" y="-3" width="${W}" height="${H}" fill="${NIGHT}"/>${p.body}<g id="CutContour"><rect x="0" y="0" width="${w}" height="${h}" rx="3" fill="none" stroke="${CUT}" stroke-width="0.25"/></g></svg>`,
    // the same without the cut line, for the mockups
    face: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="-3 -3 ${W} ${H}"><rect x="-3" y="-3" width="${W}" height="${H}" fill="${NIGHT}"/>${p.body}</svg>`,
    W,
    H,
    w,
    h,
  };
}

// The wizard sticker: the emoji master's alpha at 20 px per mm, grown by the 2.5 mm white border,
// closed by 1.5 mm so no notch narrower than 3 mm stays for the die, traced along its outer edge.
const EMOJI = join(LOGOS, "emoji-logo-short.png");
const PX = 20;

// Die-cut sticker of the wizard `side` mm square: white to the cut with 1.5 mm white bleed past it,
// the cut line as in the kiss-cut files, the cut's box at 0, 0 with 3 mm round it.
async function wizardPrint(side: number) {
  const n = Math.round(side * PX);
  const pad = 5 * PX;
  const S = n + 2 * pad;
  const alpha = await sharp(EMOJI)
    .resize(n, n)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#0000" })
    .extractChannel("alpha")
    .raw()
    .toBuffer();
  const mask: Mask = {
    data: Uint8Array.from(alpha, (a) => (a >= 128 ? 1 : 0)),
    width: S,
    height: S,
  };
  const rim = dilate(mask, 2.5 * PX);
  const pts = trace(erode(dilate(rim, 1.5 * PX), 1.5 * PX));
  const x0 = Math.min(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1]));
  const w = (Math.max(...pts.map((p) => p[0])) - x0) / PX;
  const h = (Math.max(...pts.map((p) => p[1])) - y0) / PX;
  const d = `M${pts.map(([x, y]) => `${+((x - x0) / PX).toFixed(2)},${+((y - y0) / PX).toFixed(2)}`).join(" L")} Z`;
  // the wizard at 300 dpi
  const png = await sharp(EMOJI)
    .resize(Math.ceil((side / 25.4) * 300))
    .png({ compressionLevel: 9 })
    .toBuffer();
  const art = `<path d="${d}" fill="#FFFFFF"/><image x="${+((pad - x0) / PX).toFixed(3)}" y="${+((pad - y0) / PX).toFixed(3)}" width="${side}" height="${side}" href="data:image/png;base64,${png.toString("base64")}"/>`;
  const W = +(w + 6).toFixed(3);
  const H = +(h + 6).toFixed(3);
  const doc = (body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="-3 -3 ${W} ${H}">${body}</svg>`;
  return {
    svg: doc(
      `<path d="${d}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>${art}<g id="CutContour"><path d="${d}" fill="none" stroke="${CUT}" stroke-width="0.25"/></g>`,
    ),
    face: doc(art),
    W,
    H,
    w,
    h,
  };
}

const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const mockupPage = (body: string, bg: string) =>
  `<!doctype html><html><head><style>html,body{margin:0}body{background:${bg};position:relative;font:16px system-ui}</style></head><body>${body}</body></html>`;

// T12 front chest: the outline cut FRONT_MM wide; T12 back neck: lockup 150 mm; H12 chest above the
// pocket: the outline cut 280 mm wide, inside DTF class A4; stickers: the wordmark 56/72/90 mm, on the
// laptop lid 134 mm
const FRONT_MM = 320;
const t12Front = (FRONT_MM * 6571) / outline.vbW;
const t12 = (150 * 6571) / LOCKUP_UNITS;
const h12 = (280 * 6571) / outline.vbW;
const files = {
  "shirt-T12-front": textilePrint(outline, t12Front),
  "shirt-T12-back": textilePrint(outline, t12),
  "hoodie-H12-front": textilePrint(outline, h12),
  "stickerP-P10": stickerPrint(56),
  "stickerL-L13": stickerPrint(72),
  "stickerB-B16": stickerPrint(90),
  // the laptop lid (applications/device-stickers/): the wordmark 134 mm, cut 140 mm wide
  "stickerD-D1": stickerPrint(134),
  // the wizard: Z1 45 x 51 mm, on the laptop lid Z2 67 x 76 mm
  "stickerZ-Z1": await wizardPrint(49.37),
  "stickerZ-Z2": await wizardPrint(76.18),
};

const b = await browser();
try {
  for (const [name, f] of Object.entries(files)) {
    writeFileSync(join(DIR, `${name}.svg`), `${f.svg}\n`);
    const html = `<!doctype html><html><head><style>@page{size:${f.W}mm ${f.H}mm;margin:0}html,body{margin:0}img{display:block;width:${f.W}mm;height:${f.H}mm}</style></head><body><img src="${uri(f.svg)}"></body></html>`;
    writeFileSync(join(DIR, `${name}.pdf`), await b.pdf(html, f.W, f.H));
  }

  const jpg = (png: Buffer, name: string) =>
    sharp(png)
      .jpeg({ quality: 90 })
      .toFile(join(MOCKUPS, `${name}.jpg`));

  // Embed the print file at its physical size in the textile mockup.
  const mockupPrint = (art: keyof typeof files): Print => {
    const f = files[art];
    return { href: uri(f.svg), W: f.W, H: f.H };
  };
  const zoom = (col: string, art: string, px: number) => {
    const f = files[art as keyof typeof files];
    return `<div style="background:${col};padding:${12 * px}px ${10 * px}px;display:inline-block"><img src="${uri(f.svg)}" style="display:block;width:${f.W * px}px;height:${f.H * px}px"></div>`;
  };
  const cap = (t: string) =>
    `<div style="font:15px system-ui;color:#545861;margin-top:6px">${t}</div>`; // --color-muted

  // shirt T12 in both colours: front and back, then each print at about arm's length
  const shirtColours = [
    ["stargazer", TEXTILE.stargazer],
    ["purple-love", TEXTILE["purple-love"]],
  ] as const;
  const views = shirtColours.flatMap(([n, col]) => [
    [
      `Brust, ${n}`,
      wear({ kind: "shirt", side: "front", color: col }, mockupPrint("shirt-T12-front"), {
        x: 380,
        y: 120,
      }),
    ],
    [
      `Rücken, ${n}`,
      wear({ kind: "shirt", side: "back", color: col }, mockupPrint("shirt-T12-back"), {
        x: 380,
        y: 60,
      }),
    ],
  ]);
  const shirtSheet = mockupPage(
    `<div style="display:flex;gap:30px;padding:30px 30px 0">${views
      .map(([c, svg]) => `<div style="width:370px;height:420px">${svg}${cap(c)}</div>`)
      .join("")}</div>`,
    "#E4E6EA",
  );
  await jpg(await b.shot(shirtSheet, { width: 1600, height: 520 }), "shirt-T12");
  for (const [n, col] of shirtColours) {
    await jpg(
      await b.shot(mockupPage(zoom(col, "shirt-T12-front", 3), "#E4E6EA"), {
        width: 1040,
        height: 240,
      }),
      `shirt-T12-front-${n}-crop`,
    );
    await jpg(
      await b.shot(mockupPage(zoom(col, "shirt-T12-back", 8), "#E4E6EA"), {
        width: 1200,
        height: 360,
      }),
      `shirt-T12-back-${n}-crop`,
    );
  }

  // hoodie H12 in both colours: chest, above the kangaroo pocket and below the drawcords
  const hoodieSheet = mockupPage(
    `<div style="display:flex;gap:30px;padding:30px 30px 0">${shirtColours
      .map(
        ([n, col]) =>
          `<div style="width:620px;height:690px">${wear({ kind: "hoodie", side: "front", color: col }, mockupPrint("hoodie-H12-front"), { x: 380, y: 215 })}${cap(`Brust, ${n}`)}</div>`,
      )
      .join("")}</div>`,
    "#E4E6EA",
  );
  await jpg(await b.shot(hoodieSheet, { width: 1340, height: 780 }), "hoodie-H12");
  for (const [n, col] of shirtColours)
    await jpg(
      await b.shot(mockupPage(zoom(col, "hoodie-H12-front", 3), "#E4E6EA"), {
        width: 1040,
        height: 240,
      }),
      `hoodie-H12-front-${n}-crop`,
    );

  // stickers: on a 300 mm laptop lid (--color-ampersand-light to --color-ampersand) at 2.6 px/mm and flat on white
  for (const name of [
    "stickerP-P10",
    "stickerL-L13",
    "stickerB-B16",
    "stickerD-D1",
    "stickerZ-Z1",
    "stickerZ-Z2",
  ] as const) {
    const f = files[name];
    // the die-cut face is clear outside its cut, so its shadow follows the cut
    const edge = (s: number) =>
      name.startsWith("stickerZ")
        ? "filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))"
        : `border-radius:${3 * s}px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.35)`;
    const st = (s: number) =>
      `<div style="position:relative;width:${f.w * s}px;height:${f.h * s}px;${edge(s)}"><img src="${uri(f.face)}" style="position:absolute;left:${-3 * s}px;top:${-3 * s}px;width:${f.W * s}px;height:${f.H * s}px"></div>`;
    const flat = Math.min(8, 620 / f.w);
    const sheet = mockupPage(
      `<div style="position:absolute;left:30px;top:30px;width:780px;height:520px;border-radius:30px;background:linear-gradient(135deg,#b0b5c4,#7c849c)"><div style="position:absolute;right:120px;bottom:110px">${st(2.6)}</div></div><div style="position:absolute;left:850px;top:30px;width:720px;height:520px;background:#f2f2f2;display:flex;align-items:center;justify-content:center">${st(flat)}</div>`,
      "#d0d2d8", // --color-border
    );
    const png = await b.shot(sheet, { width: 1600, height: 580 });
    await jpg(png, name);
    await jpg(
      await sharp(png).extract({ left: 850, top: 30, width: 720, height: 520 }).png().toBuffer(),
      `${name}-crop`,
    );
  }
} finally {
  await b.close();
}

for (const [name, f] of Object.entries(files)) console.log(name, `${f.W} x ${f.H} mm`);
