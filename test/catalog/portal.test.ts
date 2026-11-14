import { afterAll, beforeAll, expect } from "bun:test";
import { test } from "../limit";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { closeSync, openSync, readdirSync, readSync } from "node:fs";
import { join } from "node:path";
import { ELEMENTS, kebab, measurePage } from "../../scan/elements";
import { ROOT } from "../../scripts/git";
import { lfsOid } from "../../scan/colours";
import { failing, launch, measureMarkers } from "../../scan/markers";
import { DIST, fileOf, page } from "./site";
import manifest from "../../manifest.json";
import catalogs from "../../expert/catalogs.json";
import { tokens } from "../../generated/tokens";

const html = page("index.html");
const COMPONENTS = readdirSync(join(ROOT, "expert/components"))
  .filter((f) => f.endsWith(".astro"))
  .map((f) => f.slice(0, -6));

test("the portal has no duplicate id", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});

test("the portal shows every shared element and every expert component", () => {
  expect(Object.keys(ELEMENTS).filter((name) => !html.includes(`id="hw-${name}"`))).toEqual([]);
  expect(COMPONENTS.filter((c) => !html.includes(`<code>${c}</code>`))).toEqual([]);
});

test("an element's page says what it is in its comment's first sentence; the rest stays in the file", () => {
  const block = html.match(/<h4 id="hw-check">[^]*?<div class="el-matrix">/)![0];
  expect(block).toContain("painted like an app");
  expect(block).not.toContain("One em square");
});

// A slot a page passes only on a condition counts as filled while empty: PageHeader draws a
// subtitle or an action box only where one holds something.
test("PageHeader draws no empty subtitle or action box", () => {
  const story = (s: string) => page(`catalog/stories/Navigation/page-header/${s}/index.html`);
  const boxes = (html: string) =>
    [
      ...html.matchAll(
        /class="(page-subtitle|page-title-action)[^"]*"[^>]*>([^]*?)<\/(span|div)>/g,
      ),
    ].map((m) => [m[1], m[2]!.replace(/<[^>]+>/g, "").trim()]);
  expect(boxes(story("title-only"))).toEqual([]);
  expect(boxes(story("subtitle-text"))).toEqual([["page-subtitle", "6 hubs · 41 pages"]]);
  expect(boxes(story("with-action")).map(([cls]) => cls)).toEqual([
    "page-subtitle",
    "page-title-action",
  ]);
});

// The portal sends a reader to the catalog for the expert components: each has its stories there.
test("every expert component has its stories in the catalog, which the portal links", () => {
  const stories = join(DIST, "catalog/stories");
  const shown = new Set(readdirSync(stories).flatMap((group) => readdirSync(join(stories, group))));
  expect(COMPONENTS.filter((c) => !shown.has(kebab(c)))).toEqual([]);
  expect(/id="expert-group"[^]*?<a href="catalog\/">/.test(html)).toBe(true);
});

test("catalogs.json's portal anchors lead to every element, every colour and every palette", () => {
  const { portal, anchors } = catalogs.find((c) => c.name === "Brand")!;
  expect(portal).toBe("https://hackersandwizards.github.io/brand/");
  // Every colour with a value of its own; an alias or a role (var() of another) has no swatch.
  const colours = Object.entries(tokens)
    .filter(([k, v]) => k.startsWith("--color-") && !v.startsWith("var("))
    .map(([k]) => anchors!.colour.replace("<colour>", k.slice("--color-".length)));
  const elements = Object.keys(ELEMENTS).map((n) => anchors!.element.replace("<element>", n));
  const palettes = ["neutrals", "hues"].map((p) => anchors!.palette.replace("<palette>", p));
  // A link opens the view, then the id inside it: #<view>/<id>.
  const missing = [...colours, ...elements, ...palettes].filter((a) => {
    const [view, id] = a.slice(1).split("/");
    // The view runs to the next view's opening tag.
    const [, body = ""] = html.split(new RegExp(`<section[^>]* data-page="${view}"`));
    return !body.split(/<section[^>]* data-page="/)[0]!.includes(` id="${id}"`);
  });
  expect(colours.length).toBeGreaterThan(10);
  expect(missing).toEqual([]);
});

test("the portal lists tokens.css's aliases and no role token among them", () => {
  const aliases = html.match(/<p class="meta">Aliases, [^]*?<\/p>/)?.[0] ?? "";
  expect(aliases).toContain("<code>--color-subtle</code>");
  expect(aliases).not.toContain("--color-label-text");
});

test("the portal counts the logos it shows", () => {
  const word = html.match(/<p>(\w+) logos, each one line\./)![1];
  const cards = html.match(/<article class="logo" /g)!.length;
  expect(["One", "Two", "Three", "Four", "Five", "Six"].indexOf(word) + 1).toBe(cards);
});

test("the portal links every logo file the package ships, a master's cut or a delivery file", () => {
  const shipped = manifest.files
    .map((f) => f.path)
    .filter((p) => p.startsWith("logos/") && !/emoji-logo|\.tif$|\.json$/.test(p));
  expect(shipped.length).toBeGreaterThan(0);
  expect(shipped.filter((p) => !html.includes(`href="${p}" download`))).toEqual([]);
});

// The design guide: a colour swatch is square, never a scaled corner.
test("the portal's colour swatches are square", () => {
  expect(html.match(/\.swatch span \{[^}]*border-radius: ([^;]+);/)![1]).toBe("0");
});

// A download link is one text line tall: the small corner.
test("the portal's download links take the small corner", () => {
  expect(html.match(/\.dl a \{[^}]*border-radius: ([^;]+);/)![1]).toBe("var(--radius-sm)");
});

test("every link and image of the portal resolves in dist/", () => {
  const decode = (s: string) =>
    s.replace(
      /&(quot|lt|gt|amp);/g,
      (_, e: string) => ({ quot: '"', lt: "<", gt: ">", amp: "&" })[e]!,
    );
  // A frame's document resolves its links against the page, through <base href="../">.
  const frames = [...html.matchAll(/<iframe src="(catalog-assets\/[^"]+\.html)"/g)].map((m) =>
    page(m[1]!).replace('<base href="../">', ""),
  );
  expect(frames.length).toBeGreaterThan(30);
  // A script's string literals are no links; its src stays checked.
  const refs = [html, ...frames]
    .map((h) => h.replace(/(<script\b[^>]*>)[^]*?(<\/script>)/g, "$1$2"))
    .flatMap((h) => [...h.matchAll(/\s(?:src|href|data-href)="([^"#]*)(?:#[^"]*)?"/g)])
    .map((m) => decode(m[1]!).split("?")[0]!)
    .concat(
      [...html.matchAll(/<style>([^]*?)<\/style>/g)].flatMap((s) =>
        [...s[1]!.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]!),
      ),
    )
    .filter((r) => r && !/^(?:[a-z]+:|\/\/)/.test(r));
  expect(refs.length).toBeGreaterThan(100);
  expect([...new Set(refs)].filter((r) => !fileOf(r))).toEqual([]);
  // A Git LFS pointer resolves too and shows as a broken image: `bun install` pulls them.
  const head = (f: string) => {
    const b = Buffer.alloc(200);
    const fd = openSync(f, "r");
    readSync(fd, b, 0, 200, 0);
    closeSync(fd);
    return b;
  };
  expect([...new Set(refs)].filter((r) => lfsOid(head(fileOf(r)!)))).toEqual([]);
});

test("catalogue.html forwards to the portal with its anchor", () => {
  expect(page("catalogue.html")).toContain('location.replace("./" + location.hash)');
});

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(() => browser?.close());
const url = pathToFileURL(`${DIST}/index.html`).href;

// Each view is hidden until its link opens it, and brand-elements skips what is hidden: every view
// is measured open, and the overview, all views hidden, as a control.
test("the portal's samples match their rules", async () => {
  const views = [...new Set(page("index.html").match(/(?<=data-page=")[a-z-]+/g))];
  const rs = await Promise.all(views.map((v) => measurePage(browser, `${url}#${v}`)));
  // Every element but one: the focus ring is read only on a focused tile.
  expect(new Set(rs.flatMap((r) => r.seen)).size).toBe(Object.keys(ELEMENTS).length - 1);
  expect(rs.flatMap((r) => r.findings)).toEqual([]);
  expect((await measurePage(browser, url)).seen).toEqual([]);
}, 60_000);

// The portal's own lists take the rule; with the browser's disc they read 0.56 to 0.61 px off.
test("the portal's lists sit within 0.25 px", async () => {
  const rs = [
    ...(await measureMarkers(browser, url, { scale: 2 })),
    ...(await measureMarkers(browser, url, { scale: 2, newline: true })),
  ];
  expect(rs.length).toBeGreaterThan(0);
  expect(
    rs.filter(failing).map((r) => `${r.label} ${r.kind} newline:${r.newline} ${r.offset}`),
  ).toEqual([]);
}, 60_000);

// The page title takes the shell's type step, which only brand's tokens set on this page.
test("the portal's title is brand's --text-page", async () => {
  const p = await browser.newPage();
  await p.goto(url);
  const size = await p.$eval("h1", (el) => getComputedStyle(el).fontSize);
  expect(size).toBe(`${parseFloat(tokens["--text-page"]) * 16}px`);
  await p.close();
}, 60_000);

// Brand asks for the quote to be marked not-prose, which the measure's own selector skips.
test("a quote in the prose block keeps the running text's measure", async () => {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.setContent(
    `<div class="prose hw-prose" style="font-size:16px"><p>Text</p><blockquote class="hw-quote not-prose"><p>Quote</p></blockquote><blockquote class="hw-quote not-prose"><pre>code</pre></blockquote></div>`,
  );
  for (const path of ["generated/tokens.root.css", "generated/elements.css"])
    await p.addStyleTag({ path: join(ROOT, path) });
  const widths = await p.$$eval(".hw-prose > *", (els) =>
    els.map((el) => el.getBoundingClientRect().width),
  );
  expect(widths).toEqual([528, 528, 768]);
  await p.close();
}, 60_000);
