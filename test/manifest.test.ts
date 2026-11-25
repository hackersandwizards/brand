import { expect, test } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import manifest from "../manifest.json";
import { ROOT } from "../scripts/git";
import { contentHash } from "../scan/colours";
import { checkoutRoot } from "./checkout";

// A print master .lfsconfig keeps from fetching is a pointer on disk: its oid is the real file's sha256.
test("every file matches its manifest hash", () => {
  // The manifest describes the published bytes, before Stryker instruments any source.
  const root = checkoutRoot();
  for (const f of manifest.files) {
    const b = readFileSync(join(root, f.path));
    expect({ path: f.path, sha256: contentHash(b) }).toEqual({
      path: f.path,
      sha256: f.sha256,
    });
  }
});

test("every file in a copied folder has a manifest entry", () => {
  const listed = new Set(manifest.files.map((f) => f.path));
  const onDisk = ["tokens", "logos", "expert", "elements", "press", "verbal"].flatMap((dir) =>
    readdirSync(join(ROOT, dir), { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile())
      .filter((e) => e.name !== ".DS_Store")
      .map((e) => relative(ROOT, join(e.parentPath, e.name))),
  );
  expect(onDisk.filter((p) => !listed.has(p))).toEqual([]);
});

// tokens/layers.css owns the layer order; a CSS file with a layer block declares it word for word
// before the block, so it still works linked or inlined alone.
test("every file with a layer block states the order of tokens/layers.css", () => {
  const order = readFileSync(join(ROOT, "tokens/layers.css"), "utf8").trim();
  const layered = manifest.files
    .filter((f) => f.path.endsWith(".css"))
    .map((f) => ({ path: f.path, css: readFileSync(join(ROOT, f.path), "utf8") }))
    .filter(({ css }) => /^@layer [\w-]+ \{/m.test(css));
  expect(layered.length).toBeGreaterThan(0);
  expect(
    layered.map(({ path, css }) => ({
      path,
      statements: [...css.matchAll(/^@layer [\w ,-]+;$/gm)].map(([statement]) => statement),
      firstLayer: /^@layer (?:[\w ,-]+;$|[\w-]+ \{)/m.exec(css)?.[0],
    })),
  ).toEqual(layered.map(({ path }) => ({ path, statements: [order], firstLayer: order })));
});
