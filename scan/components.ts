#!/usr/bin/env bun
// The component check a consumer of the expert components runs in its own gate: a component in its
// working tree (tracked or untracked, .gitignore honoured, the paths brand-colours reads) named
// like one of this package's expert components is a fork of it. Exits 1 on a fork not listed in
// the consumer's brand-scan.json ({ "<lowercase name>": "<reason>" }), on an entry without a
// reason, and on an entry added against HEAD: the list may only shrink.
// Usage: brand-scan [--tighten]
//   --tighten  drops every entry no longer found; never adds one.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { scanned } from "./colours";

export const LIST = "brand-scan.json";
export type Allowlist = Record<string, string>;

const key = (path: string) => basename(path, extname(path)).toLowerCase();
const EXPERT = new Set(
  readdirSync(join(import.meta.dir, "../expert/components"))
    .filter((f) => f.endsWith(".astro"))
    .map(key),
);

/** The consumer's paths that fork an expert component, by lowercase name. */
export const forks = (paths: string[]) => {
  const out: Record<string, string[]> = {};
  for (const p of paths)
    if (
      scanned(p) &&
      [".astro", ".tsx", ".jsx"].includes(extname(p)) &&
      /(^|\/)components\//.test(p) &&
      EXPERT.has(key(p))
    )
      (out[key(p)] ??= []).push(p);
  return out;
};

export const unlisted = (
  found: Record<string, string[]>,
  allow: Allowlist,
  committed: Allowlist | undefined,
) => [
  ...Object.entries(found)
    .filter(([k]) => !(k in allow))
    .map(
      ([k, ps]) => `${ps.join(", ")}: forks the expert component ${k}; import it from the package`,
    ),
  ...Object.entries(allow).flatMap(([k, r]) => [
    ...(r?.trim() ? [] : [`${LIST}: ${k} names no reason`]),
    ...(committed && !(k in committed)
      ? [`${LIST}: ${k} added against HEAD; the list may only shrink`]
      : []),
  ]),
];

if (import.meta.main) {
  const git = (args: string[]) => spawnSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30 });
  const ls = git(["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (ls.status !== 0) throw new Error(`brand-scan: not a git checkout: ${ls.stderr}`);
  const found = forks([...new Set(ls.stdout.split("\0"))].filter((p) => p && existsSync(p)));
  const allow: Allowlist = existsSync(LIST) ? JSON.parse(readFileSync(LIST, "utf8")) : {};
  const head = git(["show", `HEAD:./${LIST}`]);
  const committed = head.status === 0 ? (JSON.parse(head.stdout) as Allowlist) : undefined;
  if (process.argv.includes("--tighten")) {
    const next = Object.fromEntries(Object.entries(allow).filter(([k]) => k in found));
    writeFileSync(LIST, JSON.stringify(next, null, 2) + "\n");
    console.log(`brand-scan: ${LIST} tightened`);
  } else {
    const bad = unlisted(found, allow, committed);
    if (bad.length) {
      console.error(`${bad.join("\n")}\nbrand-scan: ${bad.length} findings.`);
      process.exit(1);
    }
    console.log(`brand-scan: no unlisted fork of the ${EXPERT.size} expert components`);
  }
}
