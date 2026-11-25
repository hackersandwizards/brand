import type { Browser, Page } from "puppeteer-core";
import { addCss, focusAll, open, openFolds } from "./browser";
import { type Csp, refusals } from "./browser-csp";
import { definedClasses, unstyledBrandClasses } from "./element-classes";
import { type ElementFinding, type ElementReference, installElementDom } from "./element-dom";
import { elementStyleRules, OWNS } from "./element-properties";
import { DAY_TOKENS, ELEMENT_CSS, ELEMENTS, SETTINGS, TOKENS } from "./element-rules";
import { toUrl } from "./site";

export const TOLERANCE = 0.02; // CSS px
export type Finding = { page: string } & ElementFinding;

/** A page's name in the report and the address and policy used to open it. */
export type ElementPage = { name: string; url: string; csp?: Csp };

/** Resolves the report name and URL: a page starting with / is a path on the served `site`. */
export function elementPage(name: string, site?: URL): ElementPage {
  return { name, url: toUrl(name, site) };
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
async function readUnstyledClasses(page: Page, cdp: Awaited<ReturnType<typeof focusAll>>) {
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
  const used = new Map(await page.evaluate(usedClasses));
  return unstyledBrandClasses(used, defined);
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

/** Creates a page scanner with a fixed table of required brand tokens. */
function pageMeasure(tokens: ElementReference["tokens"]) {
  const rules: ElementReference = { ...reference, tokens };
  return async function measureElementPage(
    browser: Browser,
    { name, url, csp }: ElementPage,
    css = "",
  ) {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 900 });
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      // Every tab holds focus as the one in front does, so the focus ring reads in pages run side by side.
      const cdp = await focusAll(page);
      await open(page, url, csp);
      if (css) await addCss(page, css);
      const unstyled = (await readUnstyledClasses(page, cdp)).map((f) => ({ page: name, ...f }));
      await page.evaluate(openFolds);
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      // Before the references, which draw brand's own images.
      const refused = await refusals(page, name);
      const out = await measureReferences(page, rules);
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
  };
}

export type PageResult = Awaited<ReturnType<typeof measurePage>>;

/** One page's comparison, with its exceptions, after `css` is added. */
export const measurePage = pageMeasure(TOKENS);

/** Measures a light-only page after `css` is added. `lightOnly` checks day tokens only. */
export const measureLightPage = pageMeasure(DAY_TOKENS);
