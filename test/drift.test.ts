import { expect, test } from "bun:test";
import manifest from "../manifest.json";
import { findings } from "../scan/drift";

const brand = "tokens/tokens.css";
const real = Bun.file(new URL(`../${brand}`, import.meta.url));
const bytes = Buffer.from(await real.arrayBuffer());
const list = { reason: "served", copies: { "tokens.css": brand } };

test("a copy identical to its brand file passes", () => {
  expect(manifest.files.some((f) => f.path === brand)).toBe(true);
  expect(findings("public/brand-copies.json", list, () => bytes)).toEqual([]);
});

test("a changed, missing or unknown copy and a list without a reason fail", () => {
  expect(findings("public/brand-copies.json", list, () => Buffer.from("x"))).toEqual([
    `public/tokens.css: differs from brand ${brand}`,
  ]);
  expect(findings("brand-copies.json", list, () => undefined)).toEqual(["tokens.css: missing"]);
  expect(
    findings("brand-copies.json", { reason: " ", copies: { "a.css": "no/such" } }, () => bytes),
  ).toHaveLength(2);
});
