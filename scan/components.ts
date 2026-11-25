#!/usr/bin/env bun
// The component check a consumer of the expert components runs in its own gate: a component file
// (.astro, .tsx, .jsx, .vue, .svelte) anywhere in its working tree (tracked or untracked,
// .gitignore honoured, the paths brand-colours reads) named like one of this package's expert
// components is a fork of it. Exits 1 on a fork not listed in
// the consumer's brand-scan.json ({ "<lowercase name>": "<reason>" }, the name without - and _), on an entry without a
// reason, on an entry no fork answers (stale), and on an entry added against HEAD: the list may only shrink. Where the working tree
// changes the brand pin package.json holds at HEAD, an entry may also name a fork whose files are
// committed at HEAD and unchanged since, which a newer package's component makes one.
import { readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";
import {
  allowlistTightened,
  committedAsIs,
  nothingToAllow,
  pinChange,
  readReasonAllowlists,
  writeAllowlist,
  type ReasonAllowlists,
} from "./allowlist";
import { answerHelp } from "./help";
import { COMPONENT, listTree, scanned, skippedReport } from "./tree";

const USAGE = `usage: brand-scan [--tighten]
Fails on a component in the working tree named like an expert component that brand-scan.json does
not list.
  --tighten  drops every entry no longer found; adds one, with an empty reason, only during a
             pin change, for such a fork; writes no list where none was and none is needed.`;

export const LIST = "brand-scan.json";

// The name without case and word separators, so app-header.tsx counts as AppHeader.
const key = (path: string) => basename(path, extname(path)).toLowerCase().replace(/[-_]/g, "");
const EXPERT = new Set(
  readdirSync(join(import.meta.dir, "../expert/components"))
    .filter((f) => f.endsWith(".astro"))
    .map(key),
);

/** The consumer's paths that fork an expert component, by lowercase name. */
export const forks = (paths: string[]) => {
  const out: Record<string, string[]> = {};
  for (const p of paths)
    if (scanned(p) && COMPONENT.has(extname(p)) && EXPERT.has(key(p))) (out[key(p)] ??= []).push(p);
  return out;
};

export const unlisted = (
  found: Record<string, string[]>,
  { allow, committed }: ReasonAllowlists,
  mayAdd: (k: string) => boolean = () => false,
) => [
  ...Object.entries(found)
    .filter(([k]) => !Object.hasOwn(allow, k))
    .map(
      ([k, ps]) => `${ps.join(", ")}: forks the expert component ${k}; import it from the package`,
    ),
  ...Object.entries(allow).flatMap(([k, r]) => [
    ...(r?.trim() ? [] : [`${LIST}: ${k} names no reason`]),
    // An entry no fork answers would let a fork of that name added later pass unseen.
    ...(Object.hasOwn(found, k)
      ? []
      : [`${LIST}: ${k} forks nothing; drop its entry (brand-scan --tighten)`]),
    ...(committed && !Object.hasOwn(committed, k) && !mayAdd(k)
      ? [
          `${LIST}: ${k} added against HEAD; the list may only shrink, or during a pin change name a fork committed as is`,
        ]
      : []),
  ]),
];

if (import.meta.main) {
  answerHelp(USAGE);
  const tree = listTree("brand-scan");
  const report = skippedReport("brand-scan", tree);
  if (report) console.log(report);
  const found = forks(tree);
  const lists = readReasonAllowlists(LIST);
  const upgrade = lists.committed !== undefined && pinChange("brand-scan") !== undefined;
  const mayAdd = (k: string) => upgrade && k in found && found[k].every(committedAsIs);
  if (process.argv.includes("--tighten")) {
    const next = Object.fromEntries(
      Object.keys(found)
        .filter((k) => k in lists.allow || mayAdd(k))
        .map((k) => [k, lists.allow[k] ?? ""]),
    );
    const wrote = writeAllowlist(LIST, next);
    console.log(
      wrote ? allowlistTightened("brand-scan", LIST) : nothingToAllow("brand-scan", LIST),
    );
  } else {
    const bad = unlisted(found, lists, mayAdd);
    if (bad.length) {
      console.error(`${bad.join("\n")}\nbrand-scan: ${bad.length} findings.`);
      process.exit(1);
    }
    console.log(`brand-scan: no unlisted fork of the ${EXPERT.size} expert components`);
  }
}
