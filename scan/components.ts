#!/usr/bin/env bun
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
    ...(r?.trim()
      ? []
      : [
          `${LIST}: ${k} has an undocumented component exception. Set the entry's string value to explain why the fork must stay.`,
        ]),
    // An entry no fork answers would let a fork of that name added later pass unseen.
    ...(Object.hasOwn(found, k)
      ? []
      : [
          `${LIST}: ${k} has an unused fork allowance that could hide a new fork. Run bun run brand-scan --tighten to drop the entry.`,
        ]),
    ...(committed && !Object.hasOwn(committed, k) && !mayAdd(k)
      ? [
          `${LIST}: ${k} adds a fork exception beyond what HEAD and the pin-change rule permit. Import the expert component from the package and remove this entry.`,
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
