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

// The page as a browser whose module script failed to load: every module script dropped.
const withoutModules = async (p: Page) => {
  await p.setRequestInterception(true);
  p.on("request", async (request) => {
    if (request.resourceType() !== "document") return request.continue();
    const answer = await fetch(request.url());
    const body = (await answer.text()).replace(/<script type="module"[\s\S]*?<\/script>/g, "");
    return request.respond({ status: answer.status, contentType: "text/html", body });
  });
};

test("on a phone whose script failed, the facets and the search button stay usable", async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 390, height: 844 });
  await withoutModules(p);
  await p.goto(story("screen"), { waitUntil: "networkidle0" });
  const visible = (sel: string) => p.$eval(sel, (e) => e.checkVisibility());
  expect(await visible("[data-filter-panel]")).toBe(true);
  expect(await visible("[data-filter-submit]")).toBe(true);
  expect(await visible("[data-filter-toggle]")).toBe(false);
  // Control: with the script the facets fold.
  const q = await browser.newPage();
  await q.setViewport({ width: 390, height: 844 });
  await q.goto(story("screen"), { waitUntil: "networkidle0" });
  expect(await q.$eval("[data-filter-panel]", (e) => e.checkVisibility())).toBe(false);
  await p.close();
  await q.close();
}, 60_000);

const noScript = async (name: string) => {
  const p = await browser.newPage();
  await p.setJavaScriptEnabled(false);
  await p.goto(story(name), { waitUntil: "networkidle0" });
  const out = {
    rows: await p.$$eval(
      "[data-filter-item]",
      (rows) => rows.filter((r) => (r as HTMLElement).checkVisibility()).length,
    ),
    form: await p.$eval("[data-list-filter] form", (f) => f.checkVisibility()),
  };
  await p.close();
  return out;
};

test("under an overview, without JavaScript the rows wait in a template or stay listed", async () => {
  expect(await noScript("inert")).toEqual({ rows: 0, form: false });
  expect(await noScript("listed")).toEqual({ rows: 4, form: true });
  expect(await noScript("source")).toEqual({ rows: 0, form: true });
}, 60_000);

test("under an overview the rows wait for a filter, and the overview steps aside", async () => {
  for (const name of ["inert", "listed"]) {
    const p = await browser.newPage();
    await p.setViewport({ width: 1280, height: 900 });
    await p.goto(story(name), { waitUntil: "networkidle0" });
    const overview = `#overview-${name}`;
    expect(await p.$eval("[data-filter-list]", (e) => (e as HTMLElement).hidden)).toBe(true);
    expect(await p.$eval(overview, (e) => (e as HTMLElement).hidden)).toBe(false);
    await p.type('input[name="q"]', "context");
    await settle();
    expect(await shown(p)).toEqual(["Context Engineering"]);
    expect(await p.$eval(overview, (e) => (e as HTMLElement).hidden)).toBe(true);
    await p.close();
  }
}, 60_000);

test("a source page's rows load on first use; should they fail, the search goes there", async () => {
  const p = await browser.newPage();
  await p.goto(story("source"), { waitUntil: "networkidle0" });
  expect(await p.$$eval("[data-filter-item]", (rows) => rows.length)).toBe(0);
  await p.type('input[name="q"]', "context");
  await settle();
  await p.waitForFunction(() => document.querySelectorAll("[data-filter-item]").length === 4);
  expect(await shown(p)).toEqual(["Context Engineering"]);
  expect(await text(p, "[data-filter-count]")).toBe("1 Einheit");
  await p.close();

  const q = await browser.newPage();
  await q.setRequestInterception(true);
  q.on("request", (r) =>
    r.resourceType() === "fetch" ? r.respond({ status: 503, body: "" }) : r.continue(),
  );
  await q.goto(story("source"), { waitUntil: "networkidle0" });
  // The typed search goes there on its own once the load fails.
  await q.type('input[name="q"]', "context");
  await q.waitForFunction(() => location.pathname.endsWith("/list-filter/dense/"));
  expect(new URL(q.url()).pathname).toEndWith("/list-filter/dense/");
  expect(new URL(q.url()).searchParams.get("q")).toBe("context");
  await q.close();
}, 60_000);

test("inline sets the select beside the search from 64rem; a select filters with the choices", async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto(`${story("listed")}?days=1`, { waitUntil: "networkidle0" });
  const box = (sel: string) =>
    p.$eval(sel, (e) => {
      const r = e.getBoundingClientRect();
      return { left: r.left, right: r.right, bottom: r.bottom };
    });
  const [search, select] = [await box(".hw-search"), await box('select[name="days"]')];
  expect(Math.abs(search.bottom - select.bottom)).toBeLessThan(1);
  expect(select.left).toBeGreaterThan(search.right);
  expect((await shown(p)).length).toBe(2);
  await p.click('label.hw-choice:has(input[value="tools"])');
  expect(await shown(p)).toEqual(["Spec-driven Development"]);
  expect(new URL(p.url()).search).toBe("?topic=tools&days=1");
  // Control: at 1000 px the select stacks below the search.
  await p.setViewport({ width: 1000, height: 900 });
  expect((await box('select[name="days"]')).left).toBeLessThan(search.right);
  await p.close();
}, 60_000);

test("a facet past its label budget shows as a select and filters", async () => {
  const p = await browser.newPage();
  await p.goto(story("many"), { waitUntil: "networkidle0" });
  expect(await p.$$eval('input[type="radio"]', (r) => r.length)).toBe(0);
  await p.select('select[name="topic"]', "evidence");
  expect(await shown(p)).toEqual(["Messbare Produktivität"]);
  expect(new URL(p.url()).searchParams.get("topic")).toBe("evidence");
  // Control: the story with three topics keeps its choices.
  await p.goto(story("dense"), { waitUntil: "networkidle0" });
  expect(await p.$$eval('input[type="radio"]', (r) => r.length)).toBe(4);
  await p.close();
}, 60_000);
