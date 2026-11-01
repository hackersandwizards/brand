#!/usr/bin/env bun
// The copy check a consumer runs in its own gate, over its working tree from the current directory
// down (tracked and untracked files, .gitignore honoured, brand-colours' built-in exceptions
// applied). A brand file belongs in node_modules/@hackersandwizards/brand, never in the consumer:
// exits 1 on a file byte-identical to a file this package ships (through a Git LFS pointer too),
// on a modified copy of a brand logo (a file named like one of logos/, or a text file carrying a
// logo's path data), unless brand-copies.json lists it ({ "<path>": "<reason>" }), on an entry
// without a reason, and on an entry added against HEAD: the list may only shrink.
// Usage: brand-copies [--tighten]
//   --tighten  drops every entry no longer found; never adds one.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import {
  brandFiles,
  brandSizes,
  exception,
  exceptionReport,
  isBrandCopy,
  listTree,
} from "./colours";

export const LIST = "brand-copies.json";
export type Allowlist = Record<string, string>;

const LOGOS = join(import.meta.dir, "../logos");
const logoNames = new Set(readdirSync(LOGOS));
// Path data of 100 characters and more, and a slice of each embedded image, from every logo SVG: a
// recoloured or cropped copy keeps them.
export const signatures = new Set(
  [...logoNames]
    .filter((f) => f.endsWith(".svg"))
    .flatMap((f) => {
      const svg = readFileSync(join(LOGOS, f), "utf8");
      return [
        ...[...svg.matchAll(/\sd="([^"]{100,})"/g)].map((m) => m[1]),
        ...[...svg.matchAll(/base64,([A-Za-z0-9+/=]{2000,})/g)].map((m) => m[1].slice(1000, 1200)),
      ];
    }),
);
const TEXT = /\.(svg|html?|astro|[cm]?[jt]sx?|vue|svelte|css|md|mdx)$/;

/** What makes a consumer file a copy of a brand file, or undefined where it is none. */
export const copyOf = (
  path: string,
  read: (p: string) => string,
  identical: (p: string) => string | undefined,
) => {
  const same = identical(path);
  if (same) return `identical to brand ${same}`;
  if (logoNames.has(basename(path))) return `named like brand logos/${basename(path)}`;
  if (TEXT.test(extname(path))) {
    const text = read(path);
    for (const s of signatures)
      if (text.includes(s))
        return "carries a brand logo's drawing; render the logo from the package";
  }
};

export const unlistedCopies = (
  found: Record<string, string>,
  allow: Allowlist,
  committed: Allowlist | undefined,
) => [
  ...Object.entries(found)
    .filter(([p]) => !(p in allow))
    .map(([p, why]) => `${p}: ${why}; import it from the package`),
  ...Object.entries(allow).flatMap(([p, r]) => [
    ...(r?.trim() ? [] : [`${LIST}: ${p} names no reason`]),
    ...(committed && !(p in committed)
      ? [`${LIST}: ${p} added against HEAD; the list may only shrink`]
      : []),
  ]),
];

if (import.meta.main) {
  const brand = brandFiles();
  const sizes = brandSizes(brand);
  const skipped: Record<string, number> = {};
  const found: Record<string, string> = {};
  for (const p of listTree("brand-copies")) {
    const why = exception(p);
    if (why) {
      skipped[why] = (skipped[why] ?? 0) + 1;
      continue;
    }
    const hit = copyOf(
      p,
      (f) => readFileSync(f, "utf8"),
      (f) => isBrandCopy(f, brand, sizes),
    );
    if (hit) found[p] = hit;
  }
  const report = exceptionReport("brand-copies", skipped);
  if (report) console.log(report);
  const allow = existsSync(LIST) ? (JSON.parse(readFileSync(LIST, "utf8")) as Allowlist) : {};
  const head = spawnSync("git", ["show", `HEAD:./${LIST}`], { encoding: "utf8" });
  const committed = head.status === 0 ? (JSON.parse(head.stdout) as Allowlist) : undefined;
  if (process.argv.includes("--tighten")) {
    const next = Object.fromEntries(Object.entries(allow).filter(([p]) => p in found));
    writeFileSync(LIST, JSON.stringify(next, null, 2) + "\n");
    console.log(`brand-copies: ${LIST} tightened`);
  } else {
    const bad = unlistedCopies(found, allow, committed);
    if (bad.length) {
      console.error(
        `${bad.join("\n")}\nbrand-copies: ${bad.length} findings. Read the file from node_modules/@hackersandwizards/brand, or name the exception with its reason in ${LIST}.`,
      );
      process.exit(1);
    }
    console.log(`brand-copies: no copy of a brand file outside ${LIST}`);
  }
}
