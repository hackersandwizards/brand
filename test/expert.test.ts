import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";
import { parseTokens, resolveColors, SOURCE } from "../scripts/tokens";

// What a Tailwind consumer's :root holds per theme: the tokens, then the @theme inline block, which
// Tailwind emits there under the same names, then the theme's roles. Each role must resolve to a
// colour, without a cycle through a name the inline block shadows.
const css = readFileSync(join(ROOT, "expert/expert.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const block = (head: RegExp) => parseTokens(`@theme {${head.exec(css)![1]}}`);
const light = block(/html\[data-theme="light"\]\s*\{([^}]*)\}/);
const dark = block(/html\[data-theme="dark"\]\s*\{([^}]*)\}/);
const inline = block(/@theme inline\s*\{([^}]*)\}/);
const token = resolveColors(parseTokens(readFileSync(SOURCE, "utf8")));
const root = (roles: Record<string, string>) => {
  const all = { ...parseTokens(readFileSync(SOURCE, "utf8")), ...inline, ...roles };
  const named = Object.entries(roles).filter(([, v]) => !/^\d/.test(v));
  for (const [k] of named) all[`--color-role${k}`] = `var(${k})`;
  // A cycle would recurse without end in resolveColors: name it instead.
  const visit = (k: string, path: string[]): void => {
    if (path.includes(k)) throw new Error(`cycle: ${[...path, k].join(" -> ")}`);
    for (const [, ref] of (all[k] ?? "").matchAll(/var\((--[\w-]+)\)/g)) visit(ref, [...path, k]);
  };
  for (const k of Object.keys(all)) visit(k, []);
  const colors = resolveColors(all);
  return (k: string) => colors[k.startsWith("--color-") ? k : `--color-role${k}`];
};

test("light roles resolve to the token values, without a cycle", () => {
  const value = root(light);
  expect(value("--border")).toBe("#d0d2d8");
  expect(value("--border")).toBe(token["--color-border"]);
  expect(value("--color-border")).toBe("#d0d2d8");
  expect(value("--hue-slate")).toBe("#545861");
  expect(value("--hue-slate")).toBe(token["--color-muted"]);
});

test("every light and dark role resolves to a colour", () => {
  for (const roles of [light, dark]) {
    const value = root(roles);
    for (const [k, v] of Object.entries(roles))
      if (!/^\d/.test(v)) expect(value(k)).toMatch(/^#[0-9a-f]{6}$/);
  }
});
