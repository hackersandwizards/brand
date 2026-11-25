import { expect, test, vi } from "vitest";
import type { Page, ScreenshotOptions } from "puppeteer-core";
import { listedCatalog, listedSite } from "../scan/elements-config";
import { readMarkerPixels } from "../scan/marker-capture";
import type { Probe } from "../scan/marker-dom";
import { applyExceptions, type Reading } from "../scan/marker-readings";
import { failing } from "../scan/markers";

test("a page path with a malformed escape is matched as it stands", () => {
  const reading = { page: "http://h/caf%E9/", offset: 3, indent: null, double: false } as Reading;
  const { kept } = applyExceptions([reading], { "/caf*/": { reason: "kept", off: 1 } });
  expect(kept).toEqual([reading]);
});

test("a reading with no ink on either side fails", () => {
  const reading: Reading = {
    page: "x",
    label: "x",
    kind: "glyph",
    scale: 1,
    newline: false,
    offset: NaN,
    indent: null,
    double: false,
  };
  expect(failing(reading)).toBe(true);
});

test("a marker exception needs a reason beyond whitespace", () => {
  const exceptions = { "/list/": { reason: " \t ", off: 1 } };
  expect(applyExceptions([], exceptions).findings).toEqual([
    'markers exception "/list/": needs a "reason" and an "off" count of at least 1',
  ]);
});

const STORY = "http://127.0.0.1:1/catalog/stories/Slides/Slide%20types/content-slide/at-rest/";
const UNIT = "http://127.0.0.1:1/units/x/";
const off = (page: string): Reading => ({
  page,
  label: "li",
  kind: "before",
  scale: 2,
  newline: false,
  offset: 0.26,
  indent: null,
  double: false,
});

test("marker exceptions keep off readings by decoded path and leave other failures", () => {
  const readings = [off(STORY), off(STORY), off(UNIT), { ...off(STORY), double: true }];
  const { kept, bad } = applyExceptions(readings, {
    "**/Slide types/content-slide/at-rest/": { reason: "engine rounding", off: 2 },
  });
  expect(kept).toHaveLength(2);
  // The item with two markers stays bad; a page not measured in this run makes no entry stale.
  expect(bad.map((r) => r.page)).toEqual([UNIT, STORY]);
});

test("an exception keeping nothing is stale only on a measured page", () => {
  const exceptions = {
    "**/ground-intro/": { reason: "engine rounding", off: 1 },
    "**/not-measured/": { reason: "engine rounding", off: 1 },
  };
  const { findings } = applyExceptions([], exceptions, ["http://127.0.0.1:1/x/ground-intro/"]);
  expect(findings).toEqual([
    'markers exception "**/ground-intro/" is stale: it keeps no off reading',
  ]);
});

test("over-count and invalid exceptions are reported in configuration order", () => {
  const over = applyExceptions([off(STORY), off(STORY), off(UNIT)], {
    "**/at-rest/": { reason: "engine rounding", off: 1 },
    "**/units/**": { reason: "", off: 1 },
  });
  expect(over.findings).toEqual([
    'markers exception "**/at-rest/": 2 off readings, 1 kept',
    'markers exception "**/units/**": needs a "reason" and an "off" count of at least 1',
  ]);
});

test("without exceptions every off reading stays bad", () => {
  expect(applyExceptions([off(STORY), off(STORY), off(UNIT)]).bad).toHaveLength(3);
});

// Fewer readings than "off" pass, since a run with fewer scales or pages counts fewer.
test.each([3, 2])("two readings fit an exception count of %i", (count) => {
  const { findings } = applyExceptions([off(STORY), off(STORY), off(UNIT)], {
    "**/at-rest/": { reason: "engine rounding", off: count },
  });
  expect(findings).toEqual([]);
});

test.each([
  [{ dir: "dist", at: "/mail/" }, undefined, "/mail/"],
  ["dist", "mail", "/mail/"],
  ["dist", undefined, "/"],
] as const)("a site entry %j with flag %s mounts at %s", (site, flag, at) => {
  expect(listedSite(site, flag)).toEqual({ dir: "dist", at });
});

test.each([undefined, null])("an absent site entry (%s) has no mount", (site) => {
  expect(listedSite(site)).toBeUndefined();
});

test("a site entry with a path but no folder is malformed", () => {
  expect(() => listedSite({ at: "/mail/" })).toThrow('"site": a folder');
});

test("a --site-at override supplies the mount before config path validation", () => {
  expect(listedSite({ dir: "dist", at: 5 }, "/mail/")).toEqual({ dir: "dist", at: "/mail/" });
});

test("a catalog folder preserves its exclusions with an unset mount", () => {
  expect(
    listedCatalog({ catalog: { dir: "dist/catalog", at: null, exclude: ["Slides/**"] } }),
  ).toEqual({
    dir: "dist/catalog",
    at: undefined,
    exclude: ["Slides/**"],
  });
});

test.each([
  { dir: "", at: "/catalog/" },
  { dir: "dist/catalog", at: 5 },
  { dir: "dist/catalog", exclude: null },
])("a malformed catalog entry throws: %j", (catalog) => {
  expect(() => listedCatalog({ catalog })).toThrow(
    'brand-elements.json "catalog": expected a folder',
  );
});

test.each([
  { right: 100, beyond: false },
  { right: 10, beyond: true },
])(
  "marker and text clips use captureBeyondViewport=$beyond together",
  async ({ right, beyond }) => {
    const screenshot = vi
      .fn<(options: ScreenshotOptions) => Promise<string>>()
      .mockResolvedValue("pixels");
    const evaluate = vi
      .fn<Page["evaluate"]>()
      .mockResolvedValueOnce([1, 2])
      .mockResolvedValueOnce([3, -1]);
    const page = {
      screenshot,
      evaluate,
      viewport: () => ({ deviceScaleFactor: 2 }),
    } as unknown as Page;
    const probe: Probe = {
      label: "li",
      kind: "before",
      marker: { x: -3.5, y: 0.5, width: 3, height: 3 },
      text: { x: 2.5, y: 1.5, width: 7, height: 4 },
      split: 4,
      indent: null,
      double: false,
    };

    expect(
      await readMarkerPixels(page, probe, {
        x: 10.25,
        y: 20.25,
        top: 0,
        bottom: 100,
        left: 0,
        right,
      }),
    ).toEqual({
      x: 23,
      caps: 24,
      middle: 24,
    });
    expect(screenshot.mock.calls.flat()).toEqual([
      {
        clip: { x: 13, y: 22, width: 7, height: 4 },
        encoding: "base64",
        captureBeyondViewport: beyond,
      },
      {
        clip: { x: 7, y: 21, width: 3, height: 3 },
        encoding: "base64",
        captureBeyondViewport: beyond,
      },
    ]);
    expect(evaluate.mock.calls.map(([, png, scale, split]) => ({ png, scale, split }))).toEqual([
      { png: "pixels", scale: 2, split: 3.75 },
      { png: "pixels", scale: 2, split: Infinity },
    ]);
  },
);
