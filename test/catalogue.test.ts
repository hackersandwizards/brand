import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";

// A duplicate anchor means two things on the page claim one name: rename the less specific one.
test("catalogue.html has no duplicate id", () => {
  const ids = [
    ...readFileSync(join(ROOT, "catalogue.html"), "utf8").matchAll(/\sid="([^"]+)"/g),
  ].map((m) => m[1]);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});
