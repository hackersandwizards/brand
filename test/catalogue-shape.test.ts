import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { renderCatalogue } from "../expert/catalogue";
import { ROOT } from "../scripts/git";
import { launch } from "../scan/markers";

// Every text of the catalogue shape reads at 4.5:1 or more on the page, on a plain page and under
// the expert set, whose @theme inline turns --color-muted into the muted fill (light and night).
const brand = (f: string) => pathToFileURL(join(ROOT, f)).href;
const body = renderCatalogue({
  title: "T",
  lead: "Lead",
  provenance: "source · brand",
  groups: [{ name: "Group", items: [{ name: "Name", note: "Note", href: "#", pill: "1 state" }] }],
});
const page = (theme: string) => `<!doctype html><html${theme}><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("elements/elements.css")}">
<link rel="stylesheet" href="${brand("expert/catalogue.css")}">
<style>body { margin: 0; background: var(--background, var(--color-bg)); }</style></head><body>${body}</body></html>`;
const EXPERT_LIGHT = ` style="--color-muted: color-mix(in srgb, var(--color-ink) 7%, var(--color-bg)); --background: var(--color-bg); --foreground: var(--color-ink)"`;
const EXPERT_NIGHT = ` data-theme="dark" style="--color-muted: var(--color-night-2); --background: var(--color-night); --foreground: var(--color-night-ink)"`;

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(() => browser?.close());

test.each([
  ["plain", ""],
  ["expert light", EXPERT_LIGHT],
  ["expert night", EXPERT_NIGHT],
])(
  "catalogue text reads at 4.5:1 or more, %s",
  async (_, theme) => {
    const dir = mkdtempSync(join(tmpdir(), "hw-catalogue-"));
    const file = join(dir, "page.html");
    writeFileSync(file, page(theme));
    const tab = await browser.newPage();
    await tab.goto(pathToFileURL(file).href);
    const ratios: Record<string, number> = await tab.evaluate(() => {
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const rgba = (css: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data];
      };
      const lum = ([r, g, b]: number[]) =>
        [r, g, b]
          .map((v) => v / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const bg = rgba(getComputedStyle(document.body).backgroundColor);
      const out: Record<string, number> = {};
      for (const sel of [
        ".hw-catalogue-provenance",
        ".hw-catalogue-count",
        ".hw-catalogue-note",
        ".hw-catalogue-lead",
        ".hw-catalogue-name",
      ]) {
        const [r, g, b, a] = rgba(getComputedStyle(document.querySelector(sel)!).color);
        const fg = [r, g, b].map((v, i) => (v * a + bg[i] * (255 - a)) / 255);
        const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        out[sel] = Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
      }
      return out;
    });
    await tab.close();
    for (const [sel, ratio] of Object.entries(ratios))
      expect({ sel, ok: ratio >= 4.5, ratio }).toEqual({ sel, ok: true, ratio });
  },
  30_000,
);
