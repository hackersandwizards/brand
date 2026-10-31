import { expect, test } from "bun:test";
import { pruned, unlisted } from "../scripts/scan";

const report = (duplicates: string[], skipped: string[] = []) => ({
  skipped,
  duplicates: Object.fromEntries(duplicates.map((d) => [d, []])),
});
const allow = { card: "r" };

test("flags an unlisted duplicate", () => {
  expect(unlisted(report(["card"]), allow)).toEqual([]);
  expect(unlisted(report(["card", "pill"]), allow)).toHaveLength(1);
});

test("tightening drops entries no longer found, never adds one", () => {
  expect(pruned(report(["card", "pill"]), allow)).toEqual({ card: "r" });
  expect(pruned(report([]), allow)).toEqual({});
});

test("tightening with a repo skipped keeps every entry", () => {
  expect(pruned(report([], ["talks"]), allow)).toEqual({ card: "r" });
});
