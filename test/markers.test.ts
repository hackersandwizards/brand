import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { rejection } from "@hackersandwizards/scaffolding/rejection";
import { ROOT } from "../scripts/git";
import {
  applyExceptions,
  failing,
  hasMarkers,
  launch,
  measureMarkers,
  serve,
  toUrl,
  type Reading,
  type Refusal,
} from "../scan/markers";

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
// A body shrunk with CSS zoom, as a slide's fit guard does it. `setting` is what the page declares
// on the zoomed element beside the zoom.
const ZOOM = 0.96897;
const zoomed = (setting: string) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("tokens/marker.css")}">
<style>body { margin: 40px; max-width: 420px; font-family: var(--font-sans); }
ul { margin: 0; padding: 0; } .row { display: flex; align-items: baseline; gap: 12px; }</style>
</head><body><div style="zoom: ${ZOOM}; ${setting}">
${[
  [14, 1.5],
  [16, 1.6],
  [18, 1.45],
  [22, 1.35],
  [24, 1.4],
]
  .map(
    ([size, lh]) =>
      `<ul class="hw-marker-list" style="font-size:${size}px;line-height:${lh}"><li>${item(1)}</li></ul>
<div class="row" style="font-size:${size}px;line-height:${lh}"><span class="hw-marker"></span><span>Row text</span></div>`,
  )
  .join("\n")}
</div></body></html>`;

// The sizes that sat 0.83 to 0.91 px high on a sweep of 11 to 36 px text at line heights 1.35 to
// 1.6: at 31 px unzoomed and 32 px at 0.96897 from a descent of 0.2421875em where Chrome takes
// Inter's 494/2048, at 0.92 from a half-leading of a whole real pixel landing just under it.
const SWEEP: [number, [number, number][]][] = [
  [
    1,
    [
      [31, 1.35],
      [31, 1.6],
    ],
  ],
  [
    ZOOM,
    [
      [32, 1.35],
      [32, 1.6],
    ],
  ],
  [
    0.92,
    [
      [17, 1.6],
      [24, 1.45],
      [27, 1.45],
      [30, 1.45],
      [34, 1.6],
    ],
  ],
];
const swept = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("tokens/marker.css")}">
<style>body { margin: 40px; max-width: 900px; font-family: var(--font-sans); } ul { margin: 0; padding: 0; }</style>
</head><body>${SWEEP.map(
  ([zoom, cases]) =>
    `<div style="zoom: ${zoom}; --hw-zoom: ${zoom}">${cases.map(([size, lh]) => `<ul class="hw-marker-list" style="font-size:${size}px;line-height:${lh}"><li>Item ${size}/${lh}</li></ul>`).join("")}</div>`,
).join("\n")}</body></html>`;

// The prose task box under a zoom, with --hw-zoom set beside it.
const zoomedTasks = tasks(`body > .hw-prose { zoom: ${ZOOM}; --hw-zoom: ${ZOOM} }`);

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

// A page that refits itself to its content, as a slide's fit guard does it: a ResizeObserver
// shrinks the box with CSS zoom and sets --hw-zoom. The longer lines brand-markers writes wrap and
// shrink it from 1 to about 0.6; boxes read before that refit sat 6 to 7 px off.
const refit = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("tokens/marker.css")}">
<style>body { margin: 40px; font-family: var(--font-sans); }
.fit { width: 360px; height: 140px; overflow: hidden; } .fit > div { width: 360px; }
ul { margin: 0; padding: 0; } .row { display: flex; align-items: baseline; gap: 12px; }</style>
</head><body><div class="fit"><div>
<ul class="hw-marker-list" style="font-size:24px;line-height:1.4"><li>One item that fills a line</li><li>Another item that fills one</li><li>A third item filling a line</li></ul>
<div class="row" style="font-size:24px;line-height:1.4"><span class="hw-marker"></span><span>A row filling one line</span></div>
</div></div><script>
const box = document.querySelector(".fit > div");
new ResizeObserver(() => {
  box.style.zoom = 1;
  const zoom = Math.min(1, 140 / box.scrollHeight);
  box.style.zoom = zoom;
  box.style.setProperty("--hw-zoom", zoom);
}).observe(box);
</script></body></html>`;

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
const ZOOMED = file("zoomed.html", zoomed(`--hw-zoom: ${ZOOM}`));
const ZOOMED_UNSET = file("zoomed-unset.html", zoomed(""));
const PLANTED = file("unrounded.html", fractional(UNROUNDED));
const INNER = file("inner.html", inner);
const REFIT = file("refit.html", refit);
const SWEPT = file("swept.html", swept);
const ZOOMED_TASKS = file("zoomed-tasks.html", zoomedTasks);
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

test("a page path with a malformed escape is matched as it stands", () => {
  const reading = { page: "http://h/caf%E9/", offset: 3, indent: null, double: false } as Reading;
  const { kept } = applyExceptions([reading], { "/caf*/": { reason: "kept", off: 1 } });
  expect(kept).toEqual([reading]);
});

test("the first pass finds a page with a marker and passes over one without", async () => {
  const none = file(
    "none.html",
    `<!doctype html><ol><li>A numbered item</li></ol><p><span style="display:inline-block;width:10px;height:10px;background:teal"></span> A swatch outside a list</p>`,
  );
  expect(await Promise.all([NEW, none].map((url) => hasMarkers(browser, url)))).toEqual([
    true,
    false,
  ]);
}, 30_000);

const STRICT = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'";

// brand-markers renders under the consumer's policy too, and reports what it refuses.
test("a policy refusing data: images is red on a page's data: icon, green with img-src data:", async () => {
  const url = file(
    "csp.html",
    `<!doctype html><link rel="stylesheet" href="${brand("elements/elements.css")}"><p class="hw-form-error">Wählt ein Format.</p>`,
  );
  const policy = STRICT;
  const refused: Refusal[] = [];
  await hasMarkers(browser, url, { csp: policy, refused });
  expect(refused).toEqual([
    { page: url, element: "p.hw-form-error::before", source: "data", directive: "img-src" },
  ]);
  refused.length = 0;
  await hasMarkers(browser, url, { csp: `${policy} data:`, refused });
  expect(refused).toEqual([]);
}, 30_000);

// The run reads its own screenshots inside the page, which a policy refusing data: images must not
// stop or see.
test("markers measure the same under a policy refusing data: images", async () => {
  const csp = STRICT;
  const refused: Refusal[] = [];
  // Two runs without a policy differ by about 1e-4 px; brand-markers reports two decimals.
  const near = (a: number | null, b: number | null | undefined) =>
    a !== null && b != null && Math.abs(a - b) < 0.01 ? b : a;
  const plain = await measureMarkers(browser, NEW, { scale: 2 });
  const under = await measureMarkers(browser, NEW, { scale: 2, csp, refused });
  expect(
    under.map((r, i) => ({
      ...r,
      offset: near(r.offset, plain[i]?.offset),
      indent: near(r.indent, plain[i]?.indent),
    })),
  ).toEqual(plain);
  expect(refused).toEqual([]);
}, 60_000);

// A policy the page carries itself, as a <meta> or its server's header under --base, is read
// without "csp"; a refusal inside an iframe counts too.
test("a page's own policy and an iframe's refusals are reported", async () => {
  const meta = file(
    "csp-meta.html",
    `<!doctype html><meta http-equiv="Content-Security-Policy" content="img-src 'self'"><link rel="stylesheet" href="${brand("elements/elements.css")}"><p class="hw-form-error">Wählt ein Format.</p>`,
  );
  const framed = file("csp-frame.html", `<!doctype html><iframe src="${meta}"></iframe>`);
  for (const url of [meta, framed]) {
    const refused: Refusal[] = [];
    await hasMarkers(browser, url, { refused });
    expect(refused).toEqual([
      { page: url, element: "p.hw-form-error::before", source: "data", directive: "img-src" },
    ]);
  }
}, 30_000);

// A host sending different policies by path: "csp" as globs over the page's path, each document,
// an iframe's too, under the policy of its own path.
describe("a policy per path", () => {
  const OPEN = `${STRICT} data:`;
  const form = (name: string) =>
    file(
      name,
      `<!doctype html><link rel="stylesheet" href="${brand("elements/elements.css")}"><p class="hw-form-error">Wählt ein Format.</p>`,
    );
  const refusedOn = async (url: string, csp: Record<string, string>) => {
    const refused: Refusal[] = [];
    await hasMarkers(browser, url, { csp, refused });
    return refused.map((r) => `${r.element} ${r.directive}`);
  };
  const ICON = "p.hw-form-error::before img-src";

  test("each page is rendered under the policy its path matches", async () => {
    const csp = { "**/path-strict.html": STRICT, "**/path-open.html": OPEN };
    expect(await refusedOn(form("path-strict.html"), csp)).toEqual([ICON]);
    expect(await refusedOn(form("path-open.html"), csp)).toEqual([]);
  }, 30_000);

  test("the first listed glob matching a path decides", async () => {
    const url = form("path-both.html");
    expect(await refusedOn(url, { "**/path-both.html": OPEN, "**": STRICT })).toEqual([]);
    expect(await refusedOn(url, { "**/path-both.html": STRICT, "**": OPEN })).toEqual([ICON]);
  }, 30_000);

  test("an iframe takes the policy of its own path", async () => {
    const framed = form("path-framed.html");
    const url = file("path-outer.html", `<!doctype html><iframe src="${framed}"></iframe>`);
    const csp = { "**/path-outer.html": OPEN, "**/path-framed.html": STRICT };
    expect(await refusedOn(url, csp)).toEqual([ICON]);
    expect(
      await refusedOn(url, { "**/path-outer.html": STRICT, "**/path-framed.html": OPEN }),
    ).toEqual([]);
  }, 30_000);

  test("a page no glob matches throws, naming its path", async () => {
    expect(
      await rejection(refusedOn(form("path-none.html"), { "**/elsewhere.html": STRICT })),
    ).toMatch(/"csp": no glob matches .*path-none\.html/);
  }, 30_000);

  test("a frame of the page's own origin no glob matches throws, another origin's does not", async () => {
    const framed = form("path-unlisted.html");
    const csp = { "**/path-own.html": OPEN };
    const own = file("path-own.html", `<!doctype html><iframe src="${framed}"></iframe>`);
    expect(await rejection(refusedOn(own, csp))).toMatch(/no glob matches .*path-unlisted\.html/);
    file("path-bare.html", "<!doctype html><p>A frame</p>");
    const server = serve(dir);
    try {
      const away = file(
        "path-away.html",
        `<!doctype html><iframe src="${new URL("path-bare.html", server.url).href}"></iframe>`,
      );
      expect(await refusedOn(away, { "**/path-away.html": `${OPEN}; frame-src *` })).toEqual([]);
    } finally {
      await server.stop(true);
    }
  }, 30_000);

  test.each([[{}], [{ "**": "" }], [{ "**": 1 }], [{ "**": "a\nb" }], [["a"]], [""]])(
    "a malformed value throws: %j",
    async (csp) => {
      expect(await rejection(hasMarkers(browser, NEW, { csp: csp as unknown as string }))).toMatch(
        /"csp"/,
      );
    },
    30_000,
  );
});

// An area mark opening a list item is an icon, not a list marker. The control: the same box
// without the class is measured.
test("an area mark opening a list item is no marker", async () => {
  const row = (cls: string) =>
    `<!doctype html><ul style="list-style:none"><li><span class="${cls}" style="width:14px;height:14px;display:inline-block;background:teal"></span> Blog</li></ul>`;
  const urls = [file("mark.html", row("hw-mark")), file("box.html", row("box"))];
  expect(await Promise.all(urls.map((url) => hasMarkers(browser, url)))).toEqual([false, true]);
}, 30_000);

// A system's own mark, declared as an exception in brand-elements.json, is no brand marker: its
// instance inside [data-hw-exception] is left out, as brand-elements leaves it out. The controls:
// the same list inside an exception no one declared, and outside any, is measured.
test("a marker inside a declared [data-hw-exception] is not measured, inside another it is", async () => {
  const list = (attr: string) =>
    `<div ${attr}><ul style="list-style:none"><li><span style="width:8px;height:8px;display:inline-block;background:teal"></span> Stop</li></ul></div>`;
  const exception = file("exception.html", `<!doctype html>${list('data-hw-exception="track"')}`);
  const own = file("own.html", `<!doctype html>${list("")}`);
  expect(
    await Promise.all([
      hasMarkers(browser, exception, { exceptions: ["track"] }),
      hasMarkers(browser, exception, { exceptions: ["other"] }),
      hasMarkers(browser, own),
    ]),
  ).toEqual([false, true, true]);
}, 30_000);

test.each([2, 4])(
  "under a CSS zoom of 0.96897, --hw-zoom holds marker.css within 0.25 px at %dx, and leaving it out fails",
  async (scale) => {
    const rs = await all(ZOOMED, scale);
    expect(rs.filter((r) => r.kind === "before").length).toBe(10);
    expect(rs.filter((r) => r.kind === "element").length).toBe(10);
    expect(show(rs.filter(failing))).toEqual([]);
    const unset = (await all(ZOOMED_UNSET, scale)).filter(failing);
    expect(unset.some((r) => r.kind === "before")).toBe(true);
    expect(unset.some((r) => r.kind === "element")).toBe(true);
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

test.each([2, 4])(
  "marker.css holds the sizes a sweep found off, unzoomed and zoomed, at %dx",
  async (scale) => {
    const rs = await all(SWEPT, scale);
    expect(rs.length).toBe(18);
    expect(show(rs.filter(failing))).toEqual([]);
  },
  60_000,
);

// The read-only tick is left out: under a zoom Chrome draws its mask larger than the box (43 rows
// of ink against 40 at 4x), 0.4 to 0.5 px off.
test("the prose task box sits within 0.25 px under a zoom of 0.96897 with --hw-zoom", async () => {
  const rs = (await all(ZOOMED_TASKS, 2)).filter((r) => !r.label.includes("read-only"));
  expect(rs.length).toBe(24);
  expect(show(rs.filter(failing))).toEqual([]);
}, 60_000);

test("a list below the first screen of an inner scroller is measured", async () => {
  const rs = await all(INNER, 2);
  expect(rs.length).toBe(6);
  expect(show(rs.filter(failing))).toEqual([]);
}, 60_000);

test("a page that refits itself after the lines are rewritten is measured once it settles", async () => {
  const rs = await all(REFIT, 2);
  expect(rs.length).toBe(8);
  expect(show(rs.filter(failing))).toEqual([]);
}, 60_000);

// A timeline's waypoint: a square ::before placed on the item's left edge, far left of its text,
// turned into a diamond or not. It is read in its own box: turning it about its middle, by
// transform or by rotate, or moving the text away leaves the reading; moving it down 2 px, by top
// or by translate, moves the reading 2 px. One ending just short of its text is read too.
test("an absolutely placed ::before is read whole, however far left of its text and turned", async () => {
  const stop = (pad: string, cls = "") =>
    `<li style="padding-left:${pad}" class="${cls}"><p>2025 to now</p><h3 style="margin:0">Co-founder</h3></li>`;
  const url = file(
    "stops.html",
    `<!doctype html><style>body{margin:40px;font:16px/1.5 sans-serif}ol{list-style:none;padding:0}
li{position:relative;height:80px}li::before{content:"";position:absolute;left:1px;top:6px;width:11px;height:11px;background:#fff;border:1px solid #000}
.turn::before{transform:rotate(45deg)}.rotate::before{rotate:45deg}.lower::before{top:8px}.moved::before{translate:0 2px}
p{font-size:.8rem;text-transform:uppercase;margin:0}</style><ol>${[
      stop("2.6rem", "turn"),
      stop("2.6rem"),
      stop("1.4rem", "turn"),
      stop("1.4rem"),
      stop("2.6rem", "rotate"),
      stop("2.6rem", "turn lower"),
      stop("2.6rem", "turn moved"),
      stop("13.5px"),
    ].join("")}</ol>`,
  );
  const rs = (await measureMarkers(browser, url, { scale: 2 })).map((r) => r.offset);
  expect(rs.length).toBe(8);
  const [far, square, near, nearSquare, rotated, lower, moved, close] = rs;
  for (const o of [square, near, nearSquare, rotated, close])
    expect(Math.abs(o! - far!)).toBeLessThan(0.25);
  for (const o of [lower, moved]) expect(Math.abs(o! - far! - 2)).toBeLessThan(0.25);
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
      expect(await rejection(measureMarkers(browser, toUrl(p, server.url)))).toMatch(
        "stylesheet not loaded",
      );
  } finally {
    await server.stop(true);
    rmSync(site, { recursive: true, force: true });
  }
});

// A declared exception keeps its page's off readings up to its count, and reports itself once it
// keeps nothing, so a fixed page drops it.
test("marker exceptions keep their readings, fail over their count and report a stale entry", () => {
  const off = (page: string): Reading => ({
    page,
    label: "li",
    kind: "before",
    scale: 2,
    newline: false,
    offset: 0.26,
    indent: null,
    double: false,
  });
  const story = "http://127.0.0.1:1/catalog/stories/Slides/Slide%20types/content-slide/at-rest/";
  const readings = [off(story), off(story), off("http://127.0.0.1:1/units/x/")];
  const measured = [...readings.map((r) => r.page), "http://127.0.0.1:1/x/ground-intro/"];
  const kept = applyExceptions(
    [...readings, { ...off(story), double: true }],
    {
      "**/Slide types/content-slide/at-rest/": { reason: "engine rounding", off: 2 },
      "**/ground-intro/": { reason: "engine rounding", off: 1 },
      "**/not-measured/": { reason: "engine rounding", off: 1 },
    },
    measured,
  );
  expect(kept.kept.length).toBe(2);
  // The item with two markers stays bad; a page not measured in this run makes no entry stale.
  expect(kept.bad.map((r) => r.page)).toEqual(["http://127.0.0.1:1/units/x/", story]);
  expect(kept.findings).toEqual([
    'markers exception "**/ground-intro/" is stale: it keeps no off reading',
  ]);
  const over = applyExceptions(readings, {
    "**/at-rest/": { reason: "engine rounding", off: 1 },
    "**/units/**": { reason: "", off: 1 },
  });
  expect(over.findings).toEqual([
    'markers exception "**/at-rest/": 2 off readings, 1 kept',
    'markers exception "**/units/**": needs a "reason" and an "off" count of at least 1',
  ]);
  expect(applyExceptions(readings).bad.length).toBe(3);
  // Fewer readings than "off" pass, since a run with fewer scales or pages counts fewer.
  const slack = (off: number) =>
    applyExceptions(readings, { "**/at-rest/": { reason: "engine rounding", off } }).findings;
  expect(slack(3)).toEqual([]);
  expect(slack(2)).toEqual([]);
});

// A named page whose only markers sit inside a [data-hw-exception] brand-elements.json declares
// shows its marks, declared as its own: both empty-page guards count them as found. The controls: a
// page without any marker fails, and so does a page whose exception name is not declared.
describe("a page whose markers are all declared exceptions", () => {
  const own = file(
    "only-exception.html",
    `<!doctype html><ol class="track" data-hw-exception="track" style="list-style:none"><li><span style="width:8px;height:8px;display:inline-block;background:teal"></span> Stop</li></ol>`,
  );
  const none = file("no-marker.html", `<!doctype html><p>No list here</p>`);
  // brand-markers at 2x in a folder holding `config` as brand-elements.json.
  const cli = (args: string[], config: object) => {
    const cwd = mkdtempSync(join(tmpdir(), "brand-markers-cli-"));
    try {
      writeFileSync(join(cwd, "brand-elements.json"), JSON.stringify(config));
      const run = Bun.spawnSync(["bun", join(ROOT, "scan/markers.ts"), "--scale", "2", ...args], {
        cwd,
      });
      return { code: run.exitCode, err: run.stderr.toString() };
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  };
  const declared = { exceptions: { track: "The system's own timeline." } };

  // Under an undeclared name the timeline's square is measured as a list marker, and it is off.
  const measured = `${own} li "xxxxHHHH Stop" (element, 2x): `;

  test("passes when named on the command line; no marker fails, an undeclared name is measured", () => {
    expect(cli([own], declared).code).toBe(0);
    const empty = cli([none], declared);
    expect([empty.code, empty.err]).toEqual([1, `${none}: no marker found\n`]);
    const undeclared = cli([own], {});
    expect(undeclared.code).toBe(1);
    expect(undeclared.err).toContain(measured);
  }, 60_000);

  test('passes when listed in brand-elements.json "pages"; no marker fails, an undeclared name is measured', () => {
    expect(cli([], { ...declared, pages: [own] }).code).toBe(0);
    const empty = cli([], { ...declared, pages: [none] });
    expect(empty.code).toBe(1);
    expect(empty.err).toContain('no marker on any page of brand-elements.json "pages"');
    const undeclared = cli([], { pages: [own] });
    expect(undeclared.code).toBe(1);
    expect(undeclared.err).toContain(measured);
  }, 60_000);

  // A catalog alone, its stories showing no marker, measures nothing: it fails as named pages do.
  test("a catalog whose stories show no marker fails", () => {
    const dir = mkdtempSync(join(tmpdir(), "brand-markers-catalog-"));
    try {
      mkdirSync(join(dir, "stories/Parts/plain/default"), { recursive: true });
      writeFileSync(
        join(dir, "stories/Parts/plain/default/index.html"),
        `<!doctype html><p>No list here</p>`,
      );
      const run = cli([], { catalog: dir });
      expect(run.code).toBe(1);
      expect(run.err).toContain("no marker on any page of brand-elements.json");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});

// A line drawn in a fallback face reads that face's x-height, so a page whose web face is late or
// missing is opened again, then fails rather than measuring the fallback.
describe("a page drawn in a fallback face", () => {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/generated/tokens.root.css"><link rel="stylesheet" href="/tokens/fonts.css">
<link rel="stylesheet" href="/tokens/marker.css">
<style>body { margin: 40px; max-width: 420px; font-family: var(--font-sans); } ul { margin: 0; padding: 0; }</style>
</head><body><ul class="hw-marker-list" style="font-size:16px;line-height:1.6"><li>Short item</li><li>Another item</li></ul></body></html>`;
  // The brand's files, every .woff2 answered after `delay` ms, or 404 where it is negative.
  const site = (delay: number) =>
    Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      async fetch(request) {
        const path = new URL(request.url).pathname;
        if (path === "/") return new Response(html, { headers: { "content-type": "text/html" } });
        if (path.endsWith(".woff2")) {
          if (delay < 0) return new Response("gone", { status: 404 });
          await Bun.sleep(delay);
        }
        const f = Bun.file(join(ROOT, path));
        return (await f.exists()) ? new Response(f) : new Response("gone", { status: 404 });
      },
    });
  const measure = async (delay: number) => {
    const server = site(delay);
    try {
      return await measureMarkers(browser, server.url.href, { scale: 2 });
    } finally {
      await server.stop(true);
    }
  };
  const MISSED =
    /page drawn in fallback font .+; Inter Variable missed font-display's block period/;

  test("a face that never arrives fails with the fallback named", async () => {
    expect(await rejection(measure(-1))).toMatch(MISSED);
  }, 60_000);

  test("a face 400 ms late fails so or passes once reloaded", async () => {
    try {
      const rs = await measure(400);
      expect(rs.length).toBe(2);
      expect(show(rs.filter(failing))).toEqual([]);
    } catch (e) {
      expect(String(e)).toMatch(MISSED);
    }
  }, 60_000);

  // One page left in a fallback fails the run without hiding the others: the page that loads its
  // face is still measured and reported.
  test("brand-markers reports a page left in a fallback and measures the rest", async () => {
    const [gone, served] = [site(-1), site(0)];
    try {
      const run = Bun.spawn(
        ["bun", join(ROOT, "scan/markers.ts"), "--scale", "2", gone.url.href, served.url.href],
        { cwd: tmpdir(), stdout: "pipe", stderr: "pipe" },
      );
      const [code, out, err] = await Promise.all([
        run.exited,
        new Response(run.stdout).text(),
        new Response(run.stderr).text(),
      ]);
      expect(code).toBe(1);
      expect(err).toContain(`${gone.url.href}: page drawn in fallback font`);
      expect(err).not.toContain(served.url.href);
      expect(out).toContain("brand-markers: 4 readings on 2 pages, 0 off");
    } finally {
      await gone.stop(true);
      await served.stop(true);
    }
  }, 60_000);

  // A policy refusing the font is the cause of the fallback, so the run names the refusal too.
  test("a page left in a fallback by its policy reports the refused font", async () => {
    const served = site(0);
    const cwd = mkdtempSync(join(tmpdir(), "brand-markers-csp-"));
    try {
      writeFileSync(join(cwd, "brand-elements.json"), JSON.stringify({ csp: "font-src 'none'" }));
      const run = Bun.spawn(
        ["bun", join(ROOT, "scan/markers.ts"), "--scale", "2", served.url.href],
        {
          cwd,
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      const [code, err] = await Promise.all([run.exited, new Response(run.stderr).text()]);
      expect(code).toBe(1);
      expect(err).toContain(`${served.url.href}: page drawn in fallback font`);
      expect(err).toMatch(/refuses \S+\.woff2 \(font-src\)/);
    } finally {
      await served.stop(true);
      rmSync(cwd, { recursive: true, force: true });
    }
  }, 60_000);

  test("the same page served at once reads 0 off", async () => {
    const rs = await measure(0);
    expect(rs.length).toBe(2);
    expect(show(rs.filter(failing))).toEqual([]);
  }, 60_000);
});
