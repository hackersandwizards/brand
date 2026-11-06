import { afterAll, beforeAll, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { Browser } from "puppeteer-core";
import { ROOT } from "../scripts/git";
import { launch } from "../scan/markers";

// night.css on the element that also declares the day tokens (html carrying both, as under
// Tailwind's theme layer): every property it sets computes to a value. A night value that refers
// to a token derived from the one it replaces loops, and both compute empty.
const css = (f: string) => readFileSync(`${ROOT}/${f}`, "utf8");
const night = css("tokens/night.css");
const names = [...night.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]!);

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
@layer theme { ${css("generated/tokens.root.css")} }
${night}</style></head><body></body></html>`);
  const empty = await tab.evaluate((names) => {
    const s = getComputedStyle(document.documentElement);
    return names.filter((n) => !s.getPropertyValue(n).trim());
  }, names);
  expect(empty).toEqual([]);
});
