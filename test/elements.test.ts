import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  setsOwned,
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
afterAll(async () => {
  await browser?.close();
  rmSync(dir, { recursive: true, force: true });
});

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
  button: ".hw-button { border-radius: 5px }",
  "arrow-link": ".hw-arrow-link { color: var(--color-teal) }",
  field: ".hw-field { border-color: var(--color-border) }",
  facts: ".hw-facts > div { row-gap: 8px }",
  segmented: ".hw-segmented { padding: 4px }",
  row: ".hw-row { padding: 12px }",
  breadcrumb: ".hw-breadcrumb a { color: var(--color-purple) }",
  status: ".hw-status { background: transparent }",
  frame: ".hw-frame { border-style: solid }",
  kpi: ".hw-kpi-value { font-weight: 500 }",
  prose: ".hw-prose h3 { font-weight: 400 }",
};
test.each(Object.entries(DRIFT))(
  "a drifted %s is red",
  async (name, css) => {
    const r = await measurePage(browser, file(`drift-${name}.html`, page(css)));
    expect(r.findings.some((f) => f.element === name)).toBe(true);
  },
  60_000,
);

// Every instance is measured, not one per kind: one drifted pill among 2,000 is red, and only it.
test("one drifted instance among many is red", async () => {
  const pills = Array.from({ length: 2000 }, (_, i) =>
    i === 1234 ? '<span class="hw-pill" id="odd">pdf</span>' : '<span class="hw-pill">pdf</span>',
  ).join("");
  const r = await measurePage(
    browser,
    file(
      "one-of-many.html",
      page("#odd { padding-left: 13px }").replace("</body>", `${pills}</body>`),
    ),
  );
  expect(r.findings.map((f) => f.prop)).toEqual(["padding-left"]);
}, 60_000);

test("an element inside an exception's instance is not measured", async () => {
  const r = await measurePage(browser, file("exception.html", page()));
  expect(r.findings).toEqual([]);
  expect(r.exceptions).toEqual(["total-band"]);
}, 60_000);

// Tailwind's preflight: every element a solid border of no width, which draws nothing.
test("a border of no width is no drift, whatever its style; a drawn one is", async () => {
  const unruled = (css: string) =>
    page(css).replace(
      "</body>",
      '<dl class="hw-facts"><div><dt class="hw-label" data-tone="muted">Dauer</dt><dd>2 Tage</dd></div></dl></body>',
    );
  const none = await measurePage(
    browser,
    file(
      "zero-border.html",
      unruled(".hw-facts:not([data-variant]) > div { border: 0 solid red }"),
    ),
  );
  expect(none.findings).toEqual([]);
  const drawn = await measurePage(
    browser,
    file(
      "drawn-border.html",
      unruled(".hw-facts:not([data-variant]) > div { border-top: 1px solid }"),
    ),
  );
  expect(drawn.findings.some((f) => f.element === "facts")).toBe(true);
}, 60_000);

test("a setting the medium sets, or a property the element leaves to it, is no drift", async () => {
  const r = await measurePage(
    browser,
    file(
      "setting.html",
      page(".hw-card { --hw-card-pad: 3rem; font-size: 9pt } .hw-label { --hw-label-size: 9.5pt }"),
    ),
  );
  expect(r.findings).toEqual([]);
}, 60_000);

// A build that rewrites color-mix() into rgba() (Lightning CSS) draws the same colour.
test("the same colour in another notation is no drift, another colour is", async () => {
  const same = await measurePage(
    browser,
    file(
      "notation.html",
      page(
        '[data-theme="dark"] .hw-card:not([data-variant]) { border-color: rgba(255, 255, 255, 0.15); background-color: rgba(255, 255, 255, 0.07) }',
      ),
    ),
  );
  expect(same.findings).toEqual([]);
  const other = await measurePage(
    browser,
    file(
      "notation-drift.html",
      page(
        '[data-theme="dark"] .hw-card:not([data-variant]) { background-color: rgba(255, 255, 255, 0.12) }',
      ),
    ),
  );
  expect(other.findings.some((f) => f.element === "card")).toBe(true);
}, 60_000);

// A light-only page (brand-elements.json "lightOnly") may leave the night tokens out: the night
// rules never draw there. A day token still counts.
test("a light-only page needs no night token, a day token still counts", async () => {
  const noNight = page(":root { --color-night-muted: initial }");
  const strict = await measurePage(browser, file("light-strict.html", noNight));
  expect(strict.findings.some((f) => f.prop === "--color-night-muted")).toBe(true);
  const light = await measurePage(browser, file("light-only.html", noNight), "", true);
  expect(light.findings.filter((f) => f.got === "undefined")).toEqual([]);
  const noDay = page(":root { --color-teal-dark: initial }");
  const day = await measurePage(browser, file("light-day.html", noDay), "", true);
  expect(day.findings.some((f) => f.prop === "--color-teal-dark")).toBe(true);
}, 60_000);

test("a brand token the surface never defines is red", async () => {
  const r = await measurePage(
    browser,
    file("token.html", page(":root { --type-small-family: initial }")),
  );
  expect(r.findings.some((f) => f.prop === "--type-small-family")).toBe(true);
}, 60_000);

// The nearest theme decides: a light slide inside a dark page draws its elements by day.
test("a light subtree inside a dark one draws the day rule", async () => {
  const r = await measurePage(
    browser,
    file(
      "nested.html",
      page().replace(
        "</body>",
        '<div data-theme="dark"><div data-theme="light"><div data-hw-sample class="hw-card">Tag</div><span class="hw-label">Tag</span></div></div></body>',
      ),
    ),
  );
  expect(r.findings).toEqual([]);
  const html = await browser.newPage();
  await html.goto(
    `file://${file("nested2.html", page().replace("</body>", '<div data-theme="dark"><div data-theme="light"><span id="probe" class="hw-label">Tag</span></div></div></body>'))}`,
  );
  const [day, probe] = await html.evaluate(() => {
    const ref = document.createElement("span");
    ref.className = "hw-label";
    document.body.append(ref);
    return [getComputedStyle(ref).color, getComputedStyle(document.getElementById("probe")!).color];
  });
  await html.close();
  expect(probe).toBe(day);
}, 60_000);

// A cell takes no shadow root; a remove button sizes by the pill, not the browser's button font.
test("an element in a table cell and a pill's remove button are measured", async () => {
  const r = await measurePage(
    browser,
    file(
      "cell.html",
      page().replace(
        "</body>",
        '<table><tr><td class="hw-label">Zeitraum</td><td><span class="hw-pill">agentic<button type="button" class="hw-pill-remove" aria-label="Entfernen"></button></span></td></tr></table></body>',
      ),
    ),
  );
  expect(r.findings).toEqual([]);
  const page2 = await browser.newPage();
  await page2.goto(`file://${file("cell2.html", page())}`);
  const [btn, pill] = await page2.evaluate(() => {
    const b = document.querySelector(".hw-pill-remove")!;
    return [getComputedStyle(b).width, getComputedStyle(b.parentElement!).fontSize];
  });
  await page2.close();
  expect(btn).toBe(pill);
}, 60_000);

// The link's underline offset is in em: its reference reads the cell's 14 px, not the table's parent.
test("a link in a smaller table cell is measured at the cell's size", async () => {
  const r = await measurePage(
    browser,
    file(
      "cell-link.html",
      page().replace(
        "</body>",
        '<table style="font-size: 14px"><tr><td><a class="hw-link" href="#x">Agenda</a></td></tr></table></body>',
      ),
    ),
  );
  expect(r.findings).toEqual([]);
}, 60_000);

test("a joined field row is measured joined", async () => {
  const joined =
    '<div class="hw-field-row" data-joined><input class="hw-field" aria-label="Suche"><button type="button" class="hw-button">Go</button></div>';
  const r = await measurePage(
    browser,
    file("joined.html", page().replace("</body>", `${joined}</body>`)),
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
    'brand-elements.json: "chart" is no shared element (label, pill, card, callout, quote, table, link, focus-ring, icon-button, strip, code, button, arrow-link, field, facts, segmented, row, breadcrumb, status, frame, kpi, prose)',
    'label: a page shows it, but brand-elements.json does not list it in "uses"',
    'brand-elements.json: exception "total-band" names no reason',
    'slide-table: an exception without a [data-hw-exception="slide-table"] on a page',
  ]);
});

test("source: a rule styling an element-named class is red unless hw-* or an exception", () => {
  const files: Record<string, string> = {
    "src/a.css": `.card:hover { border-color: teal } .card::before { background: purple } :is(.linked-card, a.tag):is(:hover, :has(:is(a, summary):focus-visible)) { border-color: teal } .card:has(:is(a, button):focus-visible) { outline: 2px solid } .side-card:not(.x) { border-color: red } .doc-tag { border-radius: 9999px } .card .meta { color: red } .card { display: grid } .note { font-size: 9pt; color: grey } .total-note { font: 9pt sans-serif }
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
    'src/a.css: .side-card:not(.x) styles an element named like a shared one; use the hw-* element or list "side-card" as an exception',
    'src/a.css: .total-note styles an element named like a shared one; use the hw-* element or list "total-note" as an exception',
    'src/a.css: .callout styles an element named like a shared one; use the hw-* element or list "callout" as an exception',
    'src/a.css: .eyebrow styles an element named like a shared one; use the hw-* element or list "eyebrow" as an exception',
    'src/components/Card.astro: a component named like a shared element; render the hw-* element or list "card" as an exception',
    'src/components/Chip.astro: a component named like a shared element; render the hw-* element or list "chip" as an exception',
  ]);
});

// The website's strip (Tailwind's gradient) mixes in oklab; sRGB shifted its middle on every page.
test("the strip and the expert header strip mix teal to purple in oklab", () => {
  for (const f of ["elements/strip.css", "expert/header.css"])
    expect(readFileSync(join(ROOT, f), "utf8")).toContain(
      "linear-gradient(to right in oklab, var(--color-teal), var(--color-purple))",
    );
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
    "--hw-muted",
    "--hw-pill-hue",
    "--hw-pill-hue-night",
    "--hw-pill-edit-corner",
    "--hw-segment-line",
    "--hw-prose-check-x",
    "--hw-row-fill",
    "--hw-field-family",
  ]);
  expect(SETTINGS.filter((s) => !optional.has(s) && !screen.includes(`${s}:`))).toEqual([]);
});

// Decision ds-roll-trainer-hub-compact (2026-11-02): os 13 px, trainer hub 14 px, both dense.
test("dense with data-hw-type=regular takes the expert set's regular text, dense alone 13 px", async () => {
  const p = await browser.newPage();
  const read = async (attrs: string) => {
    await p.goto(
      pathToFileURL(
        file(
          `type-${attrs.length}.html`,
          `<!doctype html><html ${attrs}><head><link rel="stylesheet" href="${brand("elements/scales.css")}"></head><body></body></html>`,
        ),
      ).href,
    );
    return p.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return ["--text-ui", "--text-ui--line-height", "--text-micro"].map((v) =>
        s.getPropertyValue(v).trim(),
      );
    });
  };
  const expert = readFileSync(join(ROOT, "expert/expert.css"), "utf8");
  const regular = ["--text-ui", "--text-ui--line-height", "--text-micro"].map(
    (v) => expert.match(new RegExp(`\\n\\s*${v}: ([^;]+);`))![1]!,
  );
  expect(await read('data-hw-scale="dense" data-hw-type="regular"')).toEqual(regular);
  expect(await read('data-hw-scale="dense"')).toEqual(["0.8125rem", "1.45", "0.6875rem"]);
  await p.close();
}, 60_000);

test("rules resolves nested rules against the parent and keeps the parent's own properties", () => {
  expect(
    rules(".card { border-radius: 8px; &:hover { color: red } .meta, & + & { x: 1 } }"),
  ).toEqual([
    { selectors: [".card:hover"], props: ["color"] },
    { selectors: [".card .meta", ".card + .card"], props: ["x"] },
    { selectors: [".card"], props: ["border-radius"] },
  ]);
});

test("a gap, flex-flow or logical property sets the longhands an element owns", () => {
  for (const [element, prop] of [
    ["kpi", "gap"],
    ["row", "gap"],
    ["kpi", "flex-flow"],
    ["card", "padding-inline"],
    ["callout", "border-inline-start"],
    ["card", "border-block-end-color"],
    ["card", "border-start-end-radius"],
  ])
    expect({ element, prop, owned: setsOwned(element!, prop!) }).toEqual({
      element,
      prop,
      owned: true,
    });
  expect(setsOwned("kpi", "margin-inline")).toBe(false);
});

test("source: a PascalCase component, a camelCase class and a nested rule are read like kebab case", () => {
  const files: Record<string, string> = {
    "src/components/ProjectCard.astro": `<div/>`,
    "src/components/StatusPill.tsx": `<span/>`,
    "src/components/Notebook.astro": `<div/>`,
    "src/a.scss": `.card { border-radius: 8px; &:hover { color: red } } .projectCard { padding: 0 }`,
  };
  expect(sourceFindings(Object.keys(files), (p) => files[p]!, {})).toEqual([
    'src/components/ProjectCard.astro: a component named like a shared element; render the hw-* element or list "project-card" as an exception',
    'src/components/StatusPill.tsx: a component named like a shared element; render the hw-* element or list "status-pill" as an exception',
    'src/a.scss: .card styles an element named like a shared one; use the hw-* element or list "card" as an exception',
    'src/a.scss: .projectCard styles an element named like a shared one; use the hw-* element or list "projectCard" as an exception',
  ]);
});
