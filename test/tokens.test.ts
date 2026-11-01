import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { parseTokens, resolveColors, rgb, SOURCE } from "../scripts/tokens";

const css = readFileSync(SOURCE, "utf8");
const tokens = parseTokens(css);
const colors = resolveColors(tokens);
const alias = (k: string) => /^var\(--color-[\w-]+\)$/.test(tokens[k]);

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
  expect(Object.keys(tokens)).toHaveLength(152);
  expect(tokens["--color-teal"]).toBe("#1a7285");
});

test("mixes color-mix() tokens in sRGB", () => {
  expect(colors["--color-night-ink"]).toBe("#ebeced"); // white 92 % on night
  expect(colors["--color-subtle"]).toBe(colors["--color-muted"]); // former name
});

test("holds 29 brand colours, a former name adding none", () => {
  const own = Object.keys(colors).filter((k) => !alias(k));
  expect(own).toHaveLength(29);
  expect(new Set(own.map((k) => colors[k])).size).toBe(29);
});

test("every role clears WCAG AA: text on light 4.5:1 on bg and white, night on night and night-2", () => {
  const rows = [...css.matchAll(/^\s*([\w-]+)\s*\|\s*([\w-]+)\s*\|\s*([\w-]+)\s*(?:\*\/)?$/gm)];
  expect(rows).toHaveLength(7);
  for (const [, , text, night] of rows) {
    for (const ground of ["bg", "white"])
      expect(contrast(colors[`--color-${text}`], colors[`--color-${ground}`])).toBeGreaterThan(4.5);
    for (const ground of ["night", "night-2"])
      expect(contrast(colors[`--color-${night}`], colors[`--color-${ground}`])).toBeGreaterThan(
        4.5,
      );
  }
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
