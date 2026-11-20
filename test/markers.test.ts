import { expect, test } from "vitest";
import { applyExceptions, failing, type Reading } from "../scan/markers";

test("a page path with a malformed escape is matched as it stands", () => {
  const reading = { page: "http://h/caf%E9/", offset: 3, indent: null, double: false } as Reading;
  const { kept } = applyExceptions([reading], { "/caf*/": { reason: "kept", off: 1 } });
  expect(kept).toEqual([reading]);
});

test("a reading with no ink on either side fails", () => {
  const r: Reading = {
    page: "x",
    label: "x",
    kind: "glyph",
    scale: 1,
    newline: false,
    offset: NaN,
    indent: null,
    double: false,
  };
  expect(failing(r)).toBe(true);
});

// A declared exception keeps its page's off readings up to its count, and reports itself once it
// keeps nothing, so a fixed page drops it.
test("marker exceptions keep their readings, fail over their count and report a stale entry", () => {
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
  const story = "http://127.0.0.1:1/catalog/stories/Slides/Slide%20types/content-slide/at-rest/";
  const readings = [off(story), off(story), off("http://127.0.0.1:1/units/x/")];
  const measured = [...readings.map((r) => r.page), "http://127.0.0.1:1/x/ground-intro/"];
  const kept = applyExceptions(
    [...readings, { ...off(story), double: true }],
    {
      "**/Slide types/content-slide/at-rest/": { reason: "engine rounding", off: 2 },
      "**/ground-intro/": { reason: "engine rounding", off: 1 },
      "**/not-measured/": { reason: "engine rounding", off: 1 },
    },
    measured,
  );
  expect(kept.kept.length).toBe(2);
  // The item with two markers stays bad; a page not measured in this run makes no entry stale.
  expect(kept.bad.map((r) => r.page)).toEqual(["http://127.0.0.1:1/units/x/", story]);
  expect(kept.findings).toEqual([
    'markers exception "**/ground-intro/" is stale: it keeps no off reading',
  ]);
  const over = applyExceptions(readings, {
    "**/at-rest/": { reason: "engine rounding", off: 1 },
    "**/units/**": { reason: "", off: 1 },
  });
  expect(over.findings).toEqual([
    'markers exception "**/at-rest/": 2 off readings, 1 kept',
    'markers exception "**/units/**": needs a "reason" and an "off" count of at least 1',
  ]);
  expect(applyExceptions(readings).bad.length).toBe(3);
  // Fewer readings than "off" pass, since a run with fewer scales or pages counts fewer.
  const slack = (off: number) =>
    applyExceptions(readings, { "**/at-rest/": { reason: "engine rounding", off } }).findings;
  expect(slack(3)).toEqual([]);
  expect(slack(2)).toEqual([]);
});
