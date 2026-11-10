import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser, Page } from "puppeteer-core";
import { launch, open } from "../scan/markers";
import { ROOT } from "../scripts/git";

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

// The autoplay timer, captured so a test runs its ticks itself: `steps` six-second steps of 200 ms
// ticks.
const CAPTURE_TICKS = `<script>window.ticks = []; window.setInterval = (f) => window.ticks.push(f);</script>`;
const tick = (p: Page, steps = 1) =>
  p.evaluate((n) => {
    for (let i = 0; i < n; i++)
      (window as unknown as { ticks: (() => void)[] }).ticks.forEach((f) => f());
  }, steps * 30);
const position = (p: Page) =>
  p.$$eval(".hw-carousel-dot", (dots) => dots.findIndex((d) => d.hasAttribute("aria-current")));
const AUTOPLAY = `${CAPTURE_TICKS}<div class="hw-carousel" data-hw-autoplay style="width:300px"><ul class="hw-carousel-track"><li style="flex-basis:100%">1</li><li style="flex-basis:100%">2</li><li style="flex-basis:100%">3</li></ul><div class="hw-carousel-controls"><button data-hw-step="-1">P</button><span data-hw-position></span><button data-hw-step="1">N</button><button data-hw-pause id="pause" aria-pressed="false">II</button><p class="hw-sr-only" aria-live="polite"></p></div></div><p id="away" style="margin-top:400px">away</p>`;

test("an autoplaying carousel advances each step, holds under the pointer and stops on pause", async () => {
  const p = await page(AUTOPLAY);
  expect(await position(p)).toBe(0);
  await tick(p);
  expect(await position(p)).toBe(1);
  await p.hover(".hw-carousel-track");
  await tick(p);
  expect(await position(p)).toBe(1);
  expect(await p.$eval(".hw-carousel", (c) => c.hasAttribute("data-hw-held"))).toBe(true);
  await p.hover("#away");
  await tick(p);
  expect(await position(p)).toBe(2);
  await p.click("#pause");
  expect(await attr(p, "#pause", "aria-pressed")).toBe("true");
  await p.hover("#away");
  await tick(p);
  expect(await position(p)).toBe(2);
  await p.close();
}, 30_000);

test("a carousel holds four seconds after the reader's step, starts paused under reduced motion, hides controls with nothing to scroll", async () => {
  const p = await page(AUTOPLAY);
  await p.$eval(".hw-carousel-track", (t) => t.dispatchEvent(new PointerEvent("pointerdown")));
  await tick(p);
  expect(await position(p)).toBe(0);
  await p.evaluate(() => {
    const now = Date.now();
    Date.now = () => now + 4001;
  });
  await tick(p);
  expect(await position(p)).toBe(1);
  await p.close();
  const still = await page(AUTOPLAY, "de", true);
  expect(await attr(still, "#pause", "aria-pressed")).toBe("true");
  await tick(still);
  expect(await position(still)).toBe(0);
  await still.close();
  const one = await page(
    `<div class="hw-carousel" style="width:300px"><ul class="hw-carousel-track"><li style="flex-basis:100%">1</li></ul><div class="hw-carousel-controls"><button data-hw-step="-1">P</button><span data-hw-position></span><button data-hw-step="1">N</button></div></div>`,
  );
  expect(await one.$eval(".hw-carousel-controls", (c) => (c as HTMLElement).hidden)).toBe(true);
  await one.close();
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
