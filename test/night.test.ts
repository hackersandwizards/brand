import { afterAll, beforeAll, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { Browser } from "puppeteer-core";
import { ROOT } from "../scripts/git";
import { parseTokens, SOURCE } from "../scripts/tokens";
import { launch } from "../scan/markers";

// night.css on the element that also declares the day tokens (html carrying both, as under
// Tailwind's theme layer): every token computes to a value. A night value that refers to a token
// derived from the one it replaces loops, and both, and every token reading them, compute empty.
const css = (f: string) => readFileSync(`${ROOT}/${f}`, "utf8");
const [tokens, night] = [css("generated/tokens.root.css"), css("tokens/night.css")];
const names = [
  ...new Set([...`${tokens}${night}`.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]!)),
];

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(() => browser?.close());

test("night.css on the element declaring the day tokens leaves no token empty", async () => {
  expect(names).toContain("--color-ampersand");
  const tab = await browser.newPage();
  await tab.setContent(`<!doctype html><html data-theme="dark" data-hw-night><head><style>
@layer theme, base;
@layer theme { ${tokens} }
${night}</style></head><body></body></html>`);
  const empty = await tab.evaluate((names) => {
    const s = getComputedStyle(document.documentElement);
    return names.filter((n) => !s.getPropertyValue(n).trim());
  }, names);
  await tab.close();
  expect(empty).toEqual([]);
});

// A surface without Tailwind links tokens.root.css, unlayered, and then night.css, the order the
// export names, with the dark toggle on <html>: every token night.css sets takes its night value
// there, and the page's colour scheme turns dark.
test("night.css after tokens.root.css turns every token on a dark html", async () => {
  const set = [...night.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)].map((m) => [m[1]!, m[2]!]);
  expect(set.length).toBeGreaterThan(10);
  const tab = await browser.newPage();
  await tab.setContent(`<!doctype html><html data-theme="dark" data-hw-night><head>
<style>${tokens}</style><style>${night}</style></head><body><i></i></body></html>`);
  const wrong = await tab.evaluate((set) => {
    const html = getComputedStyle(document.documentElement);
    const probe = document.querySelector("i")!;
    const out = set.flatMap(([name, value]) => {
      probe.style.setProperty("--probe", value!);
      const want = getComputedStyle(probe).getPropertyValue("--probe").trim();
      const got = html.getPropertyValue(name!).trim();
      return got === want ? [] : [`${name}: ${got}, want ${want}`];
    });
    return html.colorScheme === "dark" ? out : [...out, `color-scheme: ${html.colorScheme}`];
  }, set);
  await tab.close();
  expect(wrong).toEqual([]);
});

// The island takes the colours and what is built from them back, nothing else: a corner or a scale
// an ancestor sets holds on it.
test("tokens.root.css's island block declares only the colour tokens and those reading them", () => {
  const island = tokens.slice(tokens.indexOf(":where("));
  expect(island).toContain("--color-bg:");
  expect(island).toContain("--gradient-strip:");
  expect(island).not.toContain("--radius-brand:");
  expect(island).not.toContain("--text-meta:");
});

// A light island in that night, such as a catalog frame drawing a light-only page: the nearest
// data-theme wins, so every token tokens.root.css declares, a derived one included, computes there
// as on a day page, and so do its text, which body's colour would hand down in night ink, and
// scales.css's line; also where the island carries data-hw-night or holds a data-hw-night element.
// The expert roles night.css also sets are expert.css's on the island (test/expert.test.ts).
test("a data-theme=light element under a night html keeps every day token", async () => {
  const tab = await browser.newPage();
  // Every token tokens.root.css declares, scales.css's line, and the text colour.
  const keys = [...Object.keys(parseTokens(readFileSync(SOURCE, "utf8"))), "--hw-line"];
  const read = async (html: string, body: string) => {
    await tab.setContent(`<!doctype html><html data-hw-scale="screen" ${html}><head>
<style>${tokens}${css("elements/scales.css")}</style>
<style>${night} body { color: var(--color-ink) }</style></head><body>${body}</body></html>`);
    return tab.evaluate((keys) => {
      const s = getComputedStyle(document.querySelector("main")!);
      return {
        ...Object.fromEntries(keys.map((n) => [n, s.getPropertyValue(n).trim()])),
        color: s.color,
      };
    }, keys);
  };
  const day = await read("", "<main></main>");
  const dark = 'data-theme="dark" data-hw-night';
  for (const body of [
    '<main data-theme="light"></main>',
    '<main data-theme="light" data-hw-night></main>',
    '<div data-theme="light"><main data-hw-night></main></div>',
  ])
    expect([body, await read(dark, body)]).toEqual([body, day]);
  await tab.close();
});

test("the purple button turns darker on hover under night.css", async () => {
  const tab = await browser.newPage();
  await tab.setContent(`<!doctype html><html><head><style>
${tokens}${night}${css("elements/button.css")} * { transition: none !important }</style></head>
<body data-theme="dark" data-hw-night><a class="hw-button" data-hue="purple" href="#">Go</a></body></html>`);
  const lightness = () =>
    tab.$eval(".hw-button", (e) => {
      const c = document.createElement("canvas").getContext("2d")!;
      c.fillStyle = getComputedStyle(e).backgroundColor;
      c.fillRect(0, 0, 1, 1);
      const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
      return r! + g! + b!;
    });
  const rest = await lightness();
  await tab.hover(".hw-button");
  const hover = await lightness();
  await tab.close();
  expect(hover).toBeLessThan(rest);
});
