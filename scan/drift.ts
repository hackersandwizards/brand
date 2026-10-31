#!/usr/bin/env bun
// The drift check a consumer runs in its own gate over the brand files it serves as copies. Each
// `brand-copies.json` in the working tree (tracked or untracked, .gitignore honoured) sits beside
// its copies and names, with the reason the repo serves a copy, each file there and the brand file
// it copies: { "reason": "...", "copies": { "<file beside>": "<brand path>" } }. Compares each
// copy's sha256 with this package's manifest.json and exits 1 on a copy that differs, is missing or
// names no brand file, on a list without a reason, and where no list exists at all.
// Usage: brand-drift
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import manifest from "../manifest.json";

export const LIST = "brand-copies.json";
export type CopyList = { reason: string; copies: Record<string, string> };

const hashes = new Map(manifest.files.map((f) => [f.path, f.sha256]));

/** Every finding for one list, its copies read through `read` relative to the list's folder. */
export const findings = (
  list: string,
  { reason, copies }: CopyList,
  read: (path: string) => Buffer | undefined,
) => {
  const out: string[] = [];
  if (!reason?.trim()) out.push(`${list}: names no reason`);
  for (const [file, brand] of Object.entries(copies ?? {})) {
    const path = join(dirname(list), file);
    const want = hashes.get(brand);
    const got = read(path);
    if (!want) out.push(`${path}: ${brand} is no brand file`);
    else if (!got) out.push(`${path}: missing`);
    else if (createHash("sha256").update(got).digest("hex") !== want)
      out.push(`${path}: differs from brand ${brand}`);
  }
  return out;
};

if (import.meta.main) {
  const ls = spawnSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", `*${LIST}`],
    { encoding: "utf8" },
  );
  if (ls.status !== 0) throw new Error(`brand-drift: not a git checkout: ${ls.stderr}`);
  const lists = [...new Set(ls.stdout.split("\0"))].filter(
    (p) => (p === LIST || p.endsWith(`/${LIST}`)) && existsSync(p),
  );
  if (!lists.length) {
    console.error(`brand-drift: no ${LIST} found; run it only where the repo serves brand copies`);
    process.exit(1);
  }
  const read = (p: string) => (existsSync(p) ? readFileSync(p) : undefined);
  let count = 0;
  const bad = lists.flatMap((list) => {
    const parsed = JSON.parse(readFileSync(list, "utf8")) as CopyList;
    count += Object.keys(parsed.copies ?? {}).length;
    return findings(list, parsed, read);
  });
  if (bad.length) {
    console.error(
      `${bad.join("\n")}\nbrand-drift: ${bad.length} findings. Copy the file again from the installed package, or drop the copy.`,
    );
    process.exit(1);
  }
  console.log(`brand-drift: ${count} copies identical to their brand files`);
}
