#!/usr/bin/env bun
// Read-only scan of every repo in repos.json at its last commit for component names found in more
// than one repo outside the byte-identical slide engine copies. Compares them with
// scan-allowlist.json and exits 1 on any unlisted duplicate. Each repo checks its own colours in
// its own gate with the package's brand-colours command.
// Usage: bun scripts/scan.ts [--tighten]
//   --tighten  drops every entry no longer found; never adds one.
// A repo that is not checked out is skipped with a warning; with any repo skipped every entry
// stays, since an entry does not name its repos.
import { readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import repos from "../repos.json";
import { blobs, isRepo, ROOT, sha256, tree } from "./git";
import { scanned } from "../scan/colours";

export type Allowlist = Record<string, string>;
type Found = { repo: string; path: string; identical: boolean };

const ENGINE =
  /^(talks\/)?(components\/(slides|ui)|lib|types|src\/slides\/(components|lib|types))\//;

export const scan = () => {
  const skipped: string[] = [];
  const comps = new Map<string, { repo: string; path: string; sha: string }[]>();
  for (const [name, repo] of Object.entries(repos)) {
    const root = join(ROOT, repo.path);
    if (!isRepo(root)) {
      console.warn(`scan: ${name} not checked out at ${root}, skipped`);
      skipped.push(name);
      continue;
    }
    const files = tree(root).filter(
      ([p]) =>
        scanned(p) && [".astro", ".tsx", ".jsx"].includes(extname(p)) && /components\//.test(p),
    );
    const content = blobs(
      root,
      files.map(([, id]) => id),
    );
    for (const [path, id] of files) {
      const key = basename(path, extname(path)).toLowerCase();
      comps.set(key, [
        ...(comps.get(key) ?? []),
        { repo: name, path, sha: sha256(content.get(id)!) },
      ]);
    }
  }
  const duplicates: Record<string, Found[]> = {};
  for (const [key, list] of [...comps].sort()) {
    if (new Set(list.map((x) => x.repo)).size < 2) continue;
    const identical = new Set(list.map((x) => x.sha)).size === 1;
    if (identical && list.every((x) => ENGINE.test(x.path))) continue;
    duplicates[key] = list.map(({ repo, path }) => ({ repo, path, identical }));
  }
  return { skipped, duplicates };
};

export const unlisted = (report: ReturnType<typeof scan>, allow: Allowlist) =>
  Object.keys(report.duplicates)
    .filter((key) => !(key in allow))
    .map((key) => `duplicate component not allowlisted: ${key}`);

export const pruned = (report: ReturnType<typeof scan>, allow: Allowlist) =>
  report.skipped.length
    ? { ...allow }
    : Object.fromEntries(Object.entries(allow).filter(([key]) => key in report.duplicates));

if (import.meta.main) {
  const allowPath = join(ROOT, "scan-allowlist.json");
  const allow = JSON.parse(readFileSync(allowPath, "utf8")) as Allowlist;
  const report = scan();
  for (const [key, list] of Object.entries(report.duplicates))
    console.log(`${key}: ${list.map((x) => `${x.repo}:${x.path}`).join(", ")}`);
  if (process.argv.includes("--tighten")) {
    writeFileSync(allowPath, JSON.stringify(pruned(report, allow), null, 2) + "\n");
    console.log("scan: allowlist tightened");
  } else {
    const bad = unlisted(report, allow);
    if (bad.length) {
      console.error(`${bad.join("\n")}\nscan: ${bad.length} duplicates not allowlisted.`);
      process.exit(1);
    }
    console.log(`scan: ${Object.keys(report.duplicates).length} duplicates, each allowlisted`);
  }
}
