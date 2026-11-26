import { defined } from "@hackersandwizards/scaffolding/defined";
import { limit } from "@hackersandwizards/scaffolding/test-timeout";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import axe from "axe-core";
import { join } from "node:path";
import type { Browser, Viewport } from "puppeteer-core";
import { exceptionFindings } from "../../scan/element-exceptions";
import { elementPage, measurePage } from "../../scan/element-page";
import { ELEMENTS } from "../../scan/element-rules";
import { addCss, launch, open } from "../../scan/browser";
import { pool } from "../../scan/browser-workers";
import { catalogPages } from "../../scan/site";
import catalogs from "../../expert/catalogs.json";
import { BASE, contrastMessageKey, DIST, page, serveSite } from "./site";

// brand-elements over every element story, as a spoke's gate runs it over its catalog: each state
// matches the element's rule, and every element shows on a story. The pages are the ones the
// catalog key names.
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

// An expert component's stories (expert/components, each in ExpertFrame.astro).
test("the catalog includes expert component stories", () => {
  const expert = storyPages().filter(expertStory);
  expect(expert.length).toBeGreaterThan(0);
});

test(
  "every story passes brand-elements, every element story shows its element",
  async () => {
    const pages = storyPages();
    // Eight tabs at a time, since each page waits for the network to go quiet, about a second.
    const results = await pool(pages, 8, (p) => measurePage(browser, elementPage(p)));
    // An expert component may hold no shared element, such as the header's frame.
    const emptyStories = pages.filter(
      (_, i) => !defined(results[i], "story measurement").seen.length,
    );
    expect(emptyStories.filter((p) => !expertStory(p))).toEqual([]);
    expect(results.flatMap((r) => r.findings)).toEqual([]);
    expect(results.flatMap((r) => r.unstyled)).toEqual([]);
    expect(exceptionFindings({ pages }, results)).toEqual([]);
    const seen = new Set(results.flatMap((r) => r.seen));
    expect(Object.keys(ELEMENTS).filter((e) => !seen.has(e))).toEqual([]);
  },
  limit(300_000),
);

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
    const nodes = await tab.evaluate(async () => {
      // `checks` is a run option axe documents and its types leave out.
      const options = {
        runOnly: ["color-contrast"],
        checks: { "color-contrast": { options: { ignoreLength: true } } },
      } as axe.RunOptions;
      const { violations, incomplete } = await (window as unknown as { axe: typeof axe }).axe.run(
        document,
        options,
      );
      return [...violations, ...incomplete].flatMap((r) =>
        r.nodes.map((node) => {
          const data: unknown = node.any[0]?.data;
          return { target: node.target.join(" "), data };
        }),
      );
    });
    return nodes
      .filter(({ data }) => !UNMEASURED.includes(contrastMessageKey(data) ?? ""))
      .map(({ target, data }) => `${url}: ${target} ${JSON.stringify(data)}`);
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
  catalogPages({ dir: join(DIST, "catalog"), at: `${server.url}${BASE.slice(1)}catalog` });

// A scrolling table clips the cells at its edge and lays a gradient there, and axe reads the
// contrast of neither: the pass fits every table into its column, whole and without the shadow,
// and test/behaviour.test.ts measures each table text colour over the shadow at full strength.
const UNSCROLLED =
  ".hw-table-scroll { background: none !important; overflow: visible !important; } .hw-table-scroll .hw-table { width: 100%; table-layout: fixed; overflow-wrap: anywhere; }";

test(
  "every element story passes AA text contrast",
  async () => {
    const found = await pool(storyPages(), 8, (url) => contrastFailures(url, UNSCROLLED));
    expect(found.flat()).toEqual([]);
  },
  limit(300_000),
);

// The control: a one-digit count back at a lowered opacity, which both checks must report.
test(
  "a faint choice count fails the contrast check and brand-elements",
  async () => {
    const url = defined(
      storyPages().find((p) => p.endsWith("/Forms/filter-value/screen/")),
      "screen filter value story",
    );
    const faint = ".hw-choice-count { opacity: 0.8 }";
    expect((await contrastFailures(url, faint)).length).toBeGreaterThan(0);
    const { findings } = await measurePage(browser, elementPage(url), faint);
    expect(findings.some((f) => f.prop === "opacity")).toBe(true);
  },
  limit(60_000),
);

test(
  "faint text in a scrolling table fails the contrast check that lays it out whole",
  async () => {
    const url = defined(
      storyPages().find((p) => p.endsWith("/table-scroll/screen/")),
      "screen scrolling table story",
    );
    // The last column, which sits past the column's edge until the pass fits the table.
    const faint = `${UNSCROLLED} .hw-table-scroll td:last-child { opacity: 0.3 }`;
    expect((await contrastFailures(url, faint)).length).toBeGreaterThan(0);
  },
  limit(60_000),
);

// In a filter bar the choices and both selects (an app's form-input, the brand's hw-field
// hw-select) stand one height: the control height by mouse, the touch target on a touch screen,
// day and night. The control: 32 px choices beside 40 px selects.
const BEFORE = `[data-hw-scale="dense"] { --hw-choice-height: 2rem; --hw-field-height: 2.5rem }
.form-input { min-height: 2.5rem; padding-block: 0.5rem }`;
const mouse = { width: 1440, height: 900, isMobile: false, hasTouch: false };
const touch = { width: 390, height: 900, isMobile: true, hasTouch: true };
const storyUrl = (suffix: string) => {
  const url = storyPages().find((entry) => entry.endsWith(suffix));
  assert(url, `Expected a catalog story ending in ${suffix}`);
  return url;
};

async function controlHeights(viewport: Viewport, theme: string, css: string) {
  const tab = await browser.newPage();
  try {
    await tab.setViewport(viewport);
    await open(tab, storyUrl("/Forms/filter-bar/dense/"));
    await tab.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await addCss(tab, css);
    return await tab.$$eval(".expert-frame :is(.hw-choice, select)", (els) => [
      ...new Set(els.map((e) => Math.round(e.getBoundingClientRect().height))),
    ]);
  } finally {
    await tab.close();
  }
}

test.each([
  { pointer: "mouse", viewport: mouse, theme: "light", height: 38 },
  { pointer: "mouse", viewport: mouse, theme: "dark", height: 38 },
  { pointer: "touch", viewport: touch, theme: "light", height: 44 },
  { pointer: "touch", viewport: touch, theme: "dark", height: 44 },
])(
  "a filter bar's controls share a $height px height by $pointer in $theme",
  async ({ viewport, theme, height }) => {
    expect(await controlHeights(viewport, theme, "")).toEqual([height]);
  },
  limit(60_000),
);

test.each([
  { pointer: "mouse", viewport: mouse },
  { pointer: "touch", viewport: touch },
])(
  "the old filter bar styles mix control heights by $pointer",
  async ({ viewport }) => {
    expect((await controlHeights(viewport, "light", BEFORE)).length).toBeGreaterThan(1);
  },
  limit(60_000),
);

// The box without text stands on the axis and at the pitch of the boxes with text.
async function checkStoryGeometry(scale: string, viewport: Viewport, css: string) {
  const tab = await browser.newPage();
  try {
    await tab.setViewport(viewport);
    await open(tab, storyUrl(`/checkbox-and-radio/${scale}/`));
    await addCss(tab, css);
    return await tab.$$eval(".sample .hw-check", (els) => {
      const mid = els.map((e) => {
        const r = e.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2] as const;
      });
      const round = (n: number) => Math.round(n * 4) / 4;
      return [
        new Set(mid.map(([x]) => round(x))).size,
        new Set(
          mid.slice(1).map(([, y], i) => {
            const previous = mid[i];
            if (!previous) throw new Error("Missing previous checkbox midpoint");
            return round(y - previous[1]);
          }),
        ).size,
      ];
    });
  } finally {
    await tab.close();
  }
}

test.each([
  ["screen", "mouse", mouse],
  ["dense", "mouse", mouse],
  ["print", "mouse", mouse],
  ["stage", "mouse", mouse],
  ["screen", "touch", touch],
  ["dense", "touch", touch],
  ["print", "touch", touch],
  ["stage", "touch", touch],
] as const)(
  "a %s check story's marks share one axis and pitch by %s",
  async (scale, _pointer, viewport) => {
    expect(await checkStoryGeometry(scale, viewport, "")).toEqual([1, 1]);
  },
  limit(60_000),
);

test(
  "a margin on the lone check's target moves it off the rows' pitch",
  async () => {
    const gap = ".sample > * + * { margin-top: 0.5em !important }";
    expect(await checkStoryGeometry("screen", mouse, gap)).not.toEqual([1, 1]);
  },
  limit(60_000),
);

// The catalog's header lists every catalog once, Catalog marked: "page" on the home, "true" below.
test.each([
  ["catalog/index.html", "page"],
  ["catalog/dashboard/Actions/button/dense/index.html", "true"],
])("%s links every catalog once, Catalog current", (path, current) => {
  const navs = [...page(path).matchAll(/<nav[^>]*data-hw-catalogs[^>]*>.*?<\/nav>/gs)].map(
    ([nav]) => nav,
  );
  expect(navs.length).toBe(1);
  const links = [...defined(navs[0], "catalog navigation").matchAll(/<a([^>]*)>([^<]*)<\/a>/g)].map(
    ([, attrs, name]) => [
      name,
      defined(attrs, "navigation link attributes").match(/aria-current="(\w+)"/)?.[1],
    ],
  );
  expect(links.map(([name]) => name)).toEqual([
    "Brand",
    "Catalog",
    ...catalogs.filter((c) => c.name !== "Brand").map((c) => c.name),
  ]);
  expect(links.filter(([, cur]) => cur)).toEqual([["Catalog", current]]);
});
