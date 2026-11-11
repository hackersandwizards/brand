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

test("every story passes brand-elements, every element story shows its element", async () => {
  const pages = storyPages();
  // Five per element, six that show a setting (the prose block's reading width, the row's
  // padding, the dialog in a narrow tile, the navigation list at a sidebar's width, the scrolling
  // table in a text column by day and night), the list filter's nine, the area marks' two, the
  // expert components' sixteen (expert/components, each in ExpertFrame.astro) and the filter bar
  // (choices beside form-input, in ExpertFrame.astro).
  const expert = pages.filter(expertStory);
  expect([pages.length, expert.length]).toEqual([
    Object.keys(ELEMENTS).length * 5 + 6 + 9 + 2 + 17,
    17,
  ]);
  // Eight tabs at a time, since each page waits for the network to go quiet, about a second.
  const results = await pool(pages, 8, (p) => measurePage(browser, p));
  // An expert component may hold no shared element, such as the header's frame.
  expect(pages.filter((p, i) => !expertStory(p) && !results[i]!.seen.length)).toEqual([]);
  expect(results.flatMap((r) => r.findings)).toEqual([]);
  expect(results.flatMap((r) => r.unstyled)).toEqual([]);
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

// A story in ExpertFrame.astro, which names its expert component in data-story-of.
const expertStory = (url: string) =>
  page(`${decodeURIComponent(new URL(url).pathname).slice(BASE.length)}index.html`).includes(
    "data-story-of=",
  );
const storyPages = () =>
  catalogPages(join(DIST, "catalog"), `${server.url}${BASE.slice(1)}catalog`);

// A scrolling table clips the cells at its edge and lays a gradient there, and axe reads the
// contrast of neither: the pass fits every table into its column, whole and without the shadow,
// and test/behaviour.test.ts measures each table text colour over the shadow at full strength.
const UNSCROLLED =
  ".hw-table-scroll { background: none !important; overflow: visible !important; } .hw-table-scroll .hw-table { width: 100%; table-layout: fixed; overflow-wrap: anywhere; }";

test("every element story passes AA text contrast", async () => {
  const found = await pool(storyPages(), 8, (url) => contrastFailures(url, UNSCROLLED));
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

test("faint text in a scrolling table fails the contrast check that lays it out whole", async () => {
  const url = storyPages().find((p) => p.endsWith("/table-scroll/screen/"))!;
  // The last column, which sits past the column's edge until the pass fits the table.
  const faint = `${UNSCROLLED} .hw-table-scroll td:last-child { opacity: 0.3 }`;
  expect((await contrastFailures(url, faint)).length).toBeGreaterThan(0);
}, 60_000);

// In a filter bar the choices and both selects (an app's form-input, the brand's hw-field
// hw-select) stand one height: the control height by mouse, the touch target on a touch screen,
// day and night. The control: 32 px choices beside 40 px selects.
const BEFORE = `[data-hw-scale="dense"] { --hw-choice-height: 2rem; --hw-field-height: 2.5rem }
.form-input { min-height: 2.5rem; padding-block: 0.5rem }`;
test("a filter bar's choices and selects stand one height by mouse and touch, day and night", async () => {
  const url = storyPages().find((p) => p.endsWith("/Forms/filter-bar/dense/"))!;
  const heights = async (touch: boolean, theme: string, css = "") => {
    const tab = await browser.newPage();
    try {
      await tab.emulate({
        viewport: { width: touch ? 390 : 1440, height: 900, isMobile: touch, hasTouch: touch },
        userAgent: "",
      });
      await open(tab, url);
      await tab.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      if (css) await tab.addStyleTag({ content: css });
      return await tab.$$eval(".expert-frame :is(.hw-choice, select)", (els) => [
        ...new Set(els.map((e) => Math.round(e.getBoundingClientRect().height))),
      ]);
    } finally {
      await tab.close();
    }
  };
  for (const theme of ["light", "dark"]) {
    expect([theme, await heights(false, theme)]).toEqual([theme, [38]]);
    expect([theme, await heights(true, theme)]).toEqual([theme, [44]]);
  }
  expect((await heights(false, "light", BEFORE)).length).toBeGreaterThan(1);
  expect((await heights(true, "light", BEFORE)).length).toBeGreaterThan(1);
}, 60_000);

// In the tile, as on a consumer's page, the box without text stands on the axis and at the pitch
// of the boxes with text, by mouse and on a touch screen, at every scale.
test("a check story's marks share one axis and one pitch, by mouse and touch", async () => {
  const pitch = async (scale: string, touch: boolean) => {
    const tab = await browser.newPage();
    try {
      await tab.emulate({
        viewport: { width: touch ? 390 : 1440, height: 900, isMobile: touch, hasTouch: touch },
        userAgent: "",
      });
      await open(
        tab,
        storyPages().find((p) => p.endsWith(`/checkbox-and-radio/${scale}/`))!,
      );
      return await tab.$$eval(".sample .hw-check", (els) => {
        const mid = els.map((e) => {
          const r = e.getBoundingClientRect();
          return [r.left + r.width / 2, r.top + r.height / 2] as const;
        });
        const round = (n: number) => Math.round(n * 4) / 4;
        return [
          new Set(mid.map(([x]) => round(x))).size,
          new Set(mid.slice(1).map(([, y], i) => round(y - mid[i]![1]))).size,
        ];
      });
    } finally {
      await tab.close();
    }
  };
  for (const scale of ["screen", "dense", "print", "stage"])
    for (const touch of [false, true])
      expect([scale, touch, await pitch(scale, touch)]).toEqual([scale, touch, [1, 1]]);
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
