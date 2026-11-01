// The avatar files: the white hw of logos/type-logo-short.svg on the brand gradient, full-bleed
// square, one file per platform; the platform rounds or crops it itself. The hw spans MARK of the
// tile's width, centred: the largest size whose corners stay inside the circle of 40 % radius that
// a maskable app icon keeps, so the website's icons share it. os
// docs/tracking/2026-10-31-avatar-mark-size.md and 2026-10-31-icon-sizes.md have the blind reviews.
// bun applications/avatars/generate.ts
// The Google Workspace logo (the lockup at 320 x 132) is not built here.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { colors } from "../../generated/tokens";

export const MARK = 0.625;
const BRAND = join(import.meta.dir, "../..");
const logo = readFileSync(join(BRAND, "logos/type-logo-short.svg"), "utf8");
const [, ...glyphs] = [...logo.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]); // the first path is the outline cut
const [x0, y0, x1, y1] = [48, 48, 1104, 888]; // the glyphs' bounding box in that file
const size = (x1 - x0) / MARK;
const [x, y] = [(x0 + x1 - size) / 2, (y0 + y1 - size) / 2];

export const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${size} ${size}"><linearGradient id="g" x2="1" y2="1"><stop stop-color="${colors["--color-teal"]}"/><stop offset="1" stop-color="${colors["--color-purple"]}"/></linearGradient><rect x="${x}" y="${y}" width="${size}" height="${size}" fill="url(#g)"/><path fill="${colors["--color-white"]}" d="${glyphs.join("")}"/></svg>\n`;

// [file, px, palette]: palette PNGs where the platform caps the file size or the file stays small
const FILES: [string, number, boolean][] = [
  ["slack-workspace-icon-1024.png", 1024, false],
  ["linkedin-company-logo-400.png", 400, true],
  ["github-org-avatar-500.png", 500, true],
  ["gitlab-group-avatar-192.png", 192, true],
  ["youtube-profile-picture-800.png", 800, false],
  ["google-account-photo-800.png", 800, false],
  ["circle-community-icon-512.png", 512, true],
  ["circle-community-icon-32.png", 32, true],
  ["notion-workspace-icon-512.png", 512, true],
  ["fathom-brandfetch-logo-1024.png", 1024, false],
];

if (import.meta.main) {
  await Bun.write(join(import.meta.dir, "fathom-brandfetch-logo.svg"), tile);
  for (const [file, px, palette] of FILES)
    await sharp(Buffer.from(tile), { density: (72 * px) / size })
      .resize(px, px)
      .png({ palette })
      .toFile(join(import.meta.dir, file));
}
