// The one sticker combination on the back of each company device, drawn to scale in millimetres:
// the device in silver from Apple's published dimensions, the sticker from its print file in
// applications/merch/, cut line removed and clipped to the cut, with the device's centre line and
// the measure from the bottom edge to the wordmark sticker's centre. Writes one self-contained SVG
// per device beside this file.
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

// Where each wordmark sticker goes: its print file and its centre, in mm above the device's bottom
// edge (the hinge edge on the lid), centred left to right. The lid also carries the wizard sticker,
// centred on the Apple logo.
export const LID_WIZARD = "stickerZ-Z2";
export const PLACEMENT = {
  macbook: { stem: "stickerD-D1", above: 45 },
  iphone: { stem: "stickerP-P10", above: 22 },
  ipad: { stem: "stickerB-B16", above: 50 },
} as const;

// Silver only: the placement is the same on every finish, and the night sticker reads on silver.
const F = { body: ["#dfe1e4", "#c3c6cb"], logo: "#a7abb2", edge: "#9da1a8" };
// The measure's ink, the brand's teal-dark and ink.
const LINE = "#155b6a";
const INK = "#19283a";

// A sticker's print file and its cut: the cut's box is the file less 3 mm bleed on each side, its
// shape the element in `CutContour`, a rounded rectangle or the die-cut path.
function stickerFile(stem: string) {
  const svg = readFileSync(join(MERCH, `${stem}.svg`), "utf8");
  const [, W, H] = svg.match(/width="([\d.]+)mm" height="([\d.]+)mm"/)!.map(Number);
  const cut = svg
    .match(/<g id="CutContour"[^>]*>(.*?)<\/g>/s)![1]
    .replace(/\s(fill|stroke|stroke-width)="[^"]*"/g, "");
  return { svg, W, H, w: W - 6, h: H - 6, cut };
}

// Each device's caption: its name and, per sticker, the print file, its size and where it goes.
export function stickerCaptions() {
  const code = (stem: string) => stem.split("-")[1];
  const size = (stem: string) => {
    const { w, h } = stickerFile(stem);
    return `${Math.round(w)} x ${Math.round(h)} mm`;
  };
  const centred = (k: keyof typeof PLACEMENT, edge: string) =>
    `${code(PLACEMENT[k].stem)}, the wordmark, ${size(PLACEMENT[k].stem)}: its centre ${PLACEMENT[k].above} mm above the ${edge}`;
  return [
    {
      file: "macbook",
      title: "MacBook, every size",
      lines: [
        `${code(LID_WIZARD)}, the wizard, ${size(LID_WIZARD)}: centred on the Apple logo`,
        centred("macbook", "hinge edge"),
      ],
    },
    {
      file: "iphone",
      title: "iPhone",
      lines: [`${centred("iphone", "bottom edge")}, on the case if there is one`],
    },
    { file: "ipad", title: "iPad, in portrait", lines: [centred("ipad", "bottom edge")] },
  ];
}

// The sticker as printed: the print file without its cut line, clipped to the cut, with a shadow of
// the cut's shape, centred on cx, cy.
function stickerAt(stem: string, cx: number, cy: number, id: string) {
  const { w, h, cut, svg: file } = stickerFile(stem);
  const inner = file
    .replace(/<g id="CutContour">.*?<\/g>/s, "")
    .replace(/^<svg[^>]*>|<\/svg>\s*$/g, "");
  return `<g transform="translate(${cx - w / 2} ${cy - h / 2})"><clipPath id="${id}">${cut}</clipPath><g transform="translate(0.2 0.5)" fill="rgba(0,0,0,.3)">${cut}</g><g clip-path="url(#${id})">${inner}</g></g>`;
}

// The Apple logo's outline in a 100 x 122 box, scaled to its measured box.
function appleMark(cx: number, cy: number, w: number, h: number) {
  return `<g transform="translate(${cx - w / 2} ${cy - h / 2}) scale(${w / 100} ${h / 122})" fill="${F.logo}"><path d="M50 36C42 36 34 31 24 31 10 31 0 43 0 62c0 26 16 60 32 60 8 0 11-4 18-4s10 4 18 4c14 0 26-24 30-36-12-5-19-15-19-27 0-10 6-17 13-21-7-5-15-7-20-7-10 0-14 5-22 5Z"/><path d="M50 28C50 14 60 4 74 2 74 16 64 27 50 28Z"/></g>`;
}

const SHADE = `<linearGradient id="shade" x2="1" y2="1"><stop offset="0" stop-color="${F.body[0]}"/><stop offset="1" stop-color="${F.body[1]}"/></linearGradient>`;

// The device's centre line, dashed, from 3 mm above to 3 mm below it.
const axis = (w: number, h: number) =>
  `<path d="M${w / 2} -3V${h + 3}" stroke="${LINE}" stroke-width="0.4" stroke-dasharray="2 1.5" opacity=".7"/>`;

// The measure right of the device, from its bottom edge up to the wordmark sticker's centre.
function measure(w: number, h: number, above: number) {
  const x = w + 8;
  const y = h - above;
  const tip = (yy: number, dir: number) =>
    `<path d="M${x} ${yy}l-1.4 ${dir * 3}h2.8Z" fill="${LINE}"/>`;
  return `<g stroke="${LINE}" stroke-width="0.5"><path d="M${w + 1} ${h}H${x + 3}M${w + 1} ${y}H${x + 3}" stroke-dasharray="1.2 1"/><path d="M${x} ${y + 3}V${h - 3}"/></g>${tip(y, 1)}${tip(h, -1)}<text x="${x + 3}" y="${y + above / 2 + 3.5}" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" fill="${INK}">${above} mm</text>`;
}

// One device on a sheet with 6 mm round it and room for the measure on the right, in millimetres.
function sheet(w: number, h: number, above: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 52}mm" height="${h + 12}mm" viewBox="-6 -6 ${w + 52} ${h + 12}"><defs>${SHADE}</defs>${body}${measure(w, h, above)}</svg>\n`;
}

// The back of an open MacBook Pro 14-inch lid as people facing it see it, the hinge at the bottom.
function drawLid() {
  const { w, d, logo } = LID;
  const p = PLACEMENT.macbook;
  return sheet(
    w,
    d,
    p.above,
    `<rect width="${w}" height="${d}" rx="9" fill="url(#shade)" stroke="${F.edge}" stroke-width="0.6"/><rect x="${w * 0.2}" y="${d - 3}" width="${w * 0.6}" height="3" fill="${F.edge}" opacity=".55"/>${appleMark(w / 2, d / 2 + logo.dy, logo.w, logo.h)}${axis(w, d)}${stickerAt(LID_WIZARD, w / 2, d / 2 + logo.dy, "mz")}${stickerAt(p.stem, w / 2, d - p.above, "ms")}`,
  );
}

// The back of an iPhone 18 Pro.
function drawIphone() {
  const { w, h, logo } = PHONE;
  const p = PLACEMENT.iphone;
  const lens = (cx: number, cy: number) =>
    `<circle cx="${cx}" cy="${cy}" r="8.2" fill="#8b8f96"/><circle cx="${cx}" cy="${cy}" r="7" fill="#1b1d22"/>`;
  return sheet(
    w,
    h,
    p.above,
    `<rect width="${w}" height="${h}" rx="11.81" fill="url(#shade)" stroke="${F.edge}" stroke-width="0.4"/>${appleMark(logo.cx, logo.cy, logo.w, logo.h)}<rect x="5.2" y="4.9" width="61.9" height="37.8" rx="7" fill="${F.body[0]}" stroke="${F.edge}" stroke-width="0.4"/>${lens(14.4, 14.7)}${lens(32.6, 24)}${lens(14.4, 33.2)}<circle cx="57.6" cy="13.9" r="3.5" fill="#f2efe4"/><circle cx="57.6" cy="34.5" r="3.5" fill="#1b1d22"/>${axis(w, h)}${stickerAt(p.stem, w / 2, h - p.above, "ps")}`,
  );
}

// The back of an iPad Pro 11-inch in portrait.
function drawIpad() {
  const { w, h, logo } = TABLET;
  const p = PLACEMENT.ipad;
  return sheet(
    w,
    h,
    p.above,
    `<rect width="${w}" height="${h}" rx="12" fill="url(#shade)" stroke="${F.edge}" stroke-width="0.5"/><rect x="5" y="5" width="33" height="33" rx="8" fill="${F.body[1]}" stroke="${F.edge}" stroke-width="0.4"/><circle cx="14.5" cy="14.5" r="4.4" fill="#1b1d22"/><circle cx="14.5" cy="29" r="4.4" fill="#1b1d22"/><circle cx="29" cy="21.7" r="3.6" fill="#1b1d22"/>${[-5.27, 0, 5.27].map((dx) => `<circle cx="${w / 2 + dx}" cy="${h - 12}" r="2.13" fill="${F.edge}"/>`).join("")}${appleMark(w / 2, h / 2, logo.w, logo.h)}${axis(w, h)}${stickerAt(p.stem, w / 2, h - p.above, "is")}`,
  );
}

if (import.meta.main) {
  const files = { macbook: drawLid(), iphone: drawIphone(), ipad: drawIpad() };
  for (const [name, svg] of Object.entries(files)) writeFileSync(join(DIR, `${name}.svg`), svg);
}
