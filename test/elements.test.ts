import { afterAll, assert, expect, test } from "vitest";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { definedClasses, isBrandClass, unstyledBrandClasses } from "../scan/element-classes";
import { exceptionFindings } from "../scan/element-exceptions";
import type { Config } from "../scan/elements-config";
import { elementStyleRules, setsOwned } from "../scan/element-properties";
import { ELEMENTS, SETTINGS } from "../scan/element-rules";
import { rules, utility as utilityProperties } from "../scan/element-stylesheet";
import { sourceFindings } from "../scan/element-source";
import { diffElementStyles, type StyleSnapshot } from "../scan/element-values";

import { tokens } from "../generated/tokens";
import { packed, ROOT } from "../scripts/git";
import { DRIFT } from "./element-drift";

test("every element has its drift", () => {
  expect(Object.keys(DRIFT).sort()).toEqual(Object.keys(ELEMENTS).sort());
});

test("exceptions: one without a reason, one a page carries but the list does not declare", () => {
  const config: Config = {
    pages: [],
    exceptions: { "total-band": "", "slide-table": "framed for the room" },
  };
  expect(
    exceptionFindings(config, [{ exceptions: ["total-band", "own-chart"] }, { exceptions: [] }]),
  ).toEqual([
    'brand-elements.json: exception "total-band" names no reason',
    'own-chart: a [data-hw-exception="own-chart"] on a page, but brand-elements.json declares no such exception',
  ]);
});

test("source: a rule styling an element-named class is red unless hw-* or an exception", () => {
  const files: Record<string, string> = {
    "src/a.css": `.card:hover { border-color: teal } .card::before { background: purple } :is(.linked-card, a.tag):is(:hover, :has(:is(a, summary):focus-visible)) { border-color: teal } .card:has(:is(a, button):focus-visible) { outline: 2px solid } .side-card:not(.x) { border-color: red } .doc-tag { border-radius: 9999px } .card .meta { color: red } .card { display: grid } .note { font-size: 9pt; color: grey } .total-note { font: 9pt sans-serif }
@media print { .callout { background: white } } .hw-card { border: 0 } .total-band { background: teal }
.eyebrow, .title { font-size: 9pt } .text-button { min-height: 2rem } .event-facts { margin-top: 0 } .button-row { gap: 1rem } .icon-button { width: 2rem }`,
    "src/components/Breadcrumbs.astro": `<nav/>`,
    "src/components/TrainingFacts.astro": `<dl class="hw-facts"/>`,
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
    'src/a.css: .text-button styles an element named like a shared one; use the hw-* element or list "text-button" as an exception',
    'src/a.css: .event-facts styles an element named like a shared one; use the hw-* element or list "event-facts" as an exception',
    'src/a.css: .icon-button styles an element named like a shared one; use the hw-* element or list "icon-button" as an exception',
    'src/components/Breadcrumbs.astro: a component named like a shared element; render the hw-* element or list "breadcrumbs" as an exception',
    'src/components/Card.astro: a component named like a shared element; render the hw-* element or list "card" as an exception',
    'src/components/Chip.astro: a component named like a shared element; render the hw-* element or list "chip" as an exception',
  ]);
});

test("the strip and the expert header strip draw the strip gradient, teal to purple", () => {
  expect(tokens["--gradient-strip"]).toBe(
    "linear-gradient(to right, var(--color-teal), var(--color-purple))",
  );
  for (const f of ["elements/strip.css", "expert/header.css"])
    expect(readFileSync(join(ROOT, f), "utf8")).toContain("background: var(--gradient-strip);");
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
    "--hw-marker-gap",
    "--hw-marker-mid",
    "--hw-row-fill",
    "--hw-prose-width",
    "--hw-field-family",
    "--hw-button-corner",
    "--hw-range-fill",
    "--hw-field-pad-start",
    "--hw-toast-offset",
    "--hw-avatar-hue",
    "--hw-zoom",
    "--hw-touch-floor",
    "--hw-field-floor",
    "--hw-control-height",
    "--hw-list-filter-row",
    "--hw-focus-room",
    "--hw-table-ground",
    "--hw-table-held",
    "--hw-on-fill",
    "--hw-carousel-item",
    "--hw-carousel-columns",
  ]);
  // The night roles expert.css and night.css set, never a scale.
  const night = SETTINGS.filter((s) => s.startsWith("--hw-night-"));
  const declarations = Array.from(screen.matchAll(/(--hw-[\w-]+):/g), ([, name]) => name);
  const provided = new Set([...optional, ...night, ...declarations]);
  expect([...new Set(SETTINGS).difference(provided)]).toEqual([]);
});

test("rules opens nested at-rules and continues with the next top-level rule", () => {
  expect(rules("@layer x { @media print { .a, .b { color: red; border: 0 } } } .c{x:1}")).toEqual([
    { selectors: [".a", ".b"], props: ["color", "border"] },
    { selectors: [".c"], props: ["x"] },
  ]);
});

test("rules substitutes the parent for both ampersands in a sibling selector", () => {
  expect(rules(".card { & + & { x: 1 } }")).toEqual([
    { selectors: [".card + .card"], props: ["x"] },
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

test("source: a compound forks an element in any class order; an --hw-* setting is no hw-* class", () => {
  const files: Record<string, string> = {
    "src/a.css": `.project-card.is-open { border-radius: 4px } .is-open.project-card { border-radius: 4px } .note.hw-card { border-radius: 4px } .hw-card.note { border-radius: 4px }`,
    "src/components/TeamCard.astro": `<div class="team-card" style="gap:var(--hw-card-pad)"/>`,
    "src/components/NoteCard.astro": `<div class="hw-card"/>`,
  };
  expect(sourceFindings(Object.keys(files), (p) => files[p]!, {})).toEqual([
    'src/a.css: .project-card.is-open styles an element named like a shared one; use the hw-* element or list "project-card" as an exception',
    'src/a.css: .is-open.project-card styles an element named like a shared one; use the hw-* element or list "project-card" as an exception',
    'src/components/TeamCard.astro: a component named like a shared element; render the hw-* element or list "team-card" as an exception',
  ]);
});

test("source: a component named like an element renders that element's class; an .html style block is read", () => {
  const files: Record<string, string> = {
    "src/components/ProjectCard.astro": `<div class="p-4 rounded-lg"><span class="hw-pill">Neu</span></div>`,
    "src/components/TeamCard.astro": `<div class="hw-card"><span class="hw-pill">Neu</span></div>`,
    "src/pages/index.html": `<style>.card { border-radius: 12px; background: #fff }</style>`,
    "src/content/doc.html": `<style data-hw-document>.card { border-radius: 12px }</style>`,
  };
  expect(sourceFindings(Object.keys(files), (p) => files[p]!, {})).toEqual([
    'src/components/ProjectCard.astro: a component named like a shared element; render the hw-* element or list "project-card" as an exception',
    'src/pages/index.html: .card styles an element named like a shared one; use the hw-* element or list "card" as an exception',
  ]);
});

test("source: a button component may render the icon button, a fact component one facts row", () => {
  const files: Record<string, string> = {
    "src/components/CopyButton.astro": `<button class="hw-icon-button" aria-label="Copy"></button>`,
    "src/components/SaveButton.astro": `<button class="save"></button>`,
    "src/components/Fact.astro": `<div><dt class="hw-label" data-tone="muted">DE</dt><dd><slot /></dd></div>`,
    "src/components/FactBox.astro": `<div class="box"><slot /></div>`,
    "src/components/Facts.astro": `<dl class="my-facts"><dt>Ort</dt><dd>Hamburg</dd></dl>`,
    "src/components/FactList.astro": `<dl class="my-facts"><dt>Ort</dt><dd>Hamburg</dd></dl>`,
  };
  expect(sourceFindings(Object.keys(files), (p) => files[p]!, {})).toEqual([
    'src/components/SaveButton.astro: a component named like a shared element; render the hw-* element or list "save-button" as an exception',
    'src/components/FactBox.astro: a component named like a shared element; render the hw-* element or list "fact-box" as an exception',
    'src/components/Facts.astro: a component named like a shared element; render the hw-* element or list "facts" as an exception',
    'src/components/FactList.astro: a component named like a shared element; render the hw-* element or list "fact-list" as an exception',
  ]);
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

// The prose block repeats these elements' rules outside any layer, each declaration as the element
// file has it (the link's day rule adds Typography's weight undone). The first rule for a selector
// is day's, the last night's.
const proseRules = [
  {
    prose: ".hw-prose :not(pre) > code",
    original: { file: "inline-code.css", selector: ".hw-inline-code" },
    dayExtra: "",
  },
  {
    prose: ".hw-prose a:not(.not-prose, .not-prose *)",
    original: { file: "link.css", selector: ":is(.hw-link, .hw-links a)" },
    dayExtra: " font-weight: inherit;",
  },
  {
    prose: ".hw-prose a:not(.not-prose, .not-prose *):is(:hover, [data-hw-hover])",
    original: {
      file: "link.css",
      selector: ":is(.hw-link, .hw-links a):is(:hover, [data-hw-hover])",
    },
    dayExtra: "",
  },
];

test.each(
  proseRules.flatMap(({ prose, original, dayExtra }) => [
    { prose, original, theme: "day", occurrence: 0, extra: dayExtra },
    { prose, original, theme: "night", occurrence: -1, extra: "" },
  ]),
)(
  "the prose block's $prose repeats $original.file by $theme",
  ({ prose, original, occurrence, extra }) => {
    const block = ({ file, selector }: { file: string; selector: string }) =>
      readFileSync(join(import.meta.dir, "../elements", file), "utf8")
        .split(`${selector} {`)
        .slice(1)
        .at(occurrence)
        ?.split("}")[0];
    const actual = block({ file: "prose.css", selector: prose });
    const expected = block(original);
    assert(actual !== undefined, `prose.css should define ${prose}`);
    assert(expected !== undefined, `${original.file} should define ${original.selector}`);
    const normalise = (declarations: string) => declarations.replace(/\s+/g, " ").trim();
    expect(normalise(actual)).toBe(normalise(expected) + extra);
  },
);

const dir = mkdtempSync(join(tmpdir(), "brand-elements-"));
const file = (name: string, html: string) => {
  writeFileSync(join(dir, name), html);
  return join(dir, name);
};
afterAll(() => rmSync(dir, { recursive: true, force: true }));

test("brand-elements exits 2 on a brand-elements.json naming no page", () => {
  file("brand-elements.json", '{"pages":[]}');
  const r = Bun.spawnSync(["bun", join(import.meta.dir, "../scan/elements.ts")], { cwd: dir });
  expect(r.exitCode).toBe(2);
});

test("brand-elements exits 2 on a site path with no site or --base to serve it", () => {
  file("brand-elements.json", '{"pages":["/catalog/"]}');
  const r = Bun.spawnSync(["bun", join(import.meta.dir, "../scan/elements.ts")], { cwd: dir });
  expect([r.exitCode, r.stderr.toString().trim()]).toEqual([
    2,
    "brand-elements: /catalog/: a site path, but no site or --base to serve it",
  ]);
});

test.each(["elements", "markers"])("brand-%s exits 2 on a malformed csp", (scan) => {
  const repo = mkdtempSync(join(tmpdir(), "csp-malformed-"));
  writeFileSync(join(repo, "brand-elements.json"), JSON.stringify({ pages: ["a.html"], csp: {} }));
  Bun.spawnSync(["git", "init", "-q"], { cwd: repo });
  const r = Bun.spawnSync(["bun", join(import.meta.dir, `../scan/${scan}.ts`), "a.html"], {
    cwd: repo,
  });
  rmSync(repo, { recursive: true });
  expect(r.exitCode).toBe(2);
  expect(r.stderr.toString()).toContain(`brand-${scan}: brand-elements.json "csp"`);
});

test.each([
  { field: "site", value: false },
  { field: "site", value: "" },
  { field: "site", value: { dir: "dist", at: false } },
  { field: "catalog", value: false },
  { field: "catalog", value: "" },
  { field: "catalog", value: { dir: "" } },
])("both scanners reject an invalid $field setting ($value)", ({ field, value }) => {
  file("brand-elements.json", JSON.stringify({ [field]: value }));
  for (const scan of ["elements", "markers"]) {
    const run = Bun.spawnSync(["bun", join(import.meta.dir, `../scan/${scan}.ts`)], { cwd: dir });
    expect(run.exitCode).toBe(2);
    expect(run.stderr.toString()).toContain(`"${field}":`);
  }
});

test("brand-elements exits 2 when lightOnly is a string", () => {
  file("brand-elements.json", '{"lightOnly":"true"}');
  const run = Bun.spawnSync(["bun", join(import.meta.dir, "../scan/elements.ts")], { cwd: dir });
  expect(run.exitCode).toBe(2);
  expect(run.stderr.toString()).toContain('"lightOnly": expected a boolean');
});

test("a rule setting only private custom properties defines its class; an unclosed :not( ends", () => {
  expect(definedClasses(".hw-x { --_hw-tray: 1rem; --space-2: 0 }")).toEqual(["hw-x"]);
  expect(definedClasses(".a:not(.b { color: red }")).toEqual(["a"]);
});

test("only undefined brand classes are reported, in first-use order with their labels", () => {
  const used = new Map([
    ["hw-card", 'article "Agenda"'],
    ["flex", 'section "Agenda"'],
    ["btn-secondary", 'button "Pick"'],
    ["hw-buton", 'button "Save"'],
  ]);
  expect(unstyledBrandClasses(used, new Set(["hw-card"]))).toEqual([
    { cls: "btn-secondary", label: 'button "Pick"' },
    { cls: "hw-buton", label: 'button "Save"' },
  ]);
});

test("every class brand's stylesheets define is listed as one brand defines", () => {
  const defined = packed()
    .filter((f) => f.endsWith(".css"))
    .flatMap((f) => definedClasses(readFileSync(join(ROOT, f), "utf8")));
  // Names another tool emits, which brand's rules only read: Typography's opt-out, a Markdown
  // renderer's task item, Tailwind's text-foreground/<n> utilities.
  const external = new Set([
    "not-prose",
    "task-list-item",
    ...defined.filter((c) => c.startsWith("text-foreground/")),
  ]);
  const brand = new Set(defined.filter(isBrandClass));
  expect([...new Set(defined).difference(brand.union(external))]).toEqual([]);
});

// data-hw-focus draws an element's whole focused state, so every rule keyed on focus names it too.
test("every focus rule of the elements and the expert layer also matches data-hw-focus", () => {
  const files = [
    ...readdirSync(join(ROOT, "elements"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => `elements/${f}`),
    "expert/expert.css",
    "expert/header.css",
  ];
  const rules = files.flatMap((f) =>
    [
      ...readFileSync(join(ROOT, f), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .matchAll(/([^{};]+)\{/g),
    ].map((m) => `${f}: ${m[1]!.trim()}`),
  );
  const focus = new Set(rules.filter((s) => /:focus\b|:focus-(visible|within)\b/.test(s)));
  const explicit = new Set(rules.filter((s) => s.includes("[data-hw-focus]")));
  expect([...focus.difference(explicit)]).toEqual([]);
});

test.each([
  { utility: "text-[1.25rem]", props: ["font-size"] },
  { utility: "text-theme", props: ["font-size", "color"] },
  { utility: "text-pretty", props: [] },
  { utility: "border-spacing-2", props: [] },
  { utility: "bg-cover", props: [] },
  { utility: "print:p-2!", props: ["padding"] },
  { utility: "dark:@sm:pe-6", props: ["padding-inline-end"] },
  { utility: "size-6", props: ["width", "height"] },
  { utility: "h-6", props: ["height"] },
  { utility: "w-6", props: ["width"] },
])("@apply $utility contributes $props at rest", ({ utility, props }) => {
  expect(utilityProperties(utility)).toEqual(props);
});

test("style scopes leave declarations on either side of nested rules with their owner", () => {
  expect(
    rules(".panel { color: red; @media print { > .title { font-size: 1em; } } padding: 0; }"),
  ).toEqual([
    { selectors: [".panel > .title"], props: ["font-size"] },
    { selectors: [".panel"], props: ["color", "padding"] },
  ]);
});

test.each<{ rule: string; actual: StyleSnapshot; reference: StyleSnapshot; property: string }>([
  {
    rule: "a zero-width border",
    actual: { "border-top-style": "solid", "border-top-width": "0px" },
    reference: { "border-top-style": "none", "border-top-width": "0px" },
    property: "border-top-style",
  },
  {
    rule: "the same colour in two notations",
    actual: { "background-color": "rgba(255, 255, 255, 0.07)" },
    reference: { "background-color": "color(srgb 1 1 1 / 0.07)" },
    property: "background-color",
  },
  {
    rule: "a length within 0.02 CSS px",
    actual: { "padding-left": "16.01px" },
    reference: { "padding-left": "16px" },
    property: "padding-left",
  },
])("$rule reports no style difference", ({ actual, reference, property }) => {
  expect(diffElementStyles({ actual, reference }, [property], 0.02)).toEqual([]);
});

test("a different em length reports the original values without the :em qualifier", () => {
  const actual = { "text-underline-offset:em": "0.3em" };
  const reference = { "text-underline-offset:em": "0.2em" };
  expect(diffElementStyles({ actual, reference }, ["text-underline-offset:em"], 0.02)).toEqual([
    { prop: "text-underline-offset", got: "0.3em", want: "0.2em" },
  ]);
});

test("owned style properties keep multiword selectors and part declaration order", () => {
  expect(
    elementStyleRules({
      "link :scope > svg": ["width:em"],
      card: ["padding-left"],
      link: ["text-underline-offset:em"],
      "link span": ["font-weight"],
    }),
  ).toEqual({
    link: {
      own: ["text-underline-offset:em"],
      parts: [
        { selector: ":scope > svg", properties: ["width:em"] },
        { selector: "span", properties: ["font-weight"] },
      ],
    },
    card: { own: ["padding-left"], parts: [] },
  });
});
