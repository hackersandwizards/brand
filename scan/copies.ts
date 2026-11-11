#!/usr/bin/env bun
// The copy check a consumer runs in its own gate, over its working tree from the current directory
// down (tracked and untracked files, .gitignore honoured, brand-colours' built-in exceptions
// applied). A brand file belongs in node_modules/@hackersandwizards/brand, never in the consumer:
// exits 1 on a file byte-identical to a file this package ships (through a Git LFS pointer too),
// on a modified copy of a brand logo (a file named like one of logos/, or a text file carrying a
// logo's path data), unless brand-copies.json lists it ({ "<path>": "<reason>" }), on an entry
// without a reason, on an entry whose file is no copy (stale), and on an entry added against HEAD: the list may only shrink. Where the working
// tree changes the brand pin package.json holds at HEAD, an entry may also name a file committed
// at HEAD and unchanged since, which a newer scanner finds.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import {
  brandFiles,
  brandSizes,
  committedAsIs,
  ENGINE_STYLE,
  exception,
  isBrandCopy,
  listTree,
  pinChange,
  runGit,
  skippedReport,
  writeAllowlist,
} from "./colours";
import { answerHelp } from "./help";

const USAGE = `usage: brand-copies [--tighten]
Fails on a copy of a brand file in the working tree that brand-copies.json does not list.
  --tighten  drops every entry no longer found; adds one, with an empty reason, only during a
             pin change, for such a file; writes no list where none was and none is needed.`;

export const LIST = "brand-copies.json";
export type Allowlist = Record<string, string>;

const LOGOS = join(import.meta.dir, "../logos");
// The logo files only: logos.json is data about them, a name a consumer's own list also takes.
const logoNames = new Set(readdirSync(LOGOS).filter((f) => /\.(svg|png|ico|tif)$/.test(f)));
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
/** The svg text of a data: URI's parameters and data. */
const svgOf = (params: string, data: string) => {
  try {
    return params.endsWith(";base64")
      ? Buffer.from(data, "base64").toString("utf8")
      : decodeURIComponent(data).replace(/^\s+/, "");
  } catch {
    return "";
  }
};
// The opening tag of the lockup the documents engine inlines, by its viewBox.
const box = (f: string) => /viewBox="([^"]+)"/.exec(readFileSync(join(LOGOS, f), "utf8"))![1];
const LOCKUP_BOX = new RegExp(
  `^<svg\\b[^>]*viewBox="(?:${[...new Set(["lockup.svg", "lockup-screen.svg"].map(box))].join("|").replace(/\./g, "\\.")})"`,
);
const plain = (svg: string) =>
  svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s*</g, "><")
    .trim();
const WORDMARKS = new Set(
  [...logoNames]
    .filter((f) => /^wordmark.*\.svg$/.test(f))
    .map((f) => plain(readFileSync(join(LOGOS, f), "utf8"))),
);
const engineLogo = (svg: string) => LOCKUP_BOX.test(svg) || WORDMARKS.has(plain(svg));

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
    let text = read(path);
    // A document the documents engine composed inlines the logos it renders from this package to
    // stand alone, as an svg element or a data: URI: the lockup (logos/lockup.svg,
    // lockup-screen.svg), known by its viewBox, an unmodified logos/wordmark*.svg, known by its
    // whole text, and the engine's style elements are left out; every other drawing is still matched.
    if (new RegExp(ENGINE_STYLE.source).test(text))
      text = text
        .replace(ENGINE_STYLE, "")
        .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/g, (svg) => (engineLogo(svg) ? "" : svg))
        .replace(
          /(["'])data:image\/svg\+xml([^,"']*),([\s\S]*?)\1/g,
          (uri, _quote, params: string, data: string) =>
            engineLogo(svgOf(params, data)) ? "" : uri,
        );
    for (const s of signatures)
      if (text.includes(s))
        return "carries a brand logo's drawing; render the logo from the package";
  }
};

export const unlistedCopies = (
  found: Record<string, string>,
  allow: Allowlist,
  committed: Allowlist | undefined,
  mayAdd: (p: string) => boolean = () => false,
) => [
  ...Object.entries(found)
    .filter(([p]) => !(p in allow))
    .map(([p, why]) => `${p}: ${why}; import it from the package`),
  ...Object.entries(allow).flatMap(([p, r]) => [
    ...(r?.trim() ? [] : [`${LIST}: ${p} names no reason`]),
    // An entry on a file that is no copy would let a copy placed there later pass unseen.
    ...(p in found ? [] : [`${LIST}: ${p} is no copy; drop its entry (brand-copies --tighten)`]),
    ...(committed && !(p in committed) && !mayAdd(p)
      ? [
          `${LIST}: ${p} added against HEAD; the list may only shrink, or during a pin change name a file committed as is`,
        ]
      : []),
  ]),
];

if (import.meta.main) {
  answerHelp(USAGE);
  const brand = brandFiles();
  const sizes = brandSizes(brand);
  const found: Record<string, string> = {};
  const tree = listTree("brand-copies");
  for (const p of tree.filter((p) => !exception(p))) {
    const hit = copyOf(
      p,
      (f) => readFileSync(f, "utf8"),
      (f) => isBrandCopy(f, brand, sizes),
    );
    if (hit) found[p] = hit;
  }
  const report = skippedReport("brand-copies", tree);
  if (report) console.log(report);
  const allow = existsSync(LIST) ? (JSON.parse(readFileSync(LIST, "utf8")) as Allowlist) : {};
  const head = runGit(["show", `HEAD:./${LIST}`]);
  const committed = head.status === 0 ? (JSON.parse(head.stdout) as Allowlist) : undefined;
  const upgrade = committed !== undefined && pinChange("brand-copies") !== undefined;
  const mayAdd = (p: string) => upgrade && p in found && committedAsIs(p);
  if (process.argv.includes("--tighten")) {
    const next = Object.fromEntries(
      Object.keys(found)
        .filter((p) => p in allow || mayAdd(p))
        .map((p) => [p, allow[p] ?? ""]),
    );
    writeAllowlist("brand-copies", LIST, next);
  } else {
    const bad = unlistedCopies(found, allow, committed, mayAdd);
    if (bad.length) {
      console.error(
        `${bad.join("\n")}\nbrand-copies: ${bad.length} findings. Read the file from node_modules/@hackersandwizards/brand, or name the exception with its reason in ${LIST}.`,
      );
      process.exit(1);
    }
    console.log(`brand-copies: no copy of a brand file outside ${LIST}`);
  }
}
