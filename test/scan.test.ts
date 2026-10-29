import { expect, test } from "bun:test";
import { scanSource, tighten, violations, type Allowlist } from "../scripts/scan";

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

const report = (files: Record<string, number>, duplicates: string[] = []) =>
  ({
    date: "",
    repos: {},
    skipped: [],
    files: Object.fromEntries(
      Object.entries(files).map(([k, hex]) => [k, { hex, tokenHex: 0, font: 0, palette: 0 }]),
    ),
    duplicates: Object.fromEntries(duplicates.map((d) => [d, []])),
  }) as Parameters<typeof violations>[0];
const allow: Allowlist = {
  files: { "os:a.css": { hex: 2, tokenHex: 0, font: 0, palette: 0, reason: "r" } },
  duplicates: { card: "r" },
};

test("flags a count above its entry, an unlisted file and an unlisted duplicate", () => {
  expect(violations(report({ "os:a.css": 2 }, ["card"]), allow)).toEqual([]);
  expect(violations(report({ "os:a.css": 3, "os:b.css": 1 }, ["pill"]), allow)).toHaveLength(3);
});

test("tightening lowers and drops entries, never raises or adds", () => {
  expect(tighten(report({ "os:a.css": 5, "os:b.css": 1 }, ["pill"]), allow)).toEqual({
    files: { "os:a.css": { hex: 2, tokenHex: 0, font: 0, palette: 0, reason: "r" } },
    duplicates: {},
  });
  expect(tighten(report({ "os:a.css": 1 }), allow).files["os:a.css"].hex).toBe(1);
  expect(tighten(report({}), allow).files).toEqual({});
});

test("tightening with a repo skipped keeps every allowlisted duplicate", () => {
  const skipped = { ...report({}), skipped: ["talks"] };
  expect(tighten(skipped, allow).duplicates).toEqual({ card: "r" });
});
