import { expect, test } from "bun:test";
import { join } from "node:path";
import manifest from "../manifest.json";
import repos from "../repos.json";
import { drift } from "../scripts/drift";
import { isRepo, listDir, ROOT } from "../scripts/git";

test.skipIf(!isRepo(join(ROOT, repos.os.path)))("a changed hash shows as drift", () => {
  const entry = manifest.files.find((f) => f.path === "logos/type-logo-short.svg")!;
  const real = entry.sha256;
  entry.sha256 = "0".repeat(64);
  try {
    const rows = drift().os.rows.filter((r) => r.brand === "logos/type-logo-short.svg");
    expect(rows.map((r) => r.status)).toEqual(["differs"]);
  } finally {
    entry.sha256 = real;
  }
});

test.skipIf(!isRepo(join(ROOT, repos.website.path)))("a file brand owns is never a copy", () => {
  const own = manifest.files.filter((f) => !("origin" in f)).map((f) => f.path);
  expect(drift().website.rows.filter((r) => own.includes(r.brand))).toEqual([]);
});

// import.ts lists each owner's folder: a missing checkout must fail, not drop that owner's entries.
test("listing a folder of a missing checkout throws", () => {
  expect(() => listDir(join(ROOT, "no-such-repo"), "src")).toThrow("not a git checkout");
});
