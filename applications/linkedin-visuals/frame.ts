#!/usr/bin/env bun
/**
 * Frames a LinkedIn post image in the brand: a gradient band across the top with the headline in
 * white JetBrains Mono on it, the image below, uncropped, as a card that overlaps the band's lower
 * edge, a sketch's paper set to the card's colour, and the brand lockup (wizard plus pixel wordmark)
 * at bottom right on the tint, as a 1080x1350 PNG, portrait 4:5, the tallest ratio LinkedIn shows
 * uncropped.
 *
 *   bun run brand-linkedin-frame <in.png> <out.png> --headline "<text>"
 *
 * Needs sharp installed beside it and Chrome or Chromium (CHROME_BINARY overrides the search).
 */
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { colors } from "../../generated/tokens";
import { brandPath, escHtml, linkedinCss, screenshot } from "./render";

// The brand lockup (logos/lockup.svg): the wizard beside the pixel wordmark, no line under it. It
// stands on the tint, not the band, so it takes no outline.
const LOCKUP_HEIGHT = 36; // CSS px
// The headline at 36 px reads about 26 pt on a phone, 22 characters to the line.
const HEADLINE_SIZE = 36; // CSS px
// How far the card reaches up into the band.
const OVERLAP = 30; // CSS px
// Laid out at 540 CSS px, about the width the feed shows the image at, and captured at twice that,
// so every type role renders at the size the website gives it on a phone.
const [WIDTH, HEIGHT, SCALE] = [540, 675, 2];

// The generator's paper lands near the brand background but not on it (#F5F8F9 measured), which
// shows as a faint box at full size. A sketch's corners sit on that paper; a photo's do not.
const CORNER = 8; // side of the square sampled at each corner, px
const SKETCH_GATE = 8; // per channel, every corner mean to the background, or no change
// A pixel with every channel within this of the sampled paper becomes the card's colour. In a
// generated sketch the paper's noise stayed within 3 for 710,969 pixels and 4 caught another 3,870.
// The lightest drawing tones, purple light and teal light, sit 75 and 82 away on their furthest
// channel.
const TOLERANCE = 4;
// The ground is the brand's tint, not its background, which blends into LinkedIn's white feed.
// The image itself is the card; a sketch's paper becomes the background, the brand colour nearest
// the generator's paper, so the sketch reads as a light card on the tint.
const TINT = colors["--color-tint"];
const CARD = colors["--color-bg"];

/** Sets the inner image's paper to exactly the card's colour; returns the path to frame. */
async function matchPaper(input: string, dir: string): Promise<string> {
  const card = CARD.slice(1)
    .match(/../g)!
    .map((h) => parseInt(h, 16));
  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const corners = [
    [0, 0],
    [w - CORNER, 0],
    [0, h - CORNER],
    [w - CORNER, h - CORNER],
  ].map(([x0, y0]) => {
    const sum = [0, 0, 0];
    for (let y = y0; y < y0 + CORNER; y++)
      for (let x = x0; x < x0 + CORNER; x++)
        for (let c = 0; c < 3; c++) sum[c] += data[(y * w + x) * ch + c];
    return sum.map((v) => v / CORNER ** 2);
  });
  if (!corners.every((m) => m.every((v, c) => Math.abs(v - card[c]) <= SKETCH_GATE))) return input;
  const paper = [0, 1, 2].map((c) => corners.reduce((s, m) => s + m[c], 0) / 4);
  for (let i = 0; i < data.length; i += ch)
    if (paper.every((v, c) => Math.abs(data[i + c] - v) <= TOLERANCE))
      for (let c = 0; c < 3; c++) data[i + c] = card[c];
  const out = join(dir, "inner.png");
  await sharp(data, { raw: info }).png().toFile(out);
  return out;
}

async function frameHtml(image: string, headline: string): Promise<string> {
  const { width, height } = await sharp(image).metadata();
  const src = (path: string) => escHtml(pathToFileURL(path).href);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${linkedinCss()}
html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
body { display: flex; flex-direction: column; background: ${TINT}; }
header { background: var(--gradient-magic); padding: 32px 28px ${28 + OVERLAP}px; }
h1 {
  margin: 0; color: var(--color-white);
  font-family: var(--font-mono); font-weight: var(--type-h2-weight);
  font-size: ${HEADLINE_SIZE}px; line-height: var(--type-h2-line-height);
  letter-spacing: var(--type-h2-tracking); word-spacing: var(--type-h2-word-spacing);
  text-wrap: balance;
}
main { flex: 1; min-height: 0; margin: -${OVERLAP}px 28px 0; container-type: size; }
main img {
  display: block; margin: 0 auto; width: min(100cqw, 100cqh * ${width / height});
  border-radius: var(--radius-brand); box-shadow: var(--shadow-card);
}
footer { padding: 22px 28px 24px; display: flex; justify-content: flex-end; }
footer img { display: block; height: ${LOCKUP_HEIGHT}px; }
</style></head><body>
<header><h1>${escHtml(headline)}</h1></header>
<main><img src="${src(image)}" alt=""></main>
<footer><img src="${src(brandPath("logos/lockup.svg"))}" alt="hackers&amp;wizards"></footer>
</body></html>`;
}

async function frameImage(input: string, output: string, headline: string): Promise<void> {
  if (!existsSync(input)) throw new Error(`No input image at ${input}`);
  const dir = mkdtempSync(join(tmpdir(), "linkedin-frame-"));
  try {
    writeFileSync(
      join(dir, "frame.html"),
      await frameHtml(await matchPaper(resolve(input), dir), headline),
    );
    rmSync(output, { force: true });
    await screenshot(dir, "frame.html", [WIDTH, HEIGHT, SCALE], output);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const [input, output, flag, headline] = process.argv.slice(2);
  if (!input || !output || flag !== "--headline" || !headline?.trim()) {
    console.error('usage: brand-linkedin-frame <in.png> <out.png> --headline "<text>"');
    process.exit(2);
  }
  await frameImage(input, output, headline);
}
