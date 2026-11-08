import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import manifest from "../manifest.json";
import { ROOT } from "../scripts/git";
import { contentHash } from "../scan/colours";

// A print master .lfsconfig keeps from fetching is a pointer on disk: its oid is the real file's sha256.
test("every file matches its manifest hash", () => {
  for (const f of manifest.files) {
    const b = readFileSync(join(ROOT, f.path));
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
      .filter((e) => e.isFile() && e.name !== ".DS_Store")
      .map((e) => relative(ROOT, join(e.parentPath, e.name))),
  );
  expect(onDisk.filter((p) => !listed.has(p))).toEqual([]);
});

// tokens/layers.css owns the layer order; a CSS file with a layer block declares it word for word
// before the block, so it still works linked or inlined alone.
test("every file with a layer block states the order of tokens/layers.css", () => {
  const order = readFileSync(join(ROOT, "tokens/layers.css"), "utf8").trim();
  const off = manifest.files
    .filter((f) => f.path.endsWith(".css"))
    .map((f) => ({ path: f.path, css: readFileSync(join(ROOT, f.path), "utf8") }))
    .filter(({ css }) => /^@layer [\w-]+ \{/m.test(css))
    .filter(({ css }) => {
      const stated = css.match(/^@layer [\w ,-]+;$/gm) ?? [];
      return (
        stated.length !== 1 ||
        stated[0] !== order ||
        css.indexOf(order) > css.search(/^@layer [\w-]+ \{/m)
      );
    })
    .map(({ path }) => path);
  expect(off).toEqual([]);
});
