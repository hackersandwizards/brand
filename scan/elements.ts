#!/usr/bin/env bun
// The element check a consumer runs in its own gate: the shared elements (elements/*.css) as its
// own design-system page renders them, against the brand's rule at the same scale, plus the source
// that could fork one. It reads the consumer's brand-elements.json:
//
//   { "pages": ["<url, html file or site path>", ...],
//     "exceptions": { "<name>": "<reason>"            every element the system keeps as its own,
//                     | { "reason": "...", "files": ["<path>", ...] }, ... },
//     "lightOnly": true,                              optional: the pages never turn to night
//     "csp": "<policy>"                               optional: the Content-Security-Policy the
//            | { "<glob>": "<policy>", ... },         host sends, added to every page opened, or
//                                                     by path (docs/checks.md)
//     "site": "<folder>"                              optional: a built site, served on a free
//             | { "dir": "<folder>", "at": "<path>" }, port at its root, or at "at", the base path
//                                                     it was built for (such as "/mail/"), which
//                                                     a page starting with / names
//     "catalog": "<folder>"                           optional: a built catalog, every story page
//                | { "dir": "<folder>", "at": "<page>",  under it measured too, named below "at"
//                    "exclude": ["<glob>", ...] } }      (default: the folder, or its path on
//                                                     "site"), but those an exclude glob matches,
//                                                     relative to its stories folder, such as
//                                                     "Slides/**" for a group another repo owns
//
// --base <url> names the server a page starting with / is on, such as one the consumer's gate
// started on a free port, instead of "site".
//
// 1. Rendered. Every closed <details> outside a header or nav is opened, as brand-markers does. Every
//    hub element on the pages (an hw-* class; for the focus ring, each focusable inside
//    [data-hw-tile="focus-ring"] but a link into brand's portal or to its entry there (catalogs.json),
//    focused; not one inside a [data-hw-exception], which is that
//    exception's instance, nor one inside [data-hw-shell], the scaffolding catalog shell's own
//    card and pill, nor one carrying or inside [hidden], which draws nothing) is compared with a
//    reference: the same markup in a shadow root beside it, styled only by this package's element
//    files and inheriting the page's tokens, theme and scale. An instance holding the page's focus
//    (a story's focused state) is read focused, and its reference too.
//    Any difference in a computed property the element sets (OWNS: its corner, fill, line, text
//    colour, type, padding or size) fails, by more than 0.02px for a length, a link's underline
//    offset, gap and icon size compared in em of its own font size. Each brand token an
//    element reads must be defined where it renders; with "lightOnly" the tokens only its night
//    rules read are left out, since a page without night never draws them. An element drawn with
//    the brand corner (top-left and bottom-right larger than top-right) inside another so drawn
//    fails too: the brand corner sits on the outermost block only (tokens.css). So does an element
//    carrying an hw-* class, or one of BRAND_CLASSES, that no rule of a loaded stylesheet names (but
//    inside :not()) draws unstyled; not one inside [data-hw-shell].
//    Each source the page's policy refuses fails ("csp" or its own), with the element it hit;
//    brand-markers too.
// 2. Source. A CSS rule in a .css, .scss, .astro, .vue or .svelte file whose subject class is named
//    like an element (card; chip, pill, tag, badge; eyebrow, kicker, label; callout, note; quote;
//    icon-button; button, btn; breadcrumb; fact) and sets a property that element owns (a shorthand counts for its
//    longhands, an @apply utility for the properties it sets) fails, and so
//    does a component file of such a name, unless it carries the hw-* class (a button's the icon
//    button's too, a fact's a dt, one row of the facts list), its name is an
//    exception, or its file is one an exception lists in "files" (a stylesheet of the system's own
//    medium, such as a slide deck's).
// 3. Exceptions. Each declared exception names its reason, and each [data-hw-exception] on a page
//    names a declared one.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import type { Browser } from "puppeteer-core";
import catalogs from "../expert/catalogs.json";
import { COMPONENT, ENGINE_STYLE, listTree, scanned, skippedReport } from "./colours";
import { answerHelp } from "./help";

const USAGE = `usage: brand-elements [--base <url>] [--json]
Measures the shared elements on the pages and catalog brand-elements.json names. Exits 1 on any
finding, and on a named page with no hub element (a zero proves nothing; a story page may show
none). Exits 2 on a config naming no page and on a catalog folder without a story page. Needs
Chrome for Testing (CHROME_BINARY overrides).`;
import {
  addCss,
  catalogPages,
  focusAll,
  type Catalog,
  type Csp,
  type Site,
  launch,
  listedCatalog,
  listedSite,
  open,
  openFolds,
  policies,
  pool,
  refusalLine,
  refusals,
  serve,
  tabs,
  toUrl,
} from "./markers";

export const LIST = "brand-elements.json";
export type Exception = string | { reason: string; files?: string[] };
export type Config = {
  pages: string[];
  exceptions?: Record<string, Exception>;
  lightOnly?: boolean;
  site?: Site;
  catalog?: Catalog;
  csp?: Csp;
};
const reasonOf = (e: Exception) => (typeof e === "string" ? e : e.reason);
// A tile's links naming the sample's source: into brand's published portal, or to the element's
// entry on any host (a portal served locally).
const BRAND = catalogs.find((c) => c.name === "Brand")!;
const SOURCE = `[href^="${BRAND.portal}"], [href$="${BRAND.anchors!.element.replace("<element>", "focus-ring")}"]`;
export const TOLERANCE = 0.02; // CSS px

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
/** Every class other than an hw-* one that brand's stylesheets define or once defined: a page
 * using one, or an hw-* class, that no loaded stylesheet defines shows it unstyled. */
export const BRAND_CLASSES = [
  "btn-primary",
  "btn-secondary",
  "chip-link",
  "chip-link-muted",
  "chip-remove",
  "filter-chip",
  "form-input",
  "page-subtitle",
  "page-title",
  "page-title-action",
  "page-title-lead",
  "page-title-row",
  "rounded-brand",
  "theme-switching",
];
export const isBrandClass = (c: string) => c.startsWith("hw-") || BRAND_CLASSES.includes(c);

/** The classes a stylesheet's rules name, anywhere in a selector but inside :not(). */
export const definedClasses = (css: string) =>
  rules(css).flatMap((r) =>
    r.selectors.flatMap((sel) => {
      let s = sel;
      for (let i = s.indexOf(":not("); i >= 0; i = s.indexOf(":not(")) {
        let j = i + 5;
        for (let depth = 1; depth && j < s.length; j++)
          depth += s[j] === "(" ? 1 : s[j] === ")" ? -1 : 0;
        s = s.slice(0, i) + s.slice(j);
      }
      return [...s.matchAll(/\.((?:\\.|[\w-])+)/g)].map((m) => m[1]!.replace(/\\(.)/g, "$1"));
    }),
  );
// What each element (and each part, "<element> <part>") sets, and so what is compared: a property
// the element leaves to its surroundings, such as a card's text size, stays the surface's.
const CORNER = [
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
];
const FILL = ["background-color", "background-image"];
const SIDES = ["top", "right", "bottom", "left"];
const borders = (sides = SIDES) =>
  sides.flatMap((x) => [`border-${x}-width`, `border-${x}-style`, `border-${x}-color`]);
const PAD = SIDES.map((x) => `padding-${x}`);
const TYPE = [
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
];
const INLINE_CODE = [
  ...CORNER,
  ...FILL,
  ...PAD,
  "font-family",
  "font-size",
  "font-weight",
  "font-variant-ligatures",
];
// A length marked ":em" compares in em of the element's own font size, which the element leaves to
// its surface.
const LINK = [
  "align-items",
  "column-gap:em",
  "color",
  "text-decoration-line",
  "text-decoration-thickness",
  "text-underline-offset:em",
];
const CHECK = ["width", "height", "scale", "mask-image", ...CORNER, ...FILL, ...borders()];
const OWNS: Record<string, string[]> = {
  label: [...TYPE, "color"],
  "label-box": [...CORNER, ...FILL, ...borders(), ...PAD],
  pill: [...CORNER, ...FILL, ...borders(), ...PAD, ...TYPE, "color"],
  "pill .hw-pill-chevron": ["width", "height", "color"],
  "pill .hw-pill-remove": ["width", "height", "color"],
  card: [...CORNER, ...FILL, ...borders(), ...PAD],
  callout: [...CORNER, ...FILL, ...borders(["left"]), ...PAD, "font-weight"],
  quote: [...borders(["left"]), "padding-left", "color"],
  table: ["font-size", "line-height"],
  "table th": [...borders(["bottom"]), ...PAD, ...TYPE, "color", "text-align", "vertical-align"],
  "table td": [...borders(["bottom"]), ...PAD, "text-align", "vertical-align"],
  link: LINK,
  "link :scope > svg": ["width:em", "height:em", "align-self"],
  "focus-ring": ["outline-style", "outline-width", "outline-color", "outline-offset"],
  "icon-button": ["width", "height", ...CORNER, ...FILL, ...PAD, "color"],
  "icon-button svg": ["width", "height"],
  strip: ["height", ...FILL],
  rule: ["height", ...FILL],
  code: [...CORNER, ...FILL, ...PAD, ...TYPE, "color"],
  "inline-code": INLINE_CODE,
  kbd: [...CORNER, ...FILL, ...borders(), ...PAD, ...TYPE, "color"],
  button: [...CORNER, ...FILL, ...borders(), ...PAD, ...TYPE, "color", "min-height"],
  "arrow-link": ["color", "text-decoration-line", "padding-top", "padding-bottom"],
  "arrow-link .hw-arrow": ["white-space", "font-family"],
  field: [
    ...CORNER,
    ...FILL,
    ...borders(),
    "padding-left",
    "padding-right",
    "font-family",
    "font-size",
    "color",
    "min-height",
  ],
  check: CHECK,
  "form-field": ["display", "row-gap"],
  "form-field .hw-form-label": ["font-size", "font-weight", "line-height"],
  "form-field :scope > label:has(> .hw-check)": [
    "display",
    "column-gap",
    "font-size",
    "line-height",
    "padding-top",
    "padding-bottom",
  ],
  "form-field .hw-form-mark": ["font-weight", "color"],
  "form-field .hw-form-hint": ["font-size", "line-height", "color"],
  "form-field .hw-form-error": ["font-size", "font-weight", "line-height", "color", "padding-left"],
  "form-field .hw-form-warning": ["font-size", "font-weight", "color", "padding-left"],
  "form-field .hw-form-success": ["font-size", "font-weight", "color", "padding-left"],
  "form-field .hw-form-count": ["font-size", "font-weight", "color"],
  "form-field .hw-form-float > .hw-field": ["min-height", "padding-top", "padding-bottom"],
  switch: ["width", "height", ...CORNER, ...FILL, ...borders()],
  range: ["height", "font-size", ...FILL],
  "error-summary": [...CORNER, ...borders(), ...PAD, "font-size", "line-height"],
  "error-summary .hw-error-summary-title": ["font-weight"],
  "error-summary a": ["color", "font-weight", "text-decoration-line"],
  dialog: [...CORNER, ...borders(), ...PAD, ...FILL],
  drawer: [...CORNER, ...borders(), ...PAD, ...FILL],
  menu: [...CORNER, ...borders(), ...FILL, "font-size"],
  "menu .hw-menu-item": ["min-height", ...CORNER, "font-size"],
  popover: [...CORNER, ...borders(), ...PAD, ...FILL, "font-size"],
  tooltip: [...CORNER, ...PAD, ...FILL, "color", "font-size"],
  command: [...CORNER, ...borders(), ...FILL],
  "command .hw-command-option": ["min-height", ...CORNER],
  toast: [...CORNER, ...borders(), ...FILL, ...PAD, "font-size", "font-weight"],
  tabs: [...borders(["bottom"])],
  "tabs .hw-tab": ["min-height", "font-size", "font-weight", ...borders(["bottom"])],
  progress: ["height", ...CORNER],
  spinner: ["width", "height", ...CORNER, ...borders()],
  skeleton: [...CORNER],
  empty: [...CORNER, ...borders(), ...PAD],
  "empty .hw-empty-title": ["font-size", "font-weight"],
  accordion: [...borders(["top"]), "font-size"],
  "accordion summary": ["min-height", "font-weight"],
  avatar: ["width", "height", ...CORNER, "font-family", "font-weight"],
  pagination: ["font-size"],
  "pagination a": ["min-height", ...CORNER, "color"],
  stepper: ["font-size"],
  tree: ["font-size"],
  "tree .hw-tree-row": ["min-height", ...CORNER],
  carousel: ["display"],
  "carousel .hw-carousel-track": ["overflow-x", "scroll-snap-type"],
  "carousel .hw-carousel-tray": [...CORNER, ...FILL],
  facts: ["margin-top", "margin-bottom"],
  "dot-list": ["flex-wrap", "align-items", "margin-left"],
  "facts div": ["display", "row-gap", ...borders(["top"]), "padding-top", "padding-bottom"],
  "facts dd": ["margin-left"],
  segmented: [...CORNER, ...FILL, ...borders(), ...PAD, "font-size"],
  "segmented a": [...CORNER, ...FILL, ...PAD, "color"],
  "segmented button": [...CORNER, ...FILL, ...PAD, "color"],
  row: ["display", ...FILL, ...borders(["bottom"]), ...PAD, "column-gap"],
  "row .hw-row-stripe": ["align-self"],
  "row .hw-row-trail": ["font-size", "color", "white-space"],
  nav: ["font-size", "line-height"],
  "nav a": [...CORNER, ...FILL, ...PAD, "font-weight", "color", "text-decoration-line"],
  "nav summary": [...CORNER, ...FILL, ...PAD, "font-weight", "color"],
  "nav .hw-nav-count": ["color", "font-variant-numeric"],
  "nav .hw-nav-group": ["padding-left", "padding-right", "margin-bottom"],
  "nav :is(ul, ol) + .hw-nav-group": ["margin-top"],
  "nav :is(ul, ol) :is(ul, ol)": [...borders(["left"]), "padding-left", "margin-left"],
  choice: [
    ...CORNER,
    ...FILL,
    ...borders(),
    "padding-left",
    "padding-right",
    "font-size",
    "color",
    "min-height",
  ],
  "choice .hw-choice-count": ["opacity", "font-variant-numeric"],
  search: ["position"],
  breadcrumb: ["font-size", "color"],
  "breadcrumb a": ["color", "text-decoration-line"],
  disclosure: [],
  // The marker's removal and the count pill: the summary's layout, type and colour are the surface's.
  "disclosure summary": ["list-style-type"],
  "disclosure .hw-disclosure-count": [...CORNER, ...FILL, "font-family"],
  status: [...CORNER, ...FILL, ...borders(), ...PAD],
  frame: [...CORNER, ...FILL, ...borders()],
  kpi: ["display", "flex-direction", "row-gap"],
  "kpi .hw-kpi-value": [
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "letter-spacing",
    "font-variant-numeric",
  ],
  prose: ["overflow-wrap", "max-width"],
  "prose h1": ["font-size", "line-height"],
  "prose h2": [...borders(["top"]), "padding-top", "font-size", "line-height"],
  "prose h3": ["font-size", "font-weight", "line-height"],
  "prose :not(pre) > code": INLINE_CODE,
  // Typography's own link weight and list indent come in a later layer than the hub elements.
  "prose a:not(.not-prose, .not-prose *)": [...LINK, "font-weight"],
  "prose ul:not(.not-prose, .not-prose *)": ["padding-left"],
  "prose ol:not(.not-prose, .not-prose *)": ["padding-left"],
  "prose li.task-list-item input": CHECK,
};

/** The element files' rules, every @import dropped: the reference's only styles. */
export const elementCss = () =>
  readdirSync(DIR)
    .filter((f) => f.endsWith(".css") && f !== "elements.css")
    .map((f) => readFileSync(join(DIR, f), "utf8").replace(/@import[^;]+;/g, ""))
    .join("\n");
/** The settings a surface may set: every --hw-* an element file reads. */
const ELEMENT_CSS = elementCss();
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

export type Finding = {
  page: string;
  element: string;
  label: string;
  prop: string;
  got: string;
  want: string;
};

type Args = [
  string,
  Record<string, string>,
  Record<string, string[]>,
  string[],
  number,
  Record<string, string[]>,
];

/** Runs in the page: each hub element against its reference, as findings plus the exceptions found. */
function compare([css, elements, owns, settings, tolerance, tokens]: Args) {
  const findings: { element: string; label: string; prop: string; got: string; want: string }[] =
    [];
  const seen: string[] = [];
  const SKIP = "[data-hw-reference], [data-hw-exception], [data-hw-shell]";
  const missing = new Set<string>();
  const label = (el: Element) =>
    `${el.tagName.toLowerCase()}${el.classList[0] ? "." + el.classList[0] : ""} "${(el.textContent ?? "").trim().slice(0, 30)}"`;
  const num = (v: string) => (/^-?[\d.]+px$/.test(v) ? parseFloat(v) : null);
  // A length in em compares within the tolerance at 16 px.
  const em = (v: string) => (/^-?[\d.]+em$/.test(v) ? parseFloat(v) * 16 : null);
  // One colour, one text: a build that rewrites color-mix() (Lightning CSS) leaves rgba() where the
  // reference computes color(srgb ...), so each colour reads as rgba() of whole channels.
  const colour = (v: string) =>
    v.replace(/rgba?\(([^)]*)\)|color\(srgb ([^)]*)\)/g, (m, rgb?: string, srgb?: string) => {
      const n = (rgb ?? srgb)!
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map(parseFloat);
      if (n.length < 3 || n.some(Number.isNaN)) return m;
      const k = srgb ? 255 : 1;
      const [r, g, b] = n.slice(0, 3).map((c) => Math.round(c * k));
      return `rgba(${r}, ${g}, ${b}, ${Math.round((n[3] ?? 1) * 100) / 100})`;
    });
  const same = (got: string, want: string) => {
    const [x, y] = [num(got) ?? em(got), num(want) ?? em(want)];
    return x !== null && y !== null ? Math.abs(x - y) <= tolerance : colour(got) === colour(want);
  };
  const sideOf = (prop: string) => /^(border-[a-z]+)-(style|color)$/.exec(prop)?.[1];
  /** The computed values of `list` on `x`, with the width of each border side it names; a
   *  property marked ":em" in em of x's font size. */
  const snap = (x: Element, list: string[]) => {
    const g = getComputedStyle(x);
    const props = list.flatMap((p) => (sideOf(p) ? [p, `${sideOf(p)}-width`] : [p]));
    const read = (p: string) => {
      const v = g.getPropertyValue(p.replace(/:em$/, ""));
      const px = num(v);
      return p.endsWith(":em") && px !== null
        ? `${+(px / parseFloat(g.fontSize)).toFixed(4)}em`
        : v;
    };
    return Object.fromEntries(props.map((p) => [p, read(p)]));
  };
  type Snap = ReturnType<typeof snap>;
  const diff = (element: string, name: string, got: Snap, want: Snap, list: string[]) => {
    for (const prop of list) {
      // A border of no width draws nothing, so its style and colour are no difference (Tailwind's
      // preflight gives every element a solid zero-width border the reference has as none).
      const side = sideOf(prop);
      if (side && got[`${side}-width`] === "0px" && want[`${side}-width`] === "0px") continue;
      if (!same(got[prop]!, want[prop]!))
        findings.push({
          element,
          label: name,
          prop: prop.replace(/:em$/, ""),
          got: got[prop]!,
          want: want[prop]!,
        });
    }
  };
  // The element the page focused (a story's focused state): an instance holding it is read, and
  // its reference too, while the same node holds focus, since a computed style reads the live state.
  const active =
    document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : null;
  const visible = active?.matches(":focus-visible") ?? false;
  /** The node in `copy` at the place `node` holds in `root`. */
  const counterpart = (root: Element, copy: Element, node: Element) => {
    const path: number[] = [];
    for (let n = node; n !== root; n = n.parentElement!)
      path.unshift([...n.parentElement!.children].indexOf(n));
    return path.reduce<Element>((x, i) => x.children[i]!, copy) as HTMLElement;
  };
  // In passes, so the page restyles twice rather than once per instance: read every instance's
  // settings and tokens, insert every reference, then read every pair.
  const found = Object.entries(elements).flatMap(([element, selector]) =>
    [...document.querySelectorAll(selector)]
      // A hidden element draws nothing, so it is not measured (the corner rule below still reads it).
      .filter((el) => !el.closest(SKIP) && !el.closest("[hidden]"))
      .map((el) => {
        const own = getComputedStyle(el);
        for (const t of tokens[element] ?? [])
          if (!own.getPropertyValue(t).trim() && !missing.has(element + t)) {
            missing.add(element + t);
            findings.push({
              element,
              label: label(el),
              prop: t,
              got: "undefined",
              want: "a value",
            });
          }
        const set = settings.map((s) => [s, own.getPropertyValue(s).trim()] as const);
        return { element, el, set };
      }),
  );
  // The brand corner inside a brand corner, over every element of the page (a closed panel too),
  // before any reference.
  const branded = new Set(
    [...document.querySelectorAll("body *")].filter((el) => {
      const g = getComputedStyle(el);
      const [tl, tr, br, bl] = [
        g.borderTopLeftRadius,
        g.borderTopRightRadius,
        g.borderBottomRightRadius,
        g.borderBottomLeftRadius,
      ].map(parseFloat);
      return tl! > tr! && tl === br && tr === bl;
    }),
  );
  for (const el of branded) {
    if (el.closest(SKIP)) continue;
    for (let p = el.parentElement; p; p = p.parentElement)
      if (branded.has(p)) {
        findings.push({
          element: "corner",
          label: label(el),
          prop: "border-radius",
          got: `the brand corner inside ${label(p)}`,
          want: "the small corner",
        });
        break;
      }
  }
  // Every clone before any reference goes in, so none holds another instance's reference, and each
  // focus target found while the page's child order is still the clone's.
  const clones = found.map(({ el }) => el.cloneNode(true) as HTMLElement);
  // Each side's focus target: the focus ring's own element, else the page's focused node inside the
  // instance and its place in the reference.
  const targets = found.map(({ element, el }, i) =>
    element === "focus-ring"
      ? { got: el as HTMLElement, want: clones[i]!, visible: true }
      : active && el.contains(active)
        ? { got: active, want: counterpart(el, clones[i]!, active), visible }
        : null,
  );
  // A constructed sheet, which no page policy's style-src refuses, as it would a <style>.
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  const pairs = found.map(({ element, el, set }, i) => {
    seen.push(element);
    const clone = clones[i]!;
    clone.removeAttribute("id");
    clone.removeAttribute("style");
    for (const [s, v] of set) if (v) clone.style.setProperty(s, v);
    let inner: Element = clone;
    if (element === "link" && !el.classList.contains("hw-link")) {
      const wrap = document.createElement("div");
      wrap.className = "hw-links";
      wrap.append(clone);
      inner = wrap;
    }
    // A field or button in a field row, or a field under a floating label, takes its parent's
    // rules: the reference sits in a bare copy of that parent.
    const parent = el.parentElement;
    if (parent?.matches(".hw-field-row, .hw-form-float")) {
      const wrap = document.createElement("div");
      wrap.className = parent.matches(".hw-field-row") ? "hw-field-row" : "hw-form-float";
      if (parent.hasAttribute("data-joined")) wrap.setAttribute("data-joined", "");
      wrap.append(inner);
      inner = wrap;
    }
    // A label on a wash takes the wash's hue colours (label.css): the reference sits in a copy of
    // that box.
    const wash =
      element === "label" &&
      el.parentElement?.closest('.hw-status, .hw-callout, .hw-card[data-variant="tint"]');
    if (wash) {
      const wrap = wash.cloneNode(false) as HTMLElement;
      wrap.removeAttribute("id");
      wrap.removeAttribute("style");
      wrap.append(inner);
      inner = wrap;
    }
    if (element === "focus-ring") {
      const wrap = document.createElement("div");
      wrap.className = "hw-focus-ring";
      wrap.append(inner);
      inner = wrap;
    }
    const theme = el.closest("[data-theme]")?.getAttribute("data-theme");
    const frame = document.createElement("div");
    if (theme) frame.setAttribute("data-theme", theme);
    frame.append(inner);
    // A table part takes no shadow root and a row no span: the reference to a cell or a row then
    // follows the table. Anything inside a cell keeps its reference in the cell, under its type. A
    // box's reference follows its target label, which it would otherwise widen.
    const host = document.createElement("span");
    host.setAttribute("data-hw-reference", "");
    const outer =
      (el.matches("tr, td, th, thead, tbody, tfoot") && el.closest("table")) ||
      el.parentElement?.closest(".hw-check-target");
    (outer || el).after(host);
    const root = host.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [sheet];
    root.append(frame);
    return { element, el, clone, host, target: targets[i] };
  });
  try {
    for (const { element, el, clone, target } of pairs) {
      const list = owns[element]!;
      const parts = Object.entries(owns).flatMap(([key, props]) => {
        const [owner, ...rest] = key.split(" ");
        return owner === element && rest.length ? [[rest.join(" "), props] as const] : [];
      });
      // Each side read while its focus target holds focus; the page's own focus back after the pair.
      const read = (x: Element, focus?: HTMLElement) => {
        focus?.focus({ focusVisible: target!.visible });
        return {
          own: snap(x, list),
          parts: parts.map(([part, props]) => {
            const y = x.querySelector(part);
            return y && snap(y, props);
          }),
        };
      };
      const [a, b] = [read(el, target?.got), read(clone, target?.want)];
      if (target) {
        target.want.blur();
        active?.focus({ focusVisible: visible });
      }
      if (element === "focus-ring" && a.own["outline-style"] === "none")
        findings.push({
          element,
          label: label(el),
          prop: "outline-style",
          got: "none",
          want: b.own["outline-style"]!,
        });
      diff(element, label(el), a.own, b.own, list);
      parts.forEach(([part, props], i) => {
        const [x, y] = [a.parts[i], b.parts[i]];
        if (x && y) diff(element, `${label(el)} ${part}`, x, y, props);
      });
    }
  } finally {
    for (const { host } of pairs) host.remove();
  }
  const exceptions = [...document.querySelectorAll("[data-hw-exception]")].map((t) =>
    t.getAttribute("data-hw-exception")!,
  );
  return { findings, seen: [...new Set(seen)], exceptions };
}

export type PageResult = Awaited<ReturnType<typeof measurePage>>;

/** One page's comparison, with its exceptions, after `css` is added; `lightOnly` checks day tokens only,
 * and a page starting with / is a path on the served `site`. */
export async function measurePage(
  browser: Browser,
  url: string,
  css = "",
  lightOnly = false,
  site?: URL,
  csp?: Csp,
) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    // Every tab holds focus as the one in front does, so the focus ring reads in pages run side by side.
    const cdp = await focusAll(page);
    await open(page, toUrl(url, site), csp);
    if (css) await addCss(page, css);
    // Every sheet's text, another origin's and an imported one's too, which the page's own script
    // may not read: an element carrying a brand class no rule names draws unstyled.
    const sheets: string[] = [];
    cdp.on("CSS.styleSheetAdded", (e) => sheets.push(e.header.styleSheetId));
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const defined = new Set(
      (
        await Promise.all(
          sheets.map((id) =>
            cdp.send("CSS.getStyleSheetText", { styleSheetId: id }).then((r) => r.text),
          ),
        )
      ).flatMap(definedClasses),
    );
    // Each class with the element it first appears on. The catalog shell's markup is the shell's
    // (scaffolding's), as for the elements.
    const used = await page.evaluate(() => {
      const first = new Map<string, string>();
      for (const el of document.querySelectorAll("[class]"))
        if (!el.closest("[data-hw-shell]"))
          for (const c of el.classList)
            if (!first.has(c))
              first.set(
                c,
                `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 30)}"`,
              );
      return [...first];
    });
    const unstyled = used
      .filter(([cls]) => isBrandClass(cls) && !defined.has(cls))
      .map(([cls, label]) => ({ page: url, cls, label }));
    await page.evaluate(openFolds);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    // Before the references, which draw brand's own images.
    const refused = await refusals(page, url);
    const out = await page.evaluate(compare, [
      ELEMENT_CSS,
      ELEMENTS,
      OWNS,
      SETTINGS,
      TOLERANCE,
      lightOnly ? DAY_TOKENS : TOKENS,
    ] as Args);
    return {
      ...out,
      page: url,
      findings: out.findings.map((f) => ({ page: url, ...f })),
      unstyled,
      refused,
    };
  } finally {
    await page.close();
  }
}

const WORD: Record<string, string> = {
  card: "card",
  chip: "pill",
  pill: "pill",
  tag: "pill",
  badge: "pill",
  eyebrow: "label",
  kicker: "label",
  label: "label",
  callout: "callout",
  note: "callout",
  quote: "quote",
  "icon-button": "icon-button",
  button: "button",
  btn: "button",
  breadcrumb: "breadcrumb",
  fact: "facts",
};
// What a component named for an element renders to pass, where more than its hw-* class: a button
// may be the icon button.
const RENDERS: Record<string, string> = { button: "(?<![\\w-])hw-(icon-)?button(?![\\w-])" };
const NAMED = new RegExp(`(^|-)(${Object.keys(WORD).join("|")})s?($|-)`);
const NAMED_ALL = new RegExp(`(?<=^|-)(${Object.keys(WORD).join("|")})s?(?=$|-)`, "g");
/** A name in kebab case, so ProjectCard and projectCard read as project-card. */
export const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/** The element a class is named like. */
const namedAs = (cls: string) => WORD[NAMED.exec(kebab(cls))?.[2] ?? ""];
const LOGICAL: Record<string, string[]> = {
  block: ["top", "bottom"],
  inline: ["left", "right"],
  "block-start": ["top"],
  "block-end": ["bottom"],
  "inline-start": ["left"],
  "inline-end": ["right"],
};
/** The physical properties a gap, flex-flow or logical property stands for, else the property. */
const physical = (prop: string) => {
  if (prop === "gap") return ["row-gap", "column-gap"];
  if (prop === "flex-flow") return ["flex-direction", "flex-wrap"];
  if (/^border-(start|end)-(start|end)-radius$/.test(prop)) return ["border-radius"];
  const m = /^(padding|margin|border)-(block|inline)(-start|-end)?(-width|-style|-color)?$/.exec(
    prop,
  );
  return m ? LOGICAL[m[2]! + (m[3] ?? "")]!.map((side) => `${m[1]}-${side}${m[4] ?? ""}`) : [prop];
};
/** Whether a declared property, a shorthand or logical one included, sets one the element owns. */
export const setsOwned = (element: string, declared: string) =>
  physical(declared).some((prop) =>
    OWNS[element]!.map((q) => q.replace(/:em$/, "")).some(
      (q) =>
        q === prop ||
        q.startsWith(`${prop}-`) ||
        (prop === "border-radius" && q.endsWith("-radius")) ||
        (/^border-(width|style|color)$/.test(prop) && q.endsWith(prop.slice(6))),
    ),
  );
const STYLED = new Set([".css", ".scss", ".astro", ".vue", ".svelte", ".html"]);

/** The CSS of a source file: the file itself, or its style blocks, those the documents engine wrote
 *  left out (brand-colours' ENGINE_STYLE). */
const styles = (raw: string, ext: string) =>
  ext === ".css" || ext === ".scss"
    ? raw
    : [...raw.replace(ENGINE_STYLE, "").matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
        .map((m) => m[1])
        .join("\n");

/** The properties a Tailwind utility sets, as far as an element owns them: a state variant
 *  (hover:, focus:, ...) sets nothing at rest, a breakpoint, theme or print variant does. A text-*
 *  of a theme's own name may be a size or a colour, so it stands for both. */
const utility = (token: string): string[] => {
  // Variants split at a colon outside an arbitrary value's brackets.
  const parts = token.split(/:(?![^[]*\])/);
  const name = parts.pop()!.replace(/^!|!$/g, "");
  if (parts.some((v) => !/^(sm|md|lg|xl|2xl|dark|print|motion-safe|(min|max)-.+|@.+)$/.test(v)))
    return [];
  const sides: Record<string, string> = {
    x: "-inline",
    y: "-block",
    t: "-top",
    r: "-right",
    b: "-bottom",
    l: "-left",
    s: "-inline-start",
    e: "-inline-end",
  };
  const pad = /^p([xytrblse])?-/.exec(name);
  if (pad) return [`padding${pad[1] ? sides[pad[1]] : ""}`];
  if (/^rounded(-|$)/.test(name)) return ["border-radius"];
  if (/^border(-|$)/.test(name) && !/^border-(collapse|separate|spacing)/.test(name))
    return ["border"];
  if (
    /^bg-/.test(name) &&
    !/^bg-(clip|origin|repeat|no-repeat|fixed|local|scroll|blend|cover|contain|auto|center|top|bottom|left|right)/.test(
      name,
    )
  )
    return ["background"];
  if (/^text-(left|center|right|justify|start|end)$/.test(name)) return ["text-align"];
  if (/^text-(xs|sm|base|lg|\d?xl|\[[\d.]+(px|r?em)\])$/.test(name)) return ["font-size"];
  if (/^text-/.test(name) && !/^text-(wrap|nowrap|balance|pretty|ellipsis|clip)$/.test(name))
    return ["font-size", "color"];
  if (/^font-/.test(name)) return ["font"];
  if (/^leading-/.test(name)) return ["line-height"];
  if (/^tracking-/.test(name)) return ["letter-spacing"];
  if (/^(uppercase|lowercase|capitalize|normal-case)$/.test(name)) return ["text-transform"];
  if (/^min-h-/.test(name)) return ["min-height"];
  if (/^size-/.test(name)) return ["width", "height"];
  if (/^[hw]-/.test(name)) return [name[0] === "h" ? "height" : "width"];
  if (/^opacity-/.test(name)) return ["opacity"];
  return [];
};

/** Each rule's selectors and the properties it sets, @apply utilities as the properties they stand
 *  for, at-rule blocks opened and nested rules (SCSS, CSS nesting) resolved against their parent's
 *  selectors. */
export const rules = (css: string) => {
  const out: { selectors: string[]; props: string[] }[] = [];
  const nest = (parents: string[], selectors: string[]) =>
    parents.flatMap((p) =>
      selectors.map((s) => (s.includes("&") ? s.replaceAll("&", p) : `${p} ${s}`)),
    );
  const walk = (s: string, parents?: string[]) => {
    let own = "";
    let i = 0;
    while (i < s.length) {
      const open = s.indexOf("{", i);
      if (open < 0) break;
      const pre = s.slice(i, open);
      const cut = Math.max(pre.lastIndexOf(";"), pre.lastIndexOf("}")) + 1;
      own += pre.slice(0, cut);
      const head = pre.slice(cut).trim();
      let depth = 1;
      let j = open + 1;
      for (; j < s.length && depth; j++) depth += s[j] === "{" ? 1 : s[j] === "}" ? -1 : 0;
      const selectors = outside(head, ",").map((x) => x.trim());
      walk(
        s.slice(open + 1, j - 1),
        head.startsWith("@") ? parents : parents ? nest(parents, selectors) : selectors,
      );
      i = j;
    }
    own += s.slice(i);
    const props = [
      ...[...own.matchAll(/(?:^|;)\s*([\w-]+)\s*:/g)].map((m) => m[1]!),
      ...[...own.matchAll(/@apply\s+([^;]+)/g)].flatMap((m) =>
        m[1]!.trim().split(/\s+/).flatMap(utility),
      ),
    ];
    if (parents && props.length) out.push({ selectors: parents, props });
  };
  walk(css.replace(/\/\*[\s\S]*?\*\//g, ""));
  return out;
};

/** A state or a pseudo-element: the elements are compared at rest, so such a rule is not read. */
const STATE = /::?(before|after|hover|focus|focus-visible|focus-within|active|visited|marker)\b/;

/** The parts of a selector split at the characters `seps`, outside any parentheses. */
const outside = (selector: string, seps: string) => {
  const out = [""];
  let depth = 0;
  for (const ch of selector) {
    depth += ch === "(" ? 1 : ch === ")" ? -1 : 0;
    if (depth === 0 && seps.includes(ch)) out.push("");
    else out[out.length - 1] += ch;
  }
  return out.filter((x) => x.trim());
};
/** A selector's last compound, its functional pseudo-classes and their arguments included. */
const last = (selector: string) => outside(selector, " >+~").pop() ?? "";

/** The classes a selector styles: those of its last compound, outside :is(), :has() and the like. */
const subjects = (selector: string) =>
  outside(last(selector), ":")
    .filter((x) => !/^(is|where|not|has)\(/.test(x))
    .join(":")
    .match(/\.([\w-]+)/g)
    ?.map((c) => c.slice(1)) ?? [];

/** The consumer's sources that could fork an element: file and selector or component name. */
export const sourceFindings = (
  paths: string[],
  read: (p: string) => string,
  allow: Record<string, Exception>,
) => {
  const out: string[] = [];
  const own = new Set(
    Object.values(allow).flatMap((e) => (typeof e === "string" ? [] : (e.files ?? []))),
  );
  for (const p of paths) {
    if (!scanned(p) || own.has(p)) continue;
    const ext = extname(p);
    const raw = read(p);
    if (COMPONENT.has(ext) && /(^|\/)components\//.test(p)) {
      const name = kebab(basename(p, ext));
      // Each element the name names, such as callout and card in note-card; rendering one passes.
      const elements = [...name.matchAll(NAMED_ALL)].map((m) => WORD[m[1]!]!);
      if (
        elements.length &&
        !(name in allow) &&
        !elements.some((e) => new RegExp(RENDERS[e] ?? `(?<![\\w-])hw-${e}(?![\\w-])`).test(raw)) &&
        // A fact, singular, is one row (dt and dd) of the facts list its parent renders, never a list.
        !(/(^|-)fact($|-)/.test(name) && /<dt\b/.test(raw) && !/<dl\b/.test(raw))
      )
        out.push(
          `${p}: a component named like a shared element; render the hw-* element or list "${name}" as an exception`,
        );
    }
    if (!STYLED.has(ext)) continue;
    for (const r of rules(styles(raw, ext))) {
      for (const sel of r.selectors) {
        // A compound with an hw-* class is the element itself; any other class named like one forks it.
        const classes = STATE.test(last(sel)) ? [] : subjects(sel);
        const cls = classes.some((c) => c.startsWith("hw-")) ? undefined : classes.find(namedAs);
        const element = cls && namedAs(cls);
        if (element && !(cls! in allow) && r.props.some((x) => setsOwned(element, x)))
          out.push(
            `${p}: ${sel} styles an element named like a shared one; use the hw-* element or list "${cls}" as an exception`,
          );
      }
    }
  }
  return out;
};

/** The exceptions: each declared one names its reason, and each one a page carries is declared,
 *  since an exception's instance is neither measured nor source-checked. */
export const exceptionFindings = (config: Config, results: { exceptions: string[] }[]) => {
  const out: string[] = [];
  for (const [name, exception] of Object.entries(config.exceptions ?? {}))
    if (!reasonOf(exception)?.trim()) out.push(`${LIST}: exception "${name}" names no reason`);
  for (const name of new Set(results.flatMap((r) => r.exceptions)))
    if (!(name in (config.exceptions ?? {})))
      out.push(
        `${name}: a [data-hw-exception="${name}"] on a page, but ${LIST} declares no such exception`,
      );
  return out;
};

if (import.meta.main) {
  answerHelp(USAGE);
  const json = process.argv.includes("--json");
  if (!existsSync(LIST)) {
    console.error(`brand-elements: no ${LIST} in ${process.cwd()}`);
    process.exit(2);
  }
  const config = JSON.parse(readFileSync(LIST, "utf8")) as Config;
  const i = process.argv.indexOf("--base");
  if (i >= 0 && !/^https?:$/.test(URL.parse(process.argv[i + 1] ?? "")?.protocol ?? "")) {
    console.error(USAGE);
    process.exit(2);
  }
  const named = config.pages ?? [];
  const { dir, at, exclude } = listedCatalog(config);
  let site: ReturnType<typeof listedSite>;
  try {
    site = listedSite(config.site);
  } catch (e) {
    console.error(`brand-elements: ${(e as Error).message}`);
    process.exit(2);
  }
  let stories: string[] = [];
  try {
    if (config.csp !== undefined) policies(config.csp);
    if (dir) stories = catalogPages(dir, at, site?.dir, !!site || i >= 0, exclude, site?.at);
  } catch (e) {
    console.error(`brand-elements: ${(e as Error).message}`);
    process.exit(2);
  }
  const pages = [...named, ...stories];
  if (!pages.length) {
    console.error(
      `brand-elements: ${LIST} names no page; a run that measures nothing passes nothing`,
    );
    process.exit(2);
  }
  // Without a server a page starting with / is a file; one that is none is a site path.
  const unserved = named.filter(
    (p) => p.startsWith("/") && !site && i < 0 && !(existsSync(p) && statSync(p).isFile()),
  );
  if (unserved.length) {
    console.error(
      `brand-elements: ${unserved.join(", ")}: a site path, but no site or --base to serve it`,
    );
    process.exit(2);
  }
  const server = i < 0 && site ? serve(site.dir, site.at) : undefined;
  const base = i < 0 ? server?.url : new URL(process.argv[i + 1]!);
  const browser = await launch();
  const results: PageResult[] = [];
  try {
    // Tabs side by side, at least 8: each page mostly waits for the network to go quiet.
    results.push(
      ...(await pool(pages, tabs(8), (url) =>
        measurePage(browser, url, "", config.lightOnly === true, base, config.csp),
      )),
    );
  } finally {
    await browser.close();
    await server?.stop(true);
  }
  const rendered = results.flatMap((r) => r.findings);
  const unstyled = results.flatMap((r) => r.unstyled);
  const refused = results.flatMap((r) => r.refused);
  const empty = named.filter((_, i) => !results[i]!.seen.length);
  // No shared element on any page or story: a run that measures nothing passes nothing.
  const nothing = results.every((r) => !r.seen.length);
  if (nothing) console.error(`brand-elements: no shared element on any page of ${LIST}`);
  const tree = listTree("brand-elements");
  const source = sourceFindings(tree, (p) => readFileSync(p, "utf8"), config.exceptions ?? {});
  const excepted = exceptionFindings(config, results);
  if (json)
    console.log(
      JSON.stringify({ rendered, unstyled, refused, source, exceptions: excepted, empty }, null, 2),
    );
  else {
    const report = skippedReport("brand-elements", tree);
    if (report) console.log(report);
    for (const f of rendered)
      console.error(
        `${f.page} ${f.element} ${f.label}: ${
          f.got === "undefined"
            ? `reads ${f.prop}, which this page does not define: add it to the tokens the page emits (a pick-list of token names, or tokens.css without Tailwind's theme(static))`
            : `${f.prop} ${f.got}, brand ${f.want}`
        }`,
      );
    for (const u of unstyled)
      console.error(
        `${u.page} ${u.label}: carries .${u.cls}, which no stylesheet on the page defines, so it draws unstyled: take the hw-* element brand defines now, or define the class in your own CSS`,
      );
    for (const r of refused) console.error(refusalLine(r));
    for (const line of [...source, ...excepted]) console.error(line);
    for (const url of empty) console.error(`${url}: no shared element found`);
    const shown = new Set(results.flatMap((r) => r.seen));
    console.log(
      `brand-elements: ${shown.size} elements on ${pages.length} pages, ${rendered.length} rendered differences, ${unstyled.length} unstyled classes, ${refused.length} refused by the page's policy, ${source.length} source findings, ${excepted.length} exception findings`,
    );
  }
  process.exit(
    nothing || [rendered, unstyled, refused, source, excepted, empty].some((a) => a.length) ? 1 : 0,
  );
}
