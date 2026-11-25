import type { Browser, Page } from "puppeteer-core";
import { addCss, focusAll, open, openFolds } from "./browser";
import { type Csp, refusals } from "./browser-csp";
import { definedClasses, isBrandClass } from "./element-classes";
import { type ElementReference, installElementDom } from "./element-dom";
import { OWNS } from "./element-properties";
import { DAY_TOKENS, ELEMENT_CSS, ELEMENTS, SETTINGS, TOKENS } from "./element-rules";
import type { ElementStyleRules, StyleDifference } from "./element-values";
import { toUrl } from "./site";

export const TOLERANCE = 0.02; // CSS px
export type Finding = { page: string } & StyleDifference;

/** A page's name in the report and the address and policy used to open it. */
export type ElementPage = { name: string; url: string; csp?: Csp };

/** Resolves the navigation address while retaining the page name from the scan. */
export function elementPage(name: string, site?: URL, csp?: Csp): ElementPage {
  return { name, url: toUrl(name, site), csp };
}

/** Property rules indexed by element so each instance reads only its own parts. */
function elementStyleRules(owned: Record<string, string[]>) {
  const rules: Record<string, ElementStyleRules> = {};
  for (const [key, properties] of Object.entries(owned)) {
    const [element, ...rest] = key.split(" ");
    const entry = (rules[element] ??= { own: [], parts: [] });
    if (rest.length) entry.parts.push({ selector: rest.join(" "), properties });
    else entry.own = properties;
  }
  return rules;
}

const styles = elementStyleRules(OWNS);
const reference = {
  css: ELEMENT_CSS,
  selectors: ELEMENTS,
  styles,
  settings: SETTINGS,
  tolerance: TOLERANCE,
};

// Each class with the element it first appears on. The catalog shell's markup is the shell's
// (scaffolding's), as for the elements.
function usedClasses() {
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
}

/** The page's brand classes that have no rule in any loaded stylesheet. */
async function readUnstyledClasses(
  page: Page,
  cdp: Awaited<ReturnType<typeof focusAll>>,
  url: string,
) {
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
  const used = await page.evaluate(usedClasses);
  return used
    .filter(([cls]) => isBrandClass(cls) && !defined.has(cls))
    .map(([cls, label]) => ({ page: url, cls, label }));
}

/** Reads the live page against the brand reference in one browser task. */
async function measureReferences(page: Page, rules: ElementReference) {
  const dom = await installElementDom(page);
  try {
    return await dom.evaluate((api, rules) => api.compare(rules), rules);
  } finally {
    await dom.dispose();
  }
}

type ElementPageDocument = ElementPage & { css?: string };

/** Opens a scan target and returns the measurements and findings on its rendered document. */
async function checkElementPage(
  browser: Browser,
  { name, url, csp, css }: ElementPageDocument,
  tokens: ElementReference["tokens"],
) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    // Every tab holds focus as the one in front does, so the focus ring reads in pages run side by side.
    const cdp = await focusAll(page);
    await open(page, url, csp);
    if (css) await addCss(page, css);
    const unstyled = await readUnstyledClasses(page, cdp, name);
    await page.evaluate(openFolds);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    // Before the references, which draw brand's own images.
    const refused = await refusals(page, name);
    const out = await measureReferences(page, { ...reference, tokens });
    return {
      ...out,
      page: name,
      findings: out.findings.map((f): Finding => ({ page: name, ...f })),
      unstyled,
      refused,
    };
  } finally {
    await page.close();
  }
}

/** One page's comparison, with its exceptions, after `css` is added; `lightOnly` checks day tokens only,
 * and a page starting with / is a path on the served `site`. */
export type PageResult = Awaited<ReturnType<typeof measurePage>>;

/** Measures a page against both themes' brand rules. */
export function measurePage(browser: Browser, source: string | ElementPage, css = "") {
  const target = typeof source === "string" ? elementPage(source) : source;
  return checkElementPage(browser, { ...target, css }, TOKENS);
}

/** Measures a light-only page against the brand rules it can draw. */
export function measureLightPage(browser: Browser, source: string | ElementPage, css = "") {
  const target = typeof source === "string" ? elementPage(source) : source;
  return checkElementPage(browser, { ...target, css }, DAY_TOKENS);
}
