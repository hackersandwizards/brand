import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser, Page } from "puppeteer-core";
import sharp from "sharp";
import { launch, open } from "../scan/markers";
import { ROOT } from "../scripts/git";
import { hastToHtml, markdownToHast, markdownToHtml } from "satteri";
import { tableScroll, tableScrollPlugin } from "../elements/table";

// The keys, focus and placement elements/behaviour.ts gives, in a real browser.
let browser: Browser;
const dir = mkdtempSync(join(tmpdir(), "brand-behaviour-"));
const brand = (f: string) => pathToFileURL(join(ROOT, f)).href;
/** Bundles an elements/ script into dir/`out`, its exports on window as `global`. */
const bundle = async (src: string, global: string, out: string) => {
  const entry = join(dir, `${out}.entry.ts`);
  writeFileSync(
    entry,
    `import * as ${global} from ${JSON.stringify(join(ROOT, src))}; Object.assign(window, { ${global} });`,
  );
  const built = await Bun.build({ entrypoints: [entry], format: "iife" });
  writeFileSync(join(dir, out), await built.outputs[0]!.text());
};
await bundle("elements/behaviour.ts", "HW", "b.js");
await bundle("elements/copy.ts", "HWCopy", "copy.js");
await bundle("elements/form.ts", "HWForm", "form.js");
await bundle("elements/behaviour.ts", "HW2", "b2.js");
const css = ["generated/tokens.root.css", "elements/elements.css"]
  .map((f) => `<link rel="stylesheet" href="${brand(f)}">`)
  .join("");
const page = async (body: string, lang = "de", reduce = false): Promise<Page> => {
  const p = await browser.newPage();
  if (reduce) await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const f = join(dir, `${Math.random().toString(36).slice(2)}.html`);
  writeFileSync(
    f,
    `<!doctype html><html lang="${lang}"><head>${css}</head><body data-hw-scale="dense" style="margin: 2rem">${body}<script src="b.js"></script><script>HW.enhance();</script></body></html>`,
  );
  await open(p, pathToFileURL(f).href);
  return p;
};
const active = (p: Page) => p.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
const attr = (p: Page, sel: string, a: string) =>
  p.$eval(sel, (e, n) => e.getAttribute(n as string), a);

beforeAll(async () => {
  browser = await launch();
});
afterAll(async () => {
  await browser?.close();
  rmSync(dir, { recursive: true, force: true });
});

const MENU = `<button id="b" popovertarget="m" aria-haspopup="menu" aria-expanded="false">Aktionen</button>
<div id="m" popover role="menu" class="hw-menu" aria-label="A"><button role="menuitem" class="hw-menu-item">Bearbeiten</button><button role="menuitem" class="hw-menu-item" disabled>Gesperrt</button><button role="menuitem" class="hw-menu-item">Löschen</button></div>`;

test("a menu opens on its button, focuses the first entry, walks by key, closes on Escape, returns focus", async () => {
  const p = await page(MENU);
  await p.focus("#b");
  await p.keyboard.press("Enter");
  await p.waitForFunction(() => document.activeElement?.matches("[role=menuitem]"));
  expect(await attr(p, "#b", "aria-expanded")).toBe("true");
  expect(await p.$eval("#m", (m) => m.matches(":popover-open"))).toBe(true);
  expect(await active(p)).toBe("Bearbeiten");
  await p.keyboard.press("ArrowDown");
  expect(await active(p)).toBe("Löschen");
  await p.keyboard.press("Home");
  expect(await active(p)).toBe("Bearbeiten");
  await p.keyboard.press("End");
  expect(await active(p)).toBe("Löschen");
  await p.keyboard.press("b");
  expect(await active(p)).toBe("Bearbeiten");
  await p.keyboard.press("Escape");
  expect(await p.$eval("#m", (m) => m.matches(":popover-open"))).toBe(false);
  await p.waitForFunction(
    () => document.querySelector("#b")?.getAttribute("aria-expanded") === "false",
  );
  expect(await active(p)).toBe("Aktionen");
  await p.close();
}, 30_000);

test("a menu opened with ArrowUp starts on its last entry and sits under its button", async () => {
  const p = await page(MENU);
  await p.focus("#b");
  await p.keyboard.press("ArrowUp");
  await p.waitForFunction(() => document.activeElement?.matches("[role=menuitem]"));
  expect(await active(p)).toBe("Löschen");
  const [btn, menu] = await p.evaluate(() => [
    document.querySelector("#b")!.getBoundingClientRect().bottom,
    document.querySelector("#m")!.getBoundingClientRect().top,
  ]);
  expect(menu!).toBeCloseTo(btn! + 4, 0);
  await p.close();
}, 30_000);

test("a context menu opens at the pointer and an entry's click closes it", async () => {
  const p = await page(
    `<div data-hw-context="m" id="row" style="height:100px">Zeile</div><div id="m" popover role="menu" class="hw-menu"><button role="menuitem" class="hw-menu-item">Eins</button></div>`,
  );
  await p.mouse.click(60, 60, { button: "right" });
  expect(await p.$eval("#m", (m) => m.matches(":popover-open"))).toBe(true);
  const left = await p.$eval("#m", (m) => (m as HTMLElement).getBoundingClientRect().left);
  expect(left).toBe(60);
  await p.click("#m button");
  expect(await p.$eval("#m", (m) => m.matches(":popover-open"))).toBe(false);
  await p.close();
}, 30_000);

const DIALOG = `<button id="o" data-hw-open="d">Öffnen</button><dialog class="hw-dialog" id="d"><input id="i"><button data-hw-close id="c">Zu</button></dialog>`;

test("a dialog opens modal, holds focus, closes on Escape and returns focus to its opener", async () => {
  const p = await page(DIALOG);
  await p.click("#o");
  expect(await p.$eval("#d", (d) => d.matches(":modal"))).toBe(true);
  expect(await p.evaluate(() => document.activeElement?.id)).toBe("i");
  await p.keyboard.press("Escape");
  expect(await p.$eval("#d", (d) => (d as HTMLDialogElement).open)).toBe(false);
  expect(await p.evaluate(() => document.activeElement?.id)).toBe("o");
  await p.close();
}, 30_000);

test("a click on the backdrop closes it, unless data-hw-dismiss=none; data-hw-close closes it", async () => {
  const p = await page(DIALOG);
  await p.click("#o");
  await p.mouse.click(5, 5);
  expect(await p.$eval("#d", (d) => (d as HTMLDialogElement).open)).toBe(false);
  await p.$eval("#d", (d) => d.setAttribute("data-hw-dismiss", "none"));
  await p.click("#o");
  await p.mouse.click(5, 5);
  expect(await p.$eval("#d", (d) => (d as HTMLDialogElement).open)).toBe(true);
  await p.click("#c");
  expect(await p.$eval("#d", (d) => (d as HTMLDialogElement).open)).toBe(false);
  await p.close();
}, 30_000);

test("a drag from inside the panel ending on the backdrop leaves the dialog open", async () => {
  const p = await page(DIALOG);
  await p.click("#o");
  const box = await p.$eval("#i", (i) => {
    const r = i.getBoundingClientRect();
    return { x: r.x + 2, y: r.y + 2 };
  });
  await p.mouse.move(box.x, box.y);
  await p.mouse.down();
  await p.mouse.move(5, 5);
  await p.mouse.up();
  expect(await p.$eval("#d", (d) => (d as HTMLDialogElement).open)).toBe(true);
  await p.close();
}, 30_000);

const LONG = "Donaudampfschifffahrtsgesellschaftskapitänsmützenhalterungsverordnung";
const KEYS = `<dl style="display:grid;grid-template-columns:auto auto;gap:.5rem 1.5rem;margin:0">${[
  "PageDown Space Shift",
  "PageUp Shift Space",
]
  .map(
    (k) =>
      `<dt style="display:flex;gap:.25rem">${k
        .split(" ")
        .map((x) => `<kbd class="hw-kbd">${x}</kbd>`)
        .join("")}</dt><dd style="margin:0">${LONG}</dd>`,
  )
  .join("")}</dl>`;
const fits = (p: Page, sel: string) =>
  p.$eval(sel, (d) => {
    const r = d.getBoundingClientRect();
    const box = d.matches(":modal") ? innerWidth : d.parentElement!.clientWidth;
    const lines = (e: Element) => {
      const range = document.createRange();
      range.selectNodeContents(e);
      return new Set([...range.getClientRects()].map((l) => Math.round(l.top))).size;
    };
    return {
      width: r.width <= box,
      scroll: d.scrollWidth <= d.clientWidth,
      whole: [...d.querySelectorAll(".hw-button, .hw-kbd")].every((e) => lines(e) === 1),
    };
  });
const FITS = { width: true, scroll: true, whole: true };
const ACTIONS = `<div class="hw-dialog-actions">${["Abbrechen", "Entwurf speichern", "Veröffentlichen"].map((b) => `<button class="hw-button">${b}</button>`).join("")}</div>`;

test("a dialog fits its container in the flow and a phone when modal, its content wrapping", async () => {
  const p = await page(
    `<div style="width:357px"><dialog open class="hw-dialog" data-size="small" id="f"><h2 class="hw-dialog-title">${LONG}</h2><div class="hw-dialog-body">${LONG}<p style="width:2rem"><kbd class="hw-kbd">PageDown</kbd></p></div>${ACTIONS}</dialog></div>
<div class="hw-focus-ring"><dialog class="hw-dialog" data-size="large" id="m" aria-label="Tasten"><div class="hw-dialog-body">${KEYS}</div></dialog></div>`,
  );
  await p.setViewport({ width: 1280, height: 800 });
  expect(await fits(p, "#f")).toEqual(FITS);
  await p.setViewport({ width: 390, height: 800 });
  await p.keyboard.press("Tab");
  await p.$eval("#m", (d) => (d as HTMLDialogElement).showModal());
  expect(await fits(p, "#m")).toEqual(FITS);
  // A dialog holding no control takes the focus itself and draws no ring round the panel.
  expect(
    await p.$eval("#m", (d) => [d.matches(":focus-visible"), getComputedStyle(d).outlineStyle]),
  ).toEqual([true, "none"]);
  await p.close();
}, 30_000);

test("a dialog holding no control draws no ring outside hw-focus-ring too", async () => {
  const p = await page(
    `<button id="b">Öffnen</button><dialog class="hw-dialog" id="n" aria-label="Tasten"><div class="hw-dialog-body">${KEYS}</div></dialog>`,
  );
  await p.keyboard.press("Tab");
  // Control: outside hw-focus-ring the browser draws its own ring on a focused control.
  expect(await p.$eval("#b", (b) => getComputedStyle(b).outlineStyle)).not.toBe("none");
  await p.$eval("#n", (d) => (d as HTMLDialogElement).showModal());
  expect(
    await p.$eval("#n", (d) => [d.matches(":focus-visible"), getComputedStyle(d).outlineStyle]),
  ).toEqual([true, "none"]);
  await p.close();
}, 30_000);

test("a ruled facts list in columns leaves its whole first row open and rules every later row", async () => {
  const fact = (i: number) =>
    `<div><dt class="hw-label" data-tone="muted">F${i}</dt><dd>${i}</dd></div>`;
  const list = (cols: string) =>
    `<dl class="hw-facts" data-variant="ruled" ${cols}>${[1, 2, 3, 4, 5].map(fact).join("")}</dl>`;
  const p = await page(`<div style="width:600px">${list('data-columns="3"')}${list("")}</div>`);
  const rows = await p.$$eval("dl", (dls) =>
    dls.map((dl) =>
      [...dl.children].map((d) => [
        Math.round(d.getBoundingClientRect().top - dl.getBoundingClientRect().top),
        getComputedStyle(d).borderTopWidth,
      ]),
    ),
  );
  const [grid, stack] = rows;
  expect(grid!.map(([, b]) => b)).toEqual(["0px", "0px", "0px", "1px", "1px"]);
  expect(new Set(grid!.slice(0, 3).map(([t]) => t)).size).toBe(1);
  expect(grid![3]![0]).toBe(grid![4]![0]);
  expect(stack!.map(([, b]) => b)).toEqual(["0px", "1px", "1px", "1px", "1px"]);
  // Unruled, the rows keep the columns' gap apart.
  await p.$eval("dl", (dl) => dl.removeAttribute("data-variant"));
  expect(await p.$eval("dl", (dl) => getComputedStyle(dl).rowGap)).toBe("16px");
  // In a narrow column a long value wraps rather than drawing over its neighbour.
  await p.$eval("dl", (dl) => {
    dl.parentElement!.style.width = "240px";
    dl.dataset.columns = "4";
    dl.querySelector("dd")!.textContent = "Präsenztraining";
  });
  expect(
    await p.$eval("dl", (dl) => {
      const [a, b] = [...dl.children].map((d) => d.getBoundingClientRect());
      const text = document.createRange();
      text.selectNodeContents(dl.querySelector("dd")!);
      return text.getBoundingClientRect().right <= Math.min(a!.right, b!.left);
    }),
  ).toBe(true);
  await p.close();
}, 30_000);

test("the toast region exists before its first toast and leaves a dialog that closes", async () => {
  const p = await page(DIALOG);
  expect(await p.$eval(".hw-toasts", (b) => b.childElementCount)).toBe(0);
  await p.click("#o");
  await p.evaluate(() =>
    (window as unknown as { HW: { toast: (m: string, o?: object) => void } }).HW.toast("Fehler", {
      tone: "error",
    }),
  );
  expect(await p.$eval(".hw-toasts", (b) => b.parentElement!.id)).toBe("d");
  await p.keyboard.press("Escape");
  await p.waitForFunction(
    () => document.querySelector(".hw-toasts")!.parentElement === document.body,
  );
  expect(await p.$$eval(".hw-toast", (t) => t.length)).toBe(1);
  await p.close();
}, 30_000);

test("opening a folder keeps the selected document selected", async () => {
  const p = await page(
    `<ul class="hw-tree" role="tree"><li role="treeitem" aria-expanded="false" id="f"><span class="hw-tree-row">Ordner</span></li><li role="treeitem" aria-selected="true" id="d"><span class="hw-tree-row">Dokument</span></li></ul>`,
  );
  await p.click("#f .hw-tree-row");
  expect(await attr(p, "#f", "aria-expanded")).toBe("true");
  expect(await attr(p, "#d", "aria-selected")).toBe("true");
  await p.close();
}, 30_000);

test("tabs: one tab stop, arrows move and show the panel, panels stay in step", async () => {
  const p = await page(
    `<div role="tablist" class="hw-tabs"><button role="tab" class="hw-tab" id="a" aria-selected="true" aria-controls="pa">A</button><button role="tab" class="hw-tab" id="b" aria-selected="false" aria-controls="pb">B</button></div><div id="pa" role="tabpanel">x</div><div id="pb" role="tabpanel">y</div>`,
  );
  expect(await p.$eval("#b", (e) => (e as HTMLElement).tabIndex)).toBe(-1);
  expect(await p.$eval("#pb", (e) => (e as HTMLElement).hidden)).toBe(true);
  await p.focus("#a");
  await p.keyboard.press("ArrowRight");
  expect(await active(p)).toBe("B");
  expect(await attr(p, "#b", "aria-selected")).toBe("true");
  expect(await p.$eval("#pa", (e) => (e as HTMLElement).hidden)).toBe(true);
  expect(await p.$eval("#pb", (e) => (e as HTMLElement).hidden)).toBe(false);
  await p.keyboard.press("Home");
  expect(await active(p)).toBe("A");
  await p.close();
}, 30_000);

test("a tree walks by the APG keys: right opens then enters, left closes then climbs", async () => {
  const p = await page(
    `<ul class="hw-tree" role="tree"><li role="treeitem" aria-expanded="false" id="f"><span class="hw-tree-row">Ordner</span><ul role="group"><li role="treeitem" id="c"><span class="hw-tree-row">Kind</span></li></ul></li><li role="treeitem" id="z"><span class="hw-tree-row">Zwei</span></li></ul>`,
  );
  await p.focus("#f");
  await p.keyboard.press("ArrowDown");
  expect(await p.evaluate(() => document.activeElement?.id)).toBe("z");
  await p.keyboard.press("ArrowUp");
  await p.keyboard.press("ArrowRight");
  expect(await attr(p, "#f", "aria-expanded")).toBe("true");
  await p.keyboard.press("ArrowRight");
  expect(await p.evaluate(() => document.activeElement?.id)).toBe("c");
  await p.keyboard.press("ArrowLeft");
  expect(await p.evaluate(() => document.activeElement?.id)).toBe("f");
  await p.keyboard.press("ArrowLeft");
  expect(await attr(p, "#f", "aria-expanded")).toBe("false");
  await p.close();
}, 30_000);

test("a command palette filters, highlights the first hit, moves by arrow and runs on Enter", async () => {
  const p = await page(
    `<button data-hw-open="c" id="o">O</button><dialog class="hw-dialog" data-variant="command" id="c" data-hw-shortcut="k"><div class="hw-command-field"><input id="q" role="combobox" aria-controls="l"></div><div class="hw-command-list" id="l" role="listbox"><p class="hw-command-group">G</p><button role="option" class="hw-command-option" onclick="document.title='neu'">Neuer Deal</button><button role="option" class="hw-command-option">Personen</button></div></dialog>`,
  );
  await p.click("#o");
  expect(await p.evaluate(() => document.activeElement?.id)).toBe("q");
  await p.keyboard.type("neu");
  expect(await p.$$eval('[role="option"]:not([hidden])', (o) => o.length)).toBe(1);
  expect(await attr(p, '[role="option"]', "aria-selected")).toBe("true");
  expect(await attr(p, "#q", "aria-activedescendant")).not.toBeNull();
  await p.keyboard.press("Enter");
  expect(await p.title()).toBe("neu");
  await p.close();
}, 30_000);

test("a toast is announced, an error stays and carries role=alert, others close themselves, and a toast raises into an open modal", async () => {
  const p = await page(`<dialog id="d" class="hw-dialog"><p>x</p></dialog>`, "en");
  await p.evaluate(() => {
    const w = window as unknown as { HW: { toast: (m: string, o?: object) => void } };
    w.HW.toast("Saved", { tone: "success", duration: 80 });
    w.HW.toast("<b>Failed</b>", { tone: "error", duration: 80 });
  });
  expect(await p.$eval(".hw-toasts", (b) => b.getAttribute("aria-live"))).toBe("polite");
  expect(await p.$eval('.hw-toast[data-tone="error"] .hw-toast-text', (t) => t.textContent)).toBe(
    "<b>Failed</b>",
  );
  expect(await p.$eval('.hw-toast[data-tone="error"]', (t) => t.getAttribute("role"))).toBe(
    "alert",
  );
  expect(await p.$eval(".hw-toast-close", (b) => b.getAttribute("aria-label"))).toBe("Close");
  await new Promise((r) => setTimeout(r, 2000));
  expect(await p.$$eval('.hw-toast[data-tone="success"]', (t) => t.length)).toBe(0);
  expect(await p.$$eval('.hw-toast[data-tone="error"]', (t) => t.length)).toBe(1);
  await p.evaluate(() => {
    (document.querySelector("#d") as HTMLDialogElement).showModal();
    (window as unknown as { HW: { toast: (m: string) => void } }).HW.toast("In");
  });
  expect(await p.$eval(".hw-toasts", (b) => b.parentElement?.id)).toBe("d");
  await p.close();
}, 30_000);

test("a tooltip shows on keyboard focus and closes on Escape", async () => {
  const p = await page(
    `<button id="x" aria-describedby="t">A</button><span id="t" role="tooltip" popover="manual" class="hw-tooltip">T</span>`,
  );
  await p.keyboard.press("Tab");
  expect(await p.$eval("#t", (t) => t.matches(":popover-open"))).toBe(true);
  await p.keyboard.press("Escape");
  expect(await p.$eval("#t", (t) => t.matches(":popover-open"))).toBe(false);
  await p.close();
}, 30_000);

test("a carousel's step moves the track, updates the dots and announces, the ends disable", async () => {
  const p = await page(
    `<div class="hw-carousel" style="width:300px"><ul class="hw-carousel-track"><li style="flex-basis:100%">1</li><li style="flex-basis:100%">2</li></ul><div class="hw-carousel-controls"><button data-hw-step="-1" id="p">P</button><span data-hw-position></span><button data-hw-step="1" id="n">N</button><p class="hw-sr-only" aria-live="polite"></p></div></div>`,
  );
  expect(await p.$$eval(".hw-carousel-dot", (d) => d.length)).toBe(2);
  expect(await p.$eval("#p", (b) => (b as HTMLButtonElement).disabled)).toBe(true);
  await p.click("#n");
  expect(await p.$eval(".hw-sr-only", (s) => s.textContent)).toBe("2 von 2");
  expect(await p.$eval("#n", (b) => (b as HTMLButtonElement).disabled)).toBe(true);
  await p.close();
}, 30_000);

// The carousel's long timers (the step and the reader's hold), captured so a test fires them
// itself; shorter ones run as usual.
const CAPTURE_TIMERS = `<script>{
  const [set, clear] = [setTimeout.bind(window), clearTimeout.bind(window)];
  let n = 1e6;
  window.timers = new Map();
  window.setTimeout = (f, ms, ...a) => (ms >= 1000 ? (window.timers.set(++n, [f, ms]), n) : set(f, ms, ...a));
  window.clearTimeout = (id) => window.timers.delete(id) || clear(id);
}</script>`;
type Timers = { timers: Map<number, [() => void, number]> };
/** Fires every captured timer pending now, and returns their delays. */
const fire = (p: Page) =>
  p.evaluate(() => {
    const { timers } = window as unknown as Timers;
    const due = [...timers];
    timers.clear();
    for (const [, [f]] of due) f();
    return due.map(([, [, ms]]) => Math.round(ms / 1000));
  });
const position = (p: Page) =>
  p.$$eval(".hw-carousel-dot", (dots) => dots.findIndex((d) => d.hasAttribute("aria-current")));
const AUTOPLAY = `${CAPTURE_TIMERS}<div class="hw-carousel" data-hw-autoplay style="width:300px"><ul class="hw-carousel-track"><li style="flex-basis:100%">1</li><li style="flex-basis:100%">2</li><li style="flex-basis:100%">3</li></ul><div class="hw-carousel-controls"><button data-hw-step="-1">P</button><span data-hw-position></span><button data-hw-step="1">N</button><button data-hw-pause id="pause" aria-pressed="false">II</button><p class="hw-sr-only" aria-live="polite"></p></div></div><p id="away" style="margin-top:400px">away</p>`;

test("an autoplaying carousel advances each step, holds under the pointer and stops on pause", async () => {
  const p = await page(AUTOPLAY);
  expect(await position(p)).toBe(0);
  expect(await fire(p)).toEqual([6]);
  expect(await position(p)).toBe(1);
  await p.hover(".hw-carousel-track");
  expect(await fire(p)).toEqual([]);
  expect(await p.$eval(".hw-carousel", (c) => c.hasAttribute("data-hw-held"))).toBe(true);
  await p.hover("#away");
  await fire(p);
  expect(await position(p)).toBe(2);
  await p.click("#pause");
  expect(await attr(p, "#pause", "aria-pressed")).toBe("true");
  await p.hover("#away");
  expect(await fire(p)).toEqual([]);
  expect(await position(p)).toBe(2);
  await p.close();
}, 30_000);

test("a carousel holds four seconds after the reader's step, starts paused under reduced motion, hides controls with nothing to scroll", async () => {
  const p = await page(AUTOPLAY);
  await p.$eval(".hw-carousel-track", (t) => t.dispatchEvent(new PointerEvent("pointerdown")));
  expect(await fire(p)).toEqual([4]);
  expect(await position(p)).toBe(0);
  expect(await fire(p)).toEqual([6]);
  expect(await position(p)).toBe(1);
  await p.close();
  const still = await page(AUTOPLAY, "de", true);
  expect(await attr(still, "#pause", "aria-pressed")).toBe("true");
  expect(await fire(still)).toEqual([]);
  await still.click("#pause");
  expect(await fire(still)).toEqual([6]);
  expect(await position(still)).toBe(1);
  await still.close();
  const one = await page(
    `<div class="hw-carousel" style="width:300px"><ul class="hw-carousel-track"><li style="flex-basis:100%">1</li></ul><div class="hw-carousel-controls"><button data-hw-step="-1">P</button><span data-hw-position></span><button data-hw-step="1">N</button></div></div>`,
  );
  expect(await one.$eval(".hw-carousel-controls", (c) => (c as HTMLElement).hidden)).toBe(true);
  await one.close();
}, 30_000);

test("a carousel takes controls named by id, keeps dots the page wrote, and wires alone", async () => {
  const items = `<ul class="hw-carousel-track"><li style="flex-basis:100%">1</li><li style="flex-basis:100%">2</li></ul>`;
  const dot = (n: number) =>
    `<button type="button" class="hw-carousel-dot" aria-label="Stimme ${n}"><span></span></button>`;
  const controls = `<div class="hw-carousel-controls" id="c"><button data-hw-step="-1">P</button><span data-hw-position>${dot(1)}${dot(2)}</span><button data-hw-step="1" id="n">N</button></div>`;
  const body = `<div class="hw-carousel" data-hw-controls="c" style="width:300px">${items}</div><p>Text</p>${controls}`;
  const p = await page(body);
  expect(
    await p.$$eval(".hw-carousel-dot", (d) => d.map((x) => x.getAttribute("aria-label"))),
  ).toEqual(["Stimme 1", "Stimme 2"]);
  await p.click("#n");
  await p.waitForFunction(() => document.querySelector(".hw-carousel-track")!.scrollLeft > 0);
  expect(
    await p.$$eval(".hw-carousel-dot", (d) => d.map((x) => x.getAttribute("aria-current"))),
  ).toEqual([null, "true"]);
  await p.close();
  // carousels() alone wires the carousel and installs no document-wide handler, such as the toast
  // region.
  const alone = await browser.newPage();
  const f = join(dir, "carousels-alone.html");
  writeFileSync(
    f,
    `<!doctype html><html lang="de"><head>${css}</head><body>${body}<script src="b.js"></script><script>HW.carousels();</script></body></html>`,
  );
  await open(alone, pathToFileURL(f).href);
  await alone.click("#n");
  await alone.waitForFunction(() => document.querySelector(".hw-carousel-track")!.scrollLeft > 0);
  expect(await alone.$$eval("[aria-live]", (r) => r.length)).toBe(0);
  await alone.close();
}, 30_000);

test("controls outside an autoplaying carousel show its state and hold it while used", async () => {
  const items = `<ul class="hw-carousel-track"><li style="flex-basis:100%">1</li><li style="flex-basis:100%">2</li></ul>`;
  const controls = `<div class="hw-carousel-controls" id="c"><button data-hw-step="-1">P</button><span data-hw-position></span><button data-hw-step="1" id="n">N</button></div>`;
  const p = await page(
    `<div id="k" class="hw-carousel" data-hw-autoplay data-hw-controls="c" style="width:300px">${items}</div><p>Text</p>`,
  );
  // Wired once its controls are there.
  await p.evaluate((html) => {
    document.body.insertAdjacentHTML("beforeend", html);
    (window as unknown as { HW: { enhance: () => void } }).HW.enhance();
  }, controls);
  expect(await p.$eval("#c", (c) => c.hasAttribute("data-hw-autoplay"))).toBe(true);
  await p.focus("#n");
  expect(await p.$eval("#k", (c) => c.hasAttribute("data-hw-held"))).toBe(true);
  expect(await p.$eval("#c", (c) => c.hasAttribute("data-hw-held"))).toBe(true);
  await p.close();
}, 30_000);

// The clipboard as a page sees it: each text copies or fails after its own delay, the hidden
// field's execCommand answers `exec`, and every hw-copy event is logged.
const CLIPBOARD = () => {
  const w = window as unknown as {
    copied: string[];
    events: [string, boolean][];
    plan: Record<string, { fail?: boolean; ms?: number }>;
    exec: boolean;
  };
  Object.assign(w, { copied: [], events: [], plan: {}, exec: false });
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: async (t: string) => {
        const { fail, ms = 0 } = w.plan[t] ?? {};
        await new Promise((r) => setTimeout(r, ms));
        if (fail) throw new Error("denied");
        w.copied.push(t);
      },
    },
  });
  document.execCommand = () => w.exec;
  document.addEventListener("hw-copy", (e) =>
    w.events.push([(e.target as HTMLElement).id, (e as CustomEvent<{ ok: boolean }>).detail.ok]),
  );
};
type Clip = { copied: string[]; events: [string, boolean][] };
const text = (p: Page, sel: string) => p.$eval(sel, (b) => b.textContent);
const settled = (p: Page, n: number) =>
  p.waitForFunction((k) => (window as unknown as Clip).events.length === k, {}, n);
const TWO = `<button id="a" data-hw-copy="https://example.org/a" hidden>Copy link</button><button id="b" data-hw-copy="b@example.org" hidden>Copy address</button>`;

test("a copy button shows once wired, copies its text, says so on itself one at a time, and tells the page", async () => {
  const p = await page(TWO, "en");
  await p.evaluate(CLIPBOARD);
  expect(await p.$eval("#a", (b) => (b as HTMLElement).hidden)).toBe(false);
  await p.click("#a");
  await settled(p, 1);
  expect(await text(p, "#a")).toBe("Copied");
  expect(await p.$eval("[data-hw-copy-status]", (n) => n.textContent)).toBe("Copied");
  await p.click("#b");
  await settled(p, 2);
  expect(await text(p, "#b")).toBe("Copied");
  expect(await text(p, "#a")).toBe("Copy link");
  expect(await p.evaluate(() => (window as unknown as Clip).copied)).toEqual([
    "https://example.org/a",
    "b@example.org",
  ]);
  expect(await p.evaluate(() => (window as unknown as Clip).events)).toEqual([
    ["a", true],
    ["b", true],
  ]);
  await p.close();
}, 30_000);

test("a refused copy falls back to a hidden field, and fails only where that fails too", async () => {
  const p = await page(`<p>b@example.org</p>${TWO}`, "en");
  await p.evaluate(CLIPBOARD);
  await p.evaluate(() => {
    const w = window as unknown as { plan: object; exec: boolean };
    w.plan = { "https://example.org/a": { fail: true }, "b@example.org": { fail: true } };
    w.exec = true;
  });
  await p.click("#a");
  await settled(p, 1);
  expect(await text(p, "#a")).toBe("Copied");
  expect(await p.$$eval("textarea", (t) => t.length)).toBe(0);
  expect(await p.evaluate(() => document.activeElement?.id)).toBe("a");
  await p.evaluate(() => ((window as unknown as { exec: boolean }).exec = false));
  // The address stands on the page, the link does not: only the first failure points at the text.
  await p.click("#b");
  await settled(p, 2);
  expect(await text(p, "#b")).toBe("Copy failed: select the text");
  await p.click("#a");
  await settled(p, 3);
  expect(await text(p, "#a")).toBe("Copy failed");
  expect(await p.evaluate(() => (window as unknown as Clip).events)).toEqual([
    ["a", true],
    ["b", false],
    ["a", false],
  ]);
  await p.close();
}, 30_000);

test("a failed copy leaves the button that still holds the clipboard reading Copied", async () => {
  const p = await page(TWO, "en");
  await p.evaluate(CLIPBOARD);
  await p.evaluate(() => {
    (window as unknown as { plan: object }).plan = { "b@example.org": { fail: true } };
  });
  await p.click("#a");
  await settled(p, 1);
  await p.click("#b");
  await settled(p, 2);
  expect(await text(p, "#a")).toBe("Copied");
  expect(await text(p, "#b")).toBe("Copy failed");
  await p.close();
}, 30_000);

test("a failure that arrives after a later press still shows on its button", async () => {
  const p = await page(TWO, "en");
  await p.evaluate(CLIPBOARD);
  await p.evaluate(() => {
    (window as unknown as { plan: object }).plan = {
      "https://example.org/a": { fail: true, ms: 300 },
    };
  });
  await p.click("#a");
  await p.click("#b");
  await settled(p, 2);
  expect(await text(p, "#b")).toBe("Copied");
  expect(await text(p, "#a")).toBe("Copy failed");
  await p.close();
}, 30_000);

test("a newer press of the same button decides what it says, whichever answers last", async () => {
  const p = await page(TWO, "en");
  await p.evaluate(CLIPBOARD);
  await p.evaluate(() => {
    (window as unknown as { plan: object }).plan = {
      "https://example.org/a": { fail: true, ms: 300 },
    };
  });
  await p.click("#a");
  await p.evaluate(() => {
    (window as unknown as { plan: object }).plan = {};
  });
  await p.click("#a");
  await settled(p, 2);
  expect(await text(p, "#a")).toBe("Copied");
  await p.close();
}, 30_000);

test("a failure points at the text only where it stands outside the copy button", async () => {
  const p = await page(
    `<button id="a" data-hw-copy="b@example.org" hidden>b@example.org</button><p hidden>b@example.org</p>`,
    "en",
  );
  await p.evaluate(CLIPBOARD);
  await p.evaluate(() => {
    (window as unknown as { plan: object }).plan = { "b@example.org": { fail: true } };
  });
  await p.click("#a");
  await settled(p, 1);
  expect(await text(p, "#a")).toBe("Copy failed");
  await p.close();
}, 30_000);

/** A page with only copy.js and `head`, `script` running once it is parsed. */
const copyPage = async (body: string, script: string, head = "") => {
  const p = await browser.newPage();
  const f = join(dir, `${Math.random().toString(36).slice(2)}.html`);
  writeFileSync(
    f,
    `<!doctype html><html lang="de"><head>${head}</head><body>${body}<script src="copy.js"></script><script>${script}</script></body></html>`,
  );
  await open(p, pathToFileURL(f).href);
  return p;
};

test("copy.ts alone wires copy buttons with sr-only.css as its only stylesheet", async () => {
  const p = await copyPage(
    TWO,
    "HWCopy.copyButtons();",
    `<link rel="stylesheet" href="${brand("elements/sr-only.css")}">`,
  );
  await p.evaluate(CLIPBOARD);
  await p.click("#a");
  await settled(p, 1);
  expect(await text(p, "#a")).toBe("Kopiert");
  expect(await p.$$eval(".hw-toasts", (t) => t.length)).toBe(0);
  const region = await p.$eval("[data-hw-copy-status]", (r) => [
    r.className,
    r.getBoundingClientRect().width,
  ]);
  expect(region).toEqual(["hw-sr-only", 1]);
  await p.close();
}, 30_000);

test("wiring copy buttons looks up the page a fixed number of times, however many there are", async () => {
  const lookups = async (n: number) => {
    const p = await copyPage(
      `<button data-hw-copy="x" hidden>Copy</button>`.repeat(n),
      `let calls = 0; for (const t of [Document.prototype, Element.prototype]) for (const k of ["querySelector", "querySelectorAll"]) { const q = t[k]; t[k] = function (...a) { calls++; return q.apply(this, a); }; } HWCopy.copyButtons(); window.calls = calls;`,
    );
    const calls = await p.evaluate(() => (window as unknown as { calls: number }).calls);
    await p.close();
    return calls;
  };
  const few = await lookups(2);
  expect(few).toBeGreaterThan(0);
  expect(await lookups(1000)).toBe(few);
}, 30_000);

test("the copy live region exists before the first copy and moves into a modal as it opens", async () => {
  const p = await page(
    `${TWO}<dialog id="d"><button id="c" data-hw-copy="c" hidden>Copy</button></dialog>`,
  );
  // The region moves in the dialog's toggle and close events, which run after the call.
  const inside = (tag: string) =>
    p.waitForFunction(
      (t) => document.querySelector("[data-hw-copy-status]")?.parentElement?.tagName === t,
      { timeout: 5000 },
      tag,
    );
  expect(await p.$$eval("[data-hw-copy-status]", (r) => r.length)).toBe(1);
  await inside("BODY");
  await p.evaluate(() => (document.getElementById("d") as HTMLDialogElement).showModal());
  await inside("DIALOG");
  await p.evaluate(() => (document.getElementById("d") as HTMLDialogElement).close());
  await inside("BODY");
  await p.close();
}, 30_000);

test("two bundles on one page wire each control once: one copy per press, one tab per arrow", async () => {
  const p = await copyPage(
    `<div role="tablist" class="hw-tabs"><button role="tab" class="hw-tab" id="t1" aria-selected="true">A</button><button role="tab" class="hw-tab" id="t2" aria-selected="false">B</button><button role="tab" class="hw-tab" id="t3" aria-selected="false">C</button></div>${TWO}<script src="b.js"></script><script src="b2.js"></script>`,
    "HW.enhance(); HW2.enhance(); HWCopy.copyButtons();",
  );
  await p.evaluate(CLIPBOARD);
  await p.click("#a");
  await p.waitForFunction(() => (window as unknown as Clip).events.length > 0);
  await new Promise((r) => setTimeout(r, 300));
  expect(await p.evaluate(() => (window as unknown as Clip).copied)).toEqual([
    "https://example.org/a",
  ]);
  expect(await p.evaluate(() => (window as unknown as Clip).events)).toEqual([["a", true]]);
  await p.focus("#t1");
  await p.keyboard.press("ArrowRight");
  expect(await active(p)).toBe("B");
  await p.close();
}, 30_000);

test("a lone copyButton call wires its button and sets up the live region", async () => {
  const p = await copyPage(TWO, `HWCopy.copyButton(document.getElementById("a"));`);
  expect(await p.$$eval("[data-hw-copy-status]", (r) => r.length)).toBe(1);
  expect(await p.$$eval("button", (b) => b.map((x) => x.hidden))).toEqual([false, true]);
  await p.close();
}, 30_000);

test("a segment takes the control's letter case and tracking, a button's included", async () => {
  const p = await page(
    `<div class="hw-segmented" style="text-transform: uppercase; letter-spacing: 2px"><a href="#">Ansicht</a><button>Liste</button></div>`,
  );
  const style = await p.$$eval(".hw-segmented > *", (els) =>
    els.map((e) => [getComputedStyle(e).textTransform, getComputedStyle(e).letterSpacing]),
  );
  expect(style).toEqual([
    ["uppercase", "2px"],
    ["uppercase", "2px"],
  ]);
  await p.close();
}, 30_000);

test("the behaviour files hold no markup built from strings they did not create", () => {
  for (const f of ["elements/behaviour.ts", "elements/copy.ts"])
    expect(readFileSync(join(ROOT, f), "utf8")).not.toMatch(/innerHTML|insertAdjacentHTML/);
});

// A catalogue's static sample shows an element's hover with data-hw-hover, as data-hw-focus does
// its focus: every hover rule of the elements takes the attribute too.
test("every hover rule of the elements also answers data-hw-hover", async () => {
  const bare: string[] = [];
  for (const f of new Bun.Glob("elements/*.css").scanSync(ROOT))
    for (const m of readFileSync(join(ROOT, f), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .matchAll(/:hover(?![\w-]|,\s*\[data-hw-hover\])/g))
      bare.push(`${f}@${m.index}`);
  expect(bare).toEqual([]);
  const p = await page(
    `<button class="hw-button" id="n">A</button><button class="hw-button" id="h" data-hw-hover>B</button>`,
  );
  const fill = (s: string) => p.$eval(s, (e) => getComputedStyle(e).backgroundColor);
  expect(await fill("#h")).not.toBe(await fill("#n"));
  await p.close();
}, 30_000);

test("the character count reads the limit, then the overrun as an error, and back", async () => {
  const p = await browser.newPage();
  const f = join(dir, "count.html");
  writeFileSync(
    f,
    `<!doctype html><html lang="de"><head>${css}</head><body data-hw-scale="screen"><textarea class="hw-field" id="n" aria-describedby="n-count">abc</textarea><p class="hw-form-count" id="n-count" data-for="n" data-max="5" data-left="Noch {n} Zeichen" data-over="{n} Zeichen zu viel">Höchstens 5 Zeichen</p><script src="form.js"></script></body></html>`,
  );
  await open(p, pathToFileURL(f).href);
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  const before = await p.$eval("#n-count", (c) => getComputedStyle(c).color);
  await p.evaluate(() =>
    (window as unknown as { HWForm: { enhanceForms(): void } }).HWForm.enhanceForms(),
  );
  const read = () =>
    p.evaluate(() => [
      document.getElementById("n-count")!.textContent,
      document.getElementById("n-count")!.dataset.state ?? null,
      document.getElementById("n")!.getAttribute("aria-invalid"),
      getComputedStyle(document.getElementById("n-count")!).color,
    ]);
  const [left, , , quiet] = await read();
  expect([left, quiet]).toEqual(["Noch 2 Zeichen", before]);
  await p.type("#n", "defg");
  const [overText, state, invalid, red] = await read();
  expect([overText, state, invalid]).toEqual(["2 Zeichen zu viel", "over", "true"]);
  expect(red).not.toBe(quiet);
  await p.keyboard.press("Backspace");
  await p.keyboard.press("Backspace");
  expect((await read()).slice(0, 3)).toEqual(["Noch 0 Zeichen", null, null]);
  expect(errors).toEqual([]);
  await p.close();
}, 30_000);

test("a scrolling table's wrapper is a tab stop while its table scrolls, none while it fits", async () => {
  const row = (n: number) => `<tr>${"<td>Spalte mit Inhalt</td>".repeat(n)}</tr>`;
  const wrap = (id: string, n: number) =>
    `<div id="${id}" class="hw-table-scroll" tabindex="0" role="region" aria-label="${id}" style="width: 20rem"><table class="hw-table">${row(n)}</table></div>`;
  const p = await page(wrap("wide", 8) + wrap("narrow", 1));
  await p.waitForFunction(() => !document.getElementById("narrow")!.hasAttribute("tabindex"));
  expect(await attr(p, "#wide", "tabindex")).toBe("0");
  await p.$eval("#narrow tr", (tr) => tr.insertAdjacentHTML("beforeend", "<td>x</td>".repeat(30)));
  await p.waitForFunction(
    () => document.getElementById("narrow")!.getAttribute("tabindex") === "0",
  );
  await p.close();
});

/** Whether the focus ring of the control at `sel` shows whole: a purple column at its left and at
 * its right, nearly its height. */
const ringWhole = async (p: Page, sel: string) => {
  const a = (await p.$(sel))!;
  await a.evaluate((e) => e.setAttribute("data-hw-focus", ""));
  const r = (await a.boundingBox())!;
  const clip = { x: r.x - 8, y: r.y - 8, width: r.width + 16, height: r.height + 16 };
  // Within the viewport: capturing beyond it lays the page out again and moves the scroll.
  const { data, info } = await sharp(await p.screenshot({ clip, captureBeyondViewport: false }))
    .raw()
    .toBuffer({ resolveWithObject: true });
  await a.evaluate((e) => e.removeAttribute("data-hw-focus"));
  const columns = Array.from({ length: info.width }, (_, x) => {
    let n = 0;
    for (let y = 0; y < info.height; y++) {
      const i = (y * info.width + x) * info.channels;
      if (data[i + 2]! > 180 && data[i + 1]! < 110 && data[i]! > 100) n++;
    }
    return n;
  });
  return [columns.slice(0, 12), columns.slice(-12)].every((c) => Math.max(...c) >= r.height * 0.8);
};

test("a scrolling table starts where the text does, its ring room past it; a fitting one sits where a bare one does; a control at either side keeps its whole ring", async () => {
  const wide = (id: string) =>
    `<div id="${id}" class="hw-table-scroll" tabindex="0"><table class="hw-table"><tr><td><a class="hw-link" href="#a">Erste</a></td>${"<td>Spalte mit Inhalt</td>".repeat(16)}<td><a class="hw-link" href="#b">Letzte</a></td></tr></table></div>`;
  const fits = `<div id="fits" class="hw-table-scroll" tabindex="0"><table class="hw-table"><tr><td><a class="hw-link" href="#a">Erste</a></td><td><a class="hw-link" href="#b">Letzte</a></td></tr></table></div>`;
  const p = await page(
    `<div class="hw-focus-ring" style="width: 30rem"><div>${wide("plain")}</div><blockquote class="hw-quote">${wide("quote")}</blockquote><div class="hw-card">${wide("card")}</div><div>${fits}</div></div>`,
  );
  await p.waitForFunction(() => document.getElementById("fits")!.dataset.hwScrolls === "false");
  // Per wrapper: its mark, the container's own overflow, how far the wrapper reaches past the
  // container's box, and how far the table starts from the container's content edge. A scrolling
  // table reaches past a container without side padding by the ring's room, inside a card's.
  expect(
    await p.$$eval(".hw-table-scroll", (ws) =>
      ws.map((w) => {
        const c = w.parentElement!;
        const [a, b] = [c.getBoundingClientRect(), w.getBoundingClientRect()];
        const start =
          a.left +
          parseFloat(getComputedStyle(c).borderLeftWidth) +
          parseFloat(getComputedStyle(c).paddingLeft);
        return [
          (w as HTMLElement).dataset.hwScrolls,
          c.scrollWidth - c.clientWidth,
          Math.max(0, a.left - b.left, b.right - a.right),
          w.querySelector("table")!.getBoundingClientRect().left - start,
        ];
      }),
    ),
  ).toEqual([
    ["true", 5, 5, 0],
    ["true", 5, 5, 0],
    ["true", 0, 0, 0],
    ["false", 0, 0, 0],
  ]);
  for (const [wrapper, link, end] of [
    ["#plain", "td:first-child a", false],
    ["#plain", "td:last-child a", true],
    ["#fits", "td:first-child a", false],
    ["#fits", "td:last-child a", false],
  ] as const) {
    await p.$eval(
      wrapper,
      async (w, end) => {
        w.scrollLeft = end ? w.scrollWidth : 0;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      },
      end,
    );
    const whole = await ringWhole(p, `${wrapper} ${link}`);
    expect({ wrapper, link, whole }).toEqual({ wrapper, link, whole: true });
  }
  // On paper a scrolling table keeps no room: it starts where a bare one does.
  await p.emulateMediaType("print");
  expect(
    await p.$eval("#plain", (w) => [
      getComputedStyle(w).paddingLeft,
      getComputedStyle(w).marginLeft,
    ]),
  ).toEqual(["0px", "0px"]);
  await p.close();
});

// The room a scrolling table takes widens the wrapper's box, never its content box, which the mark
// measures: a table a few pixels wider than its column stays marked.
test("a table a few pixels wider than its column stays marked as scrolling", async () => {
  const p = await page(
    `<div style="width: 400px"><div id="near" class="hw-table-scroll" tabindex="0"><table class="hw-table" style="width: 405px"><tr><td>Zelle</td></tr></table></div></div>`,
  );
  await p.waitForFunction(() => document.getElementById("near")!.dataset.hwScrolls === "true");
  // The table grows by a pixel after the mark, as it does when a font loads.
  await p.$eval("#near table", async (t) => {
    (t as HTMLElement).style.width = "406px";
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 200))),
    );
  });
  expect(await p.$eval("#near", (w) => (w as HTMLElement).dataset.hwScrolls)).toBe("true");
  await p.close();
});

test("under CSS zoom a table that fits its column is not marked as scrolling", async () => {
  // A table filling its column exactly: the padding counted unzoomed would leave it short.
  const p = await page(
    `<div style="zoom: 0.5; width: 400px"><div id="z" class="hw-table-scroll" tabindex="0" data-hw-scrolls="true" style="width: 400px"><table class="hw-table" style="width: 100%"><tr><td>Zelle</td></tr></table></div></div>`,
  );
  await p.waitForFunction(() => document.getElementById("z")!.dataset.hwScrolls === "false", {
    timeout: 3000,
  });
  expect(await p.$eval("#z", (w) => w.scrollWidth > w.clientWidth)).toBe(false);
  await p.close();
});

// A grid or flex item cannot shrink below a visible overflow's content: a table that fit once would
// hold its column wide and the page would scroll sideways.
test("a table that fits in a grid starts to scroll when the grid narrows", async () => {
  const p = await page(
    `<div id="grid" style="display: grid; width: 1200px"><div id="t" class="hw-table-scroll" tabindex="0"><table class="hw-table" style="width: 600px"><tr><td>Zelle</td></tr></table></div></div>`,
  );
  await p.waitForFunction(() => document.getElementById("t")!.dataset.hwScrolls === "false");
  await p.$eval("#grid", (g) => ((g as HTMLElement).style.width = "300px"));
  await p.waitForFunction(() => document.getElementById("t")!.dataset.hwScrolls === "true", {
    timeout: 3000,
  });
  expect(await p.$eval("#t", (w) => w.getBoundingClientRect().width)).toBeLessThanOrEqual(310);
  await p.close();
});

test("a scrolling table shows a shadow at each side with more to see, a table that fits none", async () => {
  const wrap = (id: string, n: number) =>
    `<div id="${id}" class="hw-table-scroll" tabindex="0" style="width: 20rem"><table class="hw-table"><tr>${"<td>Spalte mit Inhalt</td>".repeat(n)}</tr></table></div>`;
  const p = await page(wrap("wide", 16) + wrap("fits", 1));
  const sides = (id: string, to: number | "end") =>
    p.$eval(
      `#${id}`,
      async (w, to) => {
        w.scrollLeft = to === "end" ? w.scrollWidth : to;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const s = getComputedStyle(w);
        return [s.getPropertyValue("--_hw-table-start"), s.getPropertyValue("--_hw-table-end")];
      },
      to,
    );
  expect(await sides("wide", 0)).toEqual(["0", "1"]);
  expect(await sides("wide", 100)).toEqual(["1", "1"]);
  expect(await sides("wide", "end")).toEqual(["1", "0"]);
  expect(await sides("fits", 0)).toEqual(["0", "0"]);
  // Both shadows are drawn: an invalid colour would leave the background none.
  expect(
    await p.$eval(
      "#wide",
      (w) => getComputedStyle(w).backgroundImage.match(/radial-gradient/g)?.length,
    ),
  ).toBe(2);
  await p.close();
});

// axe reads no contrast over a gradient, so the catalog's contrast check takes the shadow off; this
// measures what it leaves out: each table text colour over its ground with the shadow at full.
test("every table text colour keeps AA contrast over the edge shadow at full strength", async () => {
  const table = `<div class="hw-table-scroll" data-hw-scrolls="true"><table class="hw-table"><thead><tr><th>Kopf</th></tr></thead><tbody><tr><td>Zelle <a class="hw-link" href="#a">Link</a></td></tr></tbody></table></div>`;
  const grounds = (theme: string) =>
    `<div data-theme="${theme}" style="background: ${theme === "dark" ? "var(--color-night); color: var(--color-night-ink)" : "var(--color-white); color: var(--color-ink)"}; padding: 1rem"><div>${table}</div><blockquote class="hw-quote">${table}</blockquote><div class="hw-card" data-variant="tint">${table}</div></div>`;
  const p = await page(grounds("light") + grounds("dark"));
  const lowest = (cue = "") =>
    p.evaluate((cue) => {
      const probe = document.createElement("i");
      // A colour in sRGB channels 0 to 1 and its alpha, from whatever form the browser computes.
      const rgba = (el: Element, colour: string) => {
        probe.style.color = colour;
        el.append(probe);
        const c = getComputedStyle(probe).color;
        probe.remove();
        const n = c.match(/[\d.]+/g)!.map(Number);
        const [r, g, b, a = 1] = c.startsWith("color(")
          ? n
          : [n[0]! / 255, n[1]! / 255, n[2]! / 255, n[3]];
        return [r!, g!, b!, a];
      };
      const lum = ([r, g, b]: number[]) =>
        [r!, g!, b!]
          .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i]!, 0);
      return Math.min(
        ...[...document.querySelectorAll<HTMLElement>(".hw-table-scroll")].flatMap((w) => {
          if (cue) w.style.setProperty("--_hw-table-cue", cue);
          // The ground: each background from the wrapper's parent down to the first opaque one.
          const layers: number[][] = [];
          for (let g = w.parentElement; g && layers.at(-1)?.[3] !== 1; g = g.parentElement)
            layers.push(rgba(g, getComputedStyle(g).backgroundColor));
          const over = (base: number[], top: number[]) =>
            base.slice(0, 3).map((v, i) => v * (1 - top[3]!) + top[i]! * top[3]!);
          const ground = layers.reduceRight((base, top) => over(base, top), [1, 1, 1]);
          const under = over(ground, rgba(w, "var(--_hw-table-cue)"));
          return [...w.querySelectorAll("th, td, a")].map((t) => {
            const [a, b] = [lum(rgba(t, getComputedStyle(t).color)), lum(under)];
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          });
        }),
      );
    }, cue);
  expect(await lowest()).toBeGreaterThanOrEqual(4.5);
  // The control: a shadow of full ink must fail.
  expect(await lowest("var(--color-ink)")).toBeLessThan(4.5);
  await p.close();
});

test("the held first column covers the room beside it, keeps a focused link's ring whole, and --hw-table-held: none turns it off", async () => {
  const wide = (id: string, style = "") =>
    `<div id="${id}" class="hw-table-scroll" tabindex="0" style="${style}"><table class="hw-table">${`<tr><td><a class="hw-link" href="#a">Zeile</a></td>${"<td>Spalte mit Inhalt</td>".repeat(17)}</tr>`.repeat(2)}</table></div>`;
  const p = await page(
    '<div class="hw-focus-ring">' +
      wide("held") +
      wide("off", "--hw-table-held: none") +
      wide("table").replace(
        '<table class="hw-table">',
        '<table class="hw-table" style="--hw-table-held: none">',
      ) +
      `<div data-hw-scale="print">${wide("print")}</div>` +
      "</div>",
  );
  await p.setViewport({ width: 700, height: 600 });
  await p.waitForFunction(() => document.getElementById("held")!.dataset.hwScrolls === "true");
  // Scrolled, the held cell stands in the wrapper's room for a ring and covers the room at its left:
  // the strip beside it hits the held cell, not a scrolled one.
  const read = (id: string) =>
    p.$eval(`#${id}`, async (w) => {
      w.scrollLeft = 120;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const td = w.querySelector("td")!;
      const s = getComputedStyle(td);
      const [a, b] = [w.getBoundingClientRect(), td.getBoundingClientRect()];
      return {
        gap: b.left - a.left,
        strip: document.elementFromPoint(a.left + 2, (b.top + b.bottom) / 2) === td,
        position: s.position,
        maxWidth: s.maxWidth,
        animation: s.animationName,
        padding: getComputedStyle(w).scrollPaddingInlineStart,
      };
    });
  expect(await read("held")).toEqual({
    gap: 5,
    strip: true,
    position: "sticky",
    maxWidth: "280px",
    animation: "hw-table-held",
    padding: "290px",
  });
  expect(await ringWhole(p, "#held td:first-child a")).toBe(true);
  expect(await read("off")).toMatchObject({
    position: "static",
    maxWidth: "none",
    animation: "none",
    padding: "auto",
  });
  // Set on the table, it reaches the cells; the wrapper keeps its scroll padding.
  expect(await read("table")).toMatchObject({
    position: "static",
    maxWidth: "none",
    animation: "none",
    padding: "290px",
  });
  // A print-scale page on a narrow screen holds no column either.
  expect(await read("print")).toMatchObject({
    position: "static",
    maxWidth: "none",
    animation: "none",
  });
  await p.close();
});

test("the rehype step wraps each table in a named hw-table-scroll", () => {
  type Node = Parameters<ReturnType<typeof tableScroll>>[0];
  const el = (tagName: string, children: Node[] = [], properties = {}): Node => ({
    type: "element",
    tagName,
    properties,
    children,
  });
  const t = (s: string): Node => ({ type: "text", value: s });
  const table = (head: string) =>
    el("table", [el("thead", [el("tr", [el("th", [t(head)]), el("th", [t("Wert")])])])], {
      className: ["own"],
    });
  const wrapped = el("div", [table("C")], { className: ["hw-table-scroll"] });
  const tree: Node & { children: Node[] } = {
    type: "root",
    children: [
      table("Name"),
      el("h2", [t(" Preis"), el("strong", [t("e")])]),
      table("A"),
      el("p"),
      table("B"),
      wrapped,
    ],
  };
  tableScroll()(tree);
  const wrappers = tree.children.filter((c) => c.tagName === "div" && c !== wrapped) as {
    properties: Record<string, unknown>;
    children: { properties: Record<string, unknown> }[];
  }[];
  expect(wrappers.map((w) => w.properties)).toEqual([
    { className: ["hw-table-scroll"], tabIndex: 0, role: "region", ariaLabel: "Name Wert" },
    { className: ["hw-table-scroll"], tabIndex: 0, role: "region", ariaLabel: "Preise" },
    { className: ["hw-table-scroll"], tabIndex: 0, role: "region", ariaLabel: "Preise (2)" },
  ]);
  expect(wrappers[0]!.children[0]!.properties.className).toEqual(["own", "hw-table"]);
  // A table already in a wrapper keeps it: one tab stop, one region.
  expect(wrapped.children![0]!.tagName).toBe("table");
});

test("the Sätteri plugin writes what the rehype step writes, its count fresh in each document", () => {
  const md = [
    "| Name | Wert |\n| - | - |\n| a | 1 |",
    "## Preis*e*",
    "| A | B |\n| - | - |\n| 1 | 2 |",
    "Text",
    "| C | D |\n| - | - |\n| 3 | 4 |",
    "> | Q | R |\n> | - | - |\n> | 5 | 6 |",
  ].join("\n\n");
  const tree = markdownToHast(md);
  tableScroll()(tree as Parameters<ReturnType<typeof tableScroll>>[0]);
  const plugin = () => markdownToHtml(md, { hastPlugins: [tableScrollPlugin] }).html.trimEnd();
  const first = plugin();
  expect(first).toBe(hastToHtml(tree).trimEnd());
  expect([...first.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1])).toEqual([
    "Name Wert",
    "Preise",
    "Preise (2)",
    "Preise (3)",
  ]);
  expect(plugin()).toBe(first);
});

test("no two scrolling tables share a region name, under a repeated heading or without one", () => {
  const t = "| Name | Wert |\n| - | - |\n| a | 1 |";
  const empty = "|  |  |\n| - | - |\n| a | 1 |";
  const md = [t, t, "## Beispiel", t, "## Beispiel", t, "## Beispiel (2)", t].join("\n\n");
  const html = markdownToHtml(md, { hastPlugins: [tableScrollPlugin] }).html;
  expect([...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1])).toEqual([
    "Name Wert",
    "Name Wert (2)",
    "Beispiel",
    "Beispiel (2)",
    "Beispiel (2) (2)",
  ]);
  // A table with neither heading nor column heads stays unnamed, however many there are.
  const bare = markdownToHtml([empty, empty].join("\n\n"), {
    hastPlugins: [tableScrollPlugin],
  }).html;
  expect(bare).not.toContain("aria-label");
});
