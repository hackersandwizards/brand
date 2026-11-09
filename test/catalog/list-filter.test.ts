import { afterAll, beforeAll, expect, test } from "bun:test";
import type { Browser, Page } from "puppeteer-core";
import { launch } from "../../scan/markers";
import { BASE, page, serveSite } from "./site";

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
  await p.goto(`${story("many")}?days=1`, { waitUntil: "networkidle0" });
  const box = (sel: string) =>
    p.$eval(sel, (e) => {
      const r = e.getBoundingClientRect();
      return { left: r.left, right: r.right, bottom: r.bottom };
    });
  const [search, select] = [await box(".hw-search"), await box('select[name="topic"]')];
  expect(Math.abs(search.bottom - select.bottom)).toBeLessThan(1);
  expect(select.left).toBeGreaterThan(search.right);
  expect((await shown(p)).length).toBe(2);
  await p.select('select[name="topic"]', "tools");
  expect(await shown(p)).toEqual(["Spec-driven Development"]);
  expect(new URL(p.url()).search).toBe("?topic=tools&days=1");
  // Control: at 1000 px the select stacks below the search.
  await p.setViewport({ width: 1000, height: 900 });
  expect((await box('select[name="topic"]')).left).toBeLessThan(search.right);
  await p.close();
}, 60_000);

test("a facet past its label budget shows as a select and filters", async () => {
  const p = await browser.newPage();
  await p.goto(story("many"), { waitUntil: "networkidle0" });
  expect(await p.$$eval('input[name="topic"]', (r) => r.length)).toBe(0);
  await p.select('select[name="topic"]', "evidence");
  expect(await shown(p)).toEqual(["Messbare Produktivität"]);
  expect(new URL(p.url()).searchParams.get("topic")).toBe("evidence");
  // Control: the story with three topics keeps its choices.
  await p.goto(story("dense"), { waitUntil: "networkidle0" });
  expect(await p.$$eval('input[name="topic"]', (r) => r.length)).toBe(4);
  await p.close();
}, 60_000);

test("two facets as choices filter together, each counting under the other", async () => {
  const p = await browser.newPage();
  await p.goto(`${story("listed")}?days=2`, { waitUntil: "networkidle0" });
  expect(await p.$$eval("fieldset", (f) => f.length)).toBe(2);
  expect(await shown(p)).toEqual(["Context Engineering", "Agenten im Team"]);
  expect(await text(p, 'fieldset:first-of-type [data-facet-count="tools"]')).toBe("1");
  await p.click('label.hw-choice:has(input[name="topic"][value="practice"])');
  expect(await shown(p)).toEqual(["Agenten im Team"]);
  expect(new URL(p.url()).search).toBe("?topic=practice&days=2");
  expect(await text(p, 'fieldset:last-of-type [data-facet-count="1"]')).toBe("0");
  // Clear resets both.
  await p.click("form [data-filter-clear]");
  expect(
    await p.$$eval("input:checked", (r) => r.map((x) => (x as HTMLInputElement).value)),
  ).toEqual(["", ""]);
  await p.close();
}, 60_000);

test("arrowing through one facet is one history entry, the next facet another", async () => {
  const p = await browser.newPage();
  await p.goto(`${story("listed")}?days=2`, { waitUntil: "networkidle0" });
  await p.focus('input[name="topic"][value=""]');
  await p.keyboard.press("ArrowRight");
  await p.keyboard.press("ArrowRight");
  await p.focus('input[name="days"]:checked');
  await p.keyboard.press("ArrowLeft");
  expect(new URL(p.url()).search).toBe("?topic=evidence&days=1");
  await p.goBack();
  expect(new URL(p.url()).search).toBe("?topic=evidence&days=2");
  await p.goBack();
  expect(new URL(p.url()).search).toBe("?days=2");
  await p.close();
}, 60_000);

test("no facet shows the search alone, with no fieldset and no Filters button", async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 390, height: 800 });
  await p.goto(story("none"), { waitUntil: "networkidle0" });
  expect(await p.$$eval("fieldset, select", (f) => f.length)).toBe(0);
  expect(await p.$("[data-filter-toggle]")).toBeNull();
  await p.type('input[name="q"]', "agenten");
  await settle();
  expect(await shown(p)).toEqual(["Agenten im Team"]);
  // Control: the screen story on a phone has its Filters button.
  await p.goto(story("screen"), { waitUntil: "networkidle0" });
  expect(await p.$("[data-filter-toggle]")).not.toBeNull();
  await p.close();
}, 60_000);

test("Ctrl+K or Cmd+K outside a text field focuses the search; K alone or a palette page not", async () => {
  const p = await browser.newPage();
  await p.goto(story("dense"), { waitUntil: "networkidle0" });
  const focused = () => p.evaluate(() => document.activeElement?.getAttribute("name"));
  await p.click("body");
  await p.keyboard.press("k");
  expect(await focused()).toBeNull();
  for (const modifier of ["Control", "Meta"] as const) {
    await p.click("body");
    await p.keyboard.down(modifier);
    await p.keyboard.press("k");
    await p.keyboard.up(modifier);
    expect(await focused()).toBe("q");
  }
  // A page's command palette keeps the key.
  await p.evaluate(() =>
    document.body.insertAdjacentHTML("beforeend", '<dialog data-hw-shortcut="k"></dialog>'),
  );
  await p.click("body");
  await p.keyboard.down("Control");
  await p.keyboard.press("k");
  await p.keyboard.up("Control");
  expect(await focused()).not.toBe("q");
  await p.close();
}, 60_000);

test("on a phone a tapped choice folds the facets and the button names it; a key pick keeps them", async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true });
  await p.goto(story("listed"), { waitUntil: "networkidle0" });
  const panel = () => p.$eval("[data-filter-panel]", (e) => e.checkVisibility());
  const toggle = "[data-filter-toggle]";
  expect(await text(p, toggle)).toBe("Filter");
  await p.tap(toggle);
  await p.tap('label.hw-choice:has(input[name="topic"][value="tools"])');
  expect(await panel()).toBe(false);
  expect(await text(p, toggle)).toBe("Werkzeuge");
  expect(await p.$eval(toggle, (e) => e.getAttribute("aria-label"))).toBe("Filter: Werkzeuge");
  expect(await p.evaluate(() => document.activeElement?.hasAttribute("data-filter-toggle"))).toBe(
    true,
  );
  // Control: a pick by arrow key keeps them open.
  await p.tap(toggle);
  await p.focus('input[name="days"][value=""]');
  await p.keyboard.press("ArrowRight");
  expect(await panel()).toBe(true);
  expect(await text(p, toggle)).toBe("Werkzeuge, 1 Tag");
  // A shared link names its chosen values.
  await p.goto(`${story("listed")}?topic=practice`, { waitUntil: "networkidle0" });
  expect(await text(p, toggle)).toBe("Praxis");
  await p.close();
}, 60_000);

test("a short list renders every row: none paints from a whole pixel, so no seam shows", async () => {
  // The server marks only a long list, so a page whose script fails keeps every row rendered.
  const html = (name: string) => page(`catalog/stories/Forms/list-filter/${name}/index.html`);
  expect(html("dense")).not.toContain("data-long");
  expect(html("long")).toContain("data-long");
  const p = await browser.newPage();
  await p.goto(story("dense"), { waitUntil: "networkidle0" });
  expect(await p.$eval("[data-filter-list]", (l) => l.hasAttribute("data-long"))).toBe(false);
  expect(
    await p.$$eval("[data-filter-item]", (rows) =>
      rows.map((r) => getComputedStyle(r).contentVisibility),
    ),
  ).toEqual(["visible", "visible", "visible", "visible"]);
  await p.close();
}, 60_000);

test("a long list's rows off screen skip layout at their rendered height; the focused row renders", async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 390, height: 844 });
  await p.goto(story("long"), { waitUntil: "networkidle0" });
  const visibility = () =>
    p.$$eval("[data-filter-item]", (rows) =>
      rows.slice(0, 2).map((r) => getComputedStyle(r).contentVisibility),
    );
  expect(await visibility()).toEqual(["auto", "auto"]);
  const skipped = () =>
    p.$eval(
      "[data-filter-item]:last-child",
      (row) => !row.firstElementChild!.checkVisibility({ contentVisibilityAuto: true }),
    );
  expect(await skipped()).toBe(true);
  expect(
    await p.$eval("[data-filter-list]", (l) =>
      (l as HTMLElement).style.getPropertyValue("--hw-list-filter-row"),
    ),
  ).toMatch(/^\d+(\.\d+)?px$/);
  // The page holds its height while scrolling: a fixed 3rem stand-in grew it by a third.
  const heights = await p.$eval("[data-filter-list]", async (list) => {
    let el: HTMLElement | null = list as HTMLElement;
    while (el && !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) el = el.parentElement;
    const scroller = el ?? document.documentElement;
    const seen = [scroller.scrollHeight];
    for (let y = 0; y < scroller.scrollHeight; y += scroller.clientHeight * 0.8) {
      scroller.scrollTop = y;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      seen.push(scroller.scrollHeight);
    }
    return seen;
  });
  expect(Math.max(...heights) / Math.min(...heights)).toBeLessThan(1.01);
  await p.$eval("[data-filter-item]", (row) => {
    (row as HTMLElement).tabIndex = 0;
    (row as HTMLElement).focus();
  });
  expect(await visibility()).toEqual(["visible", "auto"]);
  await p.close();
}, 60_000);

test("under browse active and listed, no count line shows before the script runs", async () => {
  for (const [name, first] of [
    ["listed", ""],
    ["dense", "4 von 4 Einheiten"],
  ] as const) {
    const p = await browser.newPage();
    // The module waits until the first frame's count line is read.
    let release = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await p.setRequestInterception(true);
    p.on("request", async (r) => {
      if (r.url().includes("ListFilter.astro_astro_type_script")) await held;
      void r.continue();
    });
    // A module script holds DOMContentLoaded, so the page is read while it loads.
    const loaded = p.goto(story(name));
    await p.waitForSelector("[data-filter-count]");
    const seen = await p.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() =>
            resolve(document.querySelector("[data-filter-count]")!.textContent),
          ),
        ),
    );
    release();
    await loaded;
    expect(seen).toBe(first);
    await p.close();
  }
}, 60_000);
