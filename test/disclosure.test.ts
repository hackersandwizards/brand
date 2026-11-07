import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser, Protocol } from "puppeteer-core";
import { ROOT } from "../scripts/git";
import { launch, open } from "../scan/markers";

const brand = (f: string) => pathToFileURL(join(ROOT, f)).href;
const doc = (sheets: string[], body: string, cls = "") =>
  `<!doctype html><html class="${cls}"><head><meta charset="utf-8">${["generated/tokens.root.css", ...sheets, "expert/disclosure.css"].map((f) => `<link rel="stylesheet" href="${brand(f)}">`).join("")}</head><body>${body}</body></html>`;
const page = (cls: string) =>
  doc(
    ["elements/focus.css"],
    `<details class="hw-disclosure"><summary>Panel</summary><p>Body</p></details>`,
    cls,
  );

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
const dir = mkdtempSync(join(tmpdir(), "hw-disclosure-"));
afterAll(async () => {
  await browser?.close();
  rmSync(dir, { recursive: true, force: true });
});

// A disclosure's summary takes focus.css's ring under hw-focus-ring, and its own 2 px ring without.
test.each([
  ["hw-focus-ring", "3px"],
  ["", "2px"],
])(
  "the summary's focus ring under class '%s' is %s",
  async (cls, width) => {
    const file = join(dir, `page-${width}.html`);
    writeFileSync(file, page(cls));
    const tab = await browser.newPage();
    await open(tab, pathToFileURL(file).href);
    await tab.keyboard.press("Tab");
    const measured = await tab.evaluate(() => {
      const s = document.querySelector("summary")!;
      return { focused: s.matches(":focus-visible"), width: getComputedStyle(s).outlineWidth };
    });
    await tab.close();
    expect(measured).toEqual({ focused: true, width });
  },
  30_000,
);

// The chevron's centre sits on the centre of the label's first line, one line or wrapped, where
// the summary aligns its items on the baseline or the start, on one line where it centres them
// (a wrapped label there takes the chevron to its middle), and where the chevron span stands
// inline in a heading.
const summary = (align: string, label: string) =>
  `<details class="hw-disclosure"><summary style="width:11rem;align-items:${align}"><span class="l">${label}</span></summary></details>`;
const chevronBody = [
  ...["baseline", "flex-start"].flatMap((a) => [
    summary(a, "Agents"),
    summary(a, "Agentic engineering for platform teams"),
  ]),
  summary("center", "Agents"),
  `<details class="hw-disclosure"><summary><h2><span class="hw-disclosure-chevron" aria-hidden="true"></span><span class="l">Delivery check-ins</span></h2></summary></details>`,
].join("");
const chevronPage = doc(
  ["tokens/fonts.css"],
  `<style>body { font: 500 0.875rem/1.5 var(--font-sans) } h2 { font: 700 1.25rem/1.4 var(--font-sans) }</style>${chevronBody}`,
);

test("the chevron sits in the middle of the label's first line", async () => {
  const file = join(dir, "chevron.html");
  writeFileSync(file, chevronPage);
  const tab = await browser.newPage();
  await open(tab, pathToFileURL(file).href);
  await tab.evaluate(() => document.fonts.ready);
  // A summary's chevron is its ::before, which only the DevTools protocol measures.
  const cdp = await tab.createCDPSession();
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const pseudos: number[] = [];
  const walk = (n: Protocol.DOM.Node) => {
    const before = n.pseudoElements?.find((p) => p.pseudoType === "before");
    if (n.nodeName === "SUMMARY" && before) pseudos.push(before.nodeId);
    n.children?.forEach(walk);
  };
  walk(root);
  const chevrons = await Promise.all(
    pseudos.map(async (nodeId) => {
      const { model } = await cdp.send("DOM.getBoxModel", { nodeId });
      return { top: model.border[1]!, height: model.height };
    }),
  );
  const span = await tab.$eval(".hw-disclosure-chevron", (s) => {
    const r = s.getBoundingClientRect();
    return { top: r.top, height: r.height };
  });
  // The label's first line: a flex item's top, or for the span in the heading the heading's top.
  const lines = await tab.$$eval(".l", (ls) =>
    ls.map((l) => {
      const box = (
        l.parentElement!.tagName === "H2" ? l.parentElement! : l
      ).getBoundingClientRect();
      return { top: box.top, height: parseFloat(getComputedStyle(l).lineHeight) };
    }),
  );
  await tab.close();
  const centres = [...chevrons, span].map((c, i) => {
    const line = lines[i]!;
    return Math.abs(c.top + c.height / 2 - (line.top + line.height / 2));
  });
  expect(centres).toHaveLength(6);
  for (const off of centres) expect(off).toBeLessThan(0.5);
}, 30_000);
