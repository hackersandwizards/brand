import { defined } from "@hackersandwizards/scaffolding/defined";
import { expect, test } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { sourceFindings } from "../scan/element-source";
import { ROOT } from "../scripts/git";
import { checkoutRoot } from "./checkout";

test("brand-elements: a catalog folder without a story is a usage error, not a pass", () => {
  const dir = mkdtempSync(join(tmpdir(), "brand-catalog-empty-"));
  try {
    const redirect = join(dir, "empty/catalog/stories/Cards/Fork/default/index.html");
    mkdirSync(dirname(redirect), { recursive: true });
    writeFileSync(join(dir, "empty/catalog/index.html"), "<p>No stories.</p>");
    writeFileSync(
      redirect,
      '<meta http-equiv="refresh" content="0; url=/stories/Cards/Fork/default/">',
    );
    for (const catalog of ["empty/catalog", "missing"]) {
      writeFileSync(join(dir, "brand-elements.json"), JSON.stringify({ pages: [], catalog }));
      const run = Bun.spawnSync(["bun", join(ROOT, "scan/elements.ts"), "--json"], { cwd: dir });
      expect([run.exitCode, run.stderr.toString().trim()]).toEqual([
        2,
        `brand-elements: no story page under ${catalog}/stories, so the check cannot measure the catalog. Build the catalog at that path and make sure brand-elements.json "catalog.exclude" leaves a nonredirect story.`,
      ]);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

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
  expect(sourceFindings(Object.keys(files), (p) => defined(files[p], p), {})).toEqual([
    'src/a.css: .my-card sets styles owned by .hw-card. Use the shared element stylesheet or give "my-card" a reason in brand-elements.json "exceptions".',
    'src/a.css: .btn-primary sets styles owned by .hw-button. Use the shared element stylesheet or give "btn-primary" a reason in brand-elements.json "exceptions".',
    'src/a.css: .wide-card sets styles owned by .hw-card. Use the shared element stylesheet or give "wide-card" a reason in brand-elements.json "exceptions".',
    'src/a.css: .loud-card sets styles owned by .hw-card. Use the shared element stylesheet or give "loud-card" a reason in brand-elements.json "exceptions".',
    'src/a.css: .photo-card sets styles owned by .hw-card. Use the shared element stylesheet or give "photo-card" a reason in brand-elements.json "exceptions".',
    'src/a.css: .box-card sets styles owned by .hw-card. Use the shared element stylesheet or give "box-card" a reason in brand-elements.json "exceptions".',
  ]);
});

// brand's own expert layer meets the fork rule a consumer's gate applies, with the exceptions a
// consumer would list in its brand-elements.json, each with its reason.
const EXCEPTIONS = {
  "filter-chip-bar":
    "the row around FilterChip pills and a Clear all link: it draws no pill of its own",
};
test("the fork rule over expert/ finds only the recorded forks", () => {
  const paths = Bun.spawnSync(["git", "ls-files", "expert"], { cwd: checkoutRoot() })
    .stdout.toString()
    .trim()
    .split("\n");
  const out = sourceFindings(paths, (p) => readFileSync(join(ROOT, p), "utf8"), EXCEPTIONS);
  expect(out).toEqual([]);
});

test("a built catalog whose filter excludes every story needs a narrower filter", () => {
  const dir = mkdtempSync(join(tmpdir(), "brand-catalog-filter-"));
  try {
    const story = join(dir, "catalog/stories/Cards/Example/default/index.html");
    mkdirSync(dirname(story), { recursive: true });
    writeFileSync(story, '<div class="hw-card">Example</div>');
    writeFileSync(
      join(dir, "brand-elements.json"),
      JSON.stringify({ catalog: { dir: "catalog", exclude: ["**/*"] } }),
    );
    const run = Bun.spawnSync(["bun", join(ROOT, "scan/elements.ts")], { cwd: dir });
    expect([run.exitCode, run.stderr.toString().trim()]).toEqual([
      2,
      'brand-elements: no story page under catalog/stories, so the check cannot measure the catalog. Build the catalog at that path and make sure brand-elements.json "catalog.exclude" leaves a nonredirect story.',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
