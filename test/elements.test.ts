import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import own from "../package.json";
import {
  coverage,
  ELEMENTS,
  measurePage,
  rules,
  SETTINGS,
  sourceFindings,
  type Config,
} from "../scan/elements";
import { launch } from "../scan/markers";
import { DEMOS } from "../scripts/element-demos";
import { ROOT } from "../scripts/git";

// Every element in every scale and theme, as a spoke's page shows it: tiles holding the samples.
const brand = (f: string) => pathToFileURL(join(ROOT, f)).href;
const tiles = Object.keys(ELEMENTS)
  .map(
    (name) =>
      `<div data-hw-tile="${name}" data-hw-version="${own.version}">${DEMOS[name] ?? ""}</div>`,
  )
  .join("\n");
const page = (css = "") => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("elements/elements.css")}">
<style>body { font-family: var(--font-sans); } [data-hw-exception] td { padding-left: 9px } ${css}</style></head>
<body class="hw-focus-ring">
${["screen", "dense", "print", "stage"]
  .flatMap((scale) =>
    ["light", "dark"].map(
      (theme) =>
        `<section data-hw-scale="${scale}" data-theme="${theme}">${theme === "light" ? tiles : tiles.replaceAll("data-hw-tile", "data-hw-sample")}</section>`,
    ),
  )
  .join("\n")}
<div data-hw-exception="total-band"><table class="hw-table"><tr><td>Sum</td></tr></table></div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), "brand-elements-"));
const file = (name: string, html: string) => {
  writeFileSync(join(dir, name), html);
  return join(dir, name);
};

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(() => browser?.close());

test("every element matches its rule in every scale and theme", async () => {
  const r = await measurePage(browser, file("clean.html", page()));
  expect(r.findings).toEqual([]);
  expect(r.seen.sort()).toEqual(Object.keys(ELEMENTS).sort());
}, 60_000);

// One drift per element, as a surface's own rule overrides the element: each must turn red.
const DRIFT: Record<string, string> = {
  label: ".hw-label { letter-spacing: 0.1em }",
  pill: ".hw-pill { background: color-mix(in srgb, var(--color-teal) 40%, white) }",
  card: ".hw-card { border-color: var(--color-teal) }",
  callout: ".hw-callout { border-radius: 0 }",
  quote: ".hw-quote { border-left-width: 4px }",
  table: ".hw-table th { color: var(--color-ink) }",
  link: ".hw-link { text-decoration-line: none }",
  "focus-ring": ".hw-focus-ring :focus-visible { outline-width: 2px }",
  "icon-button": ".hw-icon-button { border-radius: 5px }",
  strip: ".hw-strip { height: 2px }",
  code: ".hw-code { background: #24292e }",
};
test.each(Object.entries(DRIFT))(
  "a drifted %s is red",
  async (name, css) => {
    const r = await measurePage(browser, file(`drift-${name}.html`, page(css)));
    expect(r.findings.some((f) => f.element === name)).toBe(true);
  },
  60_000,
);

test("an element inside an exception's instance is not measured", async () => {
  const r = await measurePage(browser, file("exception.html", page()));
  expect(r.findings).toEqual([]);
  expect(r.exceptions).toEqual(["total-band"]);
}, 60_000);

test("a setting the medium sets is no drift", async () => {
  const r = await measurePage(
    browser,
    file(
      "setting.html",
      page(".hw-card { --hw-card-pad: 3rem } .hw-label { --hw-label-size: 9.5pt }"),
    ),
  );
  expect(r.findings).toEqual([]);
}, 60_000);

test("night is measured against the night rule", async () => {
  const r = await measurePage(
    browser,
    file("night.html", page('[data-theme="dark"] .hw-pill { color: var(--color-ink) }')),
  );
  expect(r.findings.filter((f) => f.element === "pill").length).toBeGreaterThan(0);
}, 60_000);

test("coverage: a used element without a tile, a stale tile, an unlisted element, an exception without a reason or a tile", () => {
  const config: Config = {
    pages: [],
    uses: ["card", "pill", "chart"],
    exceptions: { "total-band": "", "slide-table": "framed for the room" },
  };
  const out = coverage(config, [
    {
      seen: ["card", "label"],
      tiles: [{ name: "card", version: "0.1.0", holds: true }],
      exceptions: ["total-band"],
    },
  ]);
  expect(out).toEqual([
    `card: the tile says brand v0.1.0, the installed package is v${own.version}; rebuild the page`,
    'pill: used, but no page shows it in a [data-hw-tile="pill"]',
    'brand-elements.json: "chart" is no shared element (label, pill, card, callout, quote, table, link, focus-ring, icon-button, strip, code)',
    'label: a page shows it, but brand-elements.json does not list it in "uses"',
    'brand-elements.json: exception "total-band" names no reason',
    'slide-table: an exception without a [data-hw-exception="slide-table"] on a page',
  ]);
});

test("source: a rule styling an element-named class is red unless hw-* or an exception", () => {
  const files: Record<string, string> = {
    "src/a.css": `.doc-tag { border-radius: 9999px } .card .meta { color: red } .card { display: grid }
@media print { .callout { background: white } } .hw-card { border: 0 } .total-band { background: teal }
.eyebrow, .title { font-size: 9pt }`,
    "src/components/Card.astro": `<div class="card"/><style>.wrap { padding: 0 }</style>`,
    "src/components/Quote.astro": `<blockquote class="hw-quote"/>`,
    "src/components/Chip.astro": `<span/>`,
    "test/x.css": ".chip { border: 0 }",
  };
  files["deck/readout.css"] = ".quote { font-size: 2rem }";
  const out = sourceFindings(Object.keys(files), (p) => files[p]!, {
    "doc-tag": "the type tag",
    readout: { reason: "the deck's own medium", files: ["deck/readout.css"] },
  });
  expect(out).toEqual([
    'src/a.css: .callout styles an element named like a shared one; use the hw-* element or list "callout" as an exception',
    'src/a.css: .eyebrow styles an element named like a shared one; use the hw-* element or list "eyebrow" as an exception',
    'src/components/Card.astro: a component named like a shared element; render the hw-* element or list "card" as an exception',
    'src/components/Chip.astro: a component named like a shared element; render the hw-* element or list "chip" as an exception',
  ]);
});

test("rules opens at-rule blocks and reads each rule's properties", () => {
  expect(rules("@layer x { @media print { .a, .b { color: red; border: 0 } } } .c{x:1}")).toEqual([
    { selectors: [".a", ".b"], props: ["color", "border"] },
    { selectors: [".c"], props: ["x"] },
  ]);
});

// The print preset leaves the type sizes to print.css, which owns paper sizes; the screen preset
// sets every setting, so a screen cell inside a paper page is whole.
test("the screen preset sets every setting an element reads", () => {
  const screen = readFileSync(join(ROOT, "elements/scales.css"), "utf8").match(
    /\[data-hw-scale="screen"\] \{([^}]*)\}/,
  )![1]!;
  const optional = new Set([
    "--hw-label-family",
    "--hw-pill-hue",
    "--hw-pill-hue-night",
    "--hw-pill-edit-corner",
  ]);
  expect(SETTINGS.filter((s) => !optional.has(s) && !screen.includes(`${s}:`))).toEqual([]);
});

// The catalogue's own styles leave its element samples alone.
test("the catalogue's samples match their rules", async () => {
  const r = await measurePage(browser, join(ROOT, "catalogue.html"));
  expect(r.seen.length).toBe(10);
  expect(r.findings).toEqual([]);
}, 60_000);
