import { defined } from "@hackersandwizards/scaffolding/defined";
import { limit } from "@hackersandwizards/scaffolding/test-timeout";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { ROOT } from "../../scripts/git";
import { launch, open } from "../../scan/browser";

const brand = (f: string) => pathToFileURL(join(ROOT, f)).href;
const doc = (sheets: string[], body: string, cls = "") =>
  `<!doctype html><html class="${cls}"><head><meta charset="utf-8">${["generated/tokens.root.css", ...sheets, "elements/disclosure.css"].map((f) => `<link rel="stylesheet" href="${brand(f)}">`).join("")}</head><body>${body}</body></html>`;
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
    const measured = await tab.$eval("summary", (s) => {
      return { focused: s.matches(":focus-visible"), width: getComputedStyle(s).outlineWidth };
    });
    await tab.close();
    expect(measured).toEqual({ focused: true, width });
  },
  limit(30_000),
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

test(
  "the chevron sits in the middle of the label's first line",
  async () => {
    const file = join(dir, "chevron.html");
    writeFileSync(file, chevronPage);
    const tab = await browser.newPage();
    await open(tab, pathToFileURL(file).href);
    await tab.evaluate(() => document.fonts.ready);
    // A summary's chevron is its ::before, which only the DevTools protocol measures.
    const cdp = await tab.createCDPSession();
    const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
      nodeId: root.nodeId,
      selector: "summary:has(> .l)",
    });
    const chevrons = await Promise.all(
      nodeIds.map(async (nodeId) => {
        const { node: summary } = await cdp.send("DOM.describeNode", { nodeId });
        const before = summary.pseudoElements?.find((node) => node.pseudoType === "before");
        assert(before, "The summary renders a ::before chevron");
        const { model } = await cdp.send("DOM.getBoxModel", {
          backendNodeId: before.backendNodeId,
        });
        return { top: defined(model.border[1], "chevron border top"), height: model.height };
      }),
    );
    const span = await tab.$eval(".hw-disclosure-chevron", (s) => {
      const r = s.getBoundingClientRect();
      return { top: r.top, height: r.height };
    });
    const headingPseudos = await tab.$$eval("summary:has(> h2)", (summaries) =>
      summaries.map((summary) => getComputedStyle(summary, "::before").content),
    );
    const lines = await tab.$$eval("summary > .l, summary > h2", (labels) =>
      labels.map((label) => ({
        top: label.getBoundingClientRect().top,
        height: parseFloat(getComputedStyle(label).lineHeight),
      })),
    );
    await tab.close();
    const centres = [...chevrons, span].map((c, i) => {
      const line = defined(lines[i], `summary line ${i}`);
      return Math.abs(c.top + c.height / 2 - (line.top + line.height / 2));
    });
    expect(headingPseudos).toEqual(["none"]);
    expect(centres.map((offset) => offset < 0.5)).toEqual([true, true, true, true, true, true]);
  },
  limit(30_000),
);

// The count pill takes night ink in a night island, also where the page's root sets --foreground
// to ink, as expert.css does.
test(
  "the count pill reads night ink on night under a root --foreground",
  async () => {
    const file = join(dir, "count-night.html");
    writeFileSync(
      file,
      doc(
        [],
        `<style>:root{--foreground:var(--color-ink)}</style><div data-theme="dark" style="background:var(--color-night)"><details class="hw-disclosure"><summary>Notes <span class="hw-disclosure-count">8</span></summary></details></div>`,
      ),
    );
    const tab = await browser.newPage();
    await open(tab, pathToFileURL(file).href);
    const [count, nightInk] = await tab.$eval(".hw-disclosure-count", (count) => {
      const probe = document.createElement("i");
      probe.style.color = "color-mix(in srgb, var(--color-night-ink) 70%, transparent)";
      document.body.append(probe);
      return [getComputedStyle(count).color, getComputedStyle(probe).color];
    });
    await tab.close();
    expect(count).toBe(nightInk);
  },
  limit(30_000),
);
