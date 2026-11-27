import puppeteer, { type HTTPRequest, type HTTPResponse, type Page } from "puppeteer-core";
import { findChrome, NO_KEYCHAIN } from "../applications/linkedin-visuals/render";
import { attachCsp, type Csp, recordRefusals } from "./browser-csp";
import { loadFactor } from "./browser-workers";

/** Opens `url` and throws where a stylesheet of its own (its origin's or a file) fails to load: an
 *  unstyled page shows the browser's own list markers and spacing, as a build linking file://
 *  stylesheets does when served over http with --site. A third party's sheet, such as a web font
 *  service's, may fail offline without reddening the run. A page answering 4xx or 5xx throws too:
 *  a missing story would otherwise pass as one showing nothing. `csp`, the policy the consumer's
 *  host sends (brand-elements.json "csp"), is added to every document's response, a file's
 *  included, by the document's own path where it names globs; a document of this page's origin no
 *  glob matches throws, as it would otherwise pass under no policy. Each refusal of the page's policies is recorded for `refusals`. */
export async function open(page: Page, url: string, csp?: Csp) {
  await page.evaluateOnNewDocument(recordRefusals);
  const origin = new URL(url).origin;
  const unmatched = csp === undefined ? [] : await attachCsp(page, origin, csp);
  const missing: string[] = [];
  const failed = (r: HTTPRequest) => {
    const u = new URL(r.url());
    if (r.resourceType() === "stylesheet" && (u.protocol === "file:" || u.origin === origin)) {
      const address = r.url();
      const failure = r.failure();
      missing.push(address + (failure ? ` (${failure.errorText})` : ""));
    }
  };
  const status = (r: HTTPResponse) => r.status() >= 400 && failed(r.request());
  page.on("requestfailed", failed).on("response", status);
  try {
    const answer = await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30_000 * loadFactor(),
    });
    if (answer && answer.status() >= 400)
      throw new Error(
        `${url}: HTTP ${answer.status()} prevented the check from opening the page. Fix the route on the scan server or correct the URL in brand-elements.json or the command arguments.`,
      );
    if (unmatched.length)
      throw new Error(
        `brand-elements.json "csp": no glob matches ${unmatched.join(", ")}; name the policy your host sends there`,
      );
  } finally {
    page.off("requestfailed", failed).off("response", status);
  }
  if (missing.length)
    throw new Error(
      `${url}: stylesheet not loaded: ${missing.join(", ")}. Fix the stylesheet URL or serve the stylesheet at that URL so the check can measure the styled page.`,
    );
}

/** Runs in the page: opens every closed <details>, whose contents are drawn only once it opens. Not
 * a header's or nav's disclosure: a site's menu script may hold the page while one is open. */
export function openFolds() {
  for (const d of document.querySelectorAll("details:not(header details, nav details)"))
    (d as HTMLDetailsElement).open = true;
}

/** Adds `css` as a constructed sheet, which no style-src of the page's policy refuses. */
export const addCss = (page: Page, css: string) =>
  page.evaluate((text) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(text);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }, css);

/** Lets `page` hold focus and draw its frames as the tab in front does, so tabs run side by side. */
export const focusAll = async (page: Page) => {
  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  return cdp;
};

export const launch = () =>
  puppeteer.launch({ executablePath: findChrome(), headless: true, args: NO_KEYCHAIN });
