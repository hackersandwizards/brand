#!/usr/bin/env bun
// Writes the -outline cut of each one-line logo: the day colours over a white outline of 48 SVG
// units round the wordmark, the wizard unoutlined. For Purple Love and the gradient (os logo-system
// study, 2026-10-30): the study's generator dilated the wordmark with a 97-unit square, which a
// mitred 96-unit stroke under the letters reproduces. The letter positions stay where the source
// file has them; the box grows to hold the outline, by the same amount above and below so a text
// beside it still centres on the letters. Renders each PNG at its source PNG's scale and adds or
// rehashes both in manifest.json. Run after any change to a source logo.
// Usage: bun scripts/outline.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import manifest from "../manifest.json";
import { ROOT, sha256 } from "./git";

const OUTLINE = 48;
const INK = { x0: 96, y0: 96, x1: 6667, y1: 947 }; // the wordmark's letters in SVG units
const WORDMARK = /<g fill="#1A7285">[\s\S]*(?=<\/svg>)/;

for (const base of ["wordmark", "lockup", "lockup-compact"]) {
  const src = readFileSync(join(ROOT, "logos", `${base}.svg`), "utf8");
  const letters = WORDMARK.exec(src)?.[0];
  if (!letters) throw new Error(`logos/${base}.svg carries no wordmark group`);
  const [x, y, w, h] = /viewBox="([^"]+)"/.exec(src)![1].split(" ").map(Number);
  const x0 = Math.min(x, INK.x0 - OUTLINE);
  const x1 = Math.max(x + w, INK.x1 + OUTLINE);
  const dy = Math.max(0, y - (INK.y0 - OUTLINE), INK.y1 + OUTLINE - (y + h));
  const box = [x0, y - dy, x1 - x0, h + 2 * dy].map((n) => +n.toFixed(3));
  const white = letters.replace(/fill="#[0-9A-F]{6}"/g, 'fill="#FFFFFF"');
  const svg = src
    .replace(/viewBox="[^"]+"/, `viewBox="${box.join(" ")}"`)
    .replace(
      / width="\d+" height="\d+"/,
      ` width="${Math.round(box[2])}" height="${Math.round(box[3])}"`,
    )
    .replace(
      WORDMARK,
      `<g stroke="#FFFFFF" stroke-width="${2 * OUTLINE}" stroke-linejoin="miter">${white}</g>${letters}`,
    );
  const svgPath = `logos/${base}-outline.svg`;
  const pngPath = `logos/${base}-outline.png`;
  writeFileSync(join(ROOT, svgPath), svg);
  const { width } = await sharp(join(ROOT, "logos", `${base}.png`)).metadata();
  await sharp(Buffer.from(svg))
    .resize(Math.round((width * box[2]) / w))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(join(ROOT, pngPath));
  for (const path of [svgPath, pngPath]) {
    const sha = sha256(readFileSync(join(ROOT, path)));
    const entry = manifest.files.find((f) => f.path === path);
    if (entry) entry.sha256 = sha;
    else {
      const after = manifest.files.findIndex((f) => f.path === `logos/${base}-night.png`);
      manifest.files.splice(after + 1 + (path.endsWith(".png") ? 1 : 0), 0, { path, sha256: sha });
    }
  }
}
writeFileSync(join(ROOT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
