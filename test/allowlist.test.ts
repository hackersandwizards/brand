import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";
import type { Allowlist } from "../scripts/scan";

const now: Allowlist = JSON.parse(readFileSync(join(ROOT, "scan-allowlist.json"), "utf8"));
const committed = spawnSync("git", ["-C", ROOT, "show", "HEAD:scan-allowlist.json"], {
  encoding: "utf8",
});

test("every allowlist entry carries a reason", () => {
  for (const [k, r] of Object.entries(now)) expect([k, r.length > 0]).toEqual([k, true]);
});

test.skipIf(committed.status !== 0)("the allowlist only shrinks against HEAD", () => {
  const before = JSON.parse(committed.stdout);
  const keys = before.duplicates ? Object.keys(before.duplicates) : Object.keys(before);
  expect(Object.keys(now).filter((d) => !keys.includes(d))).toEqual([]);
});
