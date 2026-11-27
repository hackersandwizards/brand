#!/usr/bin/env bun
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
