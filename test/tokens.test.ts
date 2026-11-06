import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { palettes, parseTokens, resolveColors, rgb, SOURCE } from "../scripts/tokens";

const css = readFileSync(SOURCE, "utf8");
const tokens = parseTokens(css);
const colors = resolveColors(tokens);
const alias = (k: string) => /^var\(--color-[\w-]+\)$/.test(tokens[k]);
const { neutrals, hues } = palettes(css);

const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test("reads every declaration of tokens.css", () => {
  expect(Object.keys(tokens)).toHaveLength(165);
  expect(tokens["--color-teal"]).toBe("#1a7285");
});

test("mixes color-mix() tokens in sRGB", () => {
  expect(colors["--color-night-ink"]).toBe("#ebeced"); // white 92 % on night
  expect(colors["--color-subtle"]).toBe(colors["--color-muted"]); // former name
});

test("holds 30 brand colours, a former name adding none", () => {
  const own = Object.keys(colors).filter((k) => !alias(k));
  expect(own).toHaveLength(30);
  expect(new Set(own.map((k) => colors[k])).size).toBe(30);
});

test("every role clears WCAG AA: text on light 4.5:1 on bg and white, night on night and night-2", () => {
  expect(hues).toHaveLength(7);
  for (const { text, night } of hues) {
    for (const ground of ["bg", "white"])
      expect(contrast(colors[`--color-${text}`], colors[`--color-${ground}`])).toBeGreaterThan(4.5);
    for (const ground of ["night", "night-2"])
      expect(contrast(colors[`--color-${night}`], colors[`--color-${ground}`])).toBeGreaterThan(
        4.5,
      );
  }
});

test("the two palettes hold every brand colour, and name only brand colours", () => {
  const cells = new Set([
    ...neutrals.flatMap((r) => [r.day, r.night]),
    ...hues.flatMap((r) => [r.base, r.text, r.night]),
    "teal-light",
    "purple-light",
  ]);
  cells.delete("-");
  const own = Object.keys(colors)
    .filter((k) => !alias(k))
    .map((k) => k.replace("--color-", ""));
  expect([...cells].sort()).toEqual(own.sort());
  expect(neutrals.every((r) => r.day !== "-" || r.night !== "-")).toBe(true);
});

test("every code colour clears 4.5:1 on night and night-2", () => {
  const roles = Object.keys(tokens).filter((k) => k.startsWith("--code-") && k !== "--code-bg");
  expect(roles).toHaveLength(6);
  for (const k of roles)
    for (const ground of ["night", "night-2"])
      expect(contrast(colors[tokens[k].slice(4, -1)], colors[`--color-${ground}`])).toBeGreaterThan(
        4.5,
      );
});

test("every chart series clears 3:1 on white", () => {
  for (let i = 1; i <= 6; i++) {
    const ref = tokens[`--chart-${i}`].match(/^var\((--color-[\w-]+)\)$/)![1];
    expect(contrast(colors[ref], "#ffffff")).toBeGreaterThan(3);
  }
});

test("print.css's page-box variables match its @page rule, which cannot read them", () => {
  const print = readFileSync(SOURCE.replace("tokens.css", "print.css"), "utf8");
  const v = (name: string) => print.match(new RegExp(`${name}: ([^;]+);`))![1];
  expect(print).toContain(
    `@page {\n  size: A4;\n  margin: 14mm 0 ${v("--print-margin-bottom")};\n}`,
  );
  expect(v("--print-page-height")).toBe("297mm"); // A4
});
