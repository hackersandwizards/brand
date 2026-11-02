#!/usr/bin/env bun
// The element check a consumer runs in its own gate: the shared elements (elements/*.css) as its
// own design-system page renders them, against the brand's rule at the same scale, plus the source
// that could fork one. It reads the consumer's brand-elements.json:
//
//   { "pages": ["<url or html file>", ...],
//     "uses": ["card", "pill", ...],                  every hub element the system uses
//     "exceptions": { "<name>": "<reason>"            every element the system keeps as its own,
//                     | { "reason": "...", "files": ["<path>", ...] }, ... } }
//
// 1. Rendered. Every hub element on the pages (an hw-* class; for the focus ring, the first
//    focusable inside [data-hw-tile="focus-ring"], focused; not one inside a [data-hw-exception],
//    which is that exception's instance) is compared with a reference: the same
//    markup in a shadow root beside it, styled only by this package's element files and inheriting
//    the page's tokens, theme and scale. Any difference in a computed property the element sets
//    (OWNS: its corner, fill, line, text colour, type, padding or size) fails, by more than 0.02px
//    for a length.
// 2. Source. A CSS rule in a .css, .scss, .astro, .vue or .svelte file whose subject class is named
//    like an element (card; chip, pill, tag, badge; eyebrow, kicker, label; callout, note; quote)
//    and sets a property that element owns (a shorthand counts for its longhands) fails, and so does a component file of such a name,
//    unless it carries the hw-* class, its name is an exception, or its file is one an exception
//    lists in "files" (a stylesheet of the system's own medium, such as a slide deck's).
// 3. Coverage. Each used element has a tile on a page ([data-hw-tile="<name>"] holding it, its
//    data-hw-version this package's version), each exception a tile ([data-hw-exception="<name>"])
//    and a reason, and every hub element a page shows is listed as used.
//
// Usage: brand-elements [--json]. Exits 1 on any finding, and on a page with no hub element (a zero
// proves nothing). Needs Chrome for Testing (CHROME_BINARY overrides).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import type { Browser } from "puppeteer-core";
import own from "../package.json";
import { listTree, scanned } from "./colours";
import { launch, toUrl } from "./markers";

export const LIST = "brand-elements.json";
export type Exception = string | { reason: string; files?: string[] };
export type Config = { pages: string[]; uses: string[]; exceptions?: Record<string, Exception> };
const reasonOf = (e: Exception) => (typeof e === "string" ? e : e.reason);
export const TOLERANCE = 0.02; // CSS px

const DIR = join(import.meta.dir, "../elements");
/** Each element by name: the selector that finds it on a page. */
export const ELEMENTS: Record<string, string> = {
  label: ".hw-label",
  pill: ".hw-pill",
  card: ".hw-card",
  callout: ".hw-callout",
  quote: ".hw-quote",
  table: ".hw-table",
  link: ".hw-link, .hw-links a",
  "focus-ring": '[data-hw-tile="focus-ring"] :is(a[href], button, [tabindex])',
  "icon-button": ".hw-icon-button",
  strip: ".hw-strip",
  code: ".hw-code",
};
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
const OWNS: Record<string, string[]> = {
  label: [...TYPE, "color"],
  pill: [...CORNER, ...FILL, ...borders(), ...PAD, ...TYPE, "color"],
  "pill .hw-pill-chevron": ["width", "height", "opacity"],
  "pill .hw-pill-remove": ["width", "height", "opacity"],
  card: [...CORNER, ...FILL, ...borders(), ...PAD],
  callout: [...CORNER, ...FILL, ...borders(["left"]), ...PAD, "font-weight"],
  quote: [...borders(["left"]), "padding-left", "color"],
  table: ["font-size", "line-height"],
  "table th": [...borders(["bottom"]), ...PAD, ...TYPE, "color", "text-align", "vertical-align"],
  "table td": [...borders(["bottom"]), ...PAD, "text-align", "vertical-align"],
  link: ["color", "text-decoration-line", "text-decoration-thickness", "text-underline-offset"],
  "focus-ring": ["outline-style", "outline-width", "outline-color", "outline-offset"],
  "icon-button": ["width", "height", ...CORNER, ...FILL, ...PAD, "color"],
  "icon-button svg": ["width", "height"],
  strip: ["height", ...FILL],
  code: [...CORNER, ...FILL, ...PAD, ...TYPE, "color"],
};

/** The element files' rules, every @import dropped: the reference's only styles. */
export const elementCss = () =>
  readdirSync(DIR)
    .filter((f) => f.endsWith(".css") && f !== "elements.css")
    .map((f) => readFileSync(join(DIR, f), "utf8").replace(/@import[^;]+;/g, ""))
    .join("\n");
/** The settings a surface may set: every --hw-* an element file reads. */
export const SETTINGS = [...new Set(elementCss().match(/(?<=var\()--hw-[a-z-]+/g))];
/** The brand tokens each element reads: a surface that never defines one (Tailwind emits only the
 * @theme tokens a scanned file names) leaves page and reference equally wrong, so each is checked. */
export const TOKENS = Object.fromEntries(
  Object.keys(ELEMENTS).map((name) => {
    const file = join(DIR, `${name === "focus-ring" ? "focus" : name}.css`);
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    return [name, [...new Set(css.match(/(?<=var\()--(?!hw-|_)[\w-]+(?=\))/g))]];
  }),
);

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

/** Runs in the page: each hub element against its reference, as findings plus the tiles found. */
function compare([css, elements, owns, settings, tolerance, tokens]: Args) {
  const findings: { element: string; label: string; prop: string; got: string; want: string }[] =
    [];
  const seen: string[] = [];
  const missing = new Set<string>();
  const label = (el: Element) =>
    `${el.tagName.toLowerCase()}${el.classList[0] ? "." + el.classList[0] : ""} "${(el.textContent ?? "").trim().slice(0, 30)}"`;
  const num = (v: string) => (/^-?[\d.]+px$/.test(v) ? parseFloat(v) : null);
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
    const [x, y] = [num(got), num(want)];
    return x !== null && y !== null ? Math.abs(x - y) <= tolerance : colour(got) === colour(want);
  };
  const diff = (element: string, name: string, a: Element, b: Element, list: string[]) => {
    const ga = getComputedStyle(a);
    const gb = getComputedStyle(b);
    for (const prop of list) {
      const got = ga.getPropertyValue(prop);
      const want = gb.getPropertyValue(prop);
      if (!same(got, want)) findings.push({ element, label: name, prop, got, want });
    }
  };
  for (const [element, selector] of Object.entries(elements))
    for (const el of document.querySelectorAll(selector)) {
      if (el.closest("[data-hw-reference], [data-hw-exception]")) continue;
      seen.push(element);
      const clone = el.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.removeAttribute("style");
      const own = getComputedStyle(el);
      for (const t of tokens[element] ?? [])
        if (!own.getPropertyValue(t).trim() && !missing.has(element + t)) {
          missing.add(element + t);
          findings.push({ element, label: label(el), prop: t, got: "undefined", want: "a value" });
        }
      for (const s of settings) {
        const v = own.getPropertyValue(s).trim();
        if (v) clone.style.setProperty(s, v);
      }
      let inner: Element = clone;
      if (element === "link" && !el.classList.contains("hw-link")) {
        const wrap = document.createElement("div");
        wrap.className = "hw-links";
        wrap.append(clone);
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
      const host = document.createElement(el.parentElement?.tagName === "TR" ? "td" : "span");
      host.setAttribute("data-hw-reference", "");
      el.after(host);
      const root = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = css;
      root.append(style, frame);
      try {
        const list = owns[element]!;
        if (element === "focus-ring") {
          // Each read while it holds focus: a computed style reads the live state.
          const read = (x: Element) => {
            (x as HTMLElement).focus();
            const g = getComputedStyle(x);
            return Object.fromEntries(list.map((p) => [p, g.getPropertyValue(p)]));
          };
          const [got, want] = [read(el), read(clone)];
          (clone as HTMLElement).blur();
          if (got["outline-style"] === "none")
            findings.push({
              element,
              label: label(el),
              prop: "outline-style",
              got: "none",
              want: want["outline-style"]!,
            });
          for (const p of list) {
            if (!same(got[p]!, want[p]!))
              findings.push({ element, label: label(el), prop: p, got: got[p]!, want: want[p]! });
          }
          continue;
        }
        diff(element, label(el), el, clone, list);
        for (const [key, props] of Object.entries(owns)) {
          const [owner, part] = key.split(" ");
          if (owner !== element || !part) continue;
          const [a, b] = [el.querySelector(part), clone.querySelector(part)];
          if (a && b) diff(element, `${label(el)} ${part}`, a, b, props);
        }
      } finally {
        host.remove();
      }
    }
  const tiles = [...document.querySelectorAll("[data-hw-tile]")].map((t) => ({
    name: t.getAttribute("data-hw-tile")!,
    version: t.getAttribute("data-hw-version") ?? "",
    holds: Object.entries(elements).some(
      ([e, s]) => e === t.getAttribute("data-hw-tile") && t.querySelector(s) !== null,
    ),
  }));
  const exceptions = [...document.querySelectorAll("[data-hw-exception]")].map((t) =>
    t.getAttribute("data-hw-exception")!,
  );
  return { findings, seen: [...new Set(seen)], tiles, exceptions };
}

export type PageResult = Awaited<ReturnType<typeof measurePage>>;

/** One page's comparison, with its tiles, after `css` is added. */
export async function measurePage(browser: Browser, url: string, css = "") {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.goto(toUrl(url), { waitUntil: "networkidle0" });
    if (css) await page.addStyleTag({ content: css });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const out = await page.evaluate(compare, [
      elementCss(),
      ELEMENTS,
      OWNS,
      SETTINGS,
      TOLERANCE,
      TOKENS,
    ] as Args);
    return { ...out, findings: out.findings.map((f) => ({ page: url, ...f })) };
  } finally {
    await page.close();
  }
}

// ── Source ──
const NAMED = /(^|-)(card|chip|pill|tag|badge|eyebrow|kicker|label|callout|note|quote)s?($|-)/;
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
};
/** The element a class is named like. */
const namedAs = (cls: string) => WORD[NAMED.exec(cls)?.[2] ?? ""];
/** Whether a declared property, a shorthand included, sets one the element owns. */
export const setsOwned = (element: string, prop: string) =>
  OWNS[element]!.some(
    (q) =>
      q === prop ||
      q.startsWith(`${prop}-`) ||
      (prop === "border-radius" && q.endsWith("-radius")) ||
      (/^border-(width|style|color)$/.test(prop) && q.endsWith(prop.slice(6))),
  );
const STYLED = new Set([".css", ".scss", ".astro", ".vue", ".svelte"]);
const COMPONENT = new Set([".astro", ".tsx", ".jsx", ".vue", ".svelte"]);

/** The CSS of a source file: the file itself, or its style blocks. */
const styles = (raw: string, ext: string) =>
  ext === ".css" || ext === ".scss"
    ? raw
    : [...raw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");

/** Each rule's selectors and the properties it sets, at-rule blocks opened. */
export const rules = (css: string) => {
  const out: { selectors: string[]; props: string[] }[] = [];
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const walk = (s: string) => {
    let i = 0;
    while (i < s.length) {
      const open = s.indexOf("{", i);
      if (open < 0) return;
      const head = s
        .slice(i, open)
        .replace(/^[\s\S]*[;}]/, "")
        .trim();
      let depth = 1;
      let j = open + 1;
      for (; j < s.length && depth; j++) depth += s[j] === "{" ? 1 : s[j] === "}" ? -1 : 0;
      const body = s.slice(open + 1, j - 1);
      if (head.startsWith("@") || body.includes("{")) walk(body);
      else
        out.push({
          selectors: outside(head, ",").map((x) => x.trim()),
          props: [...body.matchAll(/(?:^|;)\s*([a-z-]+)\s*:/g)].map((m) => m[1]!),
        });
      i = j;
    }
  };
  walk(src);
  return out;
};

/** A state or a pseudo-element the element leaves to the surface (card.css: hover). */
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

/** The class a selector styles: the last class of its last compound, outside :is(), :has() and the like. */
const subject = (selector: string) =>
  outside(last(selector), ":")
    .filter((x) => !/^(is|where|not|has)\(/.test(x))
    .join(":")
    .match(/\.([\w-]+)/g)
    ?.pop()
    ?.slice(1);

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
      const name = basename(p, ext).toLowerCase();
      if (NAMED.test(name) && !(name in allow) && !/\bhw-[a-z]/.test(raw))
        out.push(
          `${p}: a component named like a shared element; render the hw-* element or list "${name}" as an exception`,
        );
    }
    if (!STYLED.has(ext)) continue;
    for (const r of rules(styles(raw, ext))) {
      for (const sel of r.selectors) {
        const cls = STATE.test(last(sel)) ? undefined : subject(sel);
        const element = cls && !cls.startsWith("hw-") ? namedAs(cls) : undefined;
        if (element && !(cls! in allow) && r.props.some((x) => setsOwned(element, x)))
          out.push(
            `${p}: ${sel} styles an element named like a shared one; use the hw-* element or list "${cls}" as an exception`,
          );
      }
    }
  }
  return out;
};

/** Coverage of brand-elements.json against what the pages show. */
export const coverage = (
  config: Config,
  results: { seen: string[]; tiles: PageResult["tiles"]; exceptions: string[] }[],
) => {
  const out: string[] = [];
  const tiles = results.flatMap((r) => r.tiles);
  const shown = new Set(results.flatMap((r) => r.seen));
  const exceptionTiles = new Set(results.flatMap((r) => r.exceptions));
  for (const name of config.uses) {
    if (!(name in ELEMENTS)) {
      out.push(`${LIST}: "${name}" is no shared element (${Object.keys(ELEMENTS).join(", ")})`);
      continue;
    }
    const tile = tiles.find((t) => t.name === name && t.holds);
    if (!tile) out.push(`${name}: used, but no page shows it in a [data-hw-tile="${name}"]`);
    else if (tile.version !== own.version)
      out.push(
        `${name}: the tile says brand v${tile.version || "?"}, the installed package is v${own.version}; rebuild the page`,
      );
  }
  for (const name of shown)
    if (!config.uses.includes(name))
      out.push(`${name}: a page shows it, but ${LIST} does not list it in "uses"`);
  for (const [name, exception] of Object.entries(config.exceptions ?? {})) {
    if (!reasonOf(exception)?.trim()) out.push(`${LIST}: exception "${name}" names no reason`);
    if (!exceptionTiles.has(name))
      out.push(`${name}: an exception without a [data-hw-exception="${name}"] on a page`);
  }
  return out;
};

if (import.meta.main) {
  const json = process.argv.includes("--json");
  if (!existsSync(LIST)) {
    console.error(`brand-elements: no ${LIST} in ${process.cwd()}`);
    process.exit(2);
  }
  const config = JSON.parse(readFileSync(LIST, "utf8")) as Config;
  const browser = await launch();
  const results: PageResult[] = [];
  try {
    for (const url of config.pages) results.push(await measurePage(browser, url));
  } finally {
    await browser.close();
  }
  const rendered = results.flatMap((r) => r.findings);
  const empty = config.pages.filter((_, i) => !results[i]!.seen.length);
  const source = sourceFindings(
    listTree("brand-elements"),
    (p) => readFileSync(p, "utf8"),
    config.exceptions ?? {},
  );
  const covered = coverage(config, results);
  if (json) console.log(JSON.stringify({ rendered, source, coverage: covered, empty }, null, 2));
  else {
    for (const f of rendered)
      console.error(`${f.page} ${f.element} ${f.label}: ${f.prop} ${f.got}, brand ${f.want}`);
    for (const line of [...source, ...covered]) console.error(line);
    for (const url of empty) console.error(`${url}: no shared element found`);
    const shown = new Set(results.flatMap((r) => r.seen));
    console.log(
      `brand-elements: ${shown.size} elements on ${config.pages.length} pages, ${rendered.length} rendered differences, ${source.length} source findings, ${covered.length} coverage findings`,
    );
  }
  process.exit(rendered.length || source.length || covered.length || empty.length ? 1 : 0);
}
