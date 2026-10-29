import { expect, test } from "bun:test";
import { join } from "node:path";
import manifest from "../manifest.json";
import repos from "../repos.json";
import { drift } from "../scripts/drift";
import { isRepo, ROOT } from "../scripts/git";

test.skipIf(!isRepo(join(ROOT, repos.os.path)))("a changed hash shows as drift", () => {
  const entry = manifest.files.find((f) => f.path === "expert/expert.css")!;
  const real = entry.sha256;
  entry.sha256 = "0".repeat(64);
  try {
    const rows = drift().os.rows.filter((r) => r.brand === "expert/expert.css");
    expect(rows.map((r) => r.status)).toEqual(["differs"]);
  } finally {
    entry.sha256 = real;
  }
});
