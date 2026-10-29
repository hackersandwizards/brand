import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import manifest from "../manifest.json";
import { lfsOid, ROOT, sha256 } from "../scripts/git";

// A print master .lfsconfig keeps from fetching is a pointer on disk: its oid is the real file's sha256.
test("every file matches its manifest hash", () => {
  for (const f of manifest.files) {
    const b = readFileSync(join(ROOT, f.path));
    expect({ path: f.path, sha256: lfsOid(b) ?? sha256(b) }).toEqual({
      path: f.path,
      sha256: f.sha256,
    });
  }
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
