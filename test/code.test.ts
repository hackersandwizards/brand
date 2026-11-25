import { expect, test } from "vitest";
import theme from "../generated/code-theme.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeClasses, codeTokenClasses } from "../elements/code";
import { colors } from "../generated/tokens";
import { definedClasses } from "../scan/elements";
import { ROOT } from "../scripts/git";

test("codeTokenClasses are exactly the token selectors of code.css", () => {
  const css = readFileSync(join(ROOT, "elements/code.css"), "utf8");
  const selectors = definedClasses(css).filter((c) => c.startsWith("hw-code-"));
  expect(new Set(codeTokenClasses)).toEqual(new Set(selectors));
});

const themedToken = (color: string, fontStyle = 0) => {
  const token: Parameters<typeof codeClasses.tokens>[0][number][number] = {
    color,
    fontStyle,
    htmlAttrs: { style: `color:${color}` },
  };
  codeClasses.tokens([[token]]);
  return token;
};

test("every colour of code-theme.json becomes a class, never an inline style", () => {
  const colours = new Set(theme.tokenColors.map((t) => t.settings.foreground.toUpperCase()));
  expect(colours.size).toBeGreaterThan(0);
  for (const colour of colours) {
    const { htmlAttrs, htmlStyle } = themedToken(colour);
    expect({ style: htmlAttrs?.style, override: htmlStyle }).toEqual({
      style: undefined,
      override: {},
    });
  }
  const keyword = themedToken("#B97AF1", 3);
  expect({ attrs: keyword.htmlAttrs, override: keyword.htmlStyle }).toEqual({
    attrs: { class: "hw-code-keyword hw-code-italic hw-code-bold" },
    override: {},
  });
  const foreground = themedToken(theme.colors["editor.foreground"]);
  expect({ attrs: foreground.htmlAttrs, override: foreground.htmlStyle }).toEqual({
    attrs: {},
    override: {},
  });
});

test("codeTokenClasses are exactly the classes the transformer puts on a token", () => {
  const emitted = theme.tokenColors.flatMap((t) =>
    String(themedToken(t.settings.foreground, 7).htmlAttrs?.class).split(" "),
  );
  expect(new Set(codeTokenClasses)).toEqual(new Set(emitted));
});

test("a colour outside the code palette fails instead of turning grey", () => {
  expect(() => themedToken("#F97583")).toThrow("no code palette colour");
});

test("the block's class is set once, even where the theme's name already gave it", () => {
  const pre = { properties: { class: "astro-code hw-code" } };
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

test("a terminal colour outside the roles keeps its inline style, a stray colour still fails", () => {
  const amber = theme.colors["terminal.ansiYellow"];
  const { htmlAttrs, htmlStyle, color, fontStyle } = themedToken(amber, 1);
  expect({ attrs: htmlAttrs, override: htmlStyle, color, fontStyle }).toEqual({
    attrs: { style: `color:${amber}`, class: "hw-code-italic" },
    override: undefined,
    color: amber,
    fontStyle: 1,
  });
  expect(() => themedToken("#F97583")).toThrow("no code palette colour");
});
