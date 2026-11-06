import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";
import { parseTokens, resolveColors, SOURCE } from "../scripts/tokens";
import { launch } from "../scan/markers";

// What a Tailwind consumer's :root holds per theme: the tokens, then the @theme inline block, which
// Tailwind emits there under the same names, then the theme's roles. Each role must resolve to a
// colour, without a cycle through a name the inline block shadows.
const css = readFileSync(join(ROOT, "expert/expert.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const block = (head: RegExp) => parseTokens(`@theme {${head.exec(css)![1]}}`);
const light = block(/\[data-theme="light"\]\s*\{([^}]*)\}/);
// On a night page both blocks match html, so night keeps every light role it does not set.
const dark = { ...light, ...block(/html\[data-theme="dark"\]\s*\{([^}]*)\}/) };
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
  expect(value("--hw-muted")).toBe(token["--color-muted"]);
});

test("every light and dark role resolves to a colour", () => {
  for (const roles of [light, dark]) {
    const value = root(roles);
    for (const [k, v] of Object.entries(roles))
      if (!/^\d/.test(v)) expect(value(k)).toMatch(/^#[0-9a-f]{6}$/);
  }
});

test("the select chevron is border-strong on light and night-muted on night", () => {
  const select = readFileSync(join(ROOT, "expert/select.css"), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const strokes = [...select.matchAll(/stroke='%23([0-9a-f]{6})'/g)].map(([, hex]) => `#${hex}`);
  expect(strokes).toEqual([token["--color-border-strong"], token["--color-night-muted"]]);
});

test("teal, purple, rust and slate equal no error, warning or success", () => {
  for (const roles of [light, dark]) {
    const value = root(roles);
    const status = ["--error", "--warning", "--success"].map(value);
    for (const hue of ["--hue-teal", "--hue-purple", "--hue-rust", "--hue-slate"])
      expect(status).not.toContain(value(hue));
  }
});

// A light island inside a night page takes every light role, the light colour scheme and the light
// select chevron, as a light page does. A dark element inside a light page keeps the page's roles
// (a night slide). Read in Chrome from tokens.root.css, select.css and expert.css as written (the
// browser skips @theme).
test("a data-theme=light element under a night html takes the light roles", async () => {
  const browser = await launch();
  const tab = await browser.newPage();
  const sheet = ["generated/tokens.root.css", "expert/select.css"]
    .map((f) => readFileSync(join(ROOT, f), "utf8"))
    .join("");
  const read = async (outer: string, inner: string) => {
    await tab.setContent(`<!doctype html><html data-theme="${outer}"><head><style>${sheet}${css}</style>
</head><body><div data-theme="${inner}"><main><select class="form-input"></select></main></div></body></html>`);
    return tab.evaluate((keys) => {
      const s = getComputedStyle(document.querySelector("main")!);
      const chevron = getComputedStyle(document.querySelector("select")!).backgroundImage;
      return [
        ...keys.map((k) => `${k}: ${s.getPropertyValue(k).trim()}`),
        chevron.match(/stroke='%23(\w+)'/)![1],
        s.colorScheme,
      ];
    }, Object.keys(dark));
  };
  const [day, night] = [await read("light", "light"), await read("dark", "dark")];
  expect([day.at(-2), night.at(-2), night.at(-1)]).toEqual(["8c949d", "cecfd1", "dark"]);
  expect(await read("dark", "light")).toEqual(day);
  expect(await read("light", "dark")).toEqual(day);
  await browser.close();
});
