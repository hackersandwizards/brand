import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { parseTokens, resolveColors, SOURCE } from "../scripts/tokens";

const tokens = parseTokens(readFileSync(SOURCE, "utf8"));

test("reads every declaration of tokens.css", () => {
  expect(Object.keys(tokens)).toHaveLength(138);
  expect(tokens["--color-teal"]).toBe("#1a7285");
});

test("mixes color-mix() tokens in sRGB", () => {
  const colors = resolveColors(tokens);
  expect(colors["--color-subtle"]).toBe("#5e6975"); // ink 70 % on white
  expect(colors["--color-night-ink"]).toBe("#ebeced"); // white 92 % on night
});
