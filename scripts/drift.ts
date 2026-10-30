#!/usr/bin/env bun
// Read-only comparison of the brand files a repo still holds as copies (repos.json) against
// manifest.json, at each repo's last commit, LFS pointers compared by their object id. A directory
// copy covers the files the repo holds there; one brand lacks is "extra". Writes reports/drift.json
// and prints a summary. Reports only: it exits 0 on drift, and it never writes into another repo.
// Usage: bun scripts/drift.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "../manifest.json";
import repos from "../repos.json";
import { contentHash, head, isRepo, listDir, ROOT } from "./git";

type Row = { brand: string; copy: string; status: "identical" | "differs" | "missing" | "extra" };

export const drift = () => {
  const out: Record<string, { status: string; commit?: string; rows: Row[] }> = {};
  for (const [name, repo] of Object.entries(repos)) {
    const root = join(ROOT, repo.path);
    if (!repo.copies.length) {
      out[name] = { status: "no file copies", rows: [] };
      continue;
    }
    if (!isRepo(root)) {
      out[name] = { status: "not checked out", rows: [] };
      continue;
    }
    const rows: Row[] = [];
    for (const [from, to] of repo.copies) {
      const pairs = from.endsWith("/")
        ? listDir(root, to.slice(0, -1)).map((rel) => [from + rel, to + rel])
        : [[from, to]];
      for (const [brand, copy] of pairs) {
        const want = manifest.files.find((f) => f.path === brand)?.sha256;
        const got = contentHash(root, copy);
        rows.push({
          brand: want ? brand : "",
          copy,
          status: !want ? "extra" : !got ? "missing" : got === want ? "identical" : "differs",
        });
      }
    }
    const bad = rows.filter((r) => r.status !== "identical").length;
    out[name] = {
      status: bad ? `${bad} of ${rows.length} drifted` : `in sync, ${rows.length} files`,
      commit: head(root),
      rows,
    };
  }
  return out;
};

if (import.meta.main) {
  const result = drift();
  writeFileSync(
    join(ROOT, "reports/drift.json"),
    JSON.stringify({ date: new Date().toISOString().slice(0, 10), repos: result }, null, 2) + "\n",
  );
  for (const [name, r] of Object.entries(result)) {
    console.log(`${name}: ${r.status}`);
    for (const row of r.rows.filter((x) => x.status !== "identical"))
      console.log(`  ${row.status}: ${row.copy}${row.brand ? ` (brand ${row.brand})` : ""}`);
  }
}
