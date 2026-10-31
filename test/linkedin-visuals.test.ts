import { afterAll, describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";

const FRAME = resolve(import.meta.dir, "../applications/linkedin-visuals/frame.ts");
const SCRATCH = mkdtempSync(join(tmpdir(), "li-frame-"));
afterAll(() => rmSync(SCRATCH, { recursive: true, force: true }));

// Needs Chrome, as frame.ts does.
describe("applications/linkedin-visuals/frame.ts", () => {
  it("frames any input at 1080x1350, headline in white on a gradient band, logo bottom right", async () => {
    const input = join(SCRATCH, "in.png");
    const output = join(SCRATCH, "out.png");
    // Landscape on purpose: the frame owns the format, whatever the input's.
    await sharp({ create: { width: 400, height: 300, channels: 3, background: "#ff0000" } })
      .png()
      .toFile(input);
    execFileSync("bun", [FRAME, input, output, "--headline", "Your repo remembers"]);

    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    expect([info.width, info.height]).toEqual([1080, 1350]);
    const px = (x: number, y: number) => {
      const i = (y * 1080 + x) * info.channels;
      return [...data.subarray(i, i + 3)];
    };
    const near = (a: number[], b: number[]) =>
      a.reduce((d, c, i) => d + Math.abs(c - b[i]), 0) < 30;
    const count = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      hit: (p: number[]) => boolean,
    ) => {
      let n = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (hit(px(x, y))) n++;
      return n;
    };

    const tint = [0xee, 0xf1, 0xf4];
    expect(px(540, 675)).toEqual([255, 0, 0]);
    // The band runs full bleed from teal at top left to purple at the right, and ends on the tint.
    expect(near(px(2, 2), [26, 114, 133])).toBe(true);
    expect(near(px(1077, 250), [147, 51, 234])).toBe(true);
    expect(px(20, 300)).toEqual(tint);
    expect(px(20, 1340)).toEqual(tint);
    // The headline is white on the band; the image, scaled up to the card's width, reaches up into
    // the band.
    expect(count(56, 60, 1024, 200, (p) => p.every((c) => c > 240))).toBeGreaterThan(2000);
    expect(px(540, 215)).toEqual([255, 0, 0]);
    expect(px(1020, 900)).toEqual([255, 0, 0]);
    expect(px(540, 190)).not.toEqual([255, 0, 0]);
    expect(near(px(20, 230), tint)).toBe(false);
    // The logo is the brand lockup: its pixel "&" is amp grey #7C849C.
    let amp = 0;
    for (let y = 1180; y < 1300; y++)
      for (let x = 600; x < 1024; x++) if (near(px(x, y), [0x7c, 0x84, 0x9c])) amp++;
    expect(amp).toBeGreaterThan(200);
  });

  it("sets a sketch's near-background paper to the card's colour and keeps its drawing", async () => {
    const input = join(SCRATCH, "paper.png");
    const output = join(SCRATCH, "paper-out.png");
    // The generator's measured paper, #F5F8F9, with a purple-light band across the middle.
    const [w, h] = [400, 400];
    const raw = Buffer.alloc(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      const band = Math.abs(Math.floor(i / w) - h / 2) < 40;
      raw.set(band ? [212, 173, 247] : [0xf5, 0xf8, 0xf9], i * 3);
    }
    await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
      .png()
      .toFile(input);
    execFileSync("bun", [FRAME, input, output, "--headline", "Paper"]);

    const { data } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    const px = (x: number, y: number) => [
      ...data.subarray((y * 1080 + x) * 3, (y * 1080 + x) * 3 + 3),
    ];
    // The image is the card, x 56-1023 and y 206-1173, the band across it at y 593-787. Without
    // the fix every sampled pixel at the image's edge reads the paper's #F5F8F9.
    const card = [0xf7, 0xf9, 0xfa];
    for (let x = 100; x <= 980; x += 20) {
      expect(px(x, 212)).toEqual(card);
      expect(px(x, 1166)).toEqual(card);
    }
    for (const y of [300, 500, 900, 1100]) {
      expect(px(60, y)).toEqual(card);
      expect(px(1019, y)).toEqual(card);
      expect(px(40, y)).toEqual([0xee, 0xf1, 0xf4]);
    }
    expect(px(540, 690)).toEqual([212, 173, 247]);
  });

  it("refuses a call without a headline", () => {
    expect(() => execFileSync("bun", [FRAME, "a.png", "b.png"], { stdio: "pipe" })).toThrow(
      /usage/,
    );
  });
});
