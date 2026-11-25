import { assert, beforeAll, expect, test } from "vitest";
import sharp from "sharp";
import {
  edgeRaster,
  moveFor,
  parseWizard,
  readWizard,
  shiftWizard,
  wizardInk,
  wizardTag,
} from "../scripts/logo-contour";
import { grow, readViewBox, sizedSvg, styleLogoCut, unionInk } from "../scripts/logo-svg";

let opaque: Buffer;
let sparse: Buffer;

beforeAll(async () => {
  opaque = await sharp({
    create: { width: 2, height: 2, channels: 4, background: "#ffffffff" },
  })
    .png()
    .toBuffer();
  sparse = await sharp(
    Buffer.from([255, 255, 255, 0, 255, 255, 255, 1, 255, 255, 255, 0, 255, 255, 255, 255]),
    { raw: { width: 2, height: 2, channels: 4 } },
  )
    .png()
    .toBuffer();
});

const wizardSvg = (png: Buffer, width: number) =>
  `<image x="0" y="0" width="${width}" height="${width}" href="data:image/png;base64,${png.toString("base64")}"/>`;

test("reads the wizard raster and updates its SVG placement at three decimal places", () => {
  const tag = wizardSvg(sparse, 20);
  const wizard = readWizard(tag);
  expect(wizard).toEqual({ tag, origin: { x: 0, y: 0 }, width: 20, png: sparse });
  const moved = shiftWizard(wizard, { x: -3.14159, y: 2.9999 });
  expect(wizardTag(moved)).toBe(tag.replace('x="0" y="0"', 'x="-3.142" y="3"'));
});

test("a wordmark may omit the wizard, while a lockup requires it", () => {
  expect(parseWizard("<svg/>")).toBeUndefined();
  expect(() => readWizard("<svg/>")).toThrow(TypeError);
});

test("wizard ink includes faint pixels and uses the placed SVG coordinates", async () => {
  const wizard = parseWizard(wizardSvg(sparse, 20));
  assert(wizard, "The fixture must embed a wizard raster.");
  expect(await wizardInk(shiftWizard(wizard, { x: 3, y: 7 }))).toEqual([13, 7, 23, 27]);
});

test.each([
  { axis: "left", x: 650, y: 0, direction: { x: -1, y: 0 } },
  { axis: "up", x: 0, y: 650, direction: { x: 0, y: -1 } },
])("moves the wizard $axis until its contour clears the letter", async ({ x, y, direction }) => {
  // Keep the contours on the same side of each other across the full search interval.
  const src = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720">${wizardSvg(opaque, 20)}<g fill="#1A7285"><rect x="${x}" y="${y}" width="20" height="20"/></g></svg>`;
  expect(await moveFor(src, direction, 632)).toBe(0);
  expect(await moveFor(src, direction, 652)).toBeCloseTo(19.04, 2);
});

test("the wizard's edge uses SVG units and antialiases the silhouette", async () => {
  const wizard = parseWizard(wizardSvg(opaque, 1024));
  assert(wizard, "The fixture must embed a wizard raster.");
  const { png, ...geometry } = await edgeRaster(wizard, 2, [13, 42, 99]);
  expect(geometry).toEqual({
    origin: { x: -4, y: -4 },
    width: 1032,
    ink: [-2, -2, 1026, 1026],
  });
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rim = (512 * info.width + 2) * info.channels;
  expect([...data.subarray(rim, rim + 4)]).toEqual([13, 42, 99, 128]);
});

const DAY_GROUP = '<g fill="#1A7285"><path fill="#9333EA"/><path fill="#7C849C"/></g>';
const DAY = `<svg width="100" height="20" viewBox="0 0 100 20">${DAY_GROUP}</svg>`;
const WHITE = '<g fill="#FFFFFF"><path fill="#FFFFFF"/><path fill="#FFFFFF"/></g>';

test.each([
  {
    kind: "night",
    group: '<g fill="#47AEC6"><path fill="#B97AF1"/><path fill="#B0B5C4"/></g>',
    edgeColour: "#B0B5C4",
    outlineInk: undefined,
  },
  { kind: "white", group: WHITE, edgeColour: "#FFFFFF", outlineInk: undefined },
  {
    kind: "black",
    group: '<g fill="#000000"><path fill="#000000"/><path fill="#000000"/></g>',
    edgeColour: "#FFFFFF",
    outlineInk: undefined,
  },
  {
    kind: "outline",
    group: `<g stroke="#FFFFFF" stroke-width="96" stroke-linejoin="miter">${WHITE}</g>${DAY_GROUP}`,
    edgeColour: "#FFFFFF",
    outlineInk: [48, 48, 6715, 995],
  },
] as const)(
  "applies the $kind treatment to a day wordmark",
  ({ kind, group, edgeColour, outlineInk }) => {
    expect(styleLogoCut(DAY, "wordmark", kind)).toEqual({
      svg: DAY.replace(DAY_GROUP, group),
      edgeColour,
      outlineInk,
    });
  },
);

test("a cut requires a wordmark group in its source logo", () => {
  expect(() => styleLogoCut("<svg/>", "wordmark", "night")).toThrow(
    "logos/wordmark.svg carries no wordmark group",
  );
});

test("SVG dimensions track the viewport while preserving fractional coordinates", () => {
  const adjusted = sizedSvg(DAY, [1.125, 2.5, 102.5, 6.5]);
  expect(adjusted).toBe(
    `<svg width="103" height="7" viewBox="1.125 2.5 102.5 6.5">${DAY_GROUP}</svg>`,
  );
  expect(readViewBox(adjusted)).toEqual([1.125, 2.5, 102.5, 6.5]);
});

test("the outer ink bounds cover every layer", () => {
  expect(unionInk([96, 96, 6700, 950], [60, 48, 6667, 1000])).toEqual([60, 48, 6700, 1000]);
});

test.each([
  { base: "lockup-compact", viewport: [60, 48, 6640, 952] },
  { base: "wordmark", viewport: [60, 48, 6640, 1048] },
  { base: "lockup", viewport: [60, -14.218, 6640, 1014.218] },
])("grows the $base viewport using its wordmark centre-line rule", ({ base, viewport }) => {
  expect(grow(base, [96, 96, 6571, 851], [60, 48, 6700, 1000])).toEqual(viewport);
});
