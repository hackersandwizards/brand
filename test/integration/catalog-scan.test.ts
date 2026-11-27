import { limit } from "@hackersandwizards/scaffolding/test-timeout";
import { afterAll, expect, test } from "vitest";
import { z } from "astro/zod";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import own from "../../package.json";
import { elementCss } from "../../scan/element-rules";
import { ROOT } from "../../scripts/git";

// A built catalog as scaffolding writes it: a home that frames its stories, and one folder per
// story state under stories/. The planted fork (corner 2px, padding 3px) and the lifted list (7px)
// sit in story pages only, so a run over the home alone reads neither.
const css = ["generated/tokens.root.css", "tokens/marker.css"]
  .map((f) => readFileSync(join(ROOT, f), "utf8"))
  .concat(elementCss())
  .join("\n");
const html = (body: string, style = "") =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${css}
body { font-family: var(--font-sans); font-size: 16px; } ${style}</style></head><body>${body}</body></html>`;
const list = (lift: number) =>
  `<ul class="hw-marker-list"><li><span style="position:relative;top:${lift}px">One</span></li><li>Two</li></ul>`;
const dir = mkdtempSync(join(tmpdir(), "brand-catalog-scan-"));
const write = (path: string, body: string) => {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), body);
};
const STORIES = {
  "Cards/Fork/default": html(
    `<div class="hw-card">Forked</div>`,
    ".hw-card { border-radius: 2px !important; padding: 3px !important }",
  ),
  "Text/Plain/default": html("<p>No element here.</p>"),
  "Lists/Lifted/default": html(list(-7)),
};
write(
  "site/catalog/index.html",
  html(
    `<div data-hw-tile="card" data-hw-version="${own.version}"><div class="hw-card">${list(0)}</div></div>` +
      Object.keys(STORIES)
        .map((s) => `<iframe src="stories/${s}/index.html"></iframe>`)
        .join(""),
  ),
);
for (const [s, body] of Object.entries(STORIES))
  write(`site/catalog/stories/${s}/index.html`, body);
write("empty/catalog/index.html", html("<p>No stories.</p>"));
// A catalog that is not the site's home leaves forwarding pages under its old path: no story.
write(
  "empty/catalog/stories/Cards/Fork/default/index.html",
  '<meta http-equiv="refresh" content="0; url=/stories/Cards/Fork/default/">',
);
// brand-elements reads its source half from a Git checkout.
Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const run = (script: string, args: string[] = []) => {
  const r = Bun.spawnSync(["bun", join(ROOT, "scan", script), ...args], { cwd: dir });
  return { code: r.exitCode, out: r.stdout.toString(), err: r.stderr.toString() };
};
const renderedPage = z.object({ page: z.string() });
const markerReading = renderedPage.extend({ offset: z.number() });
const elementsReport = z.object({ rendered: z.array(renderedPage), empty: z.array(z.string()) });
const elements = (config: object, args: string[] = []) => {
  write("brand-elements.json", JSON.stringify(config));
  const r = run("elements.ts", ["--json", ...args]);
  return {
    ...r,
    get json() {
      return elementsReport.parse(JSON.parse(r.out));
    },
  };
};
const forkPages = (rendered: { page: string }[]) => [...new Set(rendered.map((f) => f.page))];
const markerReadings = (out: string) => z.array(markerReading).parse(JSON.parse(out));

test(
  "brand-elements: the home alone misses a story's fork, the catalog key finds it",
  () => {
    const home = elements({ pages: ["site/catalog/index.html"] });
    expect([home.code, home.json.rendered.length]).toEqual([0, 0]);
    const all = elements({ pages: ["site/catalog/index.html"], catalog: "site/catalog" });
    expect(all.code).toBe(1);
    expect(all.json.rendered.length).toBeGreaterThan(0);
    // A story without a shared element is no empty page: most stories show none.
    expect(all.json.empty).toEqual([]);
    expect(forkPages(all.json.rendered)).toEqual([
      "site/catalog/stories/Cards/Fork/default/index.html",
    ]);
  },
  limit(60_000),
);

test(
  "brand-elements: on a served site a story is a path below the catalog's, or below its at",
  () => {
    for (const catalog of ["site/catalog", { dir: "site/catalog", at: "/catalog/" }]) {
      const r = elements({ site: "site", pages: ["/catalog/"], catalog });
      expect(r.code).toBe(1);
      expect(forkPages(r.json.rendered)).toEqual(["/catalog/stories/Cards/Fork/default/"]);
    }
  },
  limit(60_000),
);

test(
  "brand-elements: a story the server does not answer fails rather than passing as empty",
  () => {
    const r = elements({
      site: "site",
      pages: [],
      catalog: { dir: "site/catalog", at: "/catlog/" },
    });
    expect(r.code).not.toBe(0);
    expect(r.err).toMatch(
      /http:\/\/127\.0\.0\.1:\d+\/catlog\/stories\/[^/]+\/[^/]+\/default\/: HTTP 404 prevented the check from opening the page\. Fix the route on the scan server or correct the URL in brand-elements\.json or the command arguments\./,
    );
  },
  limit(60_000),
);

// A consumer leaves out a story group another repository owns; its own stories stay measured.
test(
  "brand-elements and brand-markers: an exclude glob leaves its stories out, the rest stay",
  () => {
    const cut = elements({
      pages: [],
      catalog: { dir: "site/catalog", exclude: ["Cards/**"] },
    });
    expect(cut.json.rendered).toEqual([]);
    // Control: the glob of another group leaves the fork in.
    const kept = elements({ pages: [], catalog: { dir: "site/catalog", exclude: ["Text/**"] } });
    expect(forkPages(kept.json.rendered)).toEqual([
      "site/catalog/stories/Cards/Fork/default/index.html",
    ]);
    const markers = (exclude: string[]) => {
      write("brand-elements.json", JSON.stringify({ catalog: { dir: "site/catalog", exclude } }));
      const r = run("markers.ts", ["--scale", "2", "--json"]);
      return markerReadings(r.out).map((x) => x.page);
    };
    expect(markers(["Lists/**"]).filter((p) => p.includes("Lifted"))).toEqual([]);
    expect(markers([]).filter((p) => p.includes("Lifted")).length).toBeGreaterThan(0);
    rmSync(join(dir, "brand-elements.json"));
  },
  limit(60_000),
);

test("a catalog exclusion that matches no story gives the config repair", () => {
  const stale = elements({ pages: [], catalog: { dir: "site/catalog", exclude: ["Slides/**"] } });
  expect([stale.code, stale.err.trim()]).toEqual([
    2,
    'brand-elements: exclude "Slides/**" matches no story under site/catalog/stories, so it skips nothing. Remove or correct this glob in brand-elements.json "catalog.exclude" using paths relative to the stories folder.',
  ]);
  expect(elements({ pages: [], catalog: { dir: "site/catalog", exclude: "Cards/**" } }).code).toBe(
    2,
  );
});

const markerOff = (out: string) => markerReadings(out).filter((r) => !(Math.abs(r.offset) <= 0.25));
const liftedPages = (out: string) => forkPages(markerOff(out));

test(
  "brand-markers: the home alone misses a story's lifted list, --catalog reads it",
  () => {
    rmSync(join(dir, "brand-elements.json"), { force: true });
    const home = run("markers.ts", ["--scale", "2", "--json", "site/catalog/index.html"]);
    expect([home.code, markerOff(home.out)]).toEqual([0, []]);
    const all = run("markers.ts", [
      "--scale",
      "2",
      "--catalog",
      "site/catalog",
      "--json",
      "site/catalog/index.html",
    ]);
    expect(all.code).toBe(1);
    const pages = liftedPages(all.out);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toContain("/stories/Lists/Lifted/default/index.html");
  },
  limit(60_000),
);

// Without --catalog, the catalog brand-elements.json names, on its site where it has one.
test.each([
  {
    kind: "files",
    config: { catalog: "site/catalog" },
    expected: /^file:.*\/stories\/Lists\/Lifted\/default\/index\.html$/,
  },
  {
    kind: "site",
    config: { site: "site", catalog: "site/catalog" },
    expected: /^http:\/\/[^/]+\/catalog\/stories\/Lists\/Lifted\/default\/$/,
  },
])(
  "brand-markers: reads the configured catalog as $kind",
  ({ config, expected }) => {
    write("brand-elements.json", JSON.stringify(config));
    const listed = run("markers.ts", ["--scale", "2", "--json"]);
    expect(listed.code).toBe(1);
    expect(liftedPages(listed.out)).toEqual([expect.stringMatching(expected)]);
  },
  limit(60_000),
);

test(
  "brand-markers: an empty --catalog is a usage error",
  () => {
    rmSync(join(dir, "brand-elements.json"), { force: true });
    expect(run("markers.ts", ["--catalog", "empty/catalog"]).code).toBe(2);
  },
  limit(60_000),
);

test(
  "brand-markers: an empty configured catalog is a usage error with an explicit page",
  () => {
    write("brand-elements.json", JSON.stringify({ catalog: "empty/catalog" }));
    expect(run("markers.ts", ["site/catalog/index.html"]).code).toBe(2);
  },
  limit(60_000),
);

// A consumer names its pages once, in brand-elements.json: brand-markers measures those showing a
// marker where no page is named on its command line, on the config's "site" with or without a
// catalog. A page named on the command line still fails without a marker, and replaces the list.
const plain = "site/catalog/stories/Text/Plain/default/index.html";
const lifted = /\/stories\/Lists\/Lifted\/default\/(index\.html)?$/;
const markerRun = (config: object, args: string[] = []) => {
  write("brand-elements.json", JSON.stringify(config));
  return run("markers.ts", ["--scale", "2", "--json", ...args]);
};

test.each([
  {
    kind: "files",
    config: { pages: ["site/catalog/stories/Lists/Lifted/default/index.html", plain] },
    expected: lifted,
  },
  {
    kind: "site",
    config: { site: "site", pages: ["/catalog/stories/Lists/Lifted/default/"] },
    expected: /^http:\/\/[^/]+\/catalog\/stories\//,
  },
])(
  "brand-markers: scans configured pages on $kind without arguments",
  ({ config, expected }) => {
    const result = markerRun(config);
    expect(result.code).toBe(1);
    expect(forkPages(markerReadings(result.out))).toEqual([expect.stringMatching(expected)]);
  },
  limit(60_000),
);

test(
  "brand-markers: fails when configured pages have no marker",
  () => {
    const none = markerRun({ pages: [plain] });
    expect(none.code).toBe(1);
    expect(none.err.trim()).toBe(
      'brand-markers: no marker on any page of brand-elements.json "pages", so the check measures nothing. Name a page that renders a list marker in "pages" or as a command argument.',
    );
  },
  limit(60_000),
);

test(
  "brand-markers: names an unserved page and still measures the configured catalog",
  () => {
    // A site path with no site to serve it is left out, named, rather than opened as a file.
    const unserved = markerRun({ pages: ["/design-system/", plain], catalog: "site/catalog" });
    expect(unserved.err.trim()).toBe(
      'brand-markers: /design-system/: the check cannot measure this site path without a server. Set "site" in brand-elements.json, pass --site with the built folder, or pass --base with the server URL.',
    );
    expect(forkPages(markerReadings(unserved.out))).toEqual([expect.stringMatching(lifted)]);
  },
  limit(60_000),
);

test(
  "brand-markers: --catalog scans its folder as files when the config names a site",
  () => {
    const flagged = markerRun({ site: "site", pages: [] }, ["--catalog", "site/catalog"]);
    expect(forkPages(markerReadings(flagged.out))).toEqual([
      expect.stringMatching(/^file:.*\/Lifted\/default\/index\.html$/),
    ]);
  },
  limit(60_000),
);

test(
  "brand-markers: an explicit page replaces the configured page",
  () => {
    const named = markerRun({ site: "site", pages: ["/catalog/stories/Lists/Lifted/default/"] }, [
      "site/catalog/index.html",
    ]);
    const pages = forkPages(markerReadings(named.out));
    expect(named.code).toBe(0);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toContain("index.html");
    rmSync(join(dir, "brand-elements.json"));
  },
  limit(60_000),
);

test(
  "brand-elements describes the fix for a visible shared element with an override",
  () => {
    write(
      "brand-elements.json",
      JSON.stringify({ pages: ["site/catalog/stories/Cards/Fork/default/index.html"] }),
    );
    const result = run("elements.ts");
    expect(result.code).toBe(1);
    expect(result.err).toMatch(
      /border-top-left-radius 2px, brand 20px, so the rendered style differs from the reference\. Find the rule in the page CSS that changes border-top-left-radius and use the value rendered by the shared stylesheet\./,
    );
  },
  limit(60_000),
);

test(
  "brand-elements names the fix when the configured page contains no shared element",
  () => {
    write("brand-elements.json", JSON.stringify({ pages: [plain] }));
    const result = run("elements.ts");
    expect(result.code).toBe(1);
    const lines = result.err.trim().split("\n");
    expect(lines).toEqual([
      'brand-elements: no shared element on any page of brand-elements.json, so there is nothing to compare. Point "pages" or "catalog" at a build with a visible shared element.',
      `${plain}: no shared element found, so the check cannot compare its styles. Render a visible shared element on this page or replace it in brand-elements.json "pages".`,
    ]);
  },
  limit(60_000),
);

test(
  "brand-elements names the small radius for a nested brand corner",
  () => {
    const page = "site/nested-corner.html";
    write(page, html('<div class="hw-card"><div style="border-radius:20px 5px">Inner</div></div>'));
    write("brand-elements.json", JSON.stringify({ pages: [page] }));
    const result = run("elements.ts");
    expect(result.code).toBe(1);
    expect(result.err.trim()).toBe(
      `${page} corner div "Inner": border-radius draws the brand corner inside div.hw-card "Inner", breaking the outer-only corner rule. Use the small corner on the inner element with var(--hw-corner-sm, var(--radius-sm)) from elements/card.css.`,
    );
  },
  limit(60_000),
);
