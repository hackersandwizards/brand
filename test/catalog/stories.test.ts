import { afterAll, beforeAll, expect, test } from "bun:test";
import axe from "axe-core";
import { join } from "node:path";
import type { Browser } from "puppeteer-core";
import { coverage, ELEMENTS, measurePage } from "../../scan/elements";
import { catalogPages, launch, open, pool } from "../../scan/markers";
import catalogs from "../../expert/catalogs.json";
import { BASE, DIST, page, serveSite } from "./site";

// brand-elements over every element story, as a spoke's gate runs it over its catalog: each state
// matches the element's rule, and every element has its tile at this version. The pages are the
// ones the catalog key names.
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
  const pages = storyPages();
  // Five per element, three that show a setting (the prose block's reading width, the row's
  // padding, the dialog in a narrow tile), the list filter's eight and the area marks' two.
  expect(pages.length).toBe(Object.keys(ELEMENTS).length * 5 + 3 + 8 + 2);
  // Eight tabs at a time, since each page waits for the network to go quiet, about a second.
  const results = await pool(pages, 8, (p) => measurePage(browser, p));
  expect(pages.filter((_, i) => !results[i]!.seen.length)).toEqual([]);
  expect(results.flatMap((r) => r.findings)).toEqual([]);
  expect(coverage({ pages, uses: Object.keys(ELEMENTS) }, results)).toEqual([]);
}, 300_000);

// WCAG AA text contrast (axe-core's color-contrast rule) over every element story at every scale
// and night, as each page loads: hover and focus are not measured. ignoreLength: a one-digit count
// is text, which axe otherwise reports as incomplete. Incomplete is otherwise a failure, except what
// axe cannot read off a page: text over a background image or under another box, the empty value of
// a field and a glyph outside the basic plane.
const UNMEASURED = ["bgImage", "bgOverlap", "emptyValue", "nonBmp"];

async function contrastFailures(url: string, css = "") {
  const tab = await browser.newPage();
  try {
    await open(tab, url);
    if (css) await tab.addStyleTag({ content: css });
    await tab.evaluate(axe.source);
    const found = await tab.evaluate(async (unmeasured) => {
      // `checks` is a run option axe documents and its types leave out.
      const options = {
        runOnly: ["color-contrast"],
        checks: { "color-contrast": { options: { ignoreLength: true } } },
      } as axe.RunOptions;
      const { violations, incomplete } = await (window as unknown as { axe: typeof axe }).axe.run(
        document,
        options,
      );
      const nodes = [...violations, ...incomplete]
        .flatMap((r) => r.nodes)
        .filter((n) => !unmeasured.includes(n.any[0]?.data?.messageKey));
      return nodes.map((n) => `${n.target.join(" ")} ${JSON.stringify(n.any[0]?.data)}`);
    }, UNMEASURED);
    return found.map((f) => `${url}: ${f}`);
  } finally {
    await tab.close();
  }
}

const storyPages = () =>
  catalogPages(join(DIST, "catalog"), `${server.url}${BASE.slice(1)}catalog`);

test("every element story passes AA text contrast", async () => {
  const found = await pool(storyPages(), 8, (url) => contrastFailures(url));
  expect(found.flat()).toEqual([]);
}, 300_000);

// The control: a one-digit count back at a lowered opacity, which both checks must report.
test("a faint choice count fails the contrast check and brand-elements", async () => {
  const url = storyPages().find((p) => p.endsWith("/Forms/filter-value/screen/"))!;
  const faint = ".hw-choice-count { opacity: 0.8 }";
  expect((await contrastFailures(url, faint)).length).toBeGreaterThan(0);
  const { findings } = await measurePage(browser, url, faint);
  expect(findings.some((f) => f.prop === "opacity")).toBe(true);
}, 60_000);

// The catalog's header lists every catalog once, Catalog marked: "page" on the home, "true" below.
test("the home and a story page link every catalog once, Catalog current", () => {
  for (const [path, current] of [
    ["catalog/index.html", "page"],
    ["catalog/dashboard/Actions/button/dense/index.html", "true"],
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
