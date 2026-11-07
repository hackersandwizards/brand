import { afterAll, beforeAll, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Browser } from "puppeteer-core";
import { coverage, ELEMENTS, measurePage } from "../../scan/elements";
import { launch } from "../../scan/markers";
import catalogs from "../../expert/catalogs.json";
import { BASE, DIST, page, serveSite } from "./site";

// brand-elements over every element story, as a spoke's gate runs it over its catalog: each state
// matches the element's rule, and every element has its tile at this version.
const STORIES = join(DIST, "catalog/stories/Elements");
const pages = readdirSync(STORIES).flatMap((el) =>
  readdirSync(join(STORIES, el)).map((state) => `catalog/stories/Elements/${el}/${state}/`),
);
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

test("every element story passes brand-elements", async () => {
  // Five per element, and two that show a setting: the prose block's reading width, the row's padding.
  expect(pages.length).toBe(Object.keys(ELEMENTS).length * 5 + 2);
  // Eight tabs at a time, since each page waits for the network to go quiet, about a second; the
  // focus ring's one by one, since only the tab in front holds focus.
  const measure = (p: string) => measurePage(browser, `${server.url}${BASE.slice(1)}${p}`);
  const focus = (p: string) => p.includes("/focus-ring/");
  const order = [...pages.filter((p) => !focus(p)), ...pages.filter(focus)];
  const results: Awaited<ReturnType<typeof measure>>[] = [];
  for (let i = 0; i < order.length; i += 8) {
    const batch = order.slice(i, i + 8);
    if (batch.some(focus)) for (const p of batch) results.push(await measure(p));
    else results.push(...(await Promise.all(batch.map(measure))));
  }
  expect(order.filter((_, i) => !results[i]!.seen.length)).toEqual([]);
  expect(results.flatMap((r) => r.findings)).toEqual([]);
  expect(coverage({ pages, uses: Object.keys(ELEMENTS) }, results)).toEqual([]);
}, 300_000);

// The catalog's header lists every catalog once, Catalog marked: "page" on the home, "true" below.
test("the home and a story page link every catalog once, Catalog current", () => {
  for (const [path, current] of [
    ["catalog/index.html", "page"],
    ["catalog/dashboard/Elements/button/dense/index.html", "true"],
  ]) {
    const navs = page(path).match(/<nav[^>]*data-hw-catalogs[^>]*>.*?<\/nav>/gs) ?? [];
    expect(navs.length).toBe(1);
    const links = [...navs[0]!.matchAll(/<a([^>]*)>([^<]*)<\/a>/g)].map(([, attrs, name]) => [
      name,
      attrs!.match(/aria-current="(\w+)"/)?.[1],
    ]);
    expect(links.map(([name]) => name)).toEqual([
      "Brand",
      "Catalog",
      ...catalogs.filter((c) => c.name !== "Brand").map((c) => c.name),
    ]);
    expect(links.filter(([, cur]) => cur)).toEqual([["Catalog", current]]);
  }
});
