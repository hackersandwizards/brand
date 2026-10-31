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
// manifest.json. A second run changes nothing.
// Usage: bun scripts/outline.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import manifest from "../manifest.json";
import { colors } from "../generated/tokens";
import { ROOT, sha256 } from "./git";

const OUTLINE = 48;
const INK = { x0: 96, y0: 96, x1: 6667, y1: 947 }; // the wordmark's letters in SVG units
const LINE = 572; // the wordmark's centre line, the middle of its 952-unit box
const WORDMARK = /<g fill="#1A7285">[\s\S]*(?=<\/svg>)/;
const WIZARD =
  /<image x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="[\d.]+" href="data:image\/png;base64,([^"]+)"\/?>/;
const tokenHex = (token: string) => colors[`--color-${token}` as keyof typeof colors].toUpperCase();
const NIGHT: [string, string][] = [
  ["teal", "teal-night"],
  ["purple", "purple-night"],
  ["ampersand", "ampersand-light"],
].map(([day, night]) => [tokenHex(day), tokenHex(night)]);
// The wordmark's centre line below the box centre, as a share of the box height; null: no rule.
const LIFT: Record<string, number | null> = { wordmark: 0, lockup: 0.078, "lockup-compact": null };
const EDGE = 64;
const RIM = 20; // added to the gap, see above
const WIDEN = 1.25;
// The day files' gap before it widened, in SVG units at K.
const GAP: Record<string, number> = { lockup: 216, "lockup-compact": 256 };
const AWAY: Record<string, [number, number]> = { lockup: [-1, 0], "lockup-compact": [0, -1] };
const K = 0.5; // px per SVG unit for the gap measurement

/** Squared distance of each sample to the nearest zero, along one line (Felzenszwalb). */
function line(f: Float64Array) {
  const n = f.length;
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  let k = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s: number;
    for (;;) {
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      if (s > z[k]) break;
      k--;
    }
    v[++k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  for (let q = 0, j = 0; q < n; q++) {
    while (z[j + 1] < q) j++;
    d[q] = (q - v[j]) ** 2 + f[v[j]];
  }
  return d;
}

/** Squared distance of each pixel of an n-wide grid to the nearest pixel that is 0. */
function distance(grid: Float64Array, n: number) {
  const m = grid.length / n;
  for (let y = 0; y < m; y++) grid.set(line(grid.subarray(y * n, (y + 1) * n)), y * n);
  const col = new Float64Array(m);
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < m; y++) col[y] = grid[y * n + x];
    const d = line(col);
    for (let y = 0; y < m; y++) grid[y * n + x] = d[y];
  }
  return grid;
}

/** Alpha of `svg` with its viewBox set to `box`, rendered at K px per unit. */
async function alpha(svg: string, box: number[]) {
  const s = svg.replace(/viewBox="[^"]+"/, `viewBox="${box.join(" ")}"`);
  const { data, info } = await sharp(Buffer.from(s))
    .resize(Math.round(box[2] * K), Math.round(box[3] * K))
    .ensureAlpha()
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, n: info.width };
}

/** How far (SVG units) the wizard moves along AWAY from where `src` has it, negative towards the
 * letters, so that its contour widened by `widen` lies `target` from theirs, both at alpha 50%. */
async function moveFor(base: string, src: string, target: number, widen = 0) {
  const vb = /viewBox="([^"]+)"/.exec(src)![1].split(" ").map(Number);
  const box = [vb[0] - 600, vb[1] - 600, vb[2] + 1200, vb[3] + 1200];
  const letters = await alpha(src.replace(WIZARD, ""), box);
  const wizard = await alpha(src.replace(WORDMARK, ""), box);
  const n = letters.n;
  const field = distance(
    Float64Array.from(letters.data, (a) => (a >= 128 ? 0 : 1e12)),
    n,
  );
  const points = [...wizard.data.keys()].filter((i) => wizard.data[i] >= 128);
  const [ax, ay] = AWAY[base];
  const gap = (t: number) => {
    let d = Infinity;
    for (const i of points) {
      const x = Math.round((i % n) + ax * t * K);
      const y = Math.round(Math.floor(i / n) + ay * t * K);
      d = Math.min(d, field[y * n + x]);
    }
    return Math.sqrt(d) / K - widen;
  };
  let [lo, hi] = [-500, 500];
  while (hi - lo > 0.5) {
    const t = (lo + hi) / 2;
    if (gap(t) < target) lo = t;
    else hi = t;
  }
  return Math.abs(hi) < 2.5 ? 0 : hi; // within the measurement's precision at K
}

/** The wizard's ink (alpha > 0) in SVG units, x0 y0 x1 y1. */
async function wizardInk(b64: string, x: number, y: number, w: number) {
  const { data, info } = await sharp(Buffer.from(b64, "base64"))
    .ensureAlpha()
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
  for (let i = 0; i < data.length; i++)
    if (data[i]) {
      const [px, py] = [i % info.width, Math.floor(i / info.width)];
      [x0, y0, x1, y1] = [
        Math.min(x0, px),
        Math.min(y0, py),
        Math.max(x1, px + 1),
        Math.max(y1, py + 1),
      ];
    }
  const u = w / info.width;
  return [x + x0 * u, y + y0 * u, x + x1 * u, y + y1 * u];
}

/** Moves the day file's wizard to the logo's gap and fits its box round letters and wizard. */
async function writeDay(base: string) {
  const path = join(ROOT, "logos", `${base}.svg`);
  const src = readFileSync(path, "utf8");
  const [tag, wx, wy, ww, b64] = WIZARD.exec(src)!;
  const t = await moveFor(base, src, WIDEN * GAP[base]);
  const [dx, dy] = AWAY[base];
  const [x, y] = [+(Number(wx) + dx * t).toFixed(3), +(Number(wy) + dy * t).toFixed(3)];
  const ink = await wizardInk(b64, x, y, Number(ww));
  const letters = [INK.x0, INK.y0, INK.x1 - INK.x0, INK.y1 - INK.y0];
  const old = /viewBox="([^"]+)"/.exec(src)![1].split(" ").map(Number);
  const next = grow(base, letters, ink);
  const svg = src
    .replace(tag, tag.replace(`x="${wx}" y="${wy}"`, `x="${x}" y="${y}"`))
    .replace(/viewBox="[^"]+"/, `viewBox="${next.join(" ")}"`)
    .replace(
      / width="\d+" height="\d+"/,
      ` width="${Math.round(next[2])}" height="${Math.round(next[3])}"`,
    );
  writeFileSync(path, svg);
  const png = join(ROOT, "logos", `${base}.png`);
  const { width } = await sharp(png).metadata();
  await sharp(Buffer.from(svg))
    .resize(Math.round((width * next[2]) / old[2]))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(png);
  for (const p of [`logos/${base}.svg`, `logos/${base}.png`]) {
    const entry = manifest.files.find((f) => f.path === p)!;
    entry.sha256 = sha256(readFileSync(join(ROOT, p)));
  }
  console.log(`${base}: wizard moves ${t.toFixed(1)} for a gap of ${WIDEN * GAP[base]} units`);
}

/** The edge raster: the wizard's silhouette (alpha >= 50%) widened by `r` px, antialiased. */
async function edgeRaster(wizard: Buffer, size: number, r: number, colour: string) {
  const pad = Math.ceil(r) + 2;
  const { data } = await sharp(wizard)
    .resize(size, size, { kernel: "lanczos3" })
    .ensureAlpha()
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#0000" })
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = size + 2 * pad;
  const grid = distance(
    Float64Array.from(data, (a) => (a >= 128 ? 0 : 1e12)),
    n,
  );
  const [cr, cg, cb] = [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16));
  const px = Buffer.alloc(n * n * 4);
  let [x0, y0, x1, y1] = [n, n, -1, -1];
  for (let i = 0; i < n * n; i++) {
    const a = Math.max(Math.min(r + 0.5 - Math.sqrt(grid[i]), 1, 1), data[i] / 255, 0);
    px.set([cr, cg, cb, Math.round(a * 255)], i * 4);
    if (a > 0) {
      const [x, y] = [i % n, Math.floor(i / n)];
      [x0, y0, x1, y1] = [
        Math.min(x0, x),
        Math.min(y0, y),
        Math.max(x1, x + 1),
        Math.max(y1, y + 1),
      ];
    }
  }
  const png = await sharp(px, { raw: { width: n, height: n, channels: 4 } })
    .png({ palette: true, compressionLevel: 9 })
    .toBuffer();
  return { png, pad, n, ink: [x0, y0, x1, y1] };
}

/** The box holding `ink` (x0 y0 x1 y1), grown from `box` (x y w h) by the base's rule. */
function grow(base: string, box: number[], ink: number[]) {
  const [x, y, w, h] = box;
  const x0 = Math.min(x, ink[0]);
  const x1 = Math.max(x + w, ink[2]);
  const lift = LIFT[base];
  let [y0, y1] = [Math.min(y, ink[1]), Math.max(y + h, ink[3])];
  if (lift !== null) {
    const height = Math.max((LINE - y0) / (0.5 + lift), (y1 - LINE) / (0.5 - lift));
    y0 = LINE - height * (0.5 + lift);
    y1 = y0 + height;
  }
  return [x0, y0, x1 - x0, y1 - y0].map((n) => +n.toFixed(3));
}

const MONO = { white: "#FFFFFF", black: "#000000" };

async function writeCut(base: string, kind: "night" | "outline" | keyof typeof MONO) {
  const src = readFileSync(join(ROOT, "logos", `${base}.svg`), "utf8");
  const box = /viewBox="([^"]+)"/.exec(src)![1].split(" ").map(Number);
  const letters = WORDMARK.exec(src)?.[0];
  if (!letters) throw new Error(`logos/${base}.svg carries no wordmark group`);
  let svg = src;
  const ink = [box[0], box[1], box[0] + box[2], box[1] + box[3]];
  const take = (b: number[]) => {
    [ink[0], ink[1]] = [Math.min(ink[0], b[0]), Math.min(ink[1], b[1])];
    [ink[2], ink[3]] = [Math.max(ink[2], b[2]), Math.max(ink[3], b[3])];
  };
  if (kind === "white" || kind === "black") {
    svg = svg.replace(/fill="#[0-9A-F]{6}"/g, `fill="${MONO[kind]}"`);
  } else if (kind === "night") {
    for (const [day, night] of NIGHT) svg = svg.replaceAll(`fill="${day}"`, `fill="${night}"`);
  } else {
    const white = letters.replace(/fill="#[0-9A-F]{6}"/g, 'fill="#FFFFFF"');
    svg = svg.replace(
      WORDMARK,
      `<g stroke="#FFFFFF" stroke-width="${2 * OUTLINE}" stroke-linejoin="miter">${white}</g>${letters}`,
    );
    take([INK.x0 - OUTLINE, INK.y0 - OUTLINE, INK.x1 + OUTLINE, INK.y1 + OUTLINE]);
  }
  const wizard = WIZARD.exec(svg);
  if (wizard) {
    const [tag, wx, wy, ww, b64] = wizard;
    const size = 1024; // twice the embedded wizard, for a smooth contour
    const unit = Number(ww) / size;
    const colour = kind === "night" ? tokenHex("ampersand-light") : "#FFFFFF";
    const shift = await moveFor(base, src, WIDEN * (GAP[base] + RIM), EDGE);
    const [dx, dy] = AWAY[base];
    const [x, y] = [+(Number(wx) + dx * shift).toFixed(3), +(Number(wy) + dy * shift).toFixed(3)];
    console.log(`${base}-${kind}: wizard moves ${shift.toFixed(1)} beyond the day file`);
    const edge = await edgeRaster(Buffer.from(b64, "base64"), size, EDGE / unit, colour);
    const [ex, ey] = [x - edge.pad * unit, y - edge.pad * unit];
    take(edge.ink.map((v, i) => +(i % 2 ? ey : ex) + v * unit));
    const side = +(edge.n * unit).toFixed(3);
    const image = `<image class="wizard-edge" x="${+ex.toFixed(3)}" y="${+ey.toFixed(3)}" width="${side}" height="${side}" href="data:image/png;base64,${edge.png.toString("base64")}"/>`;
    svg = svg
      .replace(tag, image + tag.replace(`x="${wx}" y="${wy}"`, `x="${x}" y="${y}"`))
      .replace(", so the box is the wizard's:", ", the box holds the wizard's edge, and");
  }
  const next = grow(base, box, ink);
  svg = svg
    .replace(/viewBox="[^"]+"/, `viewBox="${next.join(" ")}"`)
    .replace(
      / width="\d+" height="\d+"/,
      ` width="${Math.round(next[2])}" height="${Math.round(next[3])}"`,
    );
  const svgPath = `logos/${base}-${kind}.svg`;
  const pngPath = `logos/${base}-${kind}.png`;
  writeFileSync(join(ROOT, svgPath), svg);
  const { width } = await sharp(join(ROOT, "logos", `${base}.png`)).metadata();
  await sharp(Buffer.from(svg))
    .resize(Math.round((width * next[2]) / box[2]))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(join(ROOT, pngPath));
  for (const path of [svgPath, pngPath]) {
    const entry = manifest.files.find((f) => f.path === path);
    if (!entry) throw new Error(`${path} is missing from manifest.json`);
    entry.sha256 = sha256(readFileSync(join(ROOT, path)));
  }
}

for (const base of Object.keys(GAP)) await writeDay(base);
for (const base of Object.keys(LIFT))
  for (const kind of ["night", "outline"] as const) await writeCut(base, kind);
for (const kind of ["white", "black"] as const) await writeCut("wordmark", kind);
writeFileSync(join(ROOT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
