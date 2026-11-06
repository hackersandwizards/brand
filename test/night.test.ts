import { afterAll, beforeAll, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { Browser } from "puppeteer-core";
import { ROOT } from "../scripts/git";
import { launch } from "../scan/markers";

// night.css on the element that also declares the day tokens (html carrying both, as under
// Tailwind's theme layer): every token computes to a value. A night value that refers to a token
// derived from the one it replaces loops, and both, and every token reading them, compute empty.
const css = (f: string) => readFileSync(`${ROOT}/${f}`, "utf8");
const [tokens, night] = [css("generated/tokens.root.css"), css("tokens/night.css")];
const names = [
  ...new Set([...`${tokens}${night}`.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]!)),
];

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(() => browser?.close());

test("night.css on the element declaring the day tokens leaves no token empty", async () => {
  expect(names).toContain("--color-ampersand");
  const tab = await browser.newPage();
  await tab.setContent(`<!doctype html><html data-theme="dark" data-hw-night><head><style>
@layer theme, base;
@layer theme { ${tokens} }
${night}</style></head><body></body></html>`);
  const empty = await tab.evaluate((names) => {
    const s = getComputedStyle(document.documentElement);
    return names.filter((n) => !s.getPropertyValue(n).trim());
  }, names);
  await tab.close();
  expect(empty).toEqual([]);
});

test("the purple button turns darker on hover under night.css", async () => {
  const tab = await browser.newPage();
  await tab.setContent(`<!doctype html><html><head><style>
${tokens}${night}${css("elements/button.css")} * { transition: none !important }</style></head>
<body data-theme="dark" data-hw-night><a class="hw-button" data-hue="purple" href="#">Go</a></body></html>`);
  const lightness = () =>
    tab.$eval(".hw-button", (e) => {
      const c = document.createElement("canvas").getContext("2d")!;
      c.fillStyle = getComputedStyle(e).backgroundColor;
      c.fillRect(0, 0, 1, 1);
      const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
      return r! + g! + b!;
    });
  const rest = await lightness();
  await tab.hover(".hw-button");
  const hover = await lightness();
  await tab.close();
  expect(hover).toBeLessThan(rest);
});
