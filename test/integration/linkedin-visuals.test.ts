import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";

const FRAME = resolve(import.meta.dir, "../../applications/linkedin-visuals/frame.ts");
const TERMINAL = resolve(import.meta.dir, "../../applications/linkedin-visuals/terminal.ts");
const SCRATCH = mkdtempSync(join(tmpdir(), "li-frame-"));
afterAll(() => rmSync(SCRATCH, { recursive: true, force: true }));

// Needs Chrome, as frame.ts does. Each render cold-starts Chrome with a fresh profile, which takes
// seconds and grows with the machine's load (11 to 60 s at load 130); the limit is the
// one screenshot() gives Chrome itself.
const CHROME = 60_000;
type Point = { x: number; y: number };
type Region = { left: number; top: number; width: number; height: number };

const near = (a: number[], b: number[]) => a.reduce((d, c, i) => d + Math.abs(c - b[i]), 0) < 30;

async function readFrame(file: string) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const pixel = ({ x, y }: Point) => {
    const offset = (y * info.width + x) * info.channels;
    return [...data.subarray(offset, offset + 3)];
  };
  const region = ({ left, top, width, height }: Region) =>
    Array.from({ length: width * height }, (_, index) =>
      pixel({ x: left + (index % width), y: top + Math.floor(index / width) }),
    );
  return { size: { width: info.width, height: info.height }, pixel, region };
}

describe("applications/linkedin-visuals/frame.ts", () => {
  describe("a framed landscape image", () => {
    let frame: Awaited<ReturnType<typeof readFrame>>;

    beforeAll(async () => {
      const input = join(SCRATCH, "in.png");
      const output = join(SCRATCH, "out.png");
      // Landscape on purpose: the frame owns the format, whatever the input's.
      await sharp({ create: { width: 400, height: 300, channels: 3, background: "#ff0000" } })
        .png()
        .toFile(input);
      execFileSync("bun", [FRAME, input, output, "--headline", "Your repo remembers"]);
      frame = await readFrame(output);
    }, CHROME);

    it("uses the 1080 by 1350 portrait canvas", () => {
      expect(frame.size).toEqual({ width: 1080, height: 1350 });
    });

    const tint = [0xee, 0xf1, 0xf4];

    // The band runs full bleed from teal at top left to purple at the right, and ends on the tint.
    it("runs the teal-to-purple band full bleed", () => {
      expect(near(frame.pixel({ x: 2, y: 2 }), [26, 114, 133])).toBe(true);
      expect(near(frame.pixel({ x: 1077, y: 250 }), [147, 51, 234])).toBe(true);
      expect(near(frame.pixel({ x: 20, y: 230 }), tint)).toBe(false);
    });

    it.each([
      { x: 20, y: 300 },
      { x: 20, y: 1340 },
    ])("returns to the tint at ($x, $y) below the band", (point) => {
      expect(frame.pixel(point)).toEqual(tint);
    });

    // The headline is white on the band; the image, scaled up to the card's width, reaches up into
    // the band.
    describe("the headline and the card at the band", () => {
      it("sets the headline in white on the band", () => {
        const region = frame.region({ left: 56, top: 60, width: 968, height: 140 });
        expect(
          region.filter((pixel) => pixel.every((channel) => channel > 240)).length,
        ).toBeGreaterThan(2000);
      });

      const red = [255, 0, 0];
      it.each([
        { sample: "centre", x: 540, y: 675 },
        { sample: "upper edge", x: 540, y: 215 },
        { sample: "right edge", x: 1020, y: 900 },
      ])("shows the red image at the card's $sample", ({ x, y }) => {
        expect(frame.pixel({ x, y })).toEqual(red);
      });

      it("leaves the band above the card clear", () => {
        expect(frame.pixel({ x: 540, y: 190 })).not.toEqual(red);
      });
    });

    // The logo is the brand lockup: its pixel "&" is amp grey #7C849C.
    it("draws the brand lockup at bottom right", () => {
      const region = frame.region({ left: 600, top: 1180, width: 424, height: 120 });
      expect(region.filter((pixel) => near(pixel, [0x7c, 0x84, 0x9c])).length).toBeGreaterThan(200);
    });
  });

  it(
    "sets a sketch's near-background paper to the card's colour and keeps its drawing",
    async () => {
      const input = join(SCRATCH, "paper.png");
      const output = join(SCRATCH, "paper-out.png");
      // The generator's measured paper, #F5F8F9, with a purple-light band across the middle.
      await sharp({ create: { width: 400, height: 400, channels: 3, background: "#F5F8F9" } })
        .composite([
          {
            input: { create: { width: 400, height: 79, channels: 3, background: "#D4ADF7" } },
            left: 0,
            top: 161,
          },
        ])
        .removeAlpha()
        .png()
        .toFile(input);
      execFileSync("bun", [FRAME, input, output, "--headline", "Paper"]);

      const { data } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
      const px = (x: number, y: number) => [
        ...data.subarray((y * 1080 + x) * 3, (y * 1080 + x) * 3 + 3),
      ];
      // The image is the card, x 56-1023 and y 206-1173, the band across it at y 593-787. An image
      // short of the card leaves the paper's #F5F8F9 at every sampled edge pixel.
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
    },
    CHROME,
  );
});

describe("applications/linkedin-visuals/terminal.ts", () => {
  it(
    "trims to a square-cornered window, so the frame's radius alone rounds the card",
    async () => {
      const spec = join(SCRATCH, "spec.json");
      const output = join(SCRATCH, "terminal.png");
      writeFileSync(
        spec,
        JSON.stringify({
          title: "gh pr list",
          lines: ["a", "b", "c", "d"],
          highlight: 1,
          note: "n",
        }),
      );
      execFileSync("bun", [TERMINAL, spec, output]);

      const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
      const px = (x: number, y: number) => {
        const i = (y * info.width + x) * info.channels;
        return [...data.subarray(i, i + 3)];
      };
      // A rounded window left the paper, #F7F9FA, in each corner; the frame's 5 px corners showed it.
      const [w, h] = [info.width - 1, info.height - 1];
      for (const [x, y] of [
        [0, 0],
        [w, 0],
        [0, h],
        [w, h],
      ])
        expect(px(x, y).every((c) => c < 40)).toBe(true);
    },
    CHROME,
  );
});
