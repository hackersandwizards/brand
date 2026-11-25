import type { JSHandle, Page } from "puppeteer-core";
import {
  elementStyleFunctions,
  type diffElementStyles as DiffElementStyles,
  type snapshotStyles as SnapshotStyles,
  type StyleDifference,
} from "./element-values";
import type { ElementStyleRules } from "./element-properties";

// The declarations installed by installElementDom supply these names inside the page.
declare const snapshotStyles: typeof SnapshotStyles;
declare const diffElementStyles: typeof DiffElementStyles;

export type ElementFinding = { element: string; label: string } & StyleDifference;

const SKIP = "[data-hw-reference], [data-hw-exception], [data-hw-shell]";

export type ElementReference = {
  css: string;
  selectors: Record<string, string>;
  styles: Record<string, ElementStyleRules>;
  settings: string[];
  tolerance: number;
  tokens: Record<string, string[]>;
};

type Instance = { element: string; el: Element; settings: [string, string][] };
type PageFocus = { node: HTMLElement | null; visible: boolean };
type ReferenceFocus = { got: PageFocus; want: PageFocus; restore: PageFocus };
type Reference = Instance & { clone: HTMLElement; focus: ReferenceFocus | null };
type MountedReference = Reference & { host: HTMLSpanElement };

/** Identifies a rendered element in a finding. */
function elementLabel(el: Element) {
  return `${el.tagName.toLowerCase()}${el.classList[0] ? "." + el.classList[0] : ""} "${(el.textContent ?? "").trim().slice(0, 30)}"`;
}

/** The first instance missing each required token, plus settings on each measurable instance. */
function discoverElementInstances({ selectors, tokens, settings }: ElementReference) {
  const findings: ElementFinding[] = [];
  const missing = new Set<string>();
  const instances: Instance[] = [];
  for (const [element, selector] of Object.entries(selectors)) {
    for (const el of document.querySelectorAll(selector)) {
      // A hidden element draws nothing, so it is not measured (the corner rule below still reads it).
      if (el.closest(SKIP) || el.closest("[hidden]")) continue;
      const own = getComputedStyle(el);
      for (const token of tokens[element] ?? []) {
        const name = element + token;
        if (own.getPropertyValue(token).trim() || missing.has(name)) continue;
        missing.add(name);
        findings.push({
          element,
          label: elementLabel(el),
          prop: token,
          got: "undefined",
          want: "a value",
        });
      }
      instances.push({
        element,
        el,
        settings: settings.map((setting) => [setting, own.getPropertyValue(setting).trim()]),
      });
    }
  }
  return { instances, findings };
}

/** Whether the computed corners have the brand's large and small diagonals. */
function hasBrandCorner(el: Element) {
  const g = getComputedStyle(el);
  const [tl, tr, br, bl] = [
    g.borderTopLeftRadius,
    g.borderTopRightRadius,
    g.borderBottomRightRadius,
    g.borderBottomLeftRadius,
  ].map(parseFloat);
  return tl! > tr! && tl === br && tr === bl;
}

// The brand corner inside a brand corner, over every element of the page (a closed panel too),
// before any reference.
function nestedCornerFindings() {
  const branded = new Set([...document.querySelectorAll("body *")].filter(hasBrandCorner));
  const findings: ElementFinding[] = [];
  for (const el of branded) {
    if (el.closest(SKIP)) continue;
    for (let p = el.parentElement; p; p = p.parentElement)
      if (branded.has(p)) {
        findings.push({
          element: "corner",
          label: elementLabel(el),
          prop: "border-radius",
          got: `the brand corner inside ${elementLabel(p)}`,
          want: "the small corner",
        });
        break;
      }
  }
  return findings;
}

// The element the page focused (a story's focused state): an instance holding it is read, and
// its reference too, while the same node holds focus, since a computed style reads the live state.
function initialPageFocus(): PageFocus {
  const node =
    document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : null;
  return { node, visible: node?.matches(":focus-visible") ?? false };
}

/** The node in `copy` at the place `node` holds in `root`. */
function counterpart(root: Element, copy: Element, node: Element) {
  const path: number[] = [];
  for (let n = node; n !== root; n = n.parentElement!)
    path.unshift([...n.parentElement!.children].indexOf(n));
  return path.reduce<Element>((x, i) => x.children[i]!, copy) as HTMLElement;
}

// Each side's focus target: the focus ring's own element, else the page's focused node inside the
// instance and its place in the reference.
function referenceFocus(
  { element, el, clone }: Omit<Reference, "focus">,
  restore: PageFocus,
): ReferenceFocus | null {
  if (element === "focus-ring")
    return {
      got: { node: el as HTMLElement, visible: true },
      want: { node: clone, visible: true },
      restore,
    };
  if (!restore.node || !el.contains(restore.node)) return null;
  return {
    got: restore,
    want: { node: counterpart(el, clone, restore.node), visible: restore.visible },
    restore,
  };
}

/** Clones an instance and locates the reference's focus target before changing the page. */
function cloneElementInstance(instance: Instance, active: PageFocus): Reference {
  const copy = { ...instance, clone: instance.el.cloneNode(true) as HTMLElement };
  return { ...copy, focus: referenceFocus(copy, active) };
}

/** Wraps the reference in a bare box with the class that provides its styling context. */
function referenceWrapper(className: string, inner: Element) {
  const wrap = document.createElement("div");
  wrap.className = className;
  wrap.append(inner);
  return wrap;
}

/** Loose links inherit their rules from an enclosing link group. */
function linkReference({ el, clone }: Reference) {
  return el.classList.contains("hw-link") ? clone : referenceWrapper("hw-links", clone);
}

// A field or button in a field row, or a field under a floating label, takes its parent's
// rules: the reference sits in a bare copy of that parent.
function fieldReference(inner: Element, parent: Element | null) {
  if (!parent?.matches(".hw-field-row, .hw-form-float")) return inner;
  const wrap = referenceWrapper(
    parent.matches(".hw-field-row") ? "hw-field-row" : "hw-form-float",
    inner,
  );
  if (parent.hasAttribute("data-joined")) wrap.setAttribute("data-joined", "");
  return wrap;
}

// A label on a wash takes the wash's hue colours (label.css): the reference sits in a copy of
// that box.
function labelReference(inner: Element, parent: Element | null) {
  const wash = parent?.closest('.hw-status, .hw-callout, .hw-card[data-variant="tint"]');
  if (!wash) return inner;
  const wrap = wash.cloneNode(false) as HTMLElement;
  wrap.removeAttribute("id");
  wrap.removeAttribute("style");
  wrap.append(inner);
  return wrap;
}

/** The wrappers reproducing a reference's context, in order from the clone outwards. */
function referenceFrame(sample: Reference) {
  const { element, el, clone, settings } = sample;
  clone.removeAttribute("id");
  clone.removeAttribute("style");
  for (const [setting, value] of settings) if (value) clone.style.setProperty(setting, value);
  const inner = element === "link" ? linkReference(sample) : clone;
  const field = fieldReference(inner, el.parentElement);
  const wrappers: Partial<Record<string, () => Element>> = {
    label: () => labelReference(field, el.parentElement),
    "focus-ring": () => referenceWrapper("hw-focus-ring", field),
  };
  const frame = document.createElement("div");
  const theme = el.closest("[data-theme]")?.getAttribute("data-theme");
  if (theme) frame.setAttribute("data-theme", theme);
  frame.append(wrappers[element]?.() ?? field);
  return frame;
}

// A table part takes no shadow root and a row no span: the reference to a cell or a row then
// follows the table. Anything inside a cell keeps its reference in the cell, under its type. A
// box's reference follows its target label, which it would otherwise widen.
function referenceAnchor(el: Element) {
  if (el.matches("tr, td, th, thead, tbody, tfoot")) {
    const table = el.closest("table");
    if (table) return table;
  }
  return el.parentElement?.closest(".hw-check-target") ?? el;
}

/** Places one isolated reference with the brand stylesheet beside the instance. */
function mountElementReference(sample: Reference, sheet: CSSStyleSheet): MountedReference {
  const frame = referenceFrame(sample);
  const host = document.createElement("span");
  host.setAttribute("data-hw-reference", "");
  referenceAnchor(sample.el).after(host);
  const root = host.attachShadow({ mode: "open" });
  root.adoptedStyleSheets = [sheet];
  root.append(frame);
  return { ...sample, host };
}

/** Reads an instance or reference and its named parts after focusing its target. */
function readElementSide(el: Element, { own, parts }: ElementStyleRules, focus?: PageFocus) {
  focus?.node?.focus({ focusVisible: focus.visible });
  return {
    own: snapshotStyles(el, own),
    parts: parts.map(({ selector, properties }) => {
      const part = el.querySelector(selector);
      return part && snapshotStyles(part, properties);
    }),
  };
}

/** Findings for one instance and its reference, with the page's original focus restored. */
function readElementPair(
  { el, clone, element, focus }: MountedReference,
  rules: ElementStyleRules,
  tolerance: number,
) {
  // Each side read while its focus target holds focus; the page's own focus back after the pair.
  const actual = readElementSide(el, rules, focus?.got);
  const reference = readElementSide(clone, rules, focus?.want);
  if (focus) {
    focus.want.node?.blur();
    focus.restore.node?.focus({ focusVisible: focus.restore.visible });
  }
  const label = elementLabel(el);
  const findings: ElementFinding[] = [];
  if (element === "focus-ring" && actual.own["outline-style"] === "none")
    findings.push({
      element,
      label,
      prop: "outline-style",
      got: "none",
      want: reference.own["outline-style"]!,
    });
  for (const difference of diffElementStyles(
    { actual: actual.own, reference: reference.own },
    rules.own,
    tolerance,
  ))
    findings.push({ element, label, ...difference });

  rules.parts.forEach(({ selector, properties }, i) => {
    const [got, want] = [actual.parts[i], reference.parts[i]];
    if (!got || !want) return;
    for (const difference of diffElementStyles(
      { actual: got, reference: want },
      properties,
      tolerance,
    ))
      findings.push({ element, label: `${label} ${selector}`, ...difference });
  });
  return findings;
}

/** Runs in the page: each hub element against its reference, as findings plus the exceptions found. */
function compareElementPage(reference: ElementReference) {
  const active = initialPageFocus();
  // In passes, so the page restyles twice rather than once per instance: read every instance's
  // settings and tokens, insert every reference, then read every pair.
  const { instances, findings } = discoverElementInstances(reference);
  findings.push(...nestedCornerFindings());
  // Every clone before any reference goes in, so none holds another instance's reference, and each
  // focus target found while the page's child order is still the clone's.
  const clones = instances.map((instance) => cloneElementInstance(instance, active));
  // A constructed sheet, which no page policy's style-src refuses, as it would a <style>.
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(reference.css);
  const mounted: MountedReference[] = [];
  try {
    for (const clone of clones) mounted.push(mountElementReference(clone, sheet));
    for (const pair of mounted)
      findings.push(...readElementPair(pair, reference.styles[pair.element], reference.tolerance));
  } finally {
    for (const { host } of mounted) host.remove();
  }
  const exceptions = [...document.querySelectorAll("[data-hw-exception]")].map((el) =>
    el.getAttribute("data-hw-exception")!,
  );
  return { findings, seen: [...new Set(instances.map(({ element }) => element))], exceptions };
}

type ElementDom = {
  compare: (reference: ElementReference) => ReturnType<typeof compareElementPage>;
};

/** Installs the named readers with Puppeteer’s evaluateHandle, without a script tag or page global. */
export async function installElementDom(page: Page) {
  const functions = [
    ...elementStyleFunctions,
    elementLabel,
    discoverElementInstances,
    hasBrandCorner,
    nestedCornerFindings,
    initialPageFocus,
    counterpart,
    referenceFocus,
    cloneElementInstance,
    referenceWrapper,
    linkReference,
    fieldReference,
    labelReference,
    referenceFrame,
    referenceAnchor,
    mountElementReference,
    readElementSide,
    readElementPair,
    compareElementPage,
  ];
  const declarations = functions.map((fn) => fn.toString()).join("\n");
  return (await page.evaluateHandle(`(() => {
    const SKIP = ${JSON.stringify(SKIP)};
    ${declarations}
    return { compare: compareElementPage };
  })()`)) as JSHandle<ElementDom>;
}
