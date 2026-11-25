#!/usr/bin/env bun
// The marker check a consumer runs by hand, outside its gate, on pages it serves or builds: every list marker
// measured on the pixels headless Chrome paints. A marker's middle has to sit two thirds of the way
// from the x-height middle of the first line beside it to its cap-height middle (marker.css's
// --hw-marker-mid; the caps' middle beside capitals), and a list item's first line has to start
// where its wrapped lines start.
//
// Each page runs twice, as served and with a newline and an indent opening every list item, as
// prettier-plugin-astro and hand-written HTML leave it, where an inline-block marker kept the
// newline as a space. Each marked line opens with "xxxxHHHH", so the ink of the x's is the x-height
// band and that of the H's the cap-height band; where text-transform sets the line in capitals,
// both are capitals and the target is the caps' middle. Markers found: a square ::before (side up
// to 16px) on a list item or its opening paragraph, an empty square element (up to 16px) followed
// by text in its row that is the brand's .hw-marker or an item's first element, a bullet glyph as a
// ul item's ::before content, and the browser's own marker in a ul. A drawn marker on an item that
// also keeps the browser's own fails, whatever its offset. Not measured: a heading's or
// link's swatch outside a list, an area mark (.hw-mark), and ol numerals, whose digits stand on the
// baseline. A marker inside a [data-hw-exception] whose name brand-elements.json's "exceptions"
// declares, a system's own element, is measured and printed apart, never failing the run; inside any
// other it is measured as every marker is.
//
// The "markers" block of brand-elements.json declares the readings a consumer keeps, each with
// its reason and how many off readings it keeps at most:
//   "markers": { "<glob over the page's path>": { "reason": "...", "off": 6 } }
// The "csp" of brand-elements.json states the policy the consumer's host sends, for every page or
// by the glob over each page's path (elements.ts), and each source a page's policy refuses fails,
// "csp" or the page's own.
// An off reading on a page the glob matches is kept, printed as kept; more off readings there than
// "off" fail, and so does an entry that keeps nothing on a page it matches in this run (stale), so
// a fixed page drops its exception. Fewer pass: a run's count depends on its scales and pages. An
// item with two markers is never kept.
// Exits 1 on a marker off by more than 0.25px, a first line off by more than 0.25px, an item with
// two markers, a page named on the command line with no marker (a zero proves nothing; a story
// page may show none), or a line still drawn in a fallback face after three loads, where the first
// family of its font-family is one the page declares with @font-face; that page is reported and the
// others are still measured.
// Exits 2 on a catalog folder without a story page. Needs Chrome for Testing (CHROME_BINARY overrides).
import { existsSync, readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import type { Browser, BrowserContext } from "puppeteer-core";
import { launch } from "./browser";
import { listedCsp, policies, type Refusal, refusalLine, refusals } from "./browser-csp";
import { loadFactor, pool, tabs } from "./browser-workers";
import {
  listedCatalog,
  listedElementPages,
  listedSite,
  readElementsConfig,
} from "./elements-config";
import { answerHelp, isRecord } from "./help";
import { placeAnchor, readableProbes, readMarkerPixels } from "./marker-capture";
import { drawn, FallbackFace, hasMarkers, type MeasureOptions } from "./marker-page";
import { applyExceptions, type Reading, readingLine } from "./marker-readings";
import { catalogPages, serve, toUrl } from "./site";

const USAGE = `usage: brand-markers [--scale 2,4] [--width 1280] [--site <folder> [--site-at <path>] | --base <url>] [--catalog <folder> [--catalog-at <page>]] [--json] [<url, html file or site path>...]
--site serves a built folder on a free port, at --site-at where it was built for a base path such
as /mail/ (also for brand-elements.json's "site"), and a page starting with / is a path on it;
--base names a server the gate started instead. --catalog adds every story page of a built catalog folder, each named below --catalog-at,
by default the folder itself, or its path on --site. brand-elements.json in the working directory
gives the rest, so a consumer names its pages once: its "site" where none of --site, --base and
--catalog is given, its "catalog" with its "exclude" where --catalog is not, and its "pages" where
no page is named, each measured where it shows a marker, as a story is (a site path only where a
site or --base serves it); a run of those that finds no marker at all fails.`;

export const TOLERANCE = 0.25; // CSS px
// Where the marker's middle sits from the x-height middle (0) to the cap-height middle (1): the
// default of --hw-marker-mid in marker.css, 1ex / 6 + 1cap / 3.
export const CAP_SHARE = 2 / 3;

// Written as "not within" so a NaN offset, from a marker and a text that both show no ink, fails.
export const failing = (r: Reading) =>
  r.double ||
  !(Math.abs(r.offset) <= TOLERANCE) ||
  (r.indent !== null && !(Math.abs(r.indent) <= TOLERANCE));

/** Every marker on one page, at one device scale, how far it sits off its line and how far its
 * first line starts right of the wrapped lines, in CSS px, after `css` is added. */
export async function measureMarkers(
  browser: Browser | BrowserContext,
  url: string,
  options: MeasureOptions = {},
): Promise<Reading[]> {
  const { scale = 4, newline = false, refused, excepted } = options;
  const { page, found } = await drawn(browser, url, options);
  try {
    if (excepted && (await found.evaluate((f) => f.excepted))) excepted.add(url);
    const out: Reading[] = [];
    for (const { probe: p, index } of await readableProbes(found)) {
      const at = await placeAnchor(found, index);
      const { x, caps, middle } = await readMarkerPixels(page, p, at);
      out.push({
        page: url,
        label: p.label,
        kind: p.kind,
        scale,
        newline,
        offset: middle - (x + CAP_SHARE * (caps - x)),
        indent: p.indent,
        double: p.double,
        ...(p.exception && { exception: p.exception }),
      });
    }
    if (refused) refused.push(...(await refusals(page, url)));
    return out;
  } finally {
    await page.close();
  }
}

if (import.meta.main) {
  answerHelp(USAGE);
  const args = process.argv.slice(2);
  const opt = (name: string, fallback: string) => {
    const i = args.indexOf(name);
    return i < 0 ? fallback : args.splice(i, 2)[1]!;
  };
  const scales = opt("--scale", "2,4").split(",").map(Number);
  const width = Number(opt("--width", "1280"));
  const flagSite = opt("--site", "");
  const flagSiteAt = opt("--site-at", "");
  const flagBase = opt("--base", "");
  const flagCatalog = opt("--catalog", "");
  const flagAt = opt("--catalog-at", "");
  const json = args.includes("--json");
  const named = args.filter((a) => a !== "--json");
  const externalBase = flagBase ? (URL.parse(flagBase) ?? undefined) : undefined;
  if (flagBase && !/^https?:$/.test(externalBase?.protocol ?? "")) {
    console.error(USAGE);
    process.exit(2);
  }
  let site;
  let catalog;
  let listedPages;
  let csp;
  let exceptions;
  let markerExceptions;
  let stories: string[] = [];
  try {
    const config = existsSync("brand-elements.json")
      ? readElementsConfig(readFileSync("brand-elements.json", "utf8"))
      : {};
    const listed = flagCatalog ? {} : listedCatalog({ catalog: config.catalog });
    catalog = flagCatalog || listed.dir;
    const at = flagAt || listed.at;
    site = listedSite(flagSite || (flagBase || flagCatalog ? undefined : config.site), flagSiteAt);
    listedPages = named.length ? [] : listedElementPages(config.pages);
    csp = listedCsp(config.csp);
    if (csp !== undefined) policies(csp);
    if (config.exceptions != null && !isRecord(config.exceptions))
      throw new Error('brand-elements.json "exceptions": expected an object');
    exceptions = Object.keys(config.exceptions ?? {});
    if (config.markers !== undefined && !isRecord(config.markers))
      throw new Error('brand-elements.json "markers": expected an object');
    markerExceptions = config.markers;
    if (catalog)
      stories = catalogPages({ dir: catalog, at, exclude: listed.exclude }, site, externalBase);
  } catch (e) {
    console.error(`brand-markers: ${(e as Error).message}`);
    process.exit(2);
  }
  // The config's pages where none is named, each measured, like a story, where it shows a marker;
  // a site path only where a site or --base serves it, as brand-elements takes --base from its gate.
  const served = !!site || !!flagBase;
  const searched = listedPages.filter((p) => served || !p.startsWith("/"));
  for (const p of listedPages.filter((p) => !searched.includes(p)))
    console.error(`brand-markers: ${p}: a site path, but no site or --base; not measured`);
  stories = [...searched, ...stories];
  if (!named.length && !stories.length) {
    console.error(USAGE);
    process.exit(2);
  }
  const server = site ? serve(site.dir, site.at) : undefined;
  const base = server?.url ?? externalBase;
  const browser = await launch();
  const pages = [...named, ...stories].map((a) => toUrl(a, base));
  const refused: Refusal[] = [];
  const excepted = new Set<string>();
  const fallbacks = new Map<string, string>();
  // Every page at every scale, with and without the newline, run side by side: one run per core, at
  // most 8, as a run at 4x holds a 5120 x 3600 surface, divided by the load factor, at least 2. A
  // first pass, one load per story at the first scale, finds the stories with a marker, most having
  // none; only those, and every page named, take the measured runs. It mostly waits for the network
  // to go quiet: `tabs`, at least four per worker, the workers' contexts shared.
  const cores = availableParallelism();
  const workers = Math.min(
    Math.max(2, Math.round(Math.min(cores, 8) / loadFactor())),
    cores,
    pages.length,
  );
  let readings: Reading[];
  try {
    // A context per worker: puppeteer shoots one page of a context at a time.
    const contexts = await Promise.all(
      Array.from({ length: workers }, () => browser.createBrowserContext()),
    );
    const stories = pages.slice(named.length);
    const marked = await pool(stories, tabs(4 * workers), (url, w) =>
      hasMarkers(contexts[w % workers]!, url, {
        scale: scales[0],
        width,
        csp,
        refused,
      }),
    );
    const runs = [...pages.slice(0, named.length), ...stories.filter((_, i) => marked[i])].flatMap(
      (url) => scales.flatMap((scale) => [false, true].map((newline) => ({ url, scale, newline }))),
    );
    readings = (
      await pool(runs, workers, async ({ url, ...options }, w) =>
        fallbacks.has(url)
          ? []
          : measureMarkers(contexts[w]!, url, {
              ...options,
              width,
              csp,
              // Once per page: a story's in the first pass, a named page's in its first run.
              refused:
                options.scale === scales[0] && !options.newline && !stories.includes(url)
                  ? refused
                  : undefined,
              exceptions,
              excepted,
            }).catch((e) => {
              if (!(e instanceof FallbackFace)) throw e;
              // A story's refusals came from the first pass.
              if (!fallbacks.has(url) && !stories.includes(url)) refused.push(...e.refused);
              fallbacks.set(url, e.message);
              return [];
            }),
      )
    ).flat();
  } finally {
    await browser.close();
    await server?.stop(true);
  }
  // A marker inside a declared [data-hw-exception] counts as found: the page names its own marks.
  const empty = pages
    .slice(0, named.length)
    .filter(
      (url) => !readings.some((r) => r.page === url) && !excepted.has(url) && !fallbacks.has(url),
    );
  // Only searched pages and stories, none showing a marker: a run that measures nothing passes
  // nothing.
  const nothing =
    stories.length > 0 &&
    !readings.length &&
    !excepted.size &&
    !stories.some((p) => fallbacks.has(toUrl(p, base)));
  if (nothing)
    console.error(
      `brand-markers: no marker on any page of brand-elements.json "pages"${catalog ? " or its catalog" : ""}`,
    );
  const apart = readings.filter((r) => r.exception);
  const { bad, kept, findings } = applyExceptions(
    readings.filter((r) => !r.exception && failing(r)),
    markerExceptions,
    pages,
  );
  for (const f of findings) console.error(f);
  for (const r of refused) console.error(refusalLine(r));
  for (const message of fallbacks.values()) console.error(message);
  if (json) console.log(JSON.stringify(readings, null, 2));
  else {
    for (const r of kept)
      console.log(
        `kept: ${r.page} ${r.label} ${r.offset.toFixed(2)} px off (brand-elements.json "markers")`,
      );
    for (const r of apart.filter(failing))
      console.log(`declared exception "${r.exception}": ${readingLine(r)}`);
    for (const r of bad) console.error(readingLine(r));
    for (const url of empty) console.error(`${url}: no marker found`);
    console.log(
      `brand-markers: ${readings.length} readings on ${pages.length} pages, ${bad.length} off by more than ${TOLERANCE} px, ${kept.length} kept` +
        (apart.length
          ? `, ${apart.length} inside declared exceptions, ${apart.filter(failing).length} off`
          : ""),
    );
  }
  process.exit(
    bad.length || empty.length || findings.length || refused.length || fallbacks.size || nothing
      ? 1
      : 0,
  );
}
