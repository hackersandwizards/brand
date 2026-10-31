// Print files and mockups for the surfaces that carry the wordmark alone (design guide, logo table):
// shirt T12, hoodie H12, stickers P10, L13, B16. The outline cut goes on the Purple Love and Stargazer
// shirts and hoodies, the night cut on the Night stickers. The chest prints are sized by width; the
// back neck and the stickers keep the letter height the lockup files had, so the finest slit stays
// where the print check measured it. Logos come from this repo's logos/.
// Run: bun applications/merch/w1.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { browser } from "../backgrounds/render.ts";
import { TEXTILE, wear as wearPrint } from "./mockup.ts";

const DIR = import.meta.dir;
const LOGOS = join(DIR, "../../logos");
// Mockups for review only, outside git.
const MOCKUPS = join(DIR, "../../captures/merch");
mkdirSync(MOCKUPS, { recursive: true });
const NIGHT = "#0B1118";
const CUT = "#EC008C";
// lockup and compact lockup widths in the D files, in brand units (wordmark: 6571)
const LOCKUP_UNITS = 7988.814;

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
function placeWordmark(c: Cut, x: number, y: number, wm: number) {
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
  const p = placeWordmark(c, 0.5, 0.5, wm);
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
  const p = placeWordmark(night, 3, 3, wm);
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

const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const mockupPage = (body: string, bg: string) =>
  `<!doctype html><html><head><style>html,body{margin:0}body{background:${bg};position:relative;font:16px system-ui}</style></head><body>${body}</body></html>`;

// T12 front chest: the outline cut FRONT_MM wide; T12 back neck: lockup 150 mm; H12 chest above the
// pocket: the outline cut 280 mm wide, inside DTF class A4; stickers: compact lockup 56/72/90 mm
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

  const wear = (col: string, art: string, ax: number, ay: number, hood: boolean, back: boolean) => {
    const f = files[art as keyof typeof files];
    return wearPrint(col, { href: uri(f.svg), W: f.W, H: f.H }, ax, ay, hood, back);
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
    [`Brust, ${n}`, wear(col, "shirt-T12-front", 380, 120, false, false)],
    [`Rücken, ${n}`, wear(col, "shirt-T12-back", 380, 60, false, true)],
  ]);
  const shirtSheet = mockupPage(
    `<div style="display:flex;gap:30px;padding:30px 30px 0">${views
      .map(([c, svg]) => `<div style="width:370px;height:420px">${svg}${cap(c)}</div>`)
      .join("")}</div>`,
    "#E4E6EA",
  );
  await jpg(await b.shot(shirtSheet, 1600, 520, 1), "shirt-T12");
  for (const [n, col] of shirtColours) {
    await jpg(
      await b.shot(mockupPage(zoom(col, "shirt-T12-front", 3), "#E4E6EA"), 1040, 240, 1),
      `shirt-T12-front-${n}-crop`,
    );
    await jpg(
      await b.shot(mockupPage(zoom(col, "shirt-T12-back", 8), "#E4E6EA"), 1200, 360, 1),
      `shirt-T12-back-${n}-crop`,
    );
  }

  // hoodie H12 in both colours: chest, above the kangaroo pocket and below the drawcords
  const hoodieSheet = mockupPage(
    `<div style="display:flex;gap:30px;padding:30px 30px 0">${shirtColours
      .map(
        ([n, col]) =>
          `<div style="width:620px;height:690px">${wear(col, "hoodie-H12-front", 380, 215, true, false)}${cap(`Brust, ${n}`)}</div>`,
      )
      .join("")}</div>`,
    "#E4E6EA",
  );
  await jpg(await b.shot(hoodieSheet, 1340, 780, 1), "hoodie-H12");
  for (const [n, col] of shirtColours)
    await jpg(
      await b.shot(mockupPage(zoom(col, "hoodie-H12-front", 3), "#E4E6EA"), 1040, 240, 1),
      `hoodie-H12-front-${n}-crop`,
    );

  // stickers: on a 300 mm laptop lid (--color-ampersand-light to --color-ampersand) at 2.6 px/mm and flat on white
  for (const name of ["stickerP-P10", "stickerL-L13", "stickerB-B16"] as const) {
    const f = files[name];
    const st = (s: number) =>
      `<div style="position:relative;width:${f.w * s}px;height:${f.h * s}px;border-radius:${3 * s}px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.35)"><img src="${uri(f.face)}" style="position:absolute;left:${-3 * s}px;top:${-3 * s}px;width:${f.W * s}px;height:${f.H * s}px"></div>`;
    const flat = Math.min(8, 620 / f.w);
    const sheet = mockupPage(
      `<div style="position:absolute;left:30px;top:30px;width:780px;height:520px;border-radius:30px;background:linear-gradient(135deg,#b0b5c4,#7c849c)"><div style="position:absolute;right:120px;bottom:110px">${st(2.6)}</div></div><div style="position:absolute;left:850px;top:30px;width:720px;height:520px;background:#f2f2f2;display:flex;align-items:center;justify-content:center">${st(flat)}</div>`,
      "#d0d2d8", // --color-border
    );
    const png = await b.shot(sheet, 1600, 580, 1);
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
