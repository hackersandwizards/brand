#!/usr/bin/env bun
// Seeds this repo from the files' current owners, each read from the owner's last commit (LFS
// pointers resolved from the owner's local object store), and writes manifest.json with each
// file's origin repo, path, commit and sha256. Reads the owners, writes only here. Run it again
// while an owner still edits its file (DS-D's document set); drop it once this repo is the source.
// Usage: bun scripts/import.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
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
  ["expert/expert.css", { repo: "os", path: "src/styles/expert.css" }],
  ["document/document.css", { repo: "os", path: "assets/document.css" }],
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

writeFileSync(join(ROOT, "manifest.json"), JSON.stringify({ files }, null, 2) + "\n");
console.log(`imported ${files.length} files`);
