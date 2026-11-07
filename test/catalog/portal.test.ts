import { afterAll, beforeAll, expect, test } from "bun:test";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ELEMENTS, measurePage } from "../../scan/elements";
import { lfsOid, ROOT } from "../../scripts/git";
import { failing, launch, measureMarkers } from "../../scan/markers";
import { DIST, fileOf, page } from "./site";

const html = page("index.html");

test("the portal has no duplicate id", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});

test("the portal shows every shared element and every expert component", () => {
  const components = readdirSync(join(ROOT, "expert/components"))
    .filter((f) => f.endsWith(".astro"))
    .map((f) => f.slice(0, -6));
  expect(Object.keys(ELEMENTS).filter((name) => !html.includes(`id="hw-${name}"`))).toEqual([]);
  expect(components.filter((c) => !html.includes(`<code>${c}</code>`))).toEqual([]);
});

test("the portal counts the logos it shows", () => {
  const word = html.match(/<p>(\w+) logos, each one line\./)![1];
  const cards = html.match(/<article class="logo" /g)!.length;
  expect(["One", "Two", "Three", "Four", "Five", "Six"].indexOf(word) + 1).toBe(cards);
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
  const frames = [...html.matchAll(/\ssrcdoc="([^"]*)"/g)].map((m) => decode(m[1]!));
  const refs = [html, ...frames]
    .flatMap((h) => [...h.matchAll(/\s(?:src|href|data-href)="([^"#]*)(?:#[^"]*)?"/g)])
    .map((m) => decode(m[1]!).split("?")[0]!)
    .filter((r) => r && !/^(?:[a-z]+:|\/\/)/.test(r));
  expect(refs.length).toBeGreaterThan(100);
  expect([...new Set(refs)].filter((r) => !fileOf(r))).toEqual([]);
  // A Git LFS pointer resolves too, and shows as a broken image.
  expect([...new Set(refs)].filter((r) => lfsOid(readFileSync(fileOf(r)!)))).toEqual([]);
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

// The portal's own styles leave its element samples alone.
test("the portal's samples match their rules", async () => {
  const r = await measurePage(browser, url);
  expect(r.seen.length).toBe(24);
  expect(r.findings).toEqual([]);
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
