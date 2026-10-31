#!/usr/bin/env bun
// Places the & of the one-line wordmark optically centred between the s and the w: its mean
// row-wise gap is the same on both sides (Benedikt, 2026-10-29, os row wordmark-ampersand-spacing,
// "B, optisch mittig"). Writes the offset into every logo carrying the one-line wordmark, renders
// each PNG at its current width and rehashes both in manifest.json. A second run changes nothing.
// type-logo-long.svg keeps its own layout: its & opens the second line, with no s beside it.
// The -night, -outline, -white and -black cuts carry the same & group: run scripts/outline.ts after
// it, which writes them from the day files.
// Usage: bun scripts/ampersand.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import manifest from "../manifest.json";
import { ROOT, sha256 } from "./git";

// SVG units. The & ink sits 115 from the s and 84 from the w, row means 198 and 197 (LGD-3, b).
const AMPERSAND_DX = -29;
const LOGOS = ["wordmark", "lockup", "lockup-compact"].flatMap((n) => [n, `${n}-night`]);
// The & is the first group inside the "&wizards" block, which the wordmark shifts as one.
const AMPERSAND =
  /(<g transform="translate\(2803 -672\)"><g fill="#[0-9A-F]{6}")( transform="[^"]*")?>/;

const written = new Set<string>();
for (const name of LOGOS) {
  const svgPath = join(ROOT, "logos", `${name}.svg`);
  const pngPath = join(ROOT, "logos", `${name}.png`);
  const svg = readFileSync(svgPath, "utf8");
  if (!AMPERSAND.test(svg)) throw new Error(`logos/${name}.svg carries no & group`);
  const next = svg.replace(AMPERSAND, `$1 transform="translate(${AMPERSAND_DX} 0)">`);
  writeFileSync(svgPath, next);
  const { width } = await sharp(pngPath).metadata();
  await sharp(Buffer.from(next))
    .resize(width)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(pngPath);
  written.add(`logos/${name}.svg`).add(`logos/${name}.png`);
}

for (const f of manifest.files)
  if (written.has(f.path)) f.sha256 = sha256(readFileSync(join(ROOT, f.path)));
writeFileSync(join(ROOT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
