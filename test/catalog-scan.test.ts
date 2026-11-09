import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import own from "../package.json";
import { elementCss, sourceFindings } from "../scan/elements";
import { ROOT } from "../scripts/git";

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
const elements = (config: object, args: string[] = []) => {
  write("brand-elements.json", JSON.stringify({ uses: ["card"], ...config }));
  const r = run("elements.ts", ["--json", ...args]);
  return { ...r, json: r.out ? JSON.parse(r.out) : undefined };
};
const forkPages = (rendered: { page: string }[]) => [...new Set(rendered.map((f) => f.page))];

test("brand-elements: the home alone misses a story's fork, the catalog key finds it", () => {
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
}, 60_000);

test("brand-elements: on a served site a story is a path below the catalog's, or below its at", () => {
  for (const catalog of ["site/catalog", { dir: "site/catalog", at: "/catalog/" }]) {
    const r = elements({ site: "site", pages: ["/catalog/"], catalog });
    expect(r.code).toBe(1);
    expect(forkPages(r.json.rendered)).toEqual(["/catalog/stories/Cards/Fork/default/"]);
  }
}, 60_000);

test("brand-elements: a story the server does not answer fails rather than passing as empty", () => {
  const r = elements({ site: "site", pages: [], catalog: { dir: "site/catalog", at: "/catlog/" } });
  expect(r.code).not.toBe(0);
  expect(r.err).toContain("HTTP 404");
}, 60_000);

// A consumer leaves out a story group another repository owns; its own stories stay measured.
test("brand-elements and brand-markers: an exclude glob leaves its stories out, the rest stay", () => {
  const cut = elements({
    pages: [],
    catalog: { dir: "site/catalog", exclude: ["Cards/**"] },
  });
  expect(cut.json.rendered).toEqual([]);
  expect(cut.json.coverage).toContain(
    'card: used, but no page shows it in a [data-hw-tile="card"]',
  );
  // Control: the glob of another group leaves the fork in.
  const kept = elements({ pages: [], catalog: { dir: "site/catalog", exclude: ["Text/**"] } });
  expect(forkPages(kept.json.rendered)).toEqual([
    "site/catalog/stories/Cards/Fork/default/index.html",
  ]);
  const markers = (exclude: string[]) => {
    write("brand-elements.json", JSON.stringify({ catalog: { dir: "site/catalog", exclude } }));
    const r = run("markers.ts", ["--scale", "2", "--json"]);
    return (JSON.parse(r.out) as { page: string }[]).map((x) => x.page);
  };
  expect(markers(["Lists/**"]).filter((p) => p.includes("Lifted"))).toEqual([]);
  expect(markers([]).filter((p) => p.includes("Lifted")).length).toBeGreaterThan(0);
  rmSync(join(dir, "brand-elements.json"));
  // A glob that matches no story, or an exclude that is no list, is a usage error.
  for (const exclude of [["Slides/**"], "Cards/**"])
    expect(elements({ pages: [], catalog: { dir: "site/catalog", exclude } }).code).toBe(2);
}, 60_000);

test("brand-elements: a catalog folder without a story is a usage error, not a pass", () => {
  expect(elements({ pages: [], catalog: "empty/catalog" }).code).toBe(2);
  expect(elements({ pages: [], catalog: "missing" }).code).toBe(2);
});

test("brand-markers: the home alone misses a story's lifted list, --catalog or the catalog key reads it", () => {
  const off = (out: string) =>
    (JSON.parse(out) as { page: string; offset: number }[]).filter(
      (r) => !(Math.abs(r.offset) <= 0.25),
    );
  rmSync(join(dir, "brand-elements.json"), { force: true });
  const home = run("markers.ts", ["--scale", "2", "--json", "site/catalog/index.html"]);
  expect([home.code, off(home.out)]).toEqual([0, []]);
  const all = run("markers.ts", [
    "--scale",
    "2",
    "--catalog",
    "site/catalog",
    "--json",
    "site/catalog/index.html",
  ]);
  expect(all.code).toBe(1);
  expect(forkPages(off(all.out))).toEqual([
    expect.stringContaining("/stories/Lists/Lifted/default/index.html"),
  ]);
  expect(run("markers.ts", ["--catalog", "empty/catalog"]).code).toBe(2);
  // Without --catalog, the catalog brand-elements.json names, on its site where it has one.
  for (const config of [{ catalog: "site/catalog" }, { site: "site", catalog: "site/catalog" }]) {
    write("brand-elements.json", JSON.stringify(config));
    const listed = run("markers.ts", ["--scale", "2", "--json"]);
    expect(listed.code).toBe(1);
    expect(forkPages(off(listed.out))).toEqual([
      expect.stringMatching(
        config.site
          ? /^http:\/\/[^/]+\/catalog\/stories\/Lists\/Lifted\/default\/$/
          : /^file:.*\/stories\/Lists\/Lifted\/default\/index\.html$/,
      ),
    ]);
  }
  write("brand-elements.json", JSON.stringify({ catalog: "empty/catalog" }));
  expect(run("markers.ts", ["site/catalog/index.html"]).code).toBe(2);
  rmSync(join(dir, "brand-elements.json"));
}, 60_000);

// A consumer names its pages once, in brand-elements.json: brand-markers measures those showing a
// marker where no page is named on its command line, on the config's "site" with or without a
// catalog. A page named on the command line still fails without a marker, and replaces the list.
test("brand-markers: without pages named, the pages and site of brand-elements.json", () => {
  const lifted = /\/stories\/Lists\/Lifted\/default\/(index\.html)?$/;
  const markers = (config: object, args: string[] = []) => {
    write("brand-elements.json", JSON.stringify(config));
    const r = run("markers.ts", ["--scale", "2", "--json", ...args]);
    return { code: r.code, err: r.err, pages: r.out ? forkPages(JSON.parse(r.out)) : [] };
  };
  const plain = "site/catalog/stories/Text/Plain/default/index.html";
  const files = markers({ pages: ["site/catalog/stories/Lists/Lifted/default/index.html", plain] });
  expect(files.code).toBe(1);
  expect(files.pages).toEqual([expect.stringMatching(lifted)]);
  const served = markers({ site: "site", pages: ["/catalog/stories/Lists/Lifted/default/"] });
  expect(served.code).toBe(1);
  expect(served.pages).toEqual([expect.stringMatching(/^http:\/\/[^/]+\/catalog\/stories\//)]);
  // Pages without any marker measure nothing, which proves nothing.
  const none = markers({ pages: [plain] });
  expect([none.code, none.err]).toEqual([1, expect.stringContaining("no marker on any page")]);
  // A site path with no site to serve it is left out, named, rather than opened as a file.
  const unserved = markers({ pages: ["/design-system/", plain], catalog: "site/catalog" });
  expect(unserved.err).toContain("/design-system/: a site path, but no site or --base");
  expect(unserved.pages).toEqual([expect.stringMatching(lifted)]);
  // --catalog names its own folder, read as files: the config's site stays unserved.
  const flagged = markers({ site: "site", pages: [] }, ["--catalog", "site/catalog"]);
  expect(flagged.pages).toEqual([expect.stringMatching(/^file:.*\/Lifted\/default\/index\.html$/)]);
  // Control: a page named on the command line replaces the list.
  const named = markers({ site: "site", pages: ["/catalog/stories/Lists/Lifted/default/"] }, [
    "site/catalog/index.html",
  ]);
  expect([named.code, named.pages]).toEqual([0, [expect.stringContaining("index.html")]]);
  rmSync(join(dir, "brand-elements.json"));
}, 60_000);

test("source: an @apply sets the properties its utilities stand for; btn names a button", () => {
  const files: Record<string, string> = {
    "src/a.css": `.my-card { @apply rounded-brand p-4 bg-muted; }
.btn-primary { border-radius: 3px; }
.state-card { @apply hover:bg-muted focus:ring-2; }
.layout-card { @apply grid gap-4 md:grid-cols-2; }
.wide-card { @apply md:px-6; }
.loud-card { @apply md:!p-4; }
.photo-card { @apply bg-[url(https://x.test/a.png)]; }
.box-card { @apply @md:p-6; }`,
  };
  expect(sourceFindings(Object.keys(files), (p) => files[p]!, {})).toEqual([
    'src/a.css: .my-card styles an element named like a shared one; use the hw-* element or list "my-card" as an exception',
    'src/a.css: .btn-primary styles an element named like a shared one; use the hw-* element or list "btn-primary" as an exception',
    'src/a.css: .wide-card styles an element named like a shared one; use the hw-* element or list "wide-card" as an exception',
    'src/a.css: .loud-card styles an element named like a shared one; use the hw-* element or list "loud-card" as an exception',
    'src/a.css: .photo-card styles an element named like a shared one; use the hw-* element or list "photo-card" as an exception',
    'src/a.css: .box-card styles an element named like a shared one; use the hw-* element or list "box-card" as an exception',
  ]);
});

// brand's own expert layer meets the fork rule a consumer's gate applies, with the exceptions a
// consumer would list in its brand-elements.json, each with its reason.
const EXCEPTIONS = {
  "filter-chip-bar":
    "the row around FilterChip pills and a Clear all link: it draws no pill of its own",
};
test("the fork rule over expert/ finds only the recorded forks", () => {
  const paths = Bun.spawnSync(["git", "ls-files", "expert"], { cwd: ROOT })
    .stdout.toString()
    .trim()
    .split("\n");
  const out = sourceFindings(paths, (p) => readFileSync(join(ROOT, p), "utf8"), EXCEPTIONS);
  expect(out).toEqual([]);
});
