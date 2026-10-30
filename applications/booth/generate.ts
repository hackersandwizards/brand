// Light and mid-tone variants of the booth banners (Pixlip GO 1 x 2 m and 1 x 1 m) in logo system D,
// built on the proposal's tokens.css and banner.css, plus booth views from 6 m and 2 m.
// bun applications/booth/generate.ts <out dir> [variant ...] [--pdf] [--wall=dark,mid,white] [--lit]
// Writes <out>/<variant>-100x200.png and -100x100.png (screen scale, 0.8 px per mm), the booth
// views <out>/views/<variant>-6m.jpg and -2m.jpg (with --wall <variant>-<wall>-6m.jpg, with --lit
// <variant>-lit-6m.jpg: LED-backlit frames in a dark hall before the dark wall), and with --pdf the print files
// <out>/<variant>-100x200.pdf and -100x100.pdf (final format plus 20 mm bleed).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { brand, browser, tint, toJpeg } from "../backgrounds/render.ts";

const BOOTH = import.meta.dir;
const boothCss = (f: string) => `<link rel="stylesheet" href="file://${join(BOOTH, f)}">`;
const qr = `file://${join(BOOTH, "qr-hackersandwizards-dev.svg")}`;
const C = { teal: "#1A7285", purple: "#9333EA", ink: "#19283A", muted: "#545861", bg: "#F7F9FA" };
const GRADIENT = `linear-gradient(180deg, ${C.purple}, ${C.teal})`;

type Variant = {
  ground: string; // the sheet's background
  vars: string; // token overrides
  wordmark: string;
  accent: string; // second sentence of the headline
  layout?: "emoji" | "wall";
  giant?: boolean; // the 1 x 1 m carries the wizard large
  frame?: number; // a brand gradient frame around both pieces, mm from the sheet edge (bleed included)
  rail?: number; // the top and bottom gradient rails, mm visible
  xl?: boolean; // larger lockup and headline on the 1 x 2 m
};
const LIGHT_VARS = `--ink-on-night:${C.ink};--muted-on-night:${C.muted};--teal-light:${C.teal};--purple-light:${C.purple}`;

export const VARIANTS: Record<string, Variant> = {
  white: { ground: "#FFFFFF", vars: LIGHT_VARS, wordmark: brand.wordmark, accent: C.purple },
  tint: {
    ground: `linear-gradient(160deg, ${tint(C.teal, 12)}, ${tint(C.purple, 10)})`,
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
  },
  // The March ground, purple to teal, with the proposal's content and logo system D.
  gradient: {
    ground: GRADIENT,
    vars: "--ink-on-night:#fff;--muted-on-night:#F1F2F4;--teal-light:#CFE3E7",
    wordmark: brand.wordmarkNight,
    accent: "#E9D5FB",
  },
  // White ground, the wizard large on both pieces.
  emoji: {
    ground: "#FFFFFF",
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
    layout: "emoji",
  },
  "white-giant": {
    ground: "#FFFFFF",
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
    giant: true,
  },
  "white-frame": {
    ground: "#FFFFFF",
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
    giant: true,
    frame: 64,
  },
  "white-thin": {
    ground: "#FFFFFF",
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
    giant: true,
    frame: 44,
  },
  "white-rails": {
    ground: "#FFFFFF",
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
    giant: true,
    rail: 56,
  },
  // white-rails on a light cool grey instead of paper white: ink on the ground dims the backlit glow.
  "offwhite-rails": {
    ground: "#E6EAED",
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
    giant: true,
    rail: 56,
  },
  // white-rails on Night: only the ground and the colours it requires (the booth tokens' on-night set).
  "dark-rails": {
    ground: "var(--night)",
    vars: "",
    wordmark: brand.wordmarkNight,
    accent: "var(--purple-light)",
    giant: true,
    rail: 56,
  },
  "white-xl": {
    ground: "#FFFFFF",
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
    giant: true,
    xl: true,
  },
  // Bold: a brand block on top, the wizard looking over the white wall that carries the message.
  wall: {
    ground: "#FFFFFF",
    vars: LIGHT_VARS,
    wordmark: brand.wordmark,
    accent: C.purple,
    layout: "wall",
  },
};

function docHead(title: string, w: number, h: number, v: Variant | null) {
  const over = v
    ? `<style>:root{${v.vars}}body{background:#fff}.sheet{background:${v.ground}}.headline{color:var(--ink-on-night)}.url-line{color:var(--ink-on-night)}.contact img{box-shadow:0 0 0 calc(3*var(--mm)) rgba(25,40,58,.12)}${v.rail ? `:root{--rail:calc(${v.rail} * var(--mm))}` : ""}${v.frame ? `.sheet::after{content:'';position:absolute;inset:0;border:calc(${v.frame} * var(--mm)) solid;border-image:linear-gradient(135deg,var(--teal),var(--purple)) 1}` : ""}</style>`
    : "";
  return `<!doctype html><html lang="en"><head><title>${title}</title><meta charset="utf-8">${boothCss("tokens.css")}${boothCss("banner.css")}<style>@page{size:${w + 40}mm ${h + 40}mm;margin:0}</style>${over}</head><body>`;
}

// The wizard's edge on a dark or coloured ground, as the brand's night and outline lockups draw it:
// the edge raster and the wizard's move away from the wordmark, as shares of the wizard's box.
function wizardEdge(cut: string) {
  const svg = readFileSync(join(BOOTH, "../../logos", `${cut}.svg`), "utf8");
  const [, ex, ey, side, href] =
    /<image class="wizard-edge" x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="[\d.]+" href="([^"]+)"/.exec(
      svg,
    ) ?? [];
  const [, wx, wy, ww] = /<image x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)"/.exec(svg)!;
  // The wizard's x in the box the CSS lockup's 24 mm gap was measured on, in SVG units.
  const dayX = -1432;
  const pct = (v: number) => `${(100 * v) / Number(ww)}%`;
  return {
    href,
    left: pct(+ex - +wx),
    top: pct(+ey - +wy),
    width: pct(+side),
    shift: pct(+wx - dayX),
  };
}
const boothLockup = (v: Variant, wiz = 150) => {
  const cut =
    v.wordmark === brand.wordmark
      ? null
      : v.ground === GRADIENT
        ? "lockup-outline"
        : "lockup-night";
  const e = cut && wizardEdge(cut);
  const wizard = e
    ? `<div style="position:relative;width:calc(${wiz} * var(--mm));translate:${e.shift} var(--logo-wizard-lift)"><img src="${e.href}" alt="" style="position:absolute;left:${e.left};top:${e.top};width:${e.width};translate:none"><img src="${brand.emoji}" alt="" style="position:relative;display:block;width:100%"></div>`
    : `<img src="${brand.emoji}" alt="" style="width:calc(${wiz} * var(--mm));translate:${wizardEdge("lockup").shift} var(--logo-wizard-lift)">`;
  return `<div class="lockup">${wizard}<img class="wordmark" src="${v.wordmark}" alt="hackers&amp;wizards"></div>`;
};
const space = (mm: number) => `<div style="height:calc(${mm} * var(--mm))"></div>`;
const headline = (accent: string) =>
  `<h1 class="headline">Everyone has coding agents. <span style="color:${accent}">Releases come no faster.</span></h1>`;
const offer = `<p class="offer">Training and mentoring in agentic engineering.</p>`;
const audience = `<p class="audience">For engineering and product teams and their leaders.</p>`;
const proof = (n = 2) =>
  `<ul class="proof"><li>Our founder Benedikt Stemmildt chairs code.talks.</li>${n > 1 ? "<li>He was engineer, architect and CIO at OTTO, Breuninger and BLUME2000.</li>" : ""}</ul>`;
const contact = `<div class="contact"><img src="${qr}" alt=""><div class="label">Talk to us.</div></div><div class="url-line">hackersandwizards.dev</div>`;
const VARS_200 =
  "--w:1000;--h:2000;--pad-x:90;--pad-y:110;--wiz:150;--wm:78;--h1:96;--h2:54;--h3:40;--proof:52;--proof-gap:20;--qr:200;--url:62;--label:56";

function tall(v: Variant) {
  const rails = '<div class="rail top"></div>';
  const bottom = '<div class="rail bottom"></div>';
  let body: string;
  if (v.layout === "emoji") {
    // Wall: the wizard's cut edge sits on the line where the brand block meets the white wall.
    // Emoji: the wizard stands on a brand rail between offer and proof, so its cut edge never floats.
    body = `${boothLockup(v)}${space(70)}${headline(v.accent)}${space(40)}${offer}<div style="flex:1"></div><div style="display:flex;flex-direction:column;align-items:center"><img src="${brand.emoji}" alt="" style="width:calc(470 * var(--mm));display:block"><div style="align-self:stretch;height:calc(14 * var(--mm));background:linear-gradient(90deg,var(--teal),var(--purple));border-radius:calc(7*var(--mm))"></div></div>${space(50)}${proof(1)}<div style="flex:0.6"></div>${contact}`;
  } else if (v.layout === "wall") {
    // The block above holds the lockup; the message sits on the white wall below it.
    body = `<div style="position:absolute;left:0;right:0;top:calc(-20 * var(--mm));height:calc(670 * var(--mm));background:${GRADIENT}"></div><div style="position:relative;height:calc(560 * var(--mm));display:flex;flex-direction:column;align-items:center"><img class="wordmark" src="${brand.wordmarkNight}" alt="hackers&amp;wizards"><div style="flex:1"></div><img src="${brand.emoji}" alt="" style="width:calc(400 * var(--mm));display:block"></div><div style="position:relative;display:flex;flex-direction:column;flex:1">${space(80)}${headline(v.accent)}${space(40)}${offer}<div style="flex:0.5"></div>${proof()}<div style="flex:0.9"></div>${contact}</div>`;
    return `${docHead("hackers&amp;wizards booth banner 100x200", 1000, 2000, v)}<div class="sheet" style="${VARS_200}">${rails}<div class="final">${body}</div>${bottom}</div></body></html>`;
  } else {
    if (v.xl)
      return tall({ ...v, xl: false }).replace(
        VARS_200,
        VARS_200.replace("--wiz:150;--wm:78;--h1:96", "--wiz:160;--wm:78;--h1:108"),
      );
    body = `${boothLockup(v)}${space(80)}${headline(v.accent)}${space(50)}${offer}${space(24)}${audience}<div style="flex:0.5"></div>${proof()}<div style="flex:0.9"></div>${contact}`;
  }
  return `${docHead("hackers&amp;wizards booth banner 100x200", 1000, 2000, v)}<div class="sheet" style="${VARS_200}">${rails}<div class="final">${body}</div>${bottom}</div></body></html>`;
}

function square(v: Variant) {
  const mascot = v.layout === "emoji" ? 760 : v.giant ? 640 : v.layout === "wall" ? 460 : 520;
  const inner =
    v.layout === "wall"
      ? `<div style="position:absolute;left:0;right:0;top:calc(-20 * var(--mm));height:calc(870 * var(--mm));background:${GRADIENT}"></div><div style="position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;height:calc(760 * var(--mm))"><img class="wordmark" src="${brand.wordmarkNight}" alt="hackers&amp;wizards"><div style="height:calc(30 * var(--mm))"></div><p class="offer" style="color:#fff">Agentic engineering training and mentoring.</p><div class="grow"></div><img class="mascot" src="${brand.emoji}" alt=""></div><div class="url-line" style="position:relative;text-align:center;margin-top:calc(40 * var(--mm))">hackersandwizards.dev</div>`
      : `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;height:100%"><img class="wordmark" src="${v.wordmark}" alt="hackers&amp;wizards"><div style="height:calc(${v.layout === "emoji" || v.giant ? 24 : 40} * var(--mm))"></div><p class="offer">Agentic engineering training and mentoring.</p><div class="grow"></div><img class="mascot" style="margin-bottom:calc(-90 * var(--mm))" src="${brand.emoji}" alt=""></div>`;
  return `${docHead("hackers&amp;wizards booth banner 100x100", 1000, 1000, v)}<div class="sheet" style="--w:1000;--h:1000;--pad-x:80;--pad-y:90;--mascot:${mascot};--h2:58;--wm:100;--url:56"><div class="rail top"></div><div class="final">${inner}</div><div class="rail bottom"></div></div></body></html>`;
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
  if (!out) throw new Error("usage: generate.ts <out dir> [variant ...] [--pdf]");
  const pdf = args.includes("--pdf");
  const walls = args
    .find((a) => a.startsWith("--wall="))
    ?.slice(7)
    .split(",");
  const lit = args.includes("--lit");
  const names = args.slice(1).filter((a) => !a.startsWith("--"));
  const chosen = names.length ? names : Object.keys(VARIANTS);
  mkdirSync(join(out, "views"), { recursive: true });
  const b = await browser();
  try {
    for (const name of chosen) {
      const v = VARIANTS[name];
      if (!v) throw new Error(`unknown variant ${name}`);
      // 1040 x 2040 mm sheet at 0.8 px per mm (the tokens' screen scale), twice for detail.
      const t = tall(v);
      const s = square(v);
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
            `file://${tallFile}`,
            `file://${squareFile}`,
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
    }
  } finally {
    await b.close();
  }
}

if (import.meta.main) await generateBooth();
