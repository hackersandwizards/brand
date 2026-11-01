import { expect, test } from "bun:test";
import {
  fnColour,
  scanned,
  scanSource,
  onLadder,
  tighten,
  violations,
  type Allowlist,
} from "../scan/colours";

const zero = { hex: 0, tokenHex: 0, font: 0, palette: 0, rgb: 0, radius: 0, shadow: 0 };

test("counts off-token hex, token hex, off-brand fonts and palette classes", () => {
  const { counts, hexes, fonts } = scanSource(
    `.a { color: #123456; background: #1A7285; font-family: Georgia, serif; }
     .b { font-family: var(--font-sans); } /* #ffffff in a comment */
     <div class="bg-red-500 text-slate-700" id="#add">
     .c { box-shadow: 0 0 4px #12345680; color: #1A728580; border-color: #3458; }`,
    ".astro",
  );
  expect(counts).toEqual({ ...zero, hex: 2, tokenHex: 2, font: 1, palette: 2, shadow: 1 });
  expect(hexes).toEqual(["#123456", "#3458"]);
  expect(fonts).toEqual(["Georgia"]);
});

test("reads styling wherever it sits, never tests, builds, hub tooling or prose", () => {
  expect(
    [
      "src/a.css",
      "app/page.tsx",
      "scripts/x.py",
      "public/a.svg",
      "docs/tracking/r.html",
      "docs/tracking/x.js",
      "docs/decisions/items.js",
      "src/content/documents/x.html",
      "src/styles/brand/tokens.css",
      "public/site.webmanifest",
    ].every(scanned),
  ).toBe(true);
  expect(
    [
      "src/a.test.ts",
      "dist/a.css",
      "node_modules/x/a.css",
      ".claude/skills/parallel-session/page.html",
      "docs/tracking/decisions/items.js",
      "README.md",
      "public/a.png",
      "brand-colours.json",
    ].some(scanned),
  ).toBe(false);
});
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
  expect(tighten({ "a.css": { ...zero, hex: 1, rgb: 1 } }, allow)["a.css"].rgb).toBe(0);
});

test("a four-digit hex of letters alone counts where its colour part is a grey", () => {
  expect(
    scanSource(".a { color: #ffff; background: #ccca; border: #eee; }", ".css").counts,
  ).toEqual({ ...zero, hex: 2, tokenHex: 1 });
});

test("an entry written before rgb, radius and shadow existed allows none of them", () => {
  const old = { "a.css": { hex: 1, tokenHex: 0, font: 0, palette: 0, reason: "r" } };
  expect(violations({ "a.css": { ...zero, hex: 1 } }, old, old)).toEqual([]);
  expect(violations({ "a.css": { ...zero, hex: 1, rgb: 1 } }, old, old)).toHaveLength(1);
});

test("rgb() and hsl() literals count like hex: off-token as rgb, a token's colour as tokenHex", () => {
  expect(fnColour("rgb", "26, 114, 133")).toBe("#1a7285");
  expect(fnColour("rgba", "26 114 133 / 0.4")).toBe("#1a7285");
  expect(fnColour("hsl", "0, 0%, 100%")).toBe("#ffffff");
  expect(fnColour("rgb", "var(--x)")).toBeUndefined();
  const { counts, hexes } = scanSource(
    `.a { color: rgba(255, 214, 0, 0.5); background: rgb(26 114 133 / 40%);
       border-color: hsl(120, 100%, 25%); outline-color: rgb(var(--c)); }
     const x = \`rgba(\${r}, 0, 0, 1)\`;`,
    ".tsx",
  );
  expect(counts).toEqual({ ...zero, rgb: 2, tokenHex: 1 });
  expect(hexes).toEqual(["rgba(255, 214, 0, 0.5)", "hsl(120, 100%, 25%)"]);
});

test("a radius or shadow off the tokens counts, a token, a keyword or a reference does not", () => {
  const ok = scanSource(
    `.a { border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,.05); }
     .b { border-radius: var(--radius-brand); box-shadow: var(--shadow-overlay); border-top-left-radius: 0; }
     .c { --card-radius: 20px 5px; box-shadow: none; }
     const s = { borderRadius: 9999, boxShadow: "0 18px 46px rgb(25 40 58 / 0.1)" };
     <div class="rounded-sm rounded-brand rounded-full shadow-card shadow-overlay rounded-[var(--radius-sm)]">
     const t = { borderRadius: radius, boxShadow: \`\${shadow}\` };`,
    ".tsx",
  ).counts;
  expect(ok).toEqual(zero);
  const bad = scanSource(
    `.a { border-radius: 6px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
     .b { --chip-radius: 4px; }
     const s = { borderRadius: 6, boxShadow: "0 0 0 3px #123456" };
     <div class="rounded-lg md:rounded-t-xl shadow-md rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.3)]">`,
    ".tsx",
  ).counts;
  expect(bad).toEqual({ ...zero, radius: 6, shadow: 4 });
});

test("an SVG may write a token hex and the tint ladder, never an off-ladder colour", () => {
  for (const tint of ["#fef8ee", "#fbd89d", "#a2272c", "#864618", "#f2fdf6", "#f7f1fd", "#c6dce0"])
    expect({ tint, on: onLadder(tint) }).toEqual({ tint, on: true });
  expect(onLadder("#f52849")).toBe(false);
  expect(onLadder("#1a1a1a")).toBe(false);
  expect(
    scanSource(
      '<svg><rect fill="#1A7285"/><rect fill="#FEF8EE"/><rect fill="#F52849"/></svg>',
      ".svg",
    ).counts,
  ).toEqual({ ...zero, hex: 1 });
  expect(scanSource('<rect fill="#FEF8EE"/>', ".html").counts).toEqual({ ...zero, hex: 1 });
});

test("skips the documents engine's style elements in a composed document, reads the rest", () => {
  const css = ":root { --color-teal: #1a7285; --radius: 5px 20px; } .x { color: #123456; }";
  const engine = `<style data-hw-document>${css}</style><style data-hw-onepager>${css}</style>`;
  expect(scanSource(`<html><head>${engine}</head><body></body></html>`, ".html").counts).toEqual(
    zero,
  );
  // The same rules in a style element the engine did not write, and beside the engine's, count.
  const hand = scanSource(`<html><head><style>${css}</style></head></html>`, ".html").counts;
  expect(hand).toEqual({ ...zero, hex: 1, tokenHex: 1, radius: 1 });
  expect(scanSource(`${engine}<p style="color: #123456">x</p>`, ".html").counts).toEqual({
    ...zero,
    hex: 1,
  });
});

// The decision rows quote radii as prose: skipped there, the same radius in another tracking file
// still counts.
test("a radius in the decision rows is skipped, the same radius beside them is read", () => {
  const row = 'context: "border-radius: 4px on the pill, rounded-md"';
  expect(scanned("docs/tracking/decisions/items.js")).toBe(false);
  expect(scanned("docs/tracking/x.js")).toBe(true);
  expect(scanSource(row, ".js").counts.radius).toBeGreaterThan(0);
});
