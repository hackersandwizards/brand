// The company sticker on the back of each company device, drawn to scale in millimetres: the device
// from Apple's published dimensions, the sticker from its print file in applications/merch/, cut
// line removed and clipped to the cut. Writes one self-contained SVG per device beside this file.
// Run: bun applications/device-stickers/devices.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dir;
const MERCH = join(DIR, "../merch");

// Apple tech specs and dimensional drawings (developer.apple.com/accessories/dimensional-drawings):
// MacBook Pro 14-inch lid 312.6 x 221.2 mm; the lid's Apple logo 37.2 x 45.3 mm, its centre 3.9 mm
// above the lid's centre, as on the MacBook Neo drawing. iPhone 18 Pro 71.9 x 150.0 mm, corners R11.81,
// logo 16.32 x 20.04 mm centred 91.2 mm below the top, camera plateau the top 48 mm. iPad Pro 11-inch
// (M5) 177.5 x 249.7 mm, logo 29 x 35.5 mm centred, camera module in the top left corner.
const LID = { w: 312.6, d: 221.2, logo: { w: 37.2, h: 45.3, dy: -3.9 } };
const PHONE = { w: 71.9, h: 150, logo: { cx: 35.96, cy: 91.2, w: 16.32, h: 20.04 } };
const TABLET = { w: 177.5, h: 249.7, logo: { w: 29, h: 35.5 } };

// Where each sticker goes: its print file and its centre, in mm above the device's bottom edge (the
// hinge edge on the lid), centred left to right.
export const PLACEMENT = {
  macbook: { stem: "stickerD-D1", above: 45 },
  iphone: { stem: "stickerP-P10", above: 22 },
  ipad: { stem: "stickerB-B16", above: 50 },
} as const;

type Finish = { body: [string, string]; logo: string; edge: string };
const SILVER: Finish = { body: ["#dfe1e4", "#c3c6cb"], logo: "#a7abb2", edge: "#9da1a8" };
const SPACE_BLACK: Finish = { body: ["#3a3c40", "#2a2b2e"], logo: "#53565b", edge: "#1c1d1f" };
const CASE = "#25282d";

// A sticker's print file and its cut, the file less 3 mm bleed on each side.
function stickerFile(stem: string) {
  const svg = readFileSync(join(MERCH, `${stem}.svg`), "utf8");
  const [, W, H] = svg.match(/width="([\d.]+)mm" height="([\d.]+)mm"/)!.map(Number);
  return { svg, W, H, w: W - 6, h: H - 6 };
}

// The usage text: which sticker goes where, from PLACEMENT and the print files.
export function stickerUsage() {
  const at = (k: keyof typeof PLACEMENT, edge: string) => {
    const { stem, above } = PLACEMENT[k];
    const { w, h } = stickerFile(stem);
    return `${stem} (${Math.round(w)} x ${Math.round(h)} mm), its centre ${above} mm above the ${edge}`;
  };
  return `The wordmark sticker on the back of every company device, centred left to right, below the Apple logo and upright like it, never over the logo. MacBook, every size: ${at("macbook", "hinge edge")}. iPhone: ${at("iphone", "bottom edge")}, below the MagSafe ring; on the case where the phone has one. iPad, in portrait: ${at("ipad", "bottom edge")}. The print files are under Merch. Drawn to scale from Apple's dimensions: MacBook Pro 14-inch, iPad Pro 11-inch, each in silver and space black, and iPhone 18 Pro bare and in a case.`;
}

// The sticker as printed: the print file without its cut line, clipped to the cut (3 mm corners),
// centred on cx, cy.
function stickerAt(stem: string, cx: number, cy: number, id: string) {
  const { W, H, w, h, svg: file } = stickerFile(stem);
  const svg = file.replace(/<g id="CutContour">.*?<\/g>/s, "");
  const body = svg.replace(
    /^<svg[^>]*>/,
    `<svg x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" viewBox="-3 -3 ${W} ${H}" overflow="visible">`,
  );
  return `<g transform="translate(${cx} ${cy})"><clipPath id="${id}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3"/></clipPath><rect x="${-w / 2 + 0.2}" y="${-h / 2 + 0.5}" width="${w}" height="${h}" rx="3" fill="rgba(0,0,0,.3)"/><g clip-path="url(#${id})">${body}</g></g>`;
}

// The Apple logo's outline in a 100 x 122 box, scaled to its measured box.
function appleMark(cx: number, cy: number, w: number, h: number, fill: string) {
  return `<g transform="translate(${cx - w / 2} ${cy - h / 2}) scale(${w / 100} ${h / 122})" fill="${fill}"><path d="M50 36C42 36 34 31 24 31 10 31 0 43 0 62c0 26 16 60 32 60 8 0 11-4 18-4s10 4 18 4c14 0 26-24 30-36-12-5-19-15-19-27 0-10 6-17 13-21-7-5-15-7-20-7-10 0-14 5-22 5Z"/><path d="M50 28C50 14 60 4 74 2 74 16 64 27 50 28Z"/></g>`;
}

function shade(id: string, f: Finish) {
  return `<linearGradient id="${id}" x2="1" y2="1"><stop offset="0" stop-color="${f.body[0]}"/><stop offset="1" stop-color="${f.body[1]}"/></linearGradient>`;
}

// The back of an open MacBook Pro 14-inch lid as people facing it see it, the hinge at the bottom.
function drawLid(f: Finish, x: number, id: string) {
  const { w, d, logo } = LID;
  const p = PLACEMENT.macbook;
  return `<g transform="translate(${x} 0)"><defs>${shade(id, f)}</defs><rect width="${w}" height="${d}" rx="9" fill="url(#${id})" stroke="${f.edge}" stroke-width="0.6"/><rect x="${w * 0.2}" y="${d - 3}" width="${w * 0.6}" height="3" fill="${f.edge}" opacity=".55"/>${appleMark(w / 2, d / 2 + logo.dy, logo.w, logo.h, f.logo)}${stickerAt(p.stem, w / 2, d - p.above, `${id}s`)}</g>`;
}

// The back of an iPhone 18 Pro, bare or in a case 1.6 mm thick; on a case the sticker goes on the case.
function drawIphone(f: Finish, x: number, id: string, inCase: boolean) {
  const { w, h, logo } = PHONE;
  const t = inCase ? 1.6 : 0;
  const p = PLACEMENT.iphone;
  const lens = (cx: number, cy: number) =>
    `<circle cx="${cx}" cy="${cy}" r="8.2" fill="#8b8f96"/><circle cx="${cx}" cy="${cy}" r="7" fill="#1b1d22"/>`;
  const body = inCase
    ? `<rect x="${-t}" y="${-t}" width="${w + 2 * t}" height="${h + 2 * t}" rx="${11.81 + t}" fill="${CASE}"/><rect x="3.5" y="3.5" width="${w - 7}" height="41" rx="8" fill="#0f1012"/>`
    : `<rect width="${w}" height="${h}" rx="11.81" fill="url(#${id})" stroke="${f.edge}" stroke-width="0.4"/>${appleMark(logo.cx, logo.cy, logo.w, logo.h, f.logo)}`;
  return `<g transform="translate(${x + t} ${t})"><defs>${shade(id, f)}</defs>${body}<rect x="5.2" y="4.9" width="61.9" height="37.8" rx="7" fill="${inCase ? "#202226" : f.body[0]}" stroke="${f.edge}" stroke-width="0.4"/>${lens(14.4, 14.7)}${lens(32.6, 24)}${lens(14.4, 33.2)}<circle cx="57.6" cy="13.9" r="3.5" fill="#f2efe4"/><circle cx="57.6" cy="34.5" r="3.5" fill="#1b1d22"/>${stickerAt(p.stem, w / 2, h + t - p.above, `${id}s`)}</g>`;
}

// The back of an iPad Pro 11-inch in portrait.
function drawIpad(f: Finish, x: number, id: string) {
  const { w, h, logo } = TABLET;
  const p = PLACEMENT.ipad;
  return `<g transform="translate(${x} 0)"><defs>${shade(id, f)}</defs><rect width="${w}" height="${h}" rx="12" fill="url(#${id})" stroke="${f.edge}" stroke-width="0.5"/><rect x="5" y="5" width="33" height="33" rx="8" fill="${f.body[1]}" stroke="${f.edge}" stroke-width="0.4"/><circle cx="14.5" cy="14.5" r="4.4" fill="#1b1d22"/><circle cx="14.5" cy="29" r="4.4" fill="#1b1d22"/><circle cx="29" cy="21.7" r="3.6" fill="#1b1d22"/>${[-5.27, 0, 5.27].map((dx) => `<circle cx="${w / 2 + dx}" cy="${h - 12}" r="2.13" fill="${f.edge}"/>`).join("")}${appleMark(w / 2, h / 2, logo.w, logo.h, f.logo)}${stickerAt(p.stem, w / 2, h - p.above, `${id}s`)}</g>`;
}

// Two views side by side with 10 mm between them and 6 mm round them, in millimetres.
function sheet(views: string, w: number, h: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 12}mm" height="${h + 12}mm" viewBox="-6 -6 ${w + 12} ${h + 12}">${views}</svg>\n`;
}

if (import.meta.main) {
  const files = {
    macbook: sheet(
      drawLid(SILVER, 0, "ms") + drawLid(SPACE_BLACK, LID.w + 10, "mb"),
      LID.w * 2 + 10,
      LID.d,
    ),
    iphone: sheet(
      drawIphone(SILVER, 0, "ps", false) + drawIphone(SILVER, PHONE.w + 10, "pc", true),
      PHONE.w * 2 + 13.2,
      PHONE.h + 3.2,
    ),
    ipad: sheet(
      drawIpad(SILVER, 0, "is") + drawIpad(SPACE_BLACK, TABLET.w + 10, "ib"),
      TABLET.w * 2 + 10,
      TABLET.h,
    ),
  };
  for (const [name, svg] of Object.entries(files)) writeFileSync(join(DIR, `${name}.svg`), svg);
}
