#!/usr/bin/env bun
// Re-reads the files another repo still owns (the website's tokens and fonts, os's document
// components and logos), each from the owner's last commit (LFS pointers resolved from the owner's
// local object store), and writes manifest.json with each file's origin repo, path, commit and
// sha256. Entries without an origin are this repo's own files; they keep their place, rehashed.
// Reads the owners, writes only here.
// Usage: bun scripts/import.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import manifest from "../manifest.json";
import repos from "../repos.json";
import { head, lfsObject, lfsOid, listDir, ROOT, sha256, show } from "./git";

type Origin = { repo: keyof typeof repos; path: string };
const owner = (repo: Origin["repo"]) => join(ROOT, repos[repo].path);

const doc = "src/components";
const logos = "src/content/documents/company/design-guide/logos";
/** brand path -> origin */
const sources: [string, Origin][] = [
  ...listDir(owner("website"), "src/styles/brand").map((p): [string, Origin] => [
    `tokens/${p}`,
    { repo: "website", path: `src/styles/brand/${p}` },
  ]),
  ...[
    "DocCard",
    "DocClosing",
    "DocHeader",
    "DocLead",
    "DocPriceTable",
    "DocRecipient",
    "DocTitle",
  ].map((c): [string, Origin] => [
    `document/components/${c}.astro`,
    { repo: "os", path: `${doc}/${c}.astro` },
  ]),
  ...listDir(owner("os"), logos)
    .filter((p) => !p.endsWith(".md"))
    .map((p): [string, Origin] => [`logos/${p}`, { repo: "os", path: `${logos}/${p}` }]),
];

const files = sources.map(([path, origin]) => {
  const repo = owner(origin.repo);
  let bytes = show(repo, origin.path)!;
  const oid = lfsOid(bytes);
  if (oid) bytes = lfsObject(repo, oid);
  mkdirSync(dirname(join(ROOT, path)), { recursive: true });
  writeFileSync(join(ROOT, path), bytes);
  return { path, sha256: sha256(bytes), origin: { ...origin, commit: head(repo), lfs: !!oid } };
});

const own = manifest.files
  .filter((f) => !f.origin)
  .map(({ path }) => ({ path, sha256: sha256(readFileSync(join(ROOT, path))) }));

writeFileSync(
  join(ROOT, "manifest.json"),
  JSON.stringify({ files: [...files, ...own] }, null, 2) + "\n",
);
console.log(`imported ${files.length} files`);
