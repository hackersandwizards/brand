import { basename, extname } from "node:path";
import type { Exception } from "./elements-config";
import { setsOwned } from "./element-properties";
import { outside, rules } from "./element-stylesheet";
import { ENGINE_STYLE } from "./engine-style";
import { COMPONENT, scanned } from "./tree";

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
const NAMED_ALL = new RegExp(`(?<=^|-)(${Object.keys(WORD).join("|")})s?(?=$|-)`, "g");
/** A name in kebab case, so ProjectCard and projectCard read as project-card. */
export const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/** The shared elements a class or component name refers to. */
const namedElements = (name: string) =>
  [...kebab(name).matchAll(NAMED_ALL)].map(([, word]) => WORD[word]);
const STYLED = new Set([".css", ".scss", ".astro", ".vue", ".svelte", ".html"]);

/** The CSS of a source file: the file itself, or its style blocks, those the documents engine wrote
 *  left out (ENGINE_STYLE in engine-style.ts). */
const styles = (raw: string, ext: string) =>
  ext === ".css" || ext === ".scss"
    ? raw
    : [...raw.replace(ENGINE_STYLE, "").matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
        .map((m) => m[1])
        .join("\n");

/** A state or a pseudo-element: the elements are compared at rest, so such a rule is not read. */
const STATE = /::?(before|after|hover|focus|focus-visible|focus-within|active|visited|marker)\b/;

/** A selector's last compound, its functional pseudo-classes and their arguments included. */
const last = (selector: string) => outside(selector, " >+~").pop() ?? "";

/** The classes a selector styles: those of its last compound, outside :is(), :has() and the like. */
const subjects = (selector: string) =>
  outside(last(selector), ":")
    .filter((x) => !/^(is|where|not|has)\(/.test(x))
    .join(":")
    .match(/\.([\w-]+)/g)
    ?.map((c) => c.slice(1)) ?? [];

/** A component named for shared elements must render one of them or have a named exception. */
function componentFinding(path: string, raw: string, allow: Record<string, Exception>) {
  const ext = extname(path);
  if (!COMPONENT.has(ext) || !/(^|\/)components\//.test(path)) return;
  const name = kebab(basename(path, ext));
  if (name in allow) return;
  // Each element the name names, such as callout and card in note-card; rendering one passes.
  const elements = namedElements(name);
  if (!elements.length) return;
  if (elements.some((e) => new RegExp(RENDERS[e] ?? `(?<![\\w-])hw-${e}(?![\\w-])`).test(raw)))
    return;
  // A fact, singular, is one row (dt and dd) of the facts list its parent renders, never a list.
  if (/(^|-)fact($|-)/.test(name) && /<dt\b/.test(raw) && !/<dl\b/.test(raw)) return;
  return `${path}: a component named like a shared element; render the hw-* element or list "${name}" as an exception`;
}

/** The subject class of a selector that overrides a property a shared element owns. */
function stylingFork(selector: string, props: string[], allow: Record<string, Exception>) {
  if (STATE.test(last(selector))) return;
  // A compound with an hw-* class is the element itself; any other class named like one forks it.
  const classes = subjects(selector);
  if (classes.some((c) => c.startsWith("hw-"))) return;
  return classes.find(
    (cls) =>
      !Object.hasOwn(allow, cls) &&
      namedElements(cls).some((element) => props.some((prop) => setsOwned(element, prop))),
  );
}

/** Findings in a stylesheet, including the style blocks of a component or document. */
function stylesheetFindings(path: string, raw: string, allow: Record<string, Exception>) {
  const ext = extname(path);
  if (!STYLED.has(ext)) return [];
  const out: string[] = [];
  for (const { selectors, props } of rules(styles(raw, ext))) {
    for (const sel of selectors) {
      const cls = stylingFork(sel, props, allow);
      if (cls)
        out.push(
          `${path}: ${sel} styles an element named like a shared one; use the hw-* element or list "${cls}" as an exception`,
        );
    }
  }
  return out;
}

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
  for (const path of paths) {
    if (!scanned(path) || own.has(path)) continue;
    const raw = read(path);
    const component = componentFinding(path, raw, allow);
    if (component) out.push(component);
    out.push(...stylesheetFindings(path, raw, allow));
  }
  return out;
};
