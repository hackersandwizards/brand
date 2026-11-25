import { expect, test } from "vitest";
import sharp from "sharp";
import {
  boothLuminance,
  cropBleed,
  parseBoothArgs,
  planBoothViews,
} from "../applications/booth/generate";

test("requires an output directory for the booth banners", () => {
  expect(() => parseBoothArgs([])).toThrow("usage: generate.ts <out dir> [--pdf]");
});

test.each([
  { args: ["/output"], pdf: false, views: { mode: "ambient", walls: [""] } },
  {
    args: ["/output", "--pdf", "--wall=dark,mid,white"],
    pdf: true,
    views: { mode: "ambient", walls: ["dark", "mid", "white"] },
  },
  { args: ["/output", "--wall=white", "--lit"], pdf: false, views: { mode: "backlit" } },
])("parses the booth selection from $args", ({ args, pdf, views }) => {
  expect(parseBoothArgs(args)).toEqual({ out: "/output", pdf, views });
});

const far = { width: 1600, height: 900, pixelsPerMm: 0.25, floorY: 740, bannerX: 640, aisle: true };
const near = {
  width: 1400,
  height: 1500,
  pixelsPerMm: 0.62,
  floorY: 1410,
  bannerX: 70,
  aisle: false,
};

test("plans the unlabelled mid-wall view at 6 m before 2 m", () => {
  const lighting = { mode: "ambient", wall: "#8f9298" };
  expect(planBoothViews("/output", { mode: "ambient", walls: [""] })).toEqual([
    { path: "/output/views/gradient-6m.jpg", camera: far, lighting },
    { path: "/output/views/gradient-2m.jpg", camera: near, lighting },
  ]);
});

test("keeps requested wall labels and uses mid for an unknown wall", () => {
  const plan = planBoothViews("/output", { mode: "ambient", walls: ["dark", "unknown"] });
  expect(plan).toEqual([
    {
      path: "/output/views/gradient-dark-6m.jpg",
      camera: far,
      lighting: { mode: "ambient", wall: "#1e2024" },
    },
    {
      path: "/output/views/gradient-dark-2m.jpg",
      camera: near,
      lighting: { mode: "ambient", wall: "#1e2024" },
    },
    {
      path: "/output/views/gradient-unknown-6m.jpg",
      camera: far,
      lighting: { mode: "ambient", wall: "#8f9298" },
    },
    {
      path: "/output/views/gradient-unknown-2m.jpg",
      camera: near,
      lighting: { mode: "ambient", wall: "#8f9298" },
    },
  ]);
});

test("plans the lit views against a dark wall with the measured luminance", () => {
  const lighting = { mode: "backlit", wall: "#1e2024", luminance: 0.25 };
  expect(planBoothViews("/output", { mode: "backlit", luminance: 0.25 })).toEqual([
    { path: "/output/views/gradient-lit-6m.jpg", camera: far, lighting },
    { path: "/output/views/gradient-lit-2m.jpg", camera: near, lighting },
  ]);
});

test.each([
  { mm: { widthMm: 5, heightMm: 10 }, width: 8, height: 16 },
  { mm: { widthMm: 10, heightMm: 5 }, width: 16, height: 8 },
])("crops the 32 pixel bleed from a $width by $height print", async ({ mm, width, height }) => {
  const source = await sharp({ create: { width, height, channels: 3, background: "#fff" } })
    .extend({ top: 32, bottom: 32, left: 32, right: 32, background: "#000" })
    .png()
    .toBuffer();
  const { data, info } = await sharp(await cropBleed(source, mm))
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect(info).toMatchObject({ width, height, channels: 3 });
  expect(data).toEqual(Buffer.alloc(width * height * 3, 255));
});

// Encode one known RGB sample as an image for the luminance measurement.
const swatch = (background: string) =>
  sharp({ create: { width: 1, height: 1, channels: 3, background } })
    .png()
    .toBuffer();

test.each([
  { tall: "#ff0000", square: "#ff0000", luminance: 0.2126 },
  { tall: "#00ff00", square: "#00ff00", luminance: 0.7152 },
  { tall: "#0000ff", square: "#0000ff", luminance: 0.0722 },
  { tall: "#ffffff", square: "#000000", luminance: 2 / 3 },
  { tall: "#000000", square: "#ffffff", luminance: 1 / 3 },
])("weights $tall and $square by Rec. 709 and banner area", async ({ tall, square, luminance }) => {
  expect(
    await boothLuminance({ tall: await swatch(tall), square: await swatch(square) }),
  ).toBeCloseTo(luminance, 10);
});
