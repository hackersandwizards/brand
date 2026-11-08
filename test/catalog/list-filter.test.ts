import { afterAll, beforeAll, expect, test } from "bun:test";
import type { Browser, Page } from "puppeteer-core";
import { launch } from "../../scan/markers";
import { BASE, serveSite } from "./site";

// The list filter's story driven as a reader would: the website's e2e cases
// (e2e/components/list-filter.spec.ts) and the trainer hub's, on brand's component.
let browser: Browser;
let server: ReturnType<typeof serveSite>;
beforeAll(async () => {
  server = serveSite();
  browser = await launch();
});
afterAll(async () => {
  await browser?.close();
  await server?.stop(true);
});

const story = (name: string) =>
  `${server.url}${BASE.slice(1)}catalog/stories/Forms/list-filter/${name}/`;
const shown = (p: Page) =>
  p.$$eval("[data-filter-item]", (rows) =>
    rows
      .filter((r) => !(r as HTMLElement).hidden)
      .map((r) => r.querySelector("[data-filter-title]")!.textContent),
  );
const text = (p: Page, sel: string) => p.$eval(sel, (e) => e.textContent!.trim());
const settle = () => new Promise((r) => setTimeout(r, 350));

test("search, a choice, the count, clear and the URL work together; Back restores", async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto(story("dense"), { waitUntil: "networkidle0" });
  expect((await shown(p)).length).toBe(4);
  expect(await text(p, "[data-filter-count]")).toBe("4 von 4 Einheiten");
  await p.type('input[name="q"]', "context");
  await settle();
  expect(await shown(p)).toEqual(["Context Engineering"]);
  expect(await text(p, "[data-filter-count]")).toBe("1 Einheit");
  expect(new URL(p.url()).searchParams.get("q")).toBe("context");
  expect(await p.$eval("[data-filter-title] mark", (m) => m.textContent)).toBe("Context");
  // The counts follow the search: Werkzeuge holds the one match.
  expect(await text(p, '[data-facet-count="tools"]')).toBe("1");
  await p.click('input[name="q"]', { count: 3 });
  await p.keyboard.press("Backspace");
  await settle();
  await p.click('label.hw-choice:has(input[value="tools"])');
  expect((await shown(p)).length).toBe(2);
  expect(new URL(p.url()).searchParams.get("topic")).toBe("tools");
  await p.click('label.hw-choice:has(input[value="evidence"])');
  expect(await shown(p)).toEqual(["Messbare Produktivität"]);
  await p.goBack();
  await settle();
  expect(new URL(p.url()).searchParams.get("topic")).toBe("tools");
  expect((await shown(p)).length).toBe(2);
  await p.click("form [data-filter-clear]");
  expect((await shown(p)).length).toBe(4);
  expect(new URL(p.url()).search).toBe("");
  await p.close();
}, 60_000);

test("a shared URL restores the state, and nothing found offers a way back", async () => {
  const p = await browser.newPage();
  await p.goto(`${story("dense")}?q=zzz`, { waitUntil: "networkidle0" });
  expect(await p.$eval('input[name="q"]', (i) => (i as HTMLInputElement).value)).toBe("zzz");
  expect(await p.$eval("[data-filter-empty]", (e) => (e as HTMLElement).hidden)).toBe(false);
  expect(await p.$eval("[data-filter-list]", (e) => (e as HTMLElement).hidden)).toBe(true);
  await p.click("[data-filter-empty] [data-filter-clear]");
  expect((await shown(p)).length).toBe(4);
  await p.close();
}, 60_000);

test("on a phone the facets fold behind the Filters button, and every target on screen is 44 px", async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 390, height: 844 });
  await p.goto(story("screen"), { waitUntil: "networkidle0" });
  const panel = () => p.$eval("[data-filter-panel]", (e) => e.checkVisibility());
  expect(await panel()).toBe(false);
  await p.click("[data-filter-toggle]");
  expect(await panel()).toBe(true);
  const heights = await p.$$eval(".hw-choice, .hw-field, [data-filter-toggle]", (els) =>
    els.map((e) => e.getBoundingClientRect().height),
  );
  expect(heights.every((h) => h >= 44)).toBe(true);
  await p.keyboard.press("Escape");
  expect(await panel()).toBe(false);
  await p.close();
}, 60_000);
