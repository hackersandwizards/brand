import type { Browser, BrowserContext, JSHandle, Page } from "puppeteer-core";
import { addCss, focusAll, open, openFolds } from "./browser";
import { type Csp, type Refusal, refusals } from "./browser-csp";
import { type Found, installMarkerDom } from "./marker-dom";

/** `csp` renders every page under the consumer's policy; the refusals go to `refused`, and the
 * page's url to `excepted` where it shows a marker inside a [data-hw-exception] whose name is in
 * `exceptions`, brand-elements.json's "exceptions". */
type Options = {
  scale?: number;
  width?: number;
  csp?: Csp;
  refused?: Refusal[];
  exceptions?: string[];
  excepted?: Set<string>;
};

export type MeasureOptions = Options & { newline?: boolean; css?: string };

/** Runs in the page: rewrites the line beside each marker and returns the boxes to read, with the
 * element each probe of the same index scrolls into view; with `count`, only how many markers it
 * finds, the page's lines left as they are but for the newline. The boxes are read two frames after
 * the rewrite, once a script that refits the page to its longer lines (a slide's fit guard, run by
 * a ResizeObserver) has done so. The count pass calls discovery directly. */
async function collectMarkerProbes(
  page: Page,
  { newline = false, exceptions = [] }: MeasureOptions,
) {
  const dom = await installMarkerDom(page);
  try {
    // Discovery and rewriting run together before the page's own scripts can alter the matches.
    return await dom.evaluateHandle(
      async (api, indent, declared) => {
        if (indent) api.insertNewlines();
        const matches = api.findMarkers(declared);
        await api.rewriteLines(matches);
        return api.buildProbes(matches);
      },
      newline,
      exceptions,
    );
  } finally {
    await dom.dispose();
  }
}

/** The page with its lines rewritten, each probe's line drawn in the first family its font-family
 * names where the page declares that family with @font-face: a line drawn in a fallback face reads
 * the fallback's x-height. document.fonts.ready may resolve, and the face report loaded, while a
 * line still shows the fallback; the page is opened afresh twice, then throws FallbackFace. */
export async function drawn(
  browser: Browser | BrowserContext,
  url: string,
  options: MeasureOptions,
) {
  for (let tries = 1; ; tries++) {
    const page = await prepare(browser, url, options);
    try {
      const found = await collectMarkerProbes(page, options);
      const miss = await fallbackFace(page, found);
      if (!miss) return { page, found };
      if (tries === 3)
        throw new FallbackFace(
          `${url}: page drawn in fallback font ${miss.face}; ${miss.family} missed font-display's block period`,
          await refusals(page, url),
        );
    } catch (e) {
      await page.close();
      throw e;
    }
    await page.close();
  }
}

/** A page still drawn in a fallback face after three loads: a finding on that page alone, with the
 *  sources its policy refused, a blocked font among them. */
export class FallbackFace extends Error {
  readonly refused: Refusal[];
  constructor(message: string, refused: Refusal[]) {
    super(message);
    this.refused = refused;
  }
}

/** The first probe line drawn in no downloaded face although its first family is one the page
 * declares, with the face Chrome drew it in; undefined where every line shows its web face. */
async function fallbackFace(page: Page, found: JSHandle<Found>) {
  // Each line's element marked with the first family it names, where the page declares that family:
  // a node id comes from the CDP session alone, so the elements are found again by the mark.
  const marked = await found.evaluate(({ texts }) => {
    const name = (family: string) =>
      family
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase();
    const declared = new Set([...document.fonts].map((f) => name(f.family)));
    let n = 0;
    for (const el of new Set(texts)) {
      const first = getComputedStyle(el).fontFamily.split(",")[0]!.trim();
      if (!declared.has(name(first))) continue;
      el.setAttribute("data-hw-font-probe", first.replace(/^["']|["']$/g, ""));
      n++;
    }
    return n;
  });
  if (!marked) return;
  const cdp = await page.createCDPSession();
  try {
    const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
      nodeId: root.nodeId,
      selector: "[data-hw-font-probe]",
    });
    await cdp.send("CSS.enable");
    for (const nodeId of nodeIds) {
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      if (fonts.length && !fonts.some((f) => f.isCustomFont)) {
        const { attributes } = await cdp.send("DOM.getAttributes", { nodeId });
        const family = attributes[attributes.indexOf("data-hw-font-probe") + 1];
        return { face: fonts[0]!.familyName, family };
      }
    }
  } finally {
    await cdp.detach();
    await found.evaluate(({ texts }) => {
      for (const el of texts) el.removeAttribute("data-hw-font-probe");
    });
  }
}

/** A new tab on `url` as both passes read it: settled (reduced motion), `css` added, fonts loaded
 * and every fold open, as a closed panel's lists are markers too. */

async function prepare(
  browser: Browser | BrowserContext,
  url: string,
  { scale = 4, width = 1280, css = "", csp }: Options & { css?: string } = {},
) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height: 900, deviceScaleFactor: scale });
    // The settled layout: a scroll reveal still moving at screenshot time reads a marker off.
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    // Every tab draws its frames as the one in front does: a tab behind another of its context
    // otherwise waits seconds for the two frames the refusals are read after.
    await focusAll(page);
    await open(page, url, csp);
    if (css) await addCss(page, css);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.evaluate(openFolds);
    return page;
  } catch (e) {
    await page.close();
    throw e;
  }
}

/** Whether a page shows a marker brand-markers would measure at `scale`, as served or with the
 * newline: one load, where measureMarkers takes one per newline. A superset of the pages that give
 * a reading, as a found marker may still be skipped as decoration. */
export async function hasMarkers(
  browser: Browser | BrowserContext,
  url: string,
  { scale = 4, width = 1280, csp, refused }: Options = {},
) {
  const page = await prepare(browser, url, { scale, width, csp });
  try {
    if (refused) refused.push(...(await refusals(page, url)));
    // The newline only adds blank text, so the second count runs on the same page.
    const dom = await installMarkerDom(page);
    if (await dom.evaluate((api) => api.findMarkers().length > 0)) return true;
    return await dom.evaluate((api) => {
      api.insertNewlines();
      return api.findMarkers().length > 0;
    });
  } finally {
    await page.close();
  }
}
