import { afterAll, beforeAll, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";
import type { Browser } from "puppeteer-core";
import { parseTokens, resolveColors, SOURCE } from "../scripts/tokens";
import { launch } from "../scan/markers";

// What a Tailwind consumer's :root holds per theme: the tokens, then the @theme inline block, which
// Tailwind emits there under the same names, then the theme's roles. Each role must resolve to a
// colour, without a cycle through a name the inline block shadows.
const css = readFileSync(join(ROOT, "expert/expert.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const block = (head: RegExp) => parseTokens(`@theme {${head.exec(css)![1]}}`);
const light = block(/:root,\s*\[data-theme="light"\]\s*\{([^}]*)\}/);
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
  const select = readFileSync(join(ROOT, "elements/select.css"), "utf8").replace(
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

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(() => browser?.close());

// A light island inside a night page takes every light role, the light colour scheme, the day text
// colour (body hands down night ink, as in the apps) and the light select chevron, as a light page
// does. A dark element inside a light page keeps the page's roles (a night slide). Read in Chrome
// from tokens.root.css, select.css and expert.css as written (the browser skips @theme).
test("a data-theme=light element under a night html takes the light roles", async () => {
  const tab = await browser.newPage();
  const sheet = ["generated/tokens.root.css", "elements/select.css"]
    .map((f) => readFileSync(join(ROOT, f), "utf8"))
    .join("");
  const read = async (outer: string, inner: string) => {
    await tab.setContent(`<!doctype html><html data-theme="${outer}"><head><style>${sheet}${css}
body { color: var(--foreground) }</style></head><body><div data-theme="${inner}"><main>
<select class="form-input"></select></main></div></body></html>`);
    return tab.evaluate((keys) => {
      const s = getComputedStyle(document.querySelector("main")!);
      return {
        roles: keys.map((k) => `${k}: ${s.getPropertyValue(k).trim()}`),
        color: s.color,
        scheme: s.colorScheme,
        chevron: getComputedStyle(document.querySelector("select")!).backgroundImage,
      };
    }, Object.keys(dark));
  };
  const [day, night] = [await read("light", "light"), await read("dark", "dark")];
  for (const key of ["roles", "color", "scheme", "chevron"] as const)
    expect(night[key]).not.toEqual(day[key]);
  expect(await read("dark", "light")).toEqual(day);
  expect(await read("light", "dark")).toEqual(day);
  await tab.close();
});

test("every text-foreground step from /20 to /65 takes the dim floor", () => {
  const listed = [
    ...css.matchAll(/\.text-foreground\\\/(\d+) \{\s*color: [^;]*max\(\1%, var\(--dim-floor\)\)/g),
  ].map((m) => Number(m[1]));
  expect(listed).toEqual([20, 25, 30, 35, 40, 45, 50, 55, 60, 65]);
});

// The theme switch shows one icon before any script runs: the moon by day, the sun by night.
const header = readFileSync(join(ROOT, "expert/header.css"), "utf8");
test("ThemeToggle shows the moon by day and the sun by night without its script", async () => {
  const tab = await browser.newPage();
  const shown = async (theme: string) => {
    await tab.setContent(`<!doctype html><html data-theme="${theme}"><head><style>${header}</style></head>
<body><button id="theme-toggle"><svg id="sun-icon"></svg><svg id="moon-icon"></svg></button></body></html>`);
    return tab.evaluate(() =>
      ["sun-icon", "moon-icon"].filter(
        (id) => getComputedStyle(document.getElementById(id)!).display !== "none",
      ),
    );
  };
  expect(await shown("light")).toEqual(["moon-icon"]);
  expect(await shown("dark")).toEqual(["sun-icon"]);
  await tab.close();
});

// night.css serves pages without expert.css, so it repeats the day roles for a light island.
test("night.css gives a light island inside night expert.css's day roles", () => {
  const nightCss = readFileSync(join(ROOT, "tokens/night.css"), "utf8");
  const island = parseTokens(
    `@theme {${/\[data-hw-night\] \[data-theme="light"\]\s*\{([^}]*)\}/.exec(nightCss)![1]}}`,
  );
  const roles = ["--background", "--foreground", "--accent", "--muted", "--border"];
  expect(roles.filter((k) => !(k in island))).toEqual([]);
  // Resolved from the tokens alone, as on a page without Tailwind.
  const copy = resolveColors({
    ...parseTokens(readFileSync(SOURCE, "utf8")),
    ...island,
    ...Object.fromEntries(roles.map((k) => [`--color-role${k}`, `var(${k})`])),
  });
  const day = root(light);
  for (const k of roles) expect([k, copy[`--color-role${k}`]]).toEqual([k, day(k)]);
});
