// Print files and mockups for the surfaces that carry the wordmark alone (design guide, logo table):
// shirt T12, hoodie H6, stickers P10, L13, B16. The night cut goes on black, Stargazer and Night,
// the outline cut on Purple Love. Each wordmark keeps the letter height the lockup files had, so
// the finest slit stays where the print check measured it. Logos come from this repo's logos/.
// Run: bun applications/merch/w1.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { browser } from "../backgrounds/render.ts";

const DIR = import.meta.dir;
const LOGOS = join(DIR, "../../logos");
// Mockups for review only, outside git.
const MOCKUPS = join(DIR, "../../captures/merch");
mkdirSync(MOCKUPS, { recursive: true });
const NIGHT = "#0B1118";
const CUT = "#EC008C";
// Stanley/Stella textile colours, as in the merch rounds
const TEXTILE = { black: "#2A2B2D", stargazer: "#39505C", "purple-love": "#6C5A9E" };
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

// T12 back neck: lockup 150 mm, H6 left chest: lockup 130 mm; stickers: compact lockup 56/72/90 mm
const t12 = (150 * 6571) / LOCKUP_UNITS;
const h6 = (130 * 6571) / LOCKUP_UNITS;
const files = {
  "shirt-T12-back": textilePrint(night, t12),
  "shirt-T12-back-purple-love": textilePrint(outline, t12),
  "hoodie-H6-front": textilePrint(night, h6),
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

  // A garment in mm: body 520 wide, sleeves to 760, 740 long; hood and long sleeves for the hoodie.
  const garment = (col: string, hood: boolean, back: boolean) => {
    const neck = back ? "Q380,26 460,0" : "Q380,90 460,0";
    const sleeves = hood
      ? "L690,40 L770,580 L690,595 L645,250 L640,740 L120,740 L115,250 L70,595 L-10,580 L70,40"
      : "L760,140 L690,260 L640,220 L640,740 L120,740 L120,220 L70,260 L0,140";
    const hoodShape = hood
      ? back
        ? `<path d="M240,40 Q240,-125 380,-125 Q520,-125 520,40 Z" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width="3"/>`
        : `<path d="M240,40 Q240,-125 380,-125 Q520,-125 520,40 Z" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width="3"/><path d="M285,30 Q290,-80 380,-85 Q470,-80 475,30 Z" fill="rgba(0,0,0,.35)"/>`
      : "";
    return `${hoodShape}<path d="M180,0 L300,0 ${neck} L580,0 ${sleeves} Z" fill="${col}" stroke="rgba(0,0,0,.18)" stroke-width="3"/>`;
  };
  const wear = (col: string, art: string, ax: number, ay: number, hood: boolean, back: boolean) => {
    const f = files[art as keyof typeof files];
    return `<svg viewBox="-20 -130 800 890" width="100%" height="100%">${garment(col, hood, back)}<image href="${uri(f.svg)}" x="${ax - f.W / 2}" y="${ay}" width="${f.W}" height="${f.H}"/></svg>`;
  };
  const zoom = (col: string, art: string, px: number) => {
    const f = files[art as keyof typeof files];
    return `<div style="background:${col};padding:${12 * px}px ${10 * px}px;display:inline-block"><img src="${uri(f.svg)}" style="display:block;width:${f.W * px}px;height:${f.H * px}px"></div>`;
  };
  const cap = (t: string) =>
    `<div style="font:15px system-ui;color:#454B55;margin-top:6px">${t}</div>`;

  // shirt T12: back views in the three colours, then each print at about arm's length
  const shirts = Object.entries(TEXTILE).map(
    ([n, col]) =>
      [n, col, n === "purple-love" ? "shirt-T12-back-purple-love" : "shirt-T12-back"] as const,
  );
  const shirtSheet = mockupPage(
    `<div style="display:flex;gap:40px;padding:30px 40px 0">${shirts
      .map(
        ([n, col, art]) =>
          `<div style="width:480px;height:540px">${wear(col, art, 380, 60, false, true)}${cap(`Rücken, ${n}`)}</div>`,
      )
      .join("")}</div><div style="display:flex;gap:30px;padding:40px">${shirts
      .map(([, col, art]) => `<div>${zoom(col, art, 3.4)}</div>`)
      .join("")}</div>`,
    "#E4E6EA",
  );
  await jpg(await b.shot(shirtSheet, 1600, 800, 1), "shirt-T12");
  await jpg(
    await b.shot(mockupPage(zoom(TEXTILE.black, "shirt-T12-back", 8), "#E4E6EA"), 1200, 360, 1),
    "shirt-T12-crop",
  );
  await jpg(
    await b.shot(
      mockupPage(zoom(TEXTILE["purple-love"], "shirt-T12-back-purple-love", 8), "#E4E6EA"),
      1200,
      360,
      1,
    ),
    "shirt-T12-purple-love-crop",
  );

  // hoodie H6: front, left chest (the wearer's left)
  const hoodieSheet = mockupPage(
    `<div style="display:flex;gap:60px;padding:40px;align-items:center"><div style="width:620px;height:690px">${wear(TEXTILE.black, "hoodie-H6-front", 500, 170, true, false)}</div><div>${zoom(TEXTILE.black, "hoodie-H6-front", 6)}${cap("Brust links, etwa aus 1 m")}</div></div>`,
    "#E4E6EA",
  );
  await jpg(await b.shot(hoodieSheet, 1600, 800, 1), "hoodie-H6");
  await jpg(
    await b.shot(mockupPage(zoom(TEXTILE.black, "hoodie-H6-front", 9), "#E4E6EA"), 1200, 320, 1),
    "hoodie-H6-crop",
  );

  // stickers: on a 300 mm laptop lid at 2.6 px/mm and flat on white
  for (const name of ["stickerP-P10", "stickerL-L13", "stickerB-B16"] as const) {
    const f = files[name];
    const st = (s: number) =>
      `<div style="position:relative;width:${f.w * s}px;height:${f.h * s}px;border-radius:${3 * s}px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.35)"><img src="${uri(f.face)}" style="position:absolute;left:${-3 * s}px;top:${-3 * s}px;width:${f.W * s}px;height:${f.H * s}px"></div>`;
    const flat = Math.min(8, 620 / f.w);
    const sheet = mockupPage(
      `<div style="position:absolute;left:30px;top:30px;width:780px;height:520px;border-radius:30px;background:linear-gradient(135deg,#a9aeb6,#7d838d)"><div style="position:absolute;right:120px;bottom:110px">${st(2.6)}</div></div><div style="position:absolute;left:850px;top:30px;width:720px;height:520px;background:#f2f2f2;display:flex;align-items:center;justify-content:center">${st(flat)}</div>`,
      "#E0DDD8",
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
