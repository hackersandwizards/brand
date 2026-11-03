import { expect, test } from "bun:test";
import theme from "../generated/code-theme.json";
import { codeClasses } from "../elements/code";
import { colors } from "../generated/tokens";

const span = (color: string, fontStyle = 0) => {
  const node = { properties: { style: `color:${color}` } as Record<string, unknown> };
  codeClasses.span(node, 0, 0, node, { color, fontStyle });
  return node.properties;
};

test("every colour of code-theme.json becomes a class, never an inline style", () => {
  const colours = new Set(theme.tokenColors.map((t) => t.settings.foreground.toUpperCase()));
  expect(colours.size).toBeGreaterThan(0);
  for (const colour of colours) expect(span(colour).style).toBeUndefined();
  expect(span("#B97AF1", 3)).toEqual({ class: "hw-code-keyword hw-code-italic hw-code-bold" });
  expect(span(theme.colors["editor.foreground"])).toEqual({});
});

test("a colour outside the code palette fails instead of turning grey", () => {
  expect(() => span("#F97583")).toThrow("no code palette colour");
});

test("the block takes hw-code and drops the theme's inline ground", () => {
  const pre = {
    properties: { class: "astro-code hw-code-theme", style: "background:#0b1118" } as Record<
      string,
      unknown
    >,
  };
  codeClasses.pre(pre);
  expect(pre.properties).toEqual({ class: "astro-code hw-code-theme hw-code" });
});

test("the block's class is set once, even where the theme's name already gave it", () => {
  const pre = { properties: { class: "astro-code hw-code" } as Record<string, unknown> };
  codeClasses.pre(pre);
  expect(pre.properties.class).toBe("astro-code hw-code");
});

test("the terminal's 16 ANSI colours are core colours", () => {
  const core = new Set(Object.values(colors).map((c) => c.toLowerCase()));
  const ansi = Object.entries(theme.colors).filter(([k]) => k.startsWith("terminal.ansi"));
  expect(ansi).toHaveLength(16);
  for (const [k, c] of ansi)
    expect({ k, core: core.has(c.toLowerCase()) }).toEqual({ k, core: true });
});
