import { assert, expect, test } from "vitest";
import {
  colourPropertyWords,
  customPropertyWords,
  expressionPropWords,
  extractFontFamilies,
  extractFunctionColours,
  extractHexColours,
  extractInterpolatedWords,
  extractNamedColours,
  extractShorthandFonts,
  isComponentColourProp,
  isShortHexColour,
  scanFonts,
  scanStyleRadiiAndShadows,
  scanUtilityRadiiAndShadows,
  stripSource,
  valueStrings,
  type Counts,
} from "../scan/colour-scan";
import { isTokenValue, resolveNamedColour, summariseColours } from "../scan/colour-tokens";
import {
  countViolations,
  entryViolations,
  grownEntryMetrics,
  grownMetrics,
  parseAllowlistEntry,
  validateColourCounts,
} from "../scan/colours";

const zero: Counts = { hex: 0, tokenHex: 0, font: 0, palette: 0, rgb: 0, radius: 0, shadow: 0 };

test("removes engine styles and script comments while retaining live markup URLs", () => {
  const src =
    "<style data-hw-page>.page { color: red; }</style><a href=//host/x></a><script>// red\nlet n = 1;</script>";
  expect(stripSource(src, ".html")).toBe("<a href=//host/x></a><script>\nlet n = 1;</script>");
});

test("blanks shadow declaration values without shifting the following declaration", () => {
  expect(scanStyleRadiiAndShadows("box-shadow: 3px red; border-radius: 6px;")).toEqual({
    src: "box-shadow:        ; border-radius: 6px;",
    shadow: 1,
    radius: 1,
  });
});

test("counts sized utility classes and blanks the entire shadow class", () => {
  expect(scanUtilityRadiiAndShadows("rounded-md shadow-sm tail")).toEqual({
    src: "rounded-md           tail",
    radius: 1,
    shadow: 1,
  });
});

test.each([
  { hex: "128", before: "Issue ", expected: false },
  { hex: "128", before: "fill=", expected: true },
  { hex: "fab", before: "fill: url(", expected: false },
  { hex: "1a2", before: "See ", expected: true },
])('classifies #$hex after "$before"', ({ hex, before, expected }) => {
  expect(isShortHexColour(hex, before)).toBe(expected);
});

test("returns canonical hex values and keeps alpha in the diagnostic", () => {
  expect(extractHexColours("color: #F4A3C2DD; fill: #1a2;")).toEqual([
    { kind: "hex", value: "#f4a3c2", literal: "#f4a3c2dd" },
    { kind: "hex", value: "#11aa22", literal: "#11aa22" },
  ]);
});

test("converts RGB literals and reports modern functions without a converted value", () => {
  expect(extractFunctionColours("rgb(26 114 133); oklch(70% 0.2 20); rgb(var(--sample))")).toEqual([
    { kind: "rgb", literal: "rgb(26 114 133)", value: "#1a7285" },
    { kind: "rgb", literal: "oklch(70% 0.2 20)" },
  ]);
});

test("reads expression branch strings while skipping lookup keys and call arguments", () => {
  const expression = '{ready ? (on ? "red" : pick("black")) : keys["blue"] || "white"}';
  expect(valueStrings(expression).map(([literal]) => literal)).toEqual(['"red"', '"white"']);
});

test("keeps source offsets on interpolation results and surrounding words", () => {
  expect(extractInterpolatedWords('red ${x ? "white" : hidden} blue', 10)).toEqual([
    { word: "white", at: 21 },
    { word: "red", at: 10 },
    { word: "blue", at: 38 },
  ]);
});

test.each([
  { src: '<Pill color="red" />', expected: true },
  { src: '<path color="red" />', expected: false },
  { src: 'const color="red";', expected: false },
])("identifies component role syntax in $src", ({ src, expected }) => {
  const match = /color=/.exec(src);
  assert(match, "The fixture must contain a color= match");
  expect(isComponentColourProp(src, match, ".tsx")).toBe(expected);
});

test("reads a literal result from a brace prop after a call expression", () => {
  const src = '<path stroke={palette.find(key) || "navy"} />';
  const match = /stroke=/.exec(src);
  assert(match, "The fixture must contain a stroke= match");
  expect(expressionPropWords(src, match, ".tsx")).toEqual([{ word: "navy", at: 36 }]);
});

test.each([
  { src: 'color: "navy";', expected: [{ word: "navy", at: 8 }] },
  { src: "color: navy;", expected: [] },
  { src: 'color: "navy" | "red";', expected: [] },
])("reads script colour values in $src", ({ src, expected }) => {
  const match = /color: /.exec(src);
  assert(match, "The fixture must contain a color property");
  expect(colourPropertyWords(src, match, ".ts")).toEqual(expected);
});

test.each([
  { ext: ".css", expected: [{ word: "navy", at: 7 }] },
  { ext: ".ts", expected: [{ word: "red", at: 21 }] },
])("selects the valid custom-property form in $ext", ({ ext, expected }) => {
  expect(customPropertyWords('--one: navy; --two: "red";', ext)).toEqual(expected);
});

test("deduplicates named words by position while retaining repeated names at different offsets", () => {
  expect(extractNamedColours("color: color-mix(in srgb, navy, navy);", ".css")).toEqual([
    { kind: "hex", literal: "navy", value: "navy" },
    { kind: "hex", literal: "navy", value: "navy" },
  ]);
});

test("reports leading families set on text while accepting brand fallback face declarations", () => {
  const src =
    '@font-face { font-family: "JetBrains Mono Fallback"; } body { font-family: "Courier New", monospace; }';
  expect(extractFontFamilies(src)).toEqual(["Courier New"]);
});

test("reads the family after the size and line height in a quoted script shorthand", () => {
  const src = `font: setFont(); font: 'italic 1rem/1.5 "Courier New", serif';`;
  expect(extractShorthandFonts(src, ".ts")).toEqual(["Courier New"]);
});

test("returns font diagnostics in declaration, shorthand and utility order", () => {
  const src = 'font-serif; font: 16px Arial, sans-serif; font-family: "Courier New";';
  expect(scanFonts(src, ".css")).toEqual(["Courier New", "Arial", "font-serif"]);
});

test("checks generated token keys against the selected family", () => {
  expect(isTokenValue('tokens["--shadow-card"]', "radius")).toBe(false);
});

test.each([
  { word: "White", expected: { kind: "hex", literal: "white", value: "#ffffff" } },
  { word: "constructor", expected: undefined },
])("resolves the colour keyword $word", ({ word, expected }) => {
  expect(resolveNamedColour(word)).toEqual(expected);
});

test("skips an SVG ladder colour while retaining an unconverted modern literal", () => {
  expect(
    summariseColours(
      [
        { kind: "hex", literal: "#fef8ee", value: "#fef8ee" },
        { kind: "rgb", literal: "oklch(70% 0.2 20)" },
      ],
      ".svg",
    ),
  ).toEqual({ counts: { hex: 0, rgb: 1, tokenHex: 0 }, hexes: ["oklch(70% 0.2 20)"] });
});

test("reports count mismatches while exempting named partner marks", () => {
  expect(
    countViolations(
      { "a.css": { ...zero, hex: 2 }, "mark.svg": { ...zero, hex: 5 } },
      { "a.css": { reason: "legacy", rgb: 1 }, "mark.svg": { reason: "mark", partner: "Owner" } },
    ),
  ).toEqual([
    "a.css: hex 2, allowed 0. Reference matching brand tokens from tokens.css or tokens.json in the source that produces the styling.",
    "brand-colours.json: a.css: rgb 0, allowed 1. Run bun run brand-colours --tighten to lower the allowance to the file's count.",
  ]);
});

test("reports missing reason, stale count and misplaced partner on one entry in order", () => {
  expect(entryViolations("a.css", { reason: "", partner: "Owner" }, zero)).toEqual([
    'brand-colours.json: a.css has an undocumented exception. Set its "reason" to explain why the exception is needed.',
    "brand-colours.json: a.css has no off-token findings, so its allowance could hide new ones. Run bun run brand-colours --tighten to drop the entry.",
    'brand-colours.json: a.css: "partner" can only exempt a named third-party SVG mark. Set "partner" to the mark owner\'s name on an SVG entry or remove the field.',
  ]);
});

test("excludes a newly named partner from both metric totals", () => {
  const before = {
    "mark.svg": { hex: 20, reason: "mark" },
    "a.css": { hex: 1, font: 2, reason: "legacy" },
  };
  const after = {
    "mark.svg": { hex: 20, reason: "mark", partner: "Owner" },
    "a.css": { hex: 2, font: 2, reason: "legacy" },
  };
  expect(grownMetrics(after, before)).toEqual(new Set(["hex"]));
});

test("reports growth beyond both a committed allowance and a pin-change ceiling", () => {
  expect(
    grownEntryMetrics(
      { hex: 2, rgb: 5, shadow: 3, reason: "legacy" },
      { hex: 2, rgb: 1, reason: "legacy" },
      { ...zero, rgb: 5, shadow: 2 },
    ),
  ).toEqual(["shadow"]);
});

test("rejects a count above the safe integer range", () => {
  expect(() => validateColourCounts({ hex: 2 ** 53 }, "a.css")).toThrow(
    'a.css: "hex" cannot be used as an allowance. Set it to a non-negative safe integer.',
  );
});

test("defaults a missing reason and preserves extra partner metadata", () => {
  expect(parseAllowlistEntry("mark.svg", { partner: "Owner", review: true })).toEqual({
    partner: "Owner",
    review: true,
    reason: "",
  });
});

test.each([
  {
    label: "an allowance that is an array",
    entry: [],
    message:
      'brand-colours.json: "mark.svg" cannot be read as an allowance. Use an object with metric counts and a "reason" string.',
  },
  {
    label: "a numeric reason",
    entry: { reason: 7 },
    message:
      'brand-colours.json: "mark.svg": "reason" cannot explain the exception in its current form. Set it to a string that explains why the file needs the exception.',
  },
  {
    label: "a numeric partner",
    entry: { reason: "mark", partner: 7 },
    message:
      'brand-colours.json: "mark.svg": "partner" cannot identify the mark owner in its current form. Set it to the owner\'s name as a string for a third-party SVG mark or remove the field.',
  },
])("reports how to fix $label", ({ entry, message }) => {
  expect(() => parseAllowlistEntry("mark.svg", entry)).toThrow(message);
});
