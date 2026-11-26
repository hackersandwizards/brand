import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CatalogGroup } from "@hackersandwizards/scaffolding/catalog/render.ts";
import pkg from "../../package.json";
import { ROOT } from "../../scripts/git";
import { DEMOS, SECTIONS } from "../element-demos";
import type { PortalAssets } from "./assets";
import { code, esc } from "./markup";
import type { PortalSearchEntry, SearchableSection } from "./search";

// The shared elements: each file's own words (the first sentence of its comment and its settings), then its
// sample live in a matrix of the four scales by light and night. Every cell loads the same file;
// only the data-hw-scale on the cell changes.
const ELEMENT_ORDER = SECTIONS.flatMap(([section, els]) =>
  els.map(([name, title, file]) => ({ section, name, title, file })),
);
const sectionId = (section: string) => `el-${section.toLowerCase().replace(/ /g, "-")}`;
const SCALES: [string, string][] = [
  ["screen", "website, verifier: px"],
  ["dense", "os, trainer hub, talks"],
  ["print", "documents: pt"],
  ["stage", "slides: the 1440 stage, at half size"],
];
const elementDoc = (file: string) => {
  const head = readFileSync(join(ROOT, "elements", `${file}.css`), "utf8").match(
    /^\/\*([\s\S]*?)\*\//,
  )?.[1];
  if (head === undefined) throw new Error(`Opening comment missing: elements/${file}.css`);
  const [rule, settings = ""] = head.split(/\n\s*Settings[^\n]*\n/);
  const words = rule.replace(/\s+/g, " ").trim();
  return {
    words: words.match(/^.*?\.(?=\s|$)/)?.[0] ?? words,
    names: [...settings.matchAll(/(--hw-[\w-]+)/g)].map(([, setting]) => setting),
  };
};
// A sample's ids, every attribute naming one of them and its radio groups' names, suffixed so they
// stay unique across the cells.
const uniqueIds = (html: string, suffix: string) => {
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const own = (attr: string, token: string) => attr === "id" || attr === "name" || ids.has(token);
  return html.replace(/ ([\w-]+)="([^"]*)"/g, (all, attr: string, value: string) =>
    attr !== "class" && value.split(" ").some((token) => own(attr, token))
      ? ` ${attr}="${value.replace(/\S+/g, (token) => (own(attr, token) ? `${token}-${suffix}` : token))}"`
      : all,
  );
};
const CLASS: Record<string, string> = { "focus-ring": ".hw-focus-ring", link: ".hw-link" };
// Search words for what an element holds beyond its name.
const KEYWORDS: Record<string, string> = {
  field:
    "select dropdown hw-select textarea form-input readonly read-only file upload date combobox datalist autocomplete size small large password toggle",
  "form-field":
    "label hint error message optional fieldset legend validation warning success character count floating label",
  switch: "toggle on off setting",
  range: "slider",
  "error-summary": "validation errors form submit",
  dialog: "modal confirm alertdialog",
  drawer: "sheet offcanvas side panel",
  menu: "dropdown context right click actions",
  command: "cmd k search palette spotlight",
  tooltip: "hint title hover",
  popover: "click reveal glossary",
  toast: "notification snackbar",
  tabs: "tablist panels",
  progress: "loading bar",
  spinner: "loading",
  skeleton: "placeholder loading",
  empty: "blank state nothing yet",
  disclosure: "details summary chevron collapse expand fold",
  accordion: "faq collapse details",
  avatar: "person initials portrait",
  pagination: "pages prev next sequence",
  stepper: "steps wizard progress indicator",
  tree: "hierarchy folders treeitem",
  carousel: "slider swipe scroller",
};
// Renders a shared element at all four scales and indexes its title, CSS file and keywords.
const elementHtml = ({
  name,
  title,
  file,
}: {
  name: (typeof SECTIONS)[number][1][number][0];
  title: string;
  file: string;
}) => {
  const { words, names } = elementDoc(file);
  const entry: PortalSearchEntry = {
    t: title.toLowerCase(),
    k: "element",
    h: `elements/hw-${name}`,
    x: `hw-${name} ${file}.css${KEYWORDS[name] ? ` ${KEYWORDS[name]}` : ""}`,
  };
  const cell = (scale: string, night: boolean) =>
    `<div class="el-cell" data-hw-scale="${scale}" ${night ? 'data-theme="dark" data-hw-night' : 'data-theme="light"'}><div class="el-inner">${uniqueIds(DEMOS[name], `${scale}${night ? "-night" : ""}`)}</div></div>`;
  const html = `<h4 id="hw-${name}">${title} <code>${CLASS[name] ?? `.hw-${name}`}</code></h4>
<p class="meta">${code(`elements/${file}.css`)} · brand v${pkg.version}</p>
<p>${esc(words)}</p>
<div class="el-matrix"><span class="el-row label">Light</span><span class="el-row label">Night</span>${SCALES.map(([scale, note]) => `<span class="el-head"><strong>${scale}</strong><br><span class="meta">${note}</span></span>${cell(scale, false)}${cell(scale, true)}`).join("")}</div>
<p class="meta">Settings: ${names.map(code).join(" · ")}</p>`;
  return { html, entry };
};
// The element samples' scripts, unminified so their exports `enhance` and `enhanceForms` keep those
// names, as catalog/ElementScript.astro wires the stories.
const bundled = (f: string) => {
  const r = spawnSync(process.execPath, ["build", join(ROOT, f), "--format=esm"], {
    encoding: "utf8",
  });
  if (r.status !== 0) throw new Error(`portal: bun build ${f}: ${r.stderr}`);
  return r.stdout.replace(/<\/script/g, "<\\/script");
};
const BEHAVIOUR = bundled("elements/behaviour.ts");
const FORMS = bundled("elements/form.ts");
const EXPERT_COMPONENTS = readdirSync(join(ROOT, "expert/components"))
  .sort()
  .flatMap((f) => f.match(/^(\w+)\.astro$/)?.[1] ?? []);
const sharedIntro = `<p>Every element two or more systems show lives here once: one CSS file, shown live in light and night at each of the four scales. A system sets the scale, never a colour or a shape, and shows its exceptions in full on its own design-system page, beside a tile per hub element it uses. ${code('@import "@hackersandwizards/brand/elements.css";')} takes them all, ${code("elements/<name>.css")} with ${code("elements/scales.css")} one each; the scale is ${code('data-hw-scale="screen | dense | print | stage"')} on any container. ${code("brand-elements")} measures each element on the system's own page against this rule, in that system's gate.</p>
<p>The list marker is ${code("tokens/marker.css")}. Staying with each system, since they only look alike: total band, section band, stage and status markers, chart bars, slide table, header bars, ghost button. The slide engine's number tile, a step's number on a square, is a slide part.</p>`;
export const elementScripts = `<script type="module">
${BEHAVIOUR}
enhance();
</script>
<script type="module">
${FORMS}
enhanceForms();
</script>`;

// Builds the shared-element matrix and the lazy previews that lead to it.
export function renderElements(assets: PortalAssets): SearchableSection & { group: CatalogGroup } {
  const sections = SECTIONS.map(([section, els]) => ({
    section,
    cards: els.map(([name, title, file]) => elementHtml({ name, title, file })),
  }));
  const elementsHtml = `${sharedIntro}
${sections.map(({ section, cards }) => `<h3 id="${sectionId(section)}">${section}</h3>\n${cards.map(({ html }) => html).join("\n")}`).join("\n")}
<h3 id="expert-group">Expert: the apps</h3>
<p>The pieces os and the trainer hub both render, dense, in two themes: the expert components (${EXPERT_COMPONENTS.map(code).join(", ")}), each with its stories in <a href="catalog/">the catalog</a>. Their field is ${code("form-input")}, which takes the field's states and the form field's parts above.</p>`;
  const group: CatalogGroup = {
    name: "Elements",
    items: [
      ...ELEMENT_ORDER.map(({ section, name, title, file }) => ({
        name: title,
        href: `#elements/hw-${name}`,
        note: `${CLASS[name] ?? `.hw-${name}`} · elements/${file}.css`,
        pill: section,
        html: assets.sampleFrame(DEMOS[name]),
      })),
    ],
  };
  return {
    group,
    html: elementsHtml,
    index: sections.flatMap(({ cards }) => cards.map(({ entry }) => entry)),
  };
}
