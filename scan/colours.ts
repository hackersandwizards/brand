#!/usr/bin/env bun
// The brand colour scan a consumer runs in its own gate, over its working tree from the current
// directory down (tracked and untracked files, .gitignore honoured). Counts per file: hex literals
// off the token set (`hex`), hex literals repeating a token value instead of naming it
// (`tokenHex`), font stacks that do not open on a brand family (`font`), Tailwind default palette
// classes (`palette`). Compares the counts with the consumer's brand-colours.json and exits 1 on
// any count above its entry, any unlisted file with a count, an entry without a reason, or an
// entry that grew against HEAD: the allowlist may only shrink.
// Usage: brand-colours [--tighten]
//   --tighten  lowers every entry to today's count and drops entries at zero; creates the
//              allowlist from today's counts where none exists. Never raises an entry.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { colors } from "../generated/tokens";

export type Counts = { hex: number; tokenHex: number; font: number; palette: number };
export const METRICS = ["hex", "tokenHex", "font", "palette"] as const;
export type Allowlist = Record<string, Counts & { reason: string }>;
export const ALLOWLIST = "brand-colours.json";

const palette = new Set<string>([...Object.values(colors), "#ffffff", "#000000"]);

const SKIP =
  /(^|\/)(node_modules|dist|\.astro|\.next|out|coverage|public|docs|test-results|playwright-report|\.vercel|\.wrangler|worktrees|__pycache__|\.turbo|build)\//;
const EXT = new Set([".css", ".astro", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".html", ".py"]);
const TEST = /(\.test\.|\.spec\.|__tests__\/|(^|\/)tests?\/)/;
const BRAND = /(^|\/)(styles\/brand|assets\/brand)\//;
// Agent tooling the hub (~/.claude) syncs into every repo, non-h&w ones included, so it may not
// take its colours from this package: not brand surface.
const HUB = /^\.claude\/skills\/parallel-session\//;

/** Whether a path is brand surface the scan reads. */
export const scanned = (p: string) =>
  EXT.has(extname(p)) &&
  !SKIP.test(p) &&
  !p.startsWith("src/content/") &&
  !TEST.test(p) &&
  !BRAND.test(p) &&
  !HUB.test(p);

const strip = (s: string, ext: string) =>
  ext === ".py"
    ? s
    : s
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`])\/\/.*$/gm, "$1")
        .replace(/<!--[\s\S]*?-->/g, "");
// 8 and 4 digits carry an alpha channel; the colour part decides token or off-token.
const HEX = /(?<![&\w])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const isColour3 = (h: string) => /\d/.test(h) || /^(.)\1\1$/.test(h);
const FONT = /font-family\s*:\s*([^;}"'`\n]+|["'][^;}\n]+)|fontFamily\s*[:=]\s*["'`]([^"'`]+)/g;
const BRAND_FONT =
  /^\s*(["']?(Inter|JetBrains Mono)( Variable)?["']?|var\(--|inherit|initial|unset|theme\()/i;
const PAL =
  /\b(?:bg|text|border|from|to|via|ring|fill|stroke|outline|divide|decoration|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

/** The counts of one file's source, plus the off-token hexes and off-brand fonts it holds. */
export const scanSource = (raw: string, ext: string) => {
  const src = strip(raw, ext);
  const counts: Counts = { hex: 0, tokenHex: 0, font: 0, palette: 0 };
  const hexes: string[] = [];
  const fonts: string[] = [];
  for (const [, h] of src.matchAll(HEX)) {
    const short = h.length <= 4;
    if (short && !isColour3(h)) continue;
    const rgb6 = short ? [...h.slice(0, 3)].map((x) => x + x).join("") : h.slice(0, 6);
    const colour = "#" + rgb6.toLowerCase();
    if (palette.has(colour)) counts.tokenHex++;
    else {
      counts.hex++;
      hexes.push(h.length % 4 ? colour : "#" + h.toLowerCase());
    }
  }
  for (const m of src.matchAll(FONT)) {
    const v = (m[1] ?? m[2]).trim();
    if (!BRAND_FONT.test(v)) {
      counts.font++;
      fonts.push(v.split(",")[0].trim().replace(/["']/g, ""));
    }
  }
  counts.palette = src.match(PAL)?.length ?? 0;
  return { counts, hexes, fonts };
};

/** Every way the counts exceed the allowlist, and every entry without a reason or grown against
 *  the committed allowlist. */
export const violations = (
  files: Record<string, Counts>,
  allow: Allowlist,
  committed: Allowlist | undefined,
) => {
  const out: string[] = [];
  for (const [file, counts] of Object.entries(files))
    for (const k of METRICS) {
      const allowed = allow[file]?.[k] ?? 0;
      if (counts[k] > allowed) out.push(`${file}: ${k} ${counts[k]}, allowed ${allowed}`);
    }
  for (const [file, e] of Object.entries(allow)) {
    if (!e.reason?.trim()) out.push(`${ALLOWLIST}: ${file} names no reason`);
    if (committed)
      for (const k of METRICS)
        if (e[k] > (committed[file]?.[k] ?? 0))
          out.push(`${ALLOWLIST}: ${file} ${k} grew against HEAD; the allowlist may only shrink`);
  }
  return out;
};

export const tighten = (files: Record<string, Counts>, allow: Allowlist | undefined) => {
  const next: Allowlist = {};
  for (const [file, counts] of Object.entries(files)) {
    const prior = allow?.[file];
    if (allow && !prior) continue;
    const c = Object.fromEntries(
      METRICS.map((k) => [k, prior ? Math.min(prior[k], counts[k]) : counts[k]]),
    ) as Counts;
    if (METRICS.some((k) => c[k])) next[file] = { ...c, reason: prior?.reason ?? "" };
  }
  return next;
};

const runGit = (args: string[]) => spawnSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30 });

/** The counts of every scanned file under the current directory that has any. */
export const scanTree = () => {
  const ls = runGit(["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (ls.status !== 0) throw new Error(`brand-colours: not a git checkout: ${ls.stderr}`);
  const files: Record<string, Counts> = {};
  for (const path of new Set(ls.stdout.split("\0").filter(Boolean))) {
    if (!scanned(path) || !existsSync(path)) continue;
    const { counts } = scanSource(readFileSync(path, "utf8"), extname(path));
    if (METRICS.some((k) => counts[k])) files[path] = counts;
  }
  return files;
};

if (import.meta.main) {
  const allow = existsSync(ALLOWLIST)
    ? (JSON.parse(readFileSync(ALLOWLIST, "utf8")) as Allowlist)
    : undefined;
  const head = runGit(["show", `HEAD:./${ALLOWLIST}`]);
  const committed = head.status === 0 ? (JSON.parse(head.stdout) as Allowlist) : undefined;
  const files = scanTree();
  if (process.argv.includes("--tighten")) {
    writeFileSync(ALLOWLIST, JSON.stringify(tighten(files, allow), null, 2) + "\n");
    console.log(`brand-colours: ${ALLOWLIST} tightened; give every new entry its reason`);
  } else {
    const bad = violations(files, allow ?? {}, committed);
    if (bad.length) {
      console.error(
        `${bad.join("\n")}\nbrand-colours: ${bad.length} findings. Use the brand token, or name the exception with its reason in ${ALLOWLIST}.`,
      );
      process.exit(1);
    }
    console.log(`brand-colours: ${Object.keys(files).length} files within ${ALLOWLIST}`);
  }
}
