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
import { existsSync, readFileSync, statSync } from "node:fs";
import { launch } from "./browser";
import { listedCsp, policies, refusalLine } from "./browser-csp";
import { pool, tabs } from "./browser-workers";
import { exceptionFindings, listedElementExceptions } from "./element-exceptions";
import { elementPage, measureLightPage, measurePage, type PageResult } from "./element-page";
import { sourceFindings } from "./element-source";
import {
  type Config,
  LIST,
  listedCatalog,
  listedElementPages,
  listedSite,
  readElementsConfig,
} from "./elements-config";
import { answerHelp } from "./help";
import { catalogPages, serve } from "./site";
import { listTree, skippedReport } from "./tree";

const USAGE = `usage: brand-elements [--base <url>] [--json]
Measures the shared elements on the pages and catalog brand-elements.json names. Exits 1 on any
finding, and on a named page with no hub element (a zero proves nothing; a story page may show
none). Exits 2 on a config naming no page and on a catalog folder without a story page. Needs
Chrome for Testing (CHROME_BINARY overrides).`;

if (import.meta.main) {
  answerHelp(USAGE);
  const json = process.argv.includes("--json");
  if (!existsSync(LIST)) {
    console.error(`brand-elements: no ${LIST} in ${process.cwd()}`);
    process.exit(2);
  }
  const i = process.argv.indexOf("--base");
  const externalBase = i >= 0 ? (URL.parse(process.argv[i + 1] ?? "") ?? undefined) : undefined;
  if (i >= 0 && !/^https?:$/.test(externalBase?.protocol ?? "")) {
    console.error(USAGE);
    process.exit(2);
  }
  let config: Config;
  let site: ReturnType<typeof listedSite>;
  let stories: string[] = [];
  try {
    const raw = readElementsConfig(readFileSync(LIST, "utf8"));
    if (raw.lightOnly != null && typeof raw.lightOnly !== "boolean")
      throw new Error(`${LIST} "lightOnly": expected a boolean`);
    config = {
      pages: listedElementPages(raw.pages),
      exceptions: listedElementExceptions(raw.exceptions),
      lightOnly: raw.lightOnly === true,
      csp: listedCsp(raw.csp),
    };
    const { dir, at, exclude } = listedCatalog({ catalog: raw.catalog });
    site = listedSite(raw.site);
    if (config.csp !== undefined) policies(config.csp);
    if (dir) stories = catalogPages({ dir, at, exclude }, site, externalBase);
  } catch (e) {
    console.error(`brand-elements: ${(e as Error).message}`);
    process.exit(2);
  }
  const named = config.pages;
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
  const base = externalBase ?? server?.url;
  const browser = await launch();
  const results: PageResult[] = [];
  try {
    // Tabs side by side, at least 8: each page mostly waits for the network to go quiet.
    const measure = config.lightOnly ? measureLightPage : measurePage;
    results.push(
      ...(await pool(pages, tabs(8), (url) =>
        measure(browser, { ...elementPage(url, base), csp: config.csp }),
      )),
    );
  } finally {
    await browser.close();
    await server?.stop(true);
  }
  const rendered = results.flatMap((r) => r.findings);
  const unstyled = results.flatMap((r) => r.unstyled);
  const refused = results.flatMap((r) => r.refused);
  const empty = named.filter((url, i) => {
    const result = results[i];
    if (result === undefined) throw new Error(`Element scan result missing: ${url}`);
    return result.seen.length === 0;
  });
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
