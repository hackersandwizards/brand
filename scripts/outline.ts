#!/usr/bin/env bun
// Sets the gap between the wizard and the wordmark in the day logos, then writes the -night and
// -outline cuts of each logo from its day file, and the single-colour -white and -black cuts of the
// wordmark, every letter in that one colour, for a surface that allows one colour only.
// The gap is a property of the logo, the same share of the letters' 840-unit cap height on every
// ground: 1.25 times the gap the day files were drawn with (GAP), measured between the wizard's
// and the letters' contours at alpha 50%. The wizard moves for it, left in the lockup and up in
// the compact lockup; the letters never move.
// The night cut takes the night colours: teal-night, purple-night and ampersand-light for the &.
// The outline cut keeps the day colours over a white outline of 48 SVG units round the wordmark,
// which a mitred 96-unit stroke under the letters draws. In both cuts of the lockup and the compact
// lockup the wizard carries an edge of 64 units, 7.6% of the cap height (1.5 px at a 36 px lockup,
// 2.6 pt on a compact lockup 270 pt wide): grey (ampersand-light) in the night cut, white in the
// outline cut. The edge is a flat raster under the wizard, `<image class="wizard-edge">`, built
// from the wizard's own pixels. Its outer contour keeps 1.25 times GAP plus 20 units from the
// letters: the bright edge shows to its rim, where the dark wizard's soft rim fades into the
// ground, so without them the gap reads about one screen pixel tighter on small surfaces.
// Lockup 0.351 and compact lockup 0.411 of the cap height from the edge, 0.321 and 0.381 in the
// day files.
// Each box holds wizard, edge and outline. In the lockup and the wordmark it grows so the
// wordmark's centre line keeps its share of the box height below the box centre (lockup 7.8%,
// wordmark 0), so a text beside it still centres on the letters; in the compact lockup it grows
// only as far as needed. Renders each PNG at its day PNG's scale and rehashes both in
// manifest.json. Also writes the lockup's small screen cuts and emoji-256.png, the wizard alone at
// 256 px from the LFS master. A second run changes nothing.
// Usage: bun scripts/outline.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { optimize, type Config } from "svgo";
import manifest from "../manifest.json";
import { ROOT, sha256 } from "./git";
import {
  edgeRaster,
  moveFor,
  parseWizard,
  readWizard,
  shiftWizard,
  wizardInk,
  wizardTag,
  type LogoPoint,
} from "./logo-contour";
import {
  grow,
  INK,
  LIFT,
  readViewBox,
  sizedSvg,
  styleLogoCut,
  unionInk,
  type CutKind,
} from "./logo-svg";
import { rgb } from "./tokens";

/** Sets the sha256 of `path` in manifest.json, which must list it. */
const rehash = (path: string) => {
  const entry = manifest.files.find((f) => f.path === path);
  if (!entry) throw new Error(`${path} is missing from manifest.json`);
  entry.sha256 = sha256(readFileSync(join(ROOT, path)));
};
/** A raster at `width` px, as a palette PNG. */
const shrink = (input: string | Buffer, width: number) =>
  sharp(input)
    .resize(width, null, { kernel: "lanczos3" })
    .png({ palette: true, compressionLevel: 9 });

const EDGE = 64;
const RIM = 20; // added to the gap, see above
const WIDEN = 1.25;
// The day files' gap before it widened, in SVG units at K.
const GAP: Record<string, number> = { lockup: 216, "lockup-compact": 256 };
const AWAY: Record<string, LogoPoint> = {
  lockup: { x: -1, y: 0 },
  "lockup-compact": { x: 0, y: -1 },
};

/** Moves the day file's wizard to the logo's gap and fits its box round letters and wizard. */
async function writeDay(base: string) {
  const path = join(ROOT, "logos", `${base}.svg`);
  const src = readFileSync(path, "utf8");
  const wizard = readWizard(src);
  const direction = AWAY[base];
  const t = await moveFor(src, direction, WIDEN * GAP[base]);
  const placed = shiftWizard(wizard, { x: direction.x * t, y: direction.y * t });
  const ink = await wizardInk(placed);
  const letters = [INK.x0, INK.y0, INK.x1 - INK.x0, INK.y1 - INK.y0];
  const box = readViewBox(src);
  const next = grow(base, letters, ink);
  const svg = sizedSvg(src.replace(wizard.tag, wizardTag(placed)), next);
  await writeLogo(base, svg, { day: base, dayWidth: box[2], outputWidth: next[2] });
  console.log(`${base}: wizard moves ${t.toFixed(1)} for a gap of ${WIDEN * GAP[base]} units`);
}

type SvgRasterScale = { day: string; dayWidth: number; outputWidth: number };

/** Writes a logo SVG and its declared PNG, retaining the day raster's pixels per SVG unit. */
async function writeLogo(name: string, svg: string, scale?: SvgRasterScale) {
  const svgPath = `logos/${name}.svg`;
  const pngPath = `logos/${name}.png`;
  writeFileSync(join(ROOT, svgPath), svg);
  const paths = [svgPath];
  if (scale) {
    const { width } = await sharp(join(ROOT, "logos", `${scale.day}.png`)).metadata();
    await sharp(Buffer.from(svg))
      .resize(Math.round((width * scale.outputWidth) / scale.dayWidth))
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(join(ROOT, pngPath));
    paths.push(pngPath);
  }
  for (const path of paths) rehash(path);
}

type LogoCut = { base: string; kind: CutKind };

/** The relocated wizard with its raster edge, and the ink that the edge adds to the box. */
async function cutWizard(src: string, { base, kind }: LogoCut, edgeColour: string) {
  const wizard = parseWizard(src);
  if (!wizard) return;
  const direction = AWAY[base];
  const shift = await moveFor(src, direction, WIDEN * (GAP[base] + RIM) + EDGE);
  const placed = shiftWizard(wizard, { x: direction.x * shift, y: direction.y * shift });
  console.log(`${base}-${kind}: wizard moves ${shift.toFixed(1)} beyond the day file`);
  const edge = await edgeRaster(placed, EDGE, rgb(edgeColour));
  const { x, y } = edge.origin;
  const side = +edge.width.toFixed(3);
  const image = `<image class="wizard-edge" x="${+x.toFixed(3)}" y="${+y.toFixed(3)}" width="${side}" height="${side}" href="data:image/png;base64,${edge.png.toString("base64")}"/>`;
  return { tag: wizard.tag, replacement: image + wizardTag(placed), ink: edge.ink };
}

/** Renders one cut from its day logo, with enough room for its stroke and wizard edge. */
async function writeCut(base: string, kind: CutKind) {
  const src = readFileSync(join(ROOT, "logos", `${base}.svg`), "utf8");
  const box = readViewBox(src);
  const style = styleLogoCut(src, base, kind);
  let svg = style.svg;
  let ink = [box[0], box[1], box[0] + box[2], box[1] + box[3]];
  if (style.outlineInk) ink = unionInk(ink, style.outlineInk);
  const wizard = await cutWizard(src, { base, kind }, style.edgeColour);
  if (wizard) {
    svg = svg
      .replace(wizard.tag, wizard.replacement)
      .replace(", so the box is the wizard's:", ", the box holds the wizard's edge, and");
    ink = unionInk(ink, wizard.ink);
  }
  const next = grow(base, box, ink);
  const name = `${base}-${kind}`;
  // A cut has a PNG where manifest.json lists one.
  const scale = manifest.files.some((entry) => entry.path === `logos/${name}.png`)
    ? { day: base, dayWidth: box[2], outputWidth: next[2] }
    : undefined;
  await writeLogo(name, sizedSvg(svg, next), scale);
}

for (const base of Object.keys(GAP)) await writeDay(base);
for (const base of Object.keys(LIFT))
  for (const kind of ["night", "outline"] as const) await writeCut(base, kind);
for (const kind of ["white", "black"] as const) await writeCut("wordmark", kind);

// The small cuts of the lockup, for a header up to 40 px tall on screen or in print: lockup-screen
// and lockup-screen-night carry the wizard at half its pixels, 256 px, sharp to 6x at 40 px, past
// 384 dpi in a PDF, and every other raster, the night edge, at the wizard's density. svgo then shortens the paths; mergePaths stays off, since merged letters render their
// shared edges differently. Same geometry and colours, so a page needs no rebuild of its own.
const SCREEN = 2;
const SVGO: Config = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeComments: false,
          removeUnknownsAndDefaults: false,
          convertColors: false,
          sortAttrs: false,
          mergePaths: false,
        },
      },
    },
  ],
};
for (const [from, to] of [
  ["lockup", "lockup-screen"],
  ["lockup-night", "lockup-screen-night"],
]) {
  let svg = readFileSync(join(ROOT, "logos", `${from}.svg`), "utf8");
  const images = [...svg.matchAll(/<image ([^>]*)href="data:image\/png;base64,([^"]+)"/g)].map(
    ([, attrs, b64]) => ({ attrs, b64, units: Number(/width="([\d.]+)"/.exec(attrs)![1]) }),
  );
  const wizard = images.find((i) => !i.attrs.includes("wizard-edge"))!;
  const { width } = await sharp(Buffer.from(wizard.b64, "base64")).metadata();
  const perUnit = width / wizard.units / SCREEN;
  for (const { b64, units } of images) {
    const small = await shrink(Buffer.from(b64, "base64"), Math.round(units * perUnit)).toBuffer();
    svg = svg.replace(b64, small.toString("base64"));
  }
  svg = optimize(svg, SVGO).data;
  const path = `logos/${to}.svg`;
  writeFileSync(join(ROOT, path), svg);
  rehash(path);
}
// The wizard alone at that size, for a page or document that inlines it: emoji-256.png, a plain Git
// file the package ships, where the 4096 px master stays in LFS.
await shrink(join(ROOT, "logos/emoji-logo-short.png"), 256).toFile(
  join(ROOT, "logos/emoji-256.png"),
);
rehash("logos/emoji-256.png");
writeFileSync(join(ROOT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
