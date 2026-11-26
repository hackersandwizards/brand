import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import catalogs from "../expert/catalogs.json";

// A tile's links naming the sample's source: into brand's published portal, or to the element's
// entry on any host (a portal served locally).
const BRAND = catalogs.find((c) => c.name === "Brand");
if (BRAND === undefined) throw new Error("Catalog entry missing: Brand");
if (BRAND.anchors === undefined) throw new Error("Catalog anchors missing: Brand");
const SOURCE = `[href^="${BRAND.portal}"], [href$="${BRAND.anchors.element.replace("<element>", "focus-ring")}"]`;

const DIR = join(import.meta.dir, "../elements");
/** Each element by name: the selector that finds it on a page. */
export const ELEMENTS: Record<string, string> = {
  label: ".hw-label",
  "label-box": ".hw-label-box",
  pill: ".hw-pill",
  card: ".hw-card",
  callout: ".hw-callout",
  quote: ".hw-quote",
  table: ".hw-table",
  link: ".hw-link, .hw-links a",
  "focus-ring": `[data-hw-tile="focus-ring"] :is(a[href], button, [tabindex]):not(${SOURCE})`,
  "icon-button": ".hw-icon-button",
  strip: ".hw-strip",
  rule: ".hw-rule",
  code: ".hw-code",
  "inline-code": ".hw-inline-code",
  kbd: ".hw-kbd",
  button: ".hw-button",
  "arrow-link": ".hw-arrow-link",
  field: ".hw-field",
  check: ".hw-check, .hw-check-target",
  "form-field": ".hw-form-field",
  switch: ".hw-switch",
  range: ".hw-range",
  "error-summary": ".hw-error-summary",
  facts: ".hw-facts",
  "dot-list": ".hw-dot-list",
  segmented: ".hw-segmented",
  row: ".hw-row",
  breadcrumb: ".hw-breadcrumb",
  disclosure: ".hw-disclosure",
  nav: ".hw-nav",
  choice: ".hw-choice",
  search: ".hw-search",
  status: ".hw-status",
  frame: ".hw-frame",
  kpi: ".hw-kpi",
  prose: ".hw-prose",
  dialog: '.hw-dialog:not([data-variant="drawer"], [data-variant="command"])',
  drawer: '.hw-dialog[data-variant="drawer"]',
  menu: ".hw-menu",
  popover: ".hw-popover",
  tooltip: ".hw-tooltip",
  command: '.hw-dialog[data-variant="command"]',
  toast: ".hw-toast",
  tabs: ".hw-tabs",
  progress: ".hw-progress",
  spinner: ".hw-spinner",
  skeleton: ".hw-skeleton",
  empty: ".hw-empty",
  accordion: ".hw-accordion",
  avatar: ".hw-avatar",
  pagination: ".hw-pagination",
  stepper: ".hw-stepper",
  tree: ".hw-tree",
  carousel: ".hw-carousel",
};
/** The elements a file of another name holds. */
const FILE_OF: Record<string, string> = { "focus-ring": "focus", drawer: "dialog" };

/** The element files' rules, every @import dropped: the reference's only styles. */
export const elementCss = () =>
  readdirSync(DIR)
    .filter((f) => f.endsWith(".css") && f !== "elements.css")
    .map((f) => readFileSync(join(DIR, f), "utf8").replace(/@import[^;]+;/g, ""))
    .join("\n");
/** The settings a surface may set: every --hw-* an element file reads. */
export const ELEMENT_CSS = elementCss();
export const SETTINGS = [...new Set(ELEMENT_CSS.match(/(?<=var\()--hw-[\w-]+/g))];
/** The brand tokens each element reads: a surface that never defines one (Tailwind emits only the
 * @theme tokens a scanned file names) leaves page and reference equally wrong, so each is checked.
 * `day` leaves out the tokens only the element's night rules read. */
const tokensOf = (day: boolean) =>
  Object.fromEntries(
    Object.keys(ELEMENTS).map((name) => {
      const file = join(DIR, `${FILE_OF[name] ?? name}.css`);
      let css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      if (day) css = withoutNight(css);
      return [name, [...new Set(css.match(/(?<=var\()--(?!hw-|_)[\w-]+(?=\))/g))]];
    }),
  );
/** The CSS with every night block (@scope ([data-theme="dark"]) ...) cut out. */
export const withoutNight = (css: string) => {
  let out = css;
  for (let i = out.search(/@scope \(\[data-theme="dark"\]\)/); i >= 0;) {
    let j = out.indexOf("{", i) + 1;
    for (let depth = 1; depth; j++) depth += out[j] === "{" ? 1 : out[j] === "}" ? -1 : 0;
    out = out.slice(0, i) + out.slice(j);
    i = out.search(/@scope \(\[data-theme="dark"\]\)/);
  }
  return out;
};
export const TOKENS = tokensOf(false);
export const DAY_TOKENS = tokensOf(true);
