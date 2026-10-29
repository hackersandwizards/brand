import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import manifest from "../manifest.json";
import { ROOT, sha256 } from "../scripts/git";

test("every file matches its manifest hash", () => {
  for (const f of manifest.files)
    expect({ path: f.path, sha256: sha256(readFileSync(join(ROOT, f.path))) }).toEqual({
      path: f.path,
      sha256: f.sha256,
    });
});

test("every file in a copied folder has a manifest entry", () => {
  const listed = new Set(manifest.files.map((f) => f.path));
  const onDisk = ["tokens", "logos", "expert", "document"].flatMap((dir) =>
    readdirSync(join(ROOT, dir), { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile() && e.name !== ".DS_Store")
      .map((e) => relative(ROOT, join(e.parentPath, e.name))),
  );
  expect(onDisk.filter((p) => !listed.has(p))).toEqual([]);
});
