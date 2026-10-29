import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";
import { METRICS, type Allowlist } from "../scripts/scan";

const now: Allowlist = JSON.parse(readFileSync(join(ROOT, "scan-allowlist.json"), "utf8"));
const committed = spawnSync("git", ["-C", ROOT, "show", "HEAD:scan-allowlist.json"], {
  encoding: "utf8",
});

test("every allowlist entry carries a reason", () => {
  for (const [k, e] of Object.entries(now.files))
    expect([k, e.reason.length > 0]).toEqual([k, true]);
  for (const [k, r] of Object.entries(now.duplicates)) expect([k, r.length > 0]).toEqual([k, true]);
});

test.skipIf(committed.status !== 0)("the allowlist only shrinks against HEAD", () => {
  const before: Allowlist = JSON.parse(committed.stdout);
  const grown: string[] = [];
  for (const [file, e] of Object.entries(now.files))
    for (const k of METRICS) if (e[k] > (before.files[file]?.[k] ?? 0)) grown.push(`${file} ${k}`);
  for (const d of Object.keys(now.duplicates)) if (!(d in before.duplicates)) grown.push(d);
  expect(grown).toEqual([]);
});
