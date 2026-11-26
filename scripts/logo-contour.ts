import sharp from "sharp";
import { readViewBox, WORDMARK } from "./logo-svg";

const WIZARD =
  /<image x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="[\d.]+" href="data:image\/png;base64,([^"]+)"\/?>/;
const K = 0.5; // px per SVG unit for the gap measurement

export type LogoPoint = { x: number; y: number };
type WizardImage = { tag: string; origin: LogoPoint; width: number; png: Buffer };

/** The embedded wizard together with its placement in the logo's SVG coordinate system. */
function wizardFromMatch(match: RegExpExecArray): WizardImage {
  const [tag, x, y, width, b64] = match;
  return {
    tag,
    origin: { x: Number(x), y: Number(y) },
    width: Number(width),
    png: Buffer.from(b64, "base64"),
  };
}

/** Reads a lockup's required embedded wizard image. */
export const readWizard = (src: string) => {
  const match = WIZARD.exec(src);
  if (match === null) throw new TypeError("Wizard image missing: logo SVG");
  return wizardFromMatch(match);
};

/** Finds the wizard if the logo includes one. */
export function parseWizard(src: string): WizardImage | undefined {
  const match = WIZARD.exec(src);
  if (match) return wizardFromMatch(match);
}

/** A wizard moved by a displacement in SVG units, to the precision of the SVG output. */
export function shiftWizard(wizard: WizardImage, displacement: LogoPoint): WizardImage {
  const x = +(wizard.origin.x + displacement.x).toFixed(3);
  const y = +(wizard.origin.y + displacement.y).toFixed(3);
  return { ...wizard, origin: { x, y } };
}

/** The original wizard image element with its current SVG coordinates. */
export const wizardTag = ({ tag, origin: { x, y } }: WizardImage) =>
  tag.replace(/^<image x="[^"]+" y="[^"]+"/, `<image x="${x}" y="${y}"`);

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

type ContourClearance = { gap: number; radius: number };

/** How far (SVG units) the wizard moves along `direction` from where `src` has it, negative
 * towards the letters, so that its contour widened by `radius` lies `gap` from theirs, both at
 * alpha 50%. The gap and radius are in SVG units. */
export async function moveFor(src: string, direction: LogoPoint, clearance: ContourClearance) {
  const vb = readViewBox(src);
  const box = [vb[0] - 600, vb[1] - 600, vb[2] + 1200, vb[3] + 1200];
  const letters = await alpha(src.replace(WIZARD, ""), box);
  const wizard = await alpha(src.replace(WORDMARK, ""), box);
  const n = letters.n;
  const field = distance(
    Float64Array.from(letters.data, (a) => (a >= 128 ? 0 : 1e12)),
    n,
  );
  const points = [...wizard.data.keys()].filter((i) => wizard.data[i] >= 128);
  const { x: ax, y: ay } = direction;
  const gap = (t: number) => {
    let d = Infinity;
    for (const i of points) {
      const x = Math.round((i % n) + ax * t * K);
      const y = Math.round(Math.floor(i / n) + ay * t * K);
      d = Math.min(d, field[y * n + x]);
    }
    return Math.sqrt(d) / K - clearance.radius;
  };
  let [lo, hi] = [-500, 500];
  while (hi - lo > 0.5) {
    const t = (lo + hi) / 2;
    if (gap(t) < clearance.gap) lo = t;
    else hi = t;
  }
  return Math.abs(hi) < 2.5 ? 0 : hi; // within the measurement's precision at K
}

/** The wizard's ink (alpha > 0) in SVG units, x0 y0 x1 y1. */
export async function wizardInk({ png, origin: { x, y }, width }: WizardImage) {
  const { data, info } = await sharp(png)
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
  const u = width / info.width;
  return [x + x0 * u, y + y0 * u, x + x1 * u, y + y1 * u];
}

/** The antialiased edge raster of the wizard's silhouette (alpha >= 50%), widened by `radius`.
 * The radius and returned geometry are in SVG units. The colour is an RGB triple. */
export async function edgeRaster(wizard: WizardImage, radius: number, colour: number[]) {
  const size = 1024; // twice the embedded wizard, for a smooth contour
  const unit = wizard.width / size;
  const r = radius / unit;
  const pad = Math.ceil(r) + 2;
  const { data } = await sharp(wizard.png)
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
  const [cr, cg, cb] = colour;
  const px = Buffer.alloc(n * n * 4);
  let [x0, y0, x1, y1] = [n, n, -1, -1];
  for (let i = 0; i < n * n; i++) {
    const a = Math.max(Math.min(r + 0.5 - Math.sqrt(grid[i]), 1), data[i] / 255, 0);
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
  const { x, y } = wizard.origin;
  const left = x - pad * unit;
  const top = y - pad * unit;
  return {
    png,
    origin: { x: left, y: top },
    width: n * unit,
    ink: [left + x0 * unit, top + y0 * unit, left + x1 * unit, top + y1 * unit],
  };
}
