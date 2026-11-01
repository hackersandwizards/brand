#!/usr/bin/env bun
// The element check a consumer runs in its own gate: the shared elements (elements/*.css) as its
// own design-system page renders them, against the brand's rule at the same scale, plus the source
// that could fork one. It reads the consumer's brand-elements.json:
//
//   { "pages": ["<url or html file>", ...],
//     "uses": ["card", "pill", ...],                  every hub element the system uses
//     "exceptions": { "<name>": "<reason>", ... } }    every element the system keeps as its own
//
// 1. Rendered. Every hub element on the pages (an hw-* class; for the focus ring, the first
//    focusable inside [data-hw-tile="focus-ring"], focused) is compared with a reference: the same
//    markup in a shadow root beside it, styled only by this package's element files and inheriting
//    the page's tokens, theme and scale. Any difference in the computed corner, fill, line, text
//    colour, type, padding or size fails, by more than 0.02px for a length.
// 2. Source. A CSS rule in a .css, .scss, .astro, .vue or .svelte file whose subject class is named
//    like an element (card, chip, pill, tag, badge, eyebrow, kicker, label, callout, note, quote)
//    and sets a corner, fill, line or type fails, and so does a component file of such a name,
//    unless it carries the hw-* class or its name is an exception.
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
export type Config = { pages: string[]; uses: string[]; exceptions?: Record<string, string> };
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
const PARTS: Record<string, string[]> = {
  table: ["th", "td"],
  "icon-button": ["svg"],
  pill: [".hw-pill-chevron", ".hw-pill-remove"],
};
const PROPS = [
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "background-color",
  "background-image",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-top-style",
  "border-left-style",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
  "text-decoration-line",
  "text-decoration-thickness",
  "text-underline-offset",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "outline-style",
  "outline-width",
  "outline-color",
  "outline-offset",
];
const SIZED: Record<string, string[]> = { strip: ["height"], "icon-button": ["width", "height"] };

/** The element files' rules, every @import dropped: the reference's only styles. */
export const elementCss = () =>
  readdirSync(DIR)
    .filter((f) => f.endsWith(".css") && f !== "elements.css")
    .map((f) => readFileSync(join(DIR, f), "utf8").replace(/@import[^;]+;/g, ""))
    .join("\n");
/** The settings a surface may set: every --hw-* an element file reads. */
export const SETTINGS = [...new Set(elementCss().match(/(?<=var\()--hw-[a-z-]+/g))];

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
  string[],
  number,
  Record<string, string[]>,
];

/** Runs in the page: each hub element against its reference, as findings plus the tiles found. */
function compare([css, elements, parts, props, settings, tolerance, sized]: Args) {
  const findings: { element: string; label: string; prop: string; got: string; want: string }[] =
    [];
  const seen: string[] = [];
  const label = (el: Element) =>
    `${el.tagName.toLowerCase()}${el.classList[0] ? "." + el.classList[0] : ""} "${(el.textContent ?? "").trim().slice(0, 30)}"`;
  const num = (v: string) => (/^-?[\d.]+px$/.test(v) ? parseFloat(v) : null);
  const diff = (element: string, name: string, a: Element, b: Element, list: string[]) => {
    const ga = getComputedStyle(a);
    const gb = getComputedStyle(b);
    for (const prop of list) {
      const got = ga.getPropertyValue(prop);
      const want = gb.getPropertyValue(prop);
      const [x, y] = [num(got), num(want)];
      if (x !== null && y !== null ? Math.abs(x - y) > tolerance : got !== want)
        findings.push({ element, label: name, prop, got, want });
    }
  };
  for (const [element, selector] of Object.entries(elements))
    for (const el of document.querySelectorAll(selector)) {
      if (el.closest("[data-hw-reference]")) continue;
      seen.push(element);
      const clone = el.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.removeAttribute("style");
      const own = getComputedStyle(el);
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
        const list =
          element === "focus-ring"
            ? props.filter((p) => p.startsWith("outline"))
            : [...props, ...(sized[element] ?? [])];
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
            const [x, y] = [num(got[p]!), num(want[p]!)];
            if (x !== null && y !== null ? Math.abs(x - y) > tolerance : got[p] !== want[p])
              findings.push({ element, label: label(el), prop: p, got: got[p]!, want: want[p]! });
          }
          continue;
        }
        diff(element, label(el), el, clone, list);
        for (const part of parts[element] ?? []) {
          const [a, b] = [el.querySelector(part), clone.querySelector(part)];
          if (a && b)
            diff(
              element,
              `${label(el)} ${part}`,
              a,
              b,
              part === "svg" || part.startsWith(".hw-pill-")
                ? ["width", "height", "opacity"]
                : props,
            );
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
      PARTS,
      PROPS,
      SETTINGS,
      TOLERANCE,
      SIZED,
    ] as Args);
    return { ...out, findings: out.findings.map((f) => ({ page: url, ...f })) };
  } finally {
    await page.close();
  }
}

// ── Source ──
const NAMED = /(^|-)(card|chip|pill|tag|badge|eyebrow|kicker|label|callout|note|quote)s?($|-)/;
const STYLING =
  /^(border(-[a-z]+)*|background(-color|-image)?|font(-[a-z]+)?|letter-spacing|text-transform)$/;
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
          selectors: head.split(",").map((x) => x.trim()),
          props: [...body.matchAll(/(?:^|;)\s*([a-z-]+)\s*:/g)].map((m) => m[1]!),
        });
      i = j;
    }
  };
  walk(src);
  return out;
};

/** The class a selector styles: the last class of its last compound. */
const subject = (selector: string) =>
  selector
    .replace(/:(is|where|not|has)\([^)]*\)/g, "")
    .split(/[\s>+~]+/)
    .pop()
    ?.match(/\.([\w-]+)/g)
    ?.pop()
    ?.slice(1);

/** The consumer's sources that could fork an element: file and selector or component name. */
export const sourceFindings = (
  paths: string[],
  read: (p: string) => string,
  allow: Record<string, string>,
) => {
  const out: string[] = [];
  for (const p of paths) {
    if (!scanned(p)) continue;
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
      if (!r.props.some((x) => STYLING.test(x))) continue;
      for (const sel of r.selectors) {
        const cls = subject(sel);
        if (cls && !cls.startsWith("hw-") && NAMED.test(cls) && !(cls in allow))
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
  for (const [name, reason] of Object.entries(config.exceptions ?? {})) {
    if (!reason?.trim()) out.push(`${LIST}: exception "${name}" names no reason`);
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
