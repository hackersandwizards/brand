import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { ROOT } from "../scripts/git";
import { launch } from "../scan/markers";

// A disclosure's summary takes focus.css's ring under hw-focus-ring, and its own 2 px ring without.
const brand = (f: string) => pathToFileURL(join(ROOT, f)).href;
const page = (cls: string) => `<!doctype html><html class="${cls}"><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("elements/focus.css")}">
<link rel="stylesheet" href="${brand("expert/disclosure.css")}">
</head><body><details class="hw-disclosure"><summary>Panel</summary><p>Body</p></details></body></html>`;

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(() => browser?.close());

test.each([
  ["hw-focus-ring", "3px"],
  ["", "2px"],
])(
  "the summary's focus ring under class '%s' is %s",
  async (cls, width) => {
    const file = join(mkdtempSync(join(tmpdir(), "hw-disclosure-")), "page.html");
    writeFileSync(file, page(cls));
    const tab = await browser.newPage();
    await tab.goto(pathToFileURL(file).href);
    await tab.keyboard.press("Tab");
    const measured = await tab.evaluate(() => {
      const s = document.querySelector("summary")!;
      return { focused: s.matches(":focus-visible"), width: getComputedStyle(s).outlineWidth };
    });
    await tab.close();
    expect(measured).toEqual({ focused: true, width });
  },
  30_000,
);
