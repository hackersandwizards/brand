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
import verbal from "../../verbal/verbal.json";

const BOOTH = import.meta.dir;
const boothCss = (f: string) => `<link rel="stylesheet" href="${fileUrl(join(BOOTH, f))}">`;
const qr = fileUrl(join(BOOTH, "qr-hackersandwizards-dev.svg"));

function docHead(title: string, w: number, h: number) {
  const over = `<style>body{background:#fff}.sheet{background:var(--gradient-magic)}.contact img{box-shadow:0 0 0 calc(3*var(--mm)) rgba(25,40,58,.12)}</style>`;
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

function gradientTall() {
  const white = "color:#fff";
  const body = `${outlineLockup(800)}${space(120)}<h1 class="headline" style="${white};font-size:calc(108 * var(--mm))">Agents write code faster. Do you ship faster?</h1>${space(56)}<p class="offer" style="${white};font-size:calc(64 * var(--mm))">${verbal.descriptor.en}.</p><div style="flex:1"></div>${contact.replace('class="label"', `class="label" style="${white}"`).replace('class="url-line"', `class="url-line" style="${white}"`)}`;
  return `${docHead("hackers&amp;wizards booth banner 100x200", 1000, 2000)}<style>.final>*{flex-shrink:0}</style><div class="sheet" style="${VARS_200}"><div class="final">${body}</div></div></body></html>`;
}

// The wordmark near full width, verbal.json's claim on two lines, the answer to the 1 x 2 m's question,
// at 48 mm, the largest size that keeps it on two lines; the large wizard with the outline cut's
// white edge below, moved 30 mm left (40 mm on a 600 mm wizard, scaled). The
// wizard and its edge stay whole inside the padding, one line pitch of the claim clear below it.
function gradientSquare() {
  const mascot = edgedWizard(WIZARD_1X1, "translate:calc(-30 * var(--mm)) 0");
  return `${docHead("hackers&amp;wizards booth banner 100x100", 1000, 1000)}<div class="sheet" style="--w:1000;--h:1000;--pad-x:60;--pad-y:90;--h2:48;--wm:110"><div class="final"><div style="display:flex;flex-direction:column;align-items:center;text-align:center;height:100%"><img class="wordmark" src="${brand.wordmarkOutline}" alt="hackers&amp;wizards">${space(32)}<p class="offer" style="color:#fff">${verbal.claim.en}</p><div class="grow"></div>${mascot}</div></div></div></body></html>`;
}

// The stand wall behind the banners: --wall=dark,mid,white renders one view set per wall.
const WALLS: Record<string, string> = { mid: "#8f9298", dark: "#1e2024", white: "#f2f2ef" };

const CAMERAS = {
  "6m": { width: 1600, height: 900, pixelsPerMm: 0.25, floorY: 740, bannerX: 640, aisle: true },
  "2m": { width: 1400, height: 1500, pixelsPerMm: 0.62, floorY: 1410, bannerX: 70, aisle: false },
};
type Camera = (typeof CAMERAS)[keyof typeof CAMERAS];
type BannerPair = { tall: string; square: string };
type Lighting =
  { mode: "ambient"; wall: string } | { mode: "backlit"; wall: string; luminance: number };

const HALL = {
  ambient: {
    wall: "#3a3d44,#5b5f68",
    floor: "#7d746b,#5f5750",
    frameShadow: "box-shadow:0 0 0 2px #cfcfcf, 0 8px 22px rgba(0,0,0,.25)",
    foot: "#888",
    person: "",
    neighbourGlowMm: 0,
  },
  backlit: {
    wall: "#060709,#0f1013",
    floor: "#16130f,#0b0a09",
    frameShadow: "box-shadow:0 0 0 2px #2b2d31",
    foot: "#2b2d31",
    person: "filter:brightness(.35)",
    neighbourGlowMm: 500,
  },
};

// A booth aisle drawn to scale: k pixels per millimetre, the stand wall in one of WALLS. The 1 x 2 m frame
// stands on the floor, the 1 x 1 m frame on feet with its top at 2 m, a high table beside it.
// lit: the frames are LED lightboxes in a dark hall. The banner pixels stay as rendered (paper white is
// the brightest the frame gets), a blurred copy screened over each frame is the bloom, and the floor
// catches light in proportion to the banners' mean luminance `lit` (0 to 1).
function boothView(banners: BannerPair, camera: Camera, lighting: Lighting) {
  const { width: W, height: H, floorY, bannerX: bx, aisle } = camera;
  const mm = (v: number) => v * camera.pixelsPerMm;
  const hall = HALL[lighting.mode];
  const neighbour = (x: number, c: string, txt: string) =>
    `<div style="position:absolute;left:${x}px;top:${floorY - mm(2400)}px;width:${mm(2900)}px;height:${mm(2400)}px;background:${c};${hall.neighbourGlowMm ? `box-shadow:0 0 ${mm(hall.neighbourGlowMm)}px ${c};` : ""}display:flex;align-items:flex-start;justify-content:center;padding-top:${mm(300)}px;font:700 ${mm(170)}px Inter;color:#fff">${txt}</div>`;
  const person = (x: number, c: string, s = 1) =>
    `<div style="position:absolute;left:${x}px;top:${floorY - mm(1780 * s)}px;width:${mm(480 * s)}px;height:${mm(1780 * s) + 40}px;${hall.person}"><div style="width:${mm(240 * s)}px;height:${mm(240 * s)}px;border-radius:50%;background:#c49a7a;margin:0 auto"></div><div style="width:100%;height:${mm(1540 * s)}px;background:${c};border-radius:${mm(160)}px ${mm(160)}px 0 0"></div></div>`;
  const table = `<div style="position:absolute;left:${bx + mm(2250)}px;top:${floorY - mm(1100)}px;width:${mm(700)}px;height:${mm(1100)}px"><div style="height:${mm(40)}px;background:#e8e8e8;border-radius:${mm(20)}px"></div><div style="width:${mm(60)}px;height:${mm(1060)}px;background:#9a9a9a;margin:0 auto"></div></div>`;
  const frame = (src: string, x: number, h: number) => {
    const at = `position:absolute;left:${x}px;top:${floorY - mm(2000)}px;width:${mm(1000)}px;height:${mm(h)}px`;
    const bloom = (blur: number, o: number) =>
      `<img src="${src}" style="${at};filter:blur(${mm(blur)}px) brightness(1.4);opacity:${o};mix-blend-mode:screen">`;
    // The wide glow lies behind the frame, onto the wall; the tight one over it, as halation on the type.
    if (lighting.mode === "ambient") return `<img src="${src}" style="${at};${hall.frameShadow}">`;
    return `${bloom(300, 0.8)}<img src="${src}" style="${at};${hall.frameShadow}">${bloom(25, 0.3)}`;
  };
  const spill =
    lighting.mode === "ambient"
      ? ""
      : `<div style="position:absolute;left:${bx - mm(800)}px;top:${floorY}px;width:${mm(3600)}px;height:${mm(1400)}px;background:radial-gradient(ellipse at 50% 0,rgba(255,255,255,${(0.35 * lighting.luminance).toFixed(2)}),transparent 70%)"></div>`;
  return `<!doctype html><meta charset="utf-8"><style>*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:Inter;background:linear-gradient(${hall.wall.split(",")[0]},${hall.wall.split(",")[1]} ${floorY - 200}px)}</style>
<div style="position:absolute;left:0;right:0;top:${floorY}px;bottom:0;background:linear-gradient(${hall.floor})"></div>${spill}
${aisle ? neighbour(bx - mm(3100), "#c0392b", "CLOUDSCALE") + neighbour(bx + mm(3200), "#1f6feb", "DataFlux") : ""}
<div style="position:absolute;left:${bx - mm(100)}px;top:${floorY - mm(2500)}px;width:${mm(2200)}px;height:${mm(2500)}px;background:${lighting.wall}"></div>
${frame(fileUrl(banners.tall), bx, 2000)}
${frame(fileUrl(banners.square), bx + mm(1050), 1000)}
<div style="position:absolute;left:${bx + mm(1500)}px;top:${floorY - mm(1000)}px;width:${mm(40)}px;height:${mm(1000)}px;background:${hall.foot}"></div>
${table}
${aisle ? person(bx - mm(1500), "#2d3e50") + person(bx + mm(2350), "#6b4f3a", 0.97) + person(bx + mm(3900), "#34495e", 1.02) : ""}`;
}

type ViewSelection = { mode: "ambient"; walls: string[] } | { mode: "backlit" };
type BoothCamera = Awaited<ReturnType<typeof browser>>;
type BannerSheet = { stem: string; html: string; widthMm: number; heightMm: number };
type BoothView = { path: string; camera: Camera; lighting: Lighting };

// Read the output directory, exhibition views and optional print run from the CLI.
function parseBoothArgs(args: string[]) {
  const out = args[0];
  if (!out) throw new Error("usage: generate.ts <out dir> [--pdf]");
  const pdf = args.includes("--pdf");
  const walls = args
    .find((arg) => arg.startsWith("--wall="))
    ?.slice(7)
    .split(",");
  const views: ViewSelection = args.includes("--lit")
    ? { mode: "backlit" }
    : { mode: "ambient", walls: walls ?? [""] };
  return { out, pdf, views };
}

// Crop the bleed: the views show the final format.
function cropBleed(png: Buffer, { widthMm, heightMm }: BannerSheet) {
  return sharp(png)
    .extract({ left: 32, top: 32, width: widthMm * 1.6, height: heightMm * 1.6 })
    .png()
    .toBuffer();
}

// Capture the trimmed final-format banner at the booth mockups' raster density.
async function writeBoothBanner(b: BoothCamera, out: string, sheet: BannerSheet) {
  // 1040 x 2040 mm sheet at 0.8 px per mm (the tokens' screen scale), twice for detail.
  const viewport = {
    width: (sheet.widthMm + 40) * 0.8,
    height: (sheet.heightMm + 40) * 0.8,
    scale: 2,
  };
  const path = join(out, `${sheet.stem}.png`);
  writeFileSync(path, await cropBleed(await b.shot(sheet.html, viewport), sheet));
  return path;
}

// Mean luminance of both banners, area-weighted 2:1, for the floor light of a lit view.
async function boothLuminance({ tall, square }: BannerPair) {
  // Mean luminance of one banner's pixels on the Rec. 709 scale.
  const lum = async (file: string) => {
    const [r, g, bl] = (await sharp(file).stats()).channels.map((c) => c.mean / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  return (2 * (await lum(tall)) + (await lum(square))) / 3;
}

// Pair each requested wall and light setting with the near and far cameras.
async function planBoothViews(
  out: string,
  banners: BannerPair,
  selection: ViewSelection,
): Promise<BoothView[]> {
  const walls =
    selection.mode === "backlit"
      ? [
          {
            label: "lit",
            lighting: {
              mode: "backlit",
              wall: WALLS.dark,
              luminance: await boothLuminance(banners),
            },
          } as const,
        ]
      : selection.walls.map(
          (label) =>
            ({
              label,
              lighting: { mode: "ambient", wall: WALLS[label || "mid"] ?? WALLS.mid },
            }) as const,
        );
  return walls.flatMap(({ label, lighting }) =>
    Object.entries(CAMERAS).map(([distance, camera]) => ({
      path: join(out, "views", `gradient${label && `-${label}`}-${distance}.jpg`),
      camera,
      lighting,
    })),
  );
}

// Write separate print masters with their HTML sources and all sides of the bleed.
async function writeBoothPdfs(b: BoothCamera, out: string, sheets: BannerSheet[]) {
  for (const sheet of sheets) writeFileSync(join(out, `${sheet.stem}.html`), sheet.html);
  for (const { stem, html, widthMm, heightMm } of sheets) {
    writeFileSync(join(out, `${stem}.pdf`), await b.pdf(html, widthMm + 40, heightMm + 40));
  }
}

async function generateBooth() {
  const { out, pdf, views } = parseBoothArgs(process.argv.slice(2));
  mkdirSync(join(out, "views"), { recursive: true });
  const b = await browser();
  try {
    const tall = { stem: "gradient-100x200", html: gradientTall(), widthMm: 1000, heightMm: 2000 };
    const square = {
      stem: "gradient-100x100",
      html: gradientSquare(),
      widthMm: 1000,
      heightMm: 1000,
    };
    const banners = {
      tall: await writeBoothBanner(b, out, tall),
      square: await writeBoothBanner(b, out, square),
    };
    for (const { path, camera, lighting } of await planBoothViews(out, banners, views)) {
      const view = boothView(banners, camera, lighting);
      writeFileSync(path, await toJpeg(await b.shot(view, camera)));
    }
    if (pdf) await writeBoothPdfs(b, out, [tall, square]);
  } finally {
    await b.close();
  }
}

if (import.meta.main) await generateBooth();
