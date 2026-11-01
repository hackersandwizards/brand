import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { ROOT } from "../scripts/git";
import { failing, launch, measureMarkers, type Reading } from "../scan/markers";

// marker.css on lists at five text sizes, wrapped and not, and on element markers in baseline rows,
// against the rules it replaced: the inline-block list marker lifted by whole pixels (the website's
// .marker-list, documents before v0.1.25), the element marker lifted by whole pixels (the slide
// engine before 2026-11-01) and the browser's own disc (the website's list-disc lists).
const brand = (f: string) => pathToFileURL(join(ROOT, f)).href;
const item = (i: number) =>
  i % 2
    ? "A longer item that wraps onto a second line when the column is narrow enough to force it"
    : "Short item";
const page = (css: string, marker = false) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
${marker ? `<link rel="stylesheet" href="${brand("tokens/marker.css")}">` : ""}
<style>
body { margin: 40px; max-width: 420px; font-family: var(--font-sans); }
ul { margin: 0; padding: 0; }
.row { display: flex; align-items: baseline; gap: 12px; --hw-marker-size: 0.5625rem; }
.swatch { width: 10px; height: 10px; background: var(--color-purple); }
.glyphs { list-style: none; padding-left: 1.625em; } .glyphs > li { position: relative; }
.glyphs > li::before { content: "•"; position: absolute; left: -1em; width: 1em; text-align: center; }
.dots { list-style: none; } .dots > li { position: relative; margin-top: 40px; }
.dots > li::before { content: ""; position: absolute; top: -32px; left: 0; width: 10px; height: 10px; background: var(--color-teal); }
${css}
</style></head><body>
${[
  [11, 1.5],
  [14, 1.5],
  [16, 1.6],
  [18, 1.45],
  [22, 1.35],
]
  .map(
    ([size, lh]) =>
      `<ul class="hw-marker-list" style="font-size:${size}px;line-height:${lh}">${[0, 1, 2].map((i) => `<li>${item(i)}</li>`).join("")}</ul>`,
  )
  .join("\n")}
<ul class="dots"><li>An item whose square sits above it, not beside its first line</li></ul>
<p class="row"><span class="swatch"></span><span>A heading swatch outside a list</span></p>
<ol style="list-style: decimal; padding-left: 2rem"><li>A numbered item</li></ol>
<ul class="hw-marker-list" style="font-size:16px;line-height:1.6"><li><a href="#" style="text-decoration:underline;text-underline-offset:0.2em">A linked item</a> with more words</li></ul>
<details><summary>Panel</summary><ul class="hw-marker-list" style="font-size:14px;line-height:1.5"><li>An item in a closed panel</li></ul></details>
<ul class="hw-marker-list" style="font-size:16px;line-height:1.75"><li><p style="margin:0">A loose item opens with a paragraph</p></li></ul>
<ul class="hw-marker-list" style="font-size:14px;line-height:1.5"><li>Stored at <code style="font-family:var(--font-code, var(--font-mono))">~/.claude/projects</code> with more words to wrap the item onto a second line here</li></ul>
<ul class="hw-marker-list" style="font-size:13.333px;line-height:1.5"><li>Thirteen and a third at one and a half, a line height Chrome stores just under 20px</li></ul>
<ul class="hw-marker-list" style="font-size:13.333px;line-height:1.35"><li>Code <code style="font-family:var(--font-code)">git status</code> on the first line</li></ul>
<ul class="hw-marker-list" style="font-size:16px;line-height:1.6"><li><code style="font-family:var(--font-code);font-size:0.8125em;padding:0.125em 0.375em;background:var(--color-bg)">git status</code> is clean, an item opening with a code chip</li></ul>
<ul class="glyphs"><li>An item behind a bullet glyph drawn as content</li></ul>
<div class="row" style="font-size:15px;line-height:1.4"><span class="hw-marker"></span>Bare text beside a marker</div>
<div class="row" style="font-size:20px;line-height:1.4"><span class="hw-marker"></span><span>Row text</span></div>
<div class="row" style="font-size:15px;line-height:1.4"><span class="hw-marker"></span><span>Row text</span></div>
</body></html>`;

const OLD_LIST = `.hw-marker-list { list-style: none }
.hw-marker-list > li { padding-left: 1rem }
.hw-marker-list > li::before { content: ""; display: inline-block; width: 0.375rem;
  height: 0.375rem; margin-inline: -1rem 0.625rem; background: var(--color-teal);
  vertical-align: round(calc(0.273em - 0.1875rem), 1px) }`;
const OLD_ELEMENT = `.hw-marker { flex-shrink: 0; width: 0.5625rem; height: 0.5625rem;
  background: var(--color-teal); position: relative;
  top: calc(-1 * round(calc(0.273em - 0.28125rem), 1px)) }`;
const DISC = `.hw-marker-list { list-style: disc; padding-left: 1.25rem }`;

const dir = mkdtempSync(join(tmpdir(), "brand-markers-"));
const file = (name: string, html: string) => {
  writeFileSync(join(dir, name), html);
  return pathToFileURL(join(dir, name)).href;
};
const NEW = file("new.html", page("", true));
const OLD = file("old.html", page(`${OLD_LIST}\n${OLD_ELEMENT}`));
const NATIVE = file("disc.html", page(DISC));

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(() => browser?.close());

const all = async (url: string, scale: number) => [
  ...(await measureMarkers(browser, url, { scale })),
  ...(await measureMarkers(browser, url, { scale, newline: true })),
];
const show = (rs: Reading[]) =>
  rs.map((r) => `${r.label} ${r.kind} ${r.scale}x newline:${r.newline} ${r.offset.toFixed(2)}`);

test.each([2, 4])(
  "marker.css sits within 0.25 px at %dx, with and without a newline after <li>",
  async (scale) => {
    const rs = await all(NEW, scale);
    expect(rs.filter((r) => r.kind === "before").length).toBe(44);
    expect(rs.filter((r) => r.kind === "element").length).toBe(6);
    expect(show(rs.filter((r) => r.kind !== "glyph" && failing(r)))).toEqual([]);
  },
  60_000,
);

test("the old list marker fails: off centre at some size, first lines indented after a newline", async () => {
  const rs = (await all(OLD, 4)).filter((r) => r.kind === "before");
  expect(rs.some((r) => !r.newline && Math.abs(r.offset) > 0.25)).toBe(true);
  for (const r of rs.filter((r) => r.newline && !r.label.includes("loose")))
    expect(r.indent!).toBeGreaterThan(3);
}, 60_000);

test("the old element marker fails at some size", async () => {
  const rs = (await all(OLD, 4)).filter((r) => r.kind === "element");
  expect(rs.length).toBe(6);
  expect(rs.some(failing)).toBe(true);
}, 60_000);

test("the browser's disc is found and fails", async () => {
  const rs = (await all(NATIVE, 2)).filter((r) => r.kind === "native");
  expect(rs.length).toBe(44);
  expect(rs.some(failing)).toBe(true);
}, 60_000);

test("a bullet glyph drawn as ::before content is found", async () => {
  const rs = (await all(NEW, 2)).filter((r) => r.kind === "glyph");
  expect(rs.length).toBe(2);
  expect(rs.every((r) => Number.isFinite(r.offset))).toBe(true);
}, 60_000);
