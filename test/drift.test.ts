import { expect, test } from "bun:test";
import { join } from "node:path";
import manifest from "../manifest.json";
import repos from "../repos.json";
import { drift } from "../scripts/drift";
import { isRepo, listDir, ROOT } from "../scripts/git";

test.skipIf(!isRepo(join(ROOT, repos.website.path)))("a changed hash shows as drift", () => {
  const entry = manifest.files.find((f) => f.path === "tokens/tokens.css")!;
  const real = entry.sha256;
  entry.sha256 = "0".repeat(64);
  try {
    const rows = drift().website.rows.filter((r) => r.brand === "tokens/tokens.css");
    expect(rows.map((r) => r.status)).toEqual(["differs"]);
  } finally {
    entry.sha256 = real;
  }
});

// drift lists each copied folder: a missing checkout must fail, not read as an empty copy.
test("listing a folder of a missing checkout throws", () => {
  expect(() => listDir(join(ROOT, "no-such-repo"), "src")).toThrow("not a git checkout");
});
