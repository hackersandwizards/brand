import { codeToHtml } from "shiki";
import { expect, test } from "vitest";
import theme from "../generated/code-theme.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeClasses, codeTokenClasses } from "../elements/code";
import { colors } from "../generated/tokens";
import { definedClasses } from "../scan/element-classes";
import { ROOT } from "../scripts/git";

test("codeTokenClasses are exactly the token selectors of code.css", () => {
  const css = readFileSync(join(ROOT, "elements/code.css"), "utf8");
  const selectors = definedClasses(css).filter((c) => c.startsWith("hw-code-"));
  expect(new Set(codeTokenClasses)).toEqual(new Set(selectors));
});

const themedSpan = (color: string, fontStyle = 0) => {
  const node = { properties: { style: `color:${color}` } as Record<string, unknown> };
  codeClasses.span(node, 0, 0, node, { color, fontStyle });
  return node.properties;
};

test("every colour of code-theme.json becomes a class, never an inline style", () => {
  const colours = new Set(theme.tokenColors.map((t) => t.settings.foreground.toUpperCase()));
  expect(colours.size).toBeGreaterThan(0);
  for (const colour of colours) expect(themedSpan(colour)).not.toHaveProperty("style");
  expect(themedSpan("#B97AF1", 3)).toEqual({
    class: "hw-code-keyword hw-code-italic hw-code-bold",
  });
  expect(themedSpan(theme.colors["editor.foreground"])).toEqual({});
});

test("codeTokenClasses are exactly the classes the transformer puts on a token", () => {
  const emitted = theme.tokenColors.flatMap((t) =>
    String(themedSpan(t.settings.foreground, 7).class).split(" "),
  );
  expect(new Set(codeTokenClasses)).toEqual(new Set(emitted));
});

test("a colour outside the code palette fails instead of turning grey", () => {
  expect(() => themedSpan("#F97583")).toThrow("no code palette colour");
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
  const token = { color: amber, fontStyle: 1 };
  const node = { properties: { style: `color:${amber}` } };
  codeClasses.span(node, 0, 0, node, token);
  expect({ properties: node.properties, token }).toEqual({
    properties: { style: `color:${amber}`, class: "hw-code-italic" },
    token: { color: amber, fontStyle: 1 },
  });
  expect(() => themedSpan("#F97583")).toThrow("no code palette colour");
});

test("the span hook keeps an earlier transformer's class and clears its inline style", async () => {
  const html = await codeToHtml("return", {
    lang: "javascript",
    theme: { ...theme, type: "dark" },
    transformers: [
      {
        span(node) {
          node.properties.class = ["earlier"];
          node.properties.style = "font-weight:500";
        },
      },
      codeClasses,
    ],
  });
  expect(html).toContain('<span class="earlier hw-code-keyword">return</span>');
});
