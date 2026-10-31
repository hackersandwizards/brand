import { expect, test } from "bun:test";
import { scanned, scanSource, tighten, violations, type Allowlist } from "../scan/colours";

test("counts off-token hex, token hex, off-brand fonts and palette classes", () => {
  const { counts, hexes, fonts } = scanSource(
    `.a { color: #123456; background: #1A7285; font-family: Georgia, serif; }
     .b { font-family: var(--font-sans); } /* #ffffff in a comment */
     <div class="bg-red-500 text-slate-700" id="#add">
     .c { box-shadow: 0 0 4px #12345680; color: #1A728580; border-color: #3458; }`,
    ".astro",
  );
  expect(counts).toEqual({ hex: 3, tokenHex: 2, font: 1, palette: 2 });
  expect(hexes).toEqual(["#123456", "#12345680", "#3458"]);
  expect(fonts).toEqual(["Georgia"]);
});

test("reads source files only, never tests, content, builds or brand copies", () => {
  expect(["src/a.css", "app/page.tsx", "scripts/x.py"].every(scanned)).toBe(true);
  expect(
    [
      "src/a.test.ts",
      "src/content/x.ts",
      "dist/a.css",
      "src/styles/brand/tokens.css",
      "README.md",
    ].some(scanned),
  ).toBe(false);
});

const zero = { hex: 0, tokenHex: 0, font: 0, palette: 0 };
const allow: Allowlist = { "a.css": { ...zero, hex: 2, reason: "r" } };

test("flags a count above its entry, an unlisted file, a missing reason and a grown entry", () => {
  expect(violations({ "a.css": { ...zero, hex: 2 } }, allow, allow)).toEqual([]);
  expect(
    violations({ "a.css": { ...zero, hex: 3 }, "b.css": { ...zero, font: 1 } }, allow, allow),
  ).toHaveLength(2);
  expect(violations({}, { "a.css": { ...zero, hex: 2, reason: " " } }, undefined)).toHaveLength(1);
  expect(violations({}, allow, { "a.css": { ...zero, hex: 1, reason: "r" } })).toHaveLength(1);
});

test("tightening lowers and drops entries, never raises or adds", () => {
  expect(tighten({ "a.css": { ...zero, hex: 5 }, "b.css": { ...zero, hex: 1 } }, allow)).toEqual(
    allow,
  );
  expect(tighten({ "a.css": { ...zero, hex: 1 } }, allow)["a.css"].hex).toBe(1);
  expect(tighten({}, allow)).toEqual({});
  expect(tighten({ "b.css": { ...zero, hex: 1 } }, undefined)).toEqual({
    "b.css": { ...zero, hex: 1, reason: "" },
  });
});
