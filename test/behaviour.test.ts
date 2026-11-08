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
writeFileSync(
  join(dir, "entry.ts"),
  `import * as HW from ${JSON.stringify(join(ROOT, "elements/behaviour.ts"))}; Object.assign(window, { HW });`,
);
const js = await Bun.build({ entrypoints: [join(dir, "entry.ts")], format: "iife" });
writeFileSync(join(dir, "b.js"), await js.outputs[0]!.text());
const css = ["generated/tokens.root.css", "elements/elements.css"]
  .map((f) => `<link rel="stylesheet" href="${brand(f)}">`)
  .join("");
const page = async (body: string, lang = "de"): Promise<Page> => {
  const p = await browser.newPage();
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
    `<div class="hw-carousel" style="width:300px"><ul class="hw-carousel-track"><li style="flex-basis:100%">1</li><li style="flex-basis:100%">2</li></ul><div class="hw-carousel-controls"><button data-hw-step="-1" id="p">P</button><span data-hw-position></span><button data-hw-step="1" id="n">N</button><p class="hw-sr-status"></p></div></div>`,
  );
  expect(await p.$$eval(".hw-carousel-dot", (d) => d.length)).toBe(2);
  expect(await p.$eval("#p", (b) => (b as HTMLButtonElement).disabled)).toBe(true);
  await p.click("#n");
  expect(await p.$eval(".hw-sr-status", (s) => s.textContent)).toBe("2 von 2");
  expect(await p.$eval("#n", (b) => (b as HTMLButtonElement).disabled)).toBe(true);
  await p.close();
}, 30_000);

test("the behaviour file holds no markup built from strings it did not create", () => {
  expect(readFileSync(join(ROOT, "elements/behaviour.ts"), "utf8")).not.toMatch(
    /innerHTML|insertAdjacentHTML/,
  );
});
