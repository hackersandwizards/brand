// The avatar files: the white hw of logos/type-logo-short.svg on the brand gradient, full-bleed
// square, one file per platform; the platform rounds or crops it itself. The hw spans MARK of the
// tile's width, centred: the largest size whose corners stay inside the circle of 40 % radius that
// a maskable app icon keeps, so the website's icons share it. os
// docs/tracking/2026-10-31-icon-sizes.md has the blind reviews.
// bun applications/avatars/generate.ts
// The Google Workspace logo (the lockup at 320 x 132) is not built here. The package ships one size,
// logos/avatar-512.png, for a consumer that uploads a square logo (os: Tally forms); the rest stay in LFS.
// It also ships the favicon set every site and page serves, in logos/: browser tabs and Windows
// show favicon.svg, favicon.ico and icon-192/512 unmasked, so those carry the rounded corners
// themselves, and the 16 and 32 px favicon keeps the hw at 73 %, since 62.5 % blurs in a tab. iOS
// and Android mask apple-touch-icon and icon-maskable-512, so those are full-bleed squares.
// favicon.ico wraps the 32 px PNG, which every browser reading .ico accepts.
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

// The hw spans `mark` of the tile; `rounded` gives the tile the corner a tab shows unmasked.
const svg = (mark: number, rounded: boolean) => {
  const size = (x1 - x0) / mark;
  const [x, y] = [(x0 + x1 - size) / 2, (y0 + y1 - size) / 2];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${size} ${size}"><linearGradient id="g" x2="1" y2="1"><stop stop-color="${colors["--color-teal"]}"/><stop offset="1" stop-color="${colors["--color-purple"]}"/></linearGradient><rect x="${x}" y="${y}" width="${size}" height="${size}"${rounded ? ` rx="${size / 5}"` : ""} fill="url(#g)"/><path fill="${colors["--color-white"]}" d="${glyphs.join("")}"/></svg>\n`;
};
export const tile = svg(MARK, false);
export const favicon = svg(1056 / 1440, true);

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
  ["../../logos/avatar-512.png", 512, true],
];

if (import.meta.main) {
  await Bun.write(join(import.meta.dir, "fathom-brandfetch-logo.svg"), tile);
  for (const [file, px, palette] of FILES)
    await sharp(Buffer.from(tile), { density: (72 * px) / size })
      .resize(px, px)
      .png({ palette })
      .toFile(join(import.meta.dir, file));

  const logos = (name: string) => join(BRAND, "logos", name);
  const png = (source: string, px: number) =>
    sharp(Buffer.from(source), { density: 72 }).resize(px, px).png({ palette: true }).toBuffer();
  const roundedTile = svg(MARK, true);
  await Bun.write(logos("favicon.svg"), favicon);
  await Bun.write(logos("apple-touch-icon.png"), await png(tile, 180));
  await Bun.write(logos("icon-192.png"), await png(roundedTile, 192));
  await Bun.write(logos("icon-512.png"), await png(roundedTile, 512));
  await Bun.write(logos("icon-maskable-512.png"), await png(tile, 512));
  const ico32 = await png(favicon, 32);
  const head = Buffer.alloc(22);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(1, 4); // one image
  head.writeUInt8(32, 6); // width
  head.writeUInt8(32, 7); // height
  head.writeUInt16LE(1, 10); // colour planes
  head.writeUInt16LE(32, 12); // bits per pixel
  head.writeUInt32LE(ico32.length, 14);
  head.writeUInt32LE(22, 18); // image offset
  await Bun.write(logos("favicon.ico"), Buffer.concat([head, ico32]));
}
