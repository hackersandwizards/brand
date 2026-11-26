import { defined } from "@hackersandwizards/scaffolding/defined";
import { afterAll, beforeAll, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../scripts/git";
import type { Browser } from "puppeteer-core";
import { parseTokens } from "../../scripts/tokens";
import { launch } from "../../scan/browser";

declare const browserDefined: typeof defined;

const css = readFileSync(join(ROOT, "expert/expert.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const block = (head: RegExp) =>
  parseTokens(`@theme {${defined(head.exec(css)?.[1], `expert role block matching ${head}`)}}`);
const light = block(/:root,\s*\[data-theme="light"\]\s*\{([^}]*)\}/);
// On a night page both blocks match html, so night keeps every light role it does not set.
const dark = { ...light, ...block(/html\[data-theme="dark"\]\s*\{([^}]*)\}/) };

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
  await tab.evaluate(`globalThis.browserDefined = ${defined.toString()}`);
  const sheet = ["generated/tokens.root.css", "elements/select.css"]
    .map((f) => readFileSync(join(ROOT, f), "utf8"))
    .join("");
  const read = async (outer: string, inner: string) => {
    await tab.setContent(`<!doctype html><html data-theme="${outer}"><head><style>${sheet}${css}
body { color: var(--foreground) }</style></head><body><div data-theme="${inner}"><main>
<select class="form-input"></select></main></div></body></html>`);
    return tab.evaluate((keys) => {
      const main = browserDefined(document.querySelector("main"), "expert main");
      const select = browserDefined(document.querySelector("select"), "expert select");
      const s = getComputedStyle(main);
      return {
        roles: keys.map((k) => `${k}: ${s.getPropertyValue(k).trim()}`),
        color: s.color,
        scheme: s.colorScheme,
        chevron: getComputedStyle(select).backgroundImage,
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

// The theme switch shows one icon before any script runs: the moon by day, the sun by night.
const header = readFileSync(join(ROOT, "expert/header.css"), "utf8");
test("ThemeToggle shows the moon by day and the sun by night without its script", async () => {
  const tab = await browser.newPage();
  await tab.evaluate(`globalThis.browserDefined = ${defined.toString()}`);
  const shown = async (theme: string) => {
    await tab.setContent(`<!doctype html><html data-theme="${theme}"><head><style>${header}</style></head>
<body><button id="theme-toggle"><svg id="sun-icon"></svg><svg id="moon-icon"></svg></button></body></html>`);
    return tab.evaluate(() =>
      ["sun-icon", "moon-icon"].filter((id) => {
        const icon = browserDefined(document.getElementById(id), `theme icon #${id}`);
        return getComputedStyle(icon).display !== "none";
      }),
    );
  };
  expect(await shown("light")).toEqual(["moon-icon"]);
  expect(await shown("dark")).toEqual(["sun-icon"]);
  await tab.close();
});

// A catalog story's page shows the shell's switch and the story's, and an app's own switch can take
// the same id: every brand switch turns the page once and shows the theme whoever flipped it.
test("every ThemeToggle on a page turns it once and follows data-theme whoever flips it", async () => {
  const component = readFileSync(join(ROOT, "expert/components/ThemeToggle.astro"), "utf8");
  const [, button, script] = defined(
    component.match(/^---[^]*?---\s*(<button[^]*?<\/button>)\s*<script>([^]*?)<\/script>/),
    "ThemeToggle button and script markup",
  );
  const brand = defined(button, "ThemeToggle button markup").replace(/d=\{\w+\}/g, "");
  const own = `<button id="theme-toggle" data-own onclick="const r = document.documentElement; r.dataset.theme = r.dataset.theme === 'dark' ? 'light' : 'dark'"></button>`;
  const tab = await browser.newPage();
  await tab.setContent(`<!doctype html><html><body>${brand}${own}${brand}<script>
${new Bun.Transpiler({ loader: "ts" }).transformSync(defined(script, "ThemeToggle script"))}</script></body></html>`);
  const state = () =>
    tab.evaluate(() => [
      document.documentElement.getAttribute("data-theme"),
      ...[...document.querySelectorAll("[id=theme-toggle]:not([data-own])")].map((b) =>
        b.getAttribute("aria-pressed"),
      ),
    ]);
  const click = (n: number) =>
    tab.evaluate(
      (i) => (document.querySelectorAll("[id=theme-toggle]")[i] as HTMLElement).click(),
      n,
    );
  await click(2);
  expect(await state()).toEqual(["dark", "true", "true"]);
  await click(1);
  expect(await state()).toEqual(["light", "false", "false"]);
  await tab.evaluate(() => (document.documentElement.dataset.theme = "dark"));
  expect(await state()).toEqual(["dark", "true", "true"]);
  await tab.close();
});
