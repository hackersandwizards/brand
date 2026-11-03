import { afterAll, beforeAll, expect, test } from "bun:test";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import { measurePage } from "../../scan/elements";
import { failing, launch, measureMarkers } from "../../scan/markers";
import { DIST, fileOf, page } from "./site";

const html = page("index.html");

// A duplicate anchor means two things on the page claim one name: rename the less specific one.
test("the portal has no duplicate id", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});

// The Logos section names as many logos as it shows cards.
test("the portal counts the logos it shows", () => {
  const word = html.match(/<p>(\w+) logos, each one line\./)![1];
  const cards = html.match(/<article class="logo" /g)!.length;
  expect(["One", "Two", "Three", "Four", "Five", "Six"].indexOf(word) + 1).toBe(cards);
});

// The design guide: a colour swatch is square, never a scaled corner.
test("the portal's colour swatches are square", () => {
  expect(html.match(/\.swatch span \{[^}]*border-radius: ([^;]+);/)![1]).toBe("0");
});

// Every file the portal links or loads is in the build, its sample frames' (srcdoc) included.
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
});

// The former address forwards with its anchor, so old links such as catalogue.html#logos land.
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
  expect(r.seen.length).toBe(21);
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
