// The booth banners (Pixlip GO 1 x 2 m and 1 x 1 m), the gradient pair: the brand gradient as on the
// title slide over the whole sheet, the logo in its outline cut and only large white type on it, built
// on tokens.css and banner.css, plus booth views from 6 m and 2 m. The print files are
// booth-banner-gradient-100x200 and -100x100.
// bun applications/booth/generate.ts <out dir> [--pdf] [--wall=dark,mid,white] [--lit]
// Writes <out>/gradient-100x200.png and -100x100.png (screen scale, 0.8 px per mm), the booth
// views <out>/views/gradient-6m.jpg and -2m.jpg (with --wall gradient-<wall>-6m.jpg, with --lit
// gradient-lit-6m.jpg: LED-backlit frames in a dark hall before the dark wall), and with --pdf the print files
// <out>/gradient-100x200.pdf and -100x100.pdf (final format plus 20 mm bleed).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { brand, browser, fileUrl, toJpeg } from "../backgrounds/render";

const BOOTH = import.meta.dir;
const boothCss = (f: string) => `<link rel="stylesheet" href="${fileUrl(join(BOOTH, f))}">`;
const qr = fileUrl(join(BOOTH, "qr-hackersandwizards-dev.svg"));
const MAGIC = "linear-gradient(135deg, var(--teal), var(--purple))"; // the brand's --gradient-magic

function docHead(title: string, w: number, h: number) {
  const over = `<style>body{background:#fff}.sheet{background:${MAGIC}}.contact img{box-shadow:0 0 0 calc(3*var(--mm)) rgba(25,40,58,.12)}</style>`;
  return `<!doctype html><html lang="en"><head><title>${title}</title><meta charset="utf-8">${boothCss("tokens.css")}${boothCss("banner.css")}<style>@page{size:${w + 40}mm ${h + 40}mm;margin:0}</style>${over}</head><body>`;
}

// The outline lockup as the package draws it, inline so its wizard can take the 4096 px master
// (the file embeds 512 px); geometry, gap and edge stay the file's.
const outlineLockup = (widthMm: number) =>
  readFileSync(new URL(brand.lockupOutline), "utf8")
    .replace(
      /<image x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)" href="[^"]+"/,
      `<image x="$1" y="$2" width="$3" height="$4" href="${brand.emoji}"`,
    )
    .replace(
      / width="\d+" height="\d+"/,
      ` style="display:block;flex:none;width:calc(${widthMm} * var(--mm));height:auto"`,
    );
// The wizard's white edge as the outline lockup draws it: the edge raster's href, and its offset and
// side as shares of the wizard's width (the edge is centred on the wizard).
function wizardEdge() {
  const svg = readFileSync(new URL(brand.lockupOutline), "utf8");
  const [, ex, side, href] =
    /<image class="wizard-edge" x="([-\d.]+)" y="[-\d.]+" width="([\d.]+)" height="[\d.]+" href="([^"]+)"/.exec(
      svg,
    )!;
  const [, wx, ww] = /<image x="([-\d.]+)" y="[-\d.]+" width="([\d.]+)"/.exec(svg)!;
  return { href, offset: (+wx - +ex) / +ww, side: +side / +ww };
}
// The 1 x 1 m wizard's width in mm, edge excluded.
const WIZARD_1X1 = 440;
// The large wizard with the white edge; the box includes the edge, so the edge never leaves it.
function edgedWizard(widthMm: number, style: string) {
  const e = wizardEdge();
  const o = widthMm * e.offset;
  return `<div style="position:relative;flex:none;padding:calc(${o} * var(--mm));${style}"><img src="${e.href}" alt="" style="position:absolute;left:0;top:0;width:calc(${widthMm * e.side} * var(--mm))"><img src="${brand.emoji}" alt="" style="position:relative;display:block;width:calc(${widthMm} * var(--mm))"></div>`;
}
const space = (mm: number) => `<div style="height:calc(${mm} * var(--mm))"></div>`;
const contact = `<div class="contact"><img src="${qr}" alt=""><div class="label">Talk to us.</div></div><div class="url-line">hackersandwizards.dev</div>`;
const VARS_200 =
  "--w:1000;--h:2000;--pad-x:90;--pad-y:110;--wm:78;--h1:96;--h2:54;--qr:200;--url:62;--label:56";

// Gradient sheet: lockup, headline, offer line and contact in white on the gradient.
function gradientTall() {
  const white = "color:#fff";
  const body = `${outlineLockup(800)}${space(120)}<h1 class="headline" style="${white};font-size:calc(108 * var(--mm))">Everyone has coding agents. Releases come no faster.</h1>${space(56)}<p class="offer" style="${white};font-size:calc(64 * var(--mm))">Training and mentoring in agentic engineering.</p><div style="flex:1"></div>${contact.replace('class="label"', `class="label" style="${white}"`).replace('class="url-line"', `class="url-line" style="${white}"`)}`;
  return `${docHead("hackers&amp;wizards booth banner 100x200", 1000, 2000)}<style>.final>*{flex-shrink:0}</style><div class="sheet" style="${VARS_200}"><div class="final">${body}</div></div></body></html>`;
}

// The wordmark near full width, the offer line on two lines, the large wizard with the outline cut's
// white edge below, moved 30 mm left (the 40 mm of the 600 mm wizard before v0.21.4, scaled). The
// wizard and its edge stay whole inside the padding, one line pitch of the offer clear below it.
function gradientSquare() {
  const mascot = edgedWizard(WIZARD_1X1, "translate:calc(-30 * var(--mm)) 0");
  return `${docHead("hackers&amp;wizards booth banner 100x100", 1000, 1000)}<div class="sheet" style="--w:1000;--h:1000;--pad-x:60;--pad-y:90;--h2:62;--wm:110"><div class="final"><div style="display:flex;flex-direction:column;align-items:center;text-align:center;height:100%"><img class="wordmark" src="${brand.wordmarkOutline}" alt="hackers&amp;wizards">${space(32)}<p class="offer" style="color:#fff">Agentic engineering training and mentoring.</p><div class="grow"></div>${mascot}</div></div></div></body></html>`;
}

// The stand wall behind the banners: --wall=dark,mid,white renders one view set per wall.
const WALLS: Record<string, string> = { mid: "#8f9298", dark: "#1e2024", white: "#f2f2ef" };

// A booth aisle drawn to scale: k pixels per millimetre, the stand wall in one of WALLS. The 1 x 2 m frame
// stands on the floor, the 1 x 1 m frame on feet with its top at 2 m, a high table beside it.
// lit: the frames are LED lightboxes in a dark hall. The banner pixels stay as rendered (paper white is
// the brightest the frame gets), a blurred copy screened over each frame is the bloom, and the floor
// catches light in proportion to the banners' mean luminance `lit` (0 to 1).
function boothView(
  tallPng: string,
  squarePng: string,
  far: boolean,
  wall = WALLS.mid,
  lit?: number,
) {
  const k = far ? 0.25 : 0.62;
  const W = far ? 1600 : 1400;
  const H = far ? 900 : 1500;
  const floorY = H - (far ? 160 : 90);
  const mm = (v: number) => v * k;
  const bx = far ? 640 : 70;
  const neighbour = (x: number, c: string, txt: string) =>
    `<div style="position:absolute;left:${x}px;top:${floorY - mm(2400)}px;width:${mm(2900)}px;height:${mm(2400)}px;background:${c};${lit === undefined ? "" : `box-shadow:0 0 ${mm(500)}px ${c};`}display:flex;align-items:flex-start;justify-content:center;padding-top:${mm(300)}px;font:700 ${mm(170)}px Inter;color:#fff">${txt}</div>`;
  const person = (x: number, c: string, s = 1) =>
    `<div style="position:absolute;left:${x}px;top:${floorY - mm(1780 * s)}px;width:${mm(480 * s)}px;height:${mm(1780 * s) + 40}px;${lit === undefined ? "" : "filter:brightness(.35)"}"><div style="width:${mm(240 * s)}px;height:${mm(240 * s)}px;border-radius:50%;background:#c49a7a;margin:0 auto"></div><div style="width:100%;height:${mm(1540 * s)}px;background:${c};border-radius:${mm(160)}px ${mm(160)}px 0 0"></div></div>`;
  const table = `<div style="position:absolute;left:${bx + mm(2250)}px;top:${floorY - mm(1100)}px;width:${mm(700)}px;height:${mm(1100)}px"><div style="height:${mm(40)}px;background:#e8e8e8;border-radius:${mm(20)}px"></div><div style="width:${mm(60)}px;height:${mm(1060)}px;background:#9a9a9a;margin:0 auto"></div></div>`;
  const shadow =
    lit === undefined
      ? "box-shadow:0 0 0 2px #cfcfcf, 0 8px 22px rgba(0,0,0,.25)"
      : "box-shadow:0 0 0 2px #2b2d31";
  const frame = (src: string, x: number, h: number) => {
    const at = `position:absolute;left:${x}px;top:${floorY - mm(2000)}px;width:${mm(1000)}px;height:${mm(h)}px`;
    const bloom = (blur: number, o: number) =>
      `<img src="${src}" style="${at};filter:blur(${mm(blur)}px) brightness(1.4);opacity:${o};mix-blend-mode:screen">`;
    // The wide glow lies behind the frame, onto the wall; the tight one over it, as halation on the type.
    if (lit === undefined) return `<img src="${src}" style="${at};${shadow}">`;
    return `${bloom(300, 0.8)}<img src="${src}" style="${at};${shadow}">${bloom(25, 0.3)}`;
  };
  const hall =
    lit === undefined
      ? ["#3a3d44,#5b5f68", "#7d746b,#5f5750"]
      : ["#060709,#0f1013", "#16130f,#0b0a09"];
  const spill =
    lit === undefined
      ? ""
      : `<div style="position:absolute;left:${bx - mm(800)}px;top:${floorY}px;width:${mm(3600)}px;height:${mm(1400)}px;background:radial-gradient(ellipse at 50% 0,rgba(255,255,255,${(0.35 * lit).toFixed(2)}),transparent 70%)"></div>`;
  return `<!doctype html><meta charset="utf-8"><style>*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:Inter;background:linear-gradient(${hall[0].split(",")[0]},${hall[0].split(",")[1]} ${floorY - 200}px)}</style>
<div style="position:absolute;left:0;right:0;top:${floorY}px;bottom:0;background:linear-gradient(${hall[1]})"></div>${spill}
${far ? neighbour(bx - mm(3100), "#c0392b", "CLOUDSCALE") + neighbour(bx + mm(3200), "#1f6feb", "DataFlux") : ""}
<div style="position:absolute;left:${bx - mm(100)}px;top:${floorY - mm(2500)}px;width:${mm(2200)}px;height:${mm(2500)}px;background:${wall}"></div>
${frame(tallPng, bx, 2000)}
${frame(squarePng, bx + mm(1050), 1000)}
<div style="position:absolute;left:${bx + mm(1500)}px;top:${floorY - mm(1000)}px;width:${mm(40)}px;height:${mm(1000)}px;background:${lit === undefined ? "#888" : "#2b2d31"}"></div>
${table}
${far ? person(bx - mm(1500), "#2d3e50") + person(bx + mm(2350), "#6b4f3a", 0.97) + person(bx + mm(3900), "#34495e", 1.02) : ""}`;
}

async function generateBooth() {
  const args = process.argv.slice(2);
  const out = args[0];
  if (!out) throw new Error("usage: generate.ts <out dir> [--pdf]");
  const pdf = args.includes("--pdf");
  const walls = args
    .find((a) => a.startsWith("--wall="))
    ?.slice(7)
    .split(",");
  const lit = args.includes("--lit");
  mkdirSync(join(out, "views"), { recursive: true });
  const b = await browser();
  try {
    const name = "gradient";
    // 1040 x 2040 mm sheet at 0.8 px per mm (the tokens' screen scale), twice for detail.
    const t = gradientTall();
    const s = gradientSquare();
    const tallFile = join(out, `${name}-100x200.png`);
    const squareFile = join(out, `${name}-100x100.png`);
    // Crop the bleed: the views show the final format.
    const crop = async (png: Buffer, w: number, h: number) =>
      sharp(png)
        .extract({ left: 32, top: 32, width: w * 1.6, height: h * 1.6 })
        .png()
        .toBuffer();
    writeFileSync(tallFile, await crop(await b.shot(t, 832, 1632, 2), 1000, 2000));
    writeFileSync(squareFile, await crop(await b.shot(s, 832, 832, 2), 1000, 1000));
    // Mean luminance of both banners, area-weighted 2:1, for the floor light of a lit view.
    const lum = async (f: string) => {
      const [r, g, bl] = (await sharp(f).stats()).channels.map((c) => c.mean / 255);
      return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const glow = lit ? (2 * (await lum(tallFile)) + (await lum(squareFile))) / 3 : undefined;
    for (const wall of lit ? ["lit"] : (walls ?? [""]))
      for (const far of [true, false]) {
        const view = boothView(
          fileUrl(tallFile),
          fileUrl(squareFile),
          far,
          WALLS[lit ? "dark" : wall || "mid"],
          glow,
        );
        const [w, h] = far ? [1600, 900] : [1400, 1500];
        writeFileSync(
          join(out, "views", `${name}${wall && `-${wall}`}-${far ? "6m" : "2m"}.jpg`),
          await toJpeg(await b.shot(view, w, h, 1)),
        );
      }
    if (pdf) {
      writeFileSync(join(out, `${name}-100x200.html`), t);
      writeFileSync(join(out, `${name}-100x100.html`), s);
      writeFileSync(join(out, `${name}-100x200.pdf`), await b.pdf(t, 1040, 2040));
      writeFileSync(join(out, `${name}-100x100.pdf`), await b.pdf(s, 1040, 1040));
    }
  } finally {
    await b.close();
  }
}

if (import.meta.main) await generateBooth();
