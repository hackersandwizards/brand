import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { ROOT } from "../scripts/git";
import { failing, launch, measureMarkers, serve, toUrl, type Reading } from "../scan/markers";

// marker.css on lists at five text sizes, wrapped and not, and on element markers in baseline rows,
// against the rules it replaced: the inline-block list marker lifted by whole pixels (the website's
// .marker-list), the element marker lifted by whole pixels and the browser's own disc (the
// website's list-disc lists).
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
html { scroll-behavior: smooth; }
body { margin: 40px 40px 1200px; max-width: 420px; font-family: var(--font-sans); }
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
<ul class="hw-marker-list" style="font-size:11pt;line-height:1.45"><li>Code <code style="font-family:var(--font-code)">git status</code> on the first line</li></ul>
<ul class="hw-marker-list" style="font-size:16px;line-height:1.6"><li><code style="font-family:var(--font-code);font-size:0.8125em;padding:0.125em 0.375em;background:var(--color-bg)">git status</code> is clean, an item opening with a code chip</li></ul>
<ul class="hw-marker-list" style="font-size:14px;line-height:1.5;padding-left:1.625em"><li style="padding-left:0.375em">An item padded less than the marker indent, as Tailwind prose pads it</li></ul>
<ul class="glyphs"><li>An item behind a bullet glyph drawn as content</li></ul>
<ul class="hw-marker-list" style="font-size:16px;line-height:1.6"><li style="list-style:disc">An item that keeps the browser's disc beside the square</li></ul>
<div class="row" style="font-size:15px;line-height:1.4"><span class="hw-marker"></span>Bare text beside a marker</div>
<div class="row" style="font-size:20px;line-height:1.4"><span class="hw-marker"></span><span>Row text</span></div>
<div class="row" style="font-size:15px;line-height:1.4"><span class="hw-marker"></span><span>Row text</span></div>
<div class="row caps" style="font-size:15px;line-height:1.4;text-transform:uppercase;--hw-marker-mid:0.5cap"><span class="hw-marker"></span><span>A label in capitals</span></div>
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

// Every 1/64px offset of the first line, the side just under a whole pixel (the slide stage's
// 0.5625rem at 1920): an unrounded side painted a pixel short at one offset in 64.
const fractional = (css: string) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("tokens/marker.css")}">
<style>
body { margin: 40px; font-family: var(--font-sans); font-size: 36px; line-height: 1.4;
  --hw-marker-size: 11.984375px; }
ul { margin: 0; padding: 0; } .slot { height: 72px; }
.row { display: flex; align-items: baseline; gap: 24px; }
${css}
</style></head><body>
${Array.from({ length: 64 }, (_, k) => `<div class="slot"><div class="row" style="padding-top:${k / 64}px"><span class="hw-marker"></span><span>Row ${k}</span></div></div>`).join("")}
${Array.from({ length: 64 }, (_, k) => `<div class="slot"><ul class="hw-marker-list" style="padding-top:${k / 64}px"><li>Item ${k}</li></ul></div>`).join("")}
</body></html>`;
// The planted defect: the square back at the unrounded side.
const UNROUNDED = `.hw-marker, ul > li::before {
  width: var(--hw-marker-size) !important; height: var(--hw-marker-size) !important }`;

// prose.css's task checkbox, boxed and read-only (the tick alone), at line heights 1.25 to 2,
// tight and loose, up to 16px text (a larger box is no marker to brand-markers), against the fixed
// top it replaced (0.87 to 2.87px off). The read-only tick drawn from the box's own path read 0.63
// to 0.79px low.
const tasks = (css: string) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("tokens/marker.css")}">
<link rel="stylesheet" href="${brand("elements/prose.css")}">
<style>body { margin: 40px; max-width: 360px; font-family: var(--font-sans); }
ul { margin: 0 0 16px; padding-left: 1.625em; } ${css}</style></head><body>
${[13, 14, 16]
  .flatMap((size) =>
    [1.25, 1.5, 1.75, 2].map(
      (lh) => `<div class="hw-prose" style="font-size:${size}px;line-height:${lh}"><ul>
<li class="task-list-item"><input type="checkbox" checked disabled> A done item that wraps onto a second line in this column</li>
<li class="task-list-item"><input type="checkbox" checked disabled data-readonly> A read-only done step, the tick alone</li>
<li class="task-list-item"><p><input type="checkbox" checked disabled> A loose item</p></li></ul></div>`,
    ),
  )
  .join("\n")}
</body></html>`;
const OLD_CHECK = `.hw-prose li.task-list-item input[type="checkbox"] { top: 0.375em; transform: none; }`;

// A page that scrolls inside an element, as an Astrobook catalog does: html holds the window still
// and main scrolls, with the list below its first screen.
const inner = `<!doctype html><html style="overflow:hidden;height:100%"><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("tokens/marker.css")}">
<style>body { margin: 0; height: 100%; font-family: var(--font-sans); }
main { height: 100%; overflow: auto; padding: 0 40px; } ul { margin: 0; padding: 0; }</style>
</head><body><main><div style="height:3000px"></div>
<ul class="hw-marker-list" style="font-size:16px;line-height:1.6">${[0, 1, 2].map((i) => `<li>${item(i)}</li>`).join("")}</ul>
<div style="height:3000px"></div></main></body></html>`;

const dir = mkdtempSync(join(tmpdir(), "brand-markers-"));
const file = (name: string, html: string) => {
  writeFileSync(join(dir, name), html);
  return pathToFileURL(join(dir, name)).href;
};
const NEW = file("new.html", page("", true));
// marker.css with the middle on the x-height middle, which read low beside capitals and ascenders.
const X_MIDDLE = file(
  "x-middle.html",
  page(".hw-marker-list, .row:not(.caps) { --hw-marker-mid: 0.5ex }", true),
);
const OLD = file("old.html", page(`${OLD_LIST}\n${OLD_ELEMENT}`));
const NATIVE = file("disc.html", page(DISC));
const FRACTIONAL = file("fractional.html", fractional(""));
const PLANTED = file("unrounded.html", fractional(UNROUNDED));
const INNER = file("inner.html", inner);
const TASKS = file("tasks.html", tasks(""));
const OLD_TASKS = file("old-tasks.html", tasks(OLD_CHECK));
// The read-only tick masked with the box's own path, the rule it replaced.
const BOX_TICK = file(
  "box-tick.html",
  tasks(".hw-prose li.task-list-item input[data-readonly]:checked { mask-image: var(--_hw-tick) }"),
);

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(async () => {
  await browser?.close();
  rmSync(dir, { recursive: true, force: true });
});

// Each page and scale is measured once: two tests read NEW at 2x and two read OLD at 4x.
const measured = new Map<string, Promise<Reading[]>>();
const all = (url: string, scale: number) => {
  const key = `${url} ${scale}`;
  const run = async () => [
    ...(await measureMarkers(browser, url, { scale })),
    ...(await measureMarkers(browser, url, { scale, newline: true })),
  ];
  return measured.get(key) ?? measured.set(key, run()).get(key)!;
};
const show = (rs: Reading[]) =>
  rs.map((r) => `${r.label} ${r.kind} ${r.scale}x newline:${r.newline} ${r.offset.toFixed(2)}`);

test.each([2, 4])(
  "marker.css sits within 0.25 px at %dx, with and without a newline after <li>",
  async (scale) => {
    const rs = await all(NEW, scale);
    expect(rs.filter((r) => r.kind === "before").length).toBe(46);
    expect(rs.filter((r) => r.kind === "element").length).toBe(8);
    expect(show(rs.filter((r) => r.kind !== "glyph" && !r.double && failing(r)))).toEqual([]);
    // The square sits right, but the item keeps the disc: it fails, and only it.
    const double = rs.filter((r) => r.double);
    expect(
      double.map(
        (r) => r.label.includes("An item that keeps") && Math.abs(r.offset) <= 0.25 && failing(r),
      ),
    ).toEqual([true, true]);
  },
  60_000,
);

test.each([2, 4])(
  "marker.css sits within 0.25 px at every 1/64 px offset at %dx",
  async (scale) => {
    const rs = await measureMarkers(browser, FRACTIONAL, { scale });
    expect(rs.filter((r) => r.kind === "element").length).toBe(64);
    expect(rs.filter((r) => r.kind === "before").length).toBe(64);
    expect(show(rs.filter(failing))).toEqual([]);
  },
  60_000,
);

test("an unrounded side fails at some 1/64 px offset, element and list alike", async () => {
  const rs = (await measureMarkers(browser, PLANTED, { scale: 4 })).filter(failing);
  expect(rs.some((r) => r.kind === "element")).toBe(true);
  expect(rs.some((r) => r.kind === "before")).toBe(true);
}, 60_000);

test.each([2, 4])(
  "the prose task checkbox sits within 0.25 px at %dx, and a loose item draws no marker",
  async (scale) => {
    const rs = await all(TASKS, scale);
    expect(rs.filter((r) => r.kind === "element").length).toBe(48);
    expect(rs.filter((r) => r.kind === "before")).toEqual([]);
    expect(show(rs.filter(failing))).toEqual([]);
  },
  60_000,
);

test("a list below the first screen of an inner scroller is measured", async () => {
  const rs = await all(INNER, 2);
  expect(rs.length).toBe(6);
  expect(show(rs.filter(failing))).toEqual([]);
}, 60_000);

test("the old fixed checkbox top fails", async () => {
  expect((await all(OLD_TASKS, 2)).some(failing)).toBe(true);
}, 60_000);

test("the read-only tick on the box's own path fails", async () => {
  const rs = await measureMarkers(browser, BOX_TICK, { scale: 2 });
  expect(rs.filter((r) => r.label.includes("read-only") && failing(r)).length).toBe(12);
}, 60_000);

test("the old list marker fails: off centre at some size, first lines indented after a newline", async () => {
  const rs = (await all(OLD, 4)).filter((r) => r.kind === "before");
  expect(rs.some((r) => !r.newline && Math.abs(r.offset) > 0.25)).toBe(true);
  for (const r of rs.filter((r) => r.newline && !r.label.includes("loose")))
    expect(r.indent!).toBeGreaterThan(3);
}, 60_000);

test("the middle on the x-height middle fails, list and element alike", async () => {
  const rs = (await all(X_MIDDLE, 4)).filter((r) => r.kind !== "glyph");
  expect(rs.filter((r) => r.kind === "before" && failing(r)).length).toBeGreaterThan(30);
  expect(rs.some((r) => r.kind === "element" && failing(r))).toBe(true);
}, 60_000);

test("the old element marker fails at some size", async () => {
  const rs = (await all(OLD, 4)).filter((r) => r.kind === "element");
  expect(rs.length).toBe(8);
  expect(rs.some(failing)).toBe(true);
}, 60_000);

test("the browser's disc is found and fails", async () => {
  const rs = (await all(NATIVE, 2)).filter((r) => r.kind === "native");
  expect(rs.length).toBe(46);
  expect(rs.some(failing)).toBe(true);
  expect(rs.some((r) => r.double)).toBe(false);
}, 60_000);

test("a bullet glyph drawn as ::before content is found", async () => {
  const rs = (await all(NEW, 2)).filter((r) => r.kind === "glyph");
  expect(rs.length).toBe(2);
  expect(rs.every((r) => Number.isFinite(r.offset))).toBe(true);
}, 60_000);

test("a reading with no ink on either side fails", () => {
  const r: Reading = {
    page: "x",
    label: "x",
    kind: "glyph",
    scale: 1,
    newline: false,
    offset: NaN,
    indent: null,
    double: false,
  };
  expect(failing(r)).toBe(true);
});

test("one marker per item: an emptied ::marker and a row deeper in a disc item are not two", async () => {
  const page = file(
    "one.html",
    `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("tokens/marker.css")}">
<style>body { margin: 40px; max-width: 420px; font-family: var(--font-sans); font-size: 16px; line-height: 1.6; }
.quiet::marker { content: none; } .row { display: flex; align-items: baseline; gap: 12px; }</style>
</head><body><ul class="hw-marker-list"><li class="quiet" style="list-style:disc">An emptied marker</li></ul>
<ul style="list-style:disc;padding-left:1.25rem"><li><div class="row"><span class="hw-marker"></span><span>A row in a disc item</span></div></li></ul>
<ul class="hw-marker-list"><li style="list-style:disc">The control keeps its disc</li></ul></body></html>`,
  );
  const rs = await measureMarkers(browser, page, { scale: 2 });
  expect(rs.filter((r) => r.double).map((r) => r.label.includes("The control"))).toEqual([true]);
}, 60_000);

// The talks print page: 1920 px slides in a 1280 px window, a label's marker scrolled into view and
// its text right of the viewport.
test("a text box right of the viewport is measured", async () => {
  const wide = file(
    "wide.html",
    `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("tokens/marker.css")}">
<style>body { margin: 40px; width: 1800px; font-family: var(--font-sans); }
.row { display: flex; align-items: baseline; gap: 40px; margin-left: 1220px; }</style>
</head><body><div class="row" style="font-size:16px;line-height:1.4"><span class="hw-marker"></span><span>Row text</span></div></body></html>`,
  );
  const rs = await measureMarkers(browser, wide, { scale: 2, width: 1280 });
  expect(rs.length).toBe(1);
  expect(show(rs.filter(failing))).toEqual([]);
}, 60_000);

test("--site serves a built folder: a page path starting with / is on it, nothing outside it", async () => {
  const base = mkdtempSync(join(tmpdir(), "brand-site-"));
  const site = join(base, "site");
  mkdirSync(join(site, "catalog"), { recursive: true });
  writeFileSync(join(site, "catalog/index.html"), "<p>catalog</p>");
  writeFileSync(join(base, "outside.txt"), "outside");
  const server = serve(site);
  try {
    const url = toUrl("/catalog/", server.url);
    expect(url).toBe(`${server.url.origin}/catalog/`);
    expect(await (await fetch(url)).text()).toBe("<p>catalog</p>");
    // A folder without its slash redirects, so its relative links resolve as on Pages.
    const moved = await fetch(`${server.url.origin}/catalog`, { redirect: "manual" });
    expect([moved.status, moved.headers.get("location")]).toEqual([301, "/catalog/"]);
    expect((await fetch(`${server.url.origin}/100%.html`)).status).toBe(404);
    expect((await fetch(`${server.url.origin}/%2e%2e/outside.txt`)).status).toBe(404);
    expect(toUrl("/catalog/")).toStartWith("file://");
  } finally {
    await server.stop(true);
    rmSync(base, { recursive: true, force: true });
  }
});

test("a page whose stylesheet does not load throws rather than measuring the unstyled page", async () => {
  const site = mkdtempSync(join(tmpdir(), "brand-site-"));
  const ok = pathToFileURL(join(site, "a.css")).href;
  writeFileSync(join(site, "a.css"), "li { list-style: none; }");
  writeFileSync(join(site, "file.html"), `<link rel="stylesheet" href="${ok}"><ul><li>x</li></ul>`);
  writeFileSync(
    join(site, "gone.html"),
    `<link rel="stylesheet" href="/b.css"><ul><li>x</li></ul>`,
  );
  const server = serve(site);
  try {
    // The control: the same file:// link loads when the page is opened as a file.
    expect(await measureMarkers(browser, toUrl(join(site, "file.html")))).toEqual([]);
    for (const p of ["/file.html", "/gone.html"])
      await expect(measureMarkers(browser, toUrl(p, server.url))).rejects.toThrow(
        "stylesheet not loaded",
      );
  } finally {
    await server.stop(true);
    rmSync(site, { recursive: true, force: true });
  }
});
