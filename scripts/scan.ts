#!/usr/bin/env bun
// Read-only brand scan of every repo in repos.json at its last commit. Counts per file: hex
// literals off the token set (`hex`), hex literals repeating a token value instead of naming it
// (`tokenHex`), font stacks that do not open on a brand family (`font`), Tailwind default palette
// classes (`palette`); and component names found in more than one repo outside the byte-identical
// slide engine copies (`duplicates`). Compares the counts with scan-allowlist.json and exits 1 on
// any count above its entry, any unlisted file with a count, or any unlisted duplicate.
// Usage: bun scripts/scan.ts [--check] [--tighten]
//   default    writes reports/scan.json, then compares
//   --check    compares only, writes nothing
//   --tighten  lowers every allowlist entry to today's count and drops entries at zero; creates the
//              allowlist from today's counts where none exists. Never raises an entry.
// A repo that is not checked out is skipped with a warning, so its entries are not compared.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import repos from "../repos.json";
import { blobs, head, isRepo, ROOT, sha256, tree } from "./git";
import { parseTokens, resolveColors, rgb, SOURCE } from "./tokens";

export type Counts = { hex: number; tokenHex: number; font: number; palette: number };
export const METRICS = ["hex", "tokenHex", "font", "palette"] as const;
export type Allowlist = {
  files: Record<string, Counts & { reason: string }>;
  duplicates: Record<string, string>;
};

const palette = new Map<string, string>(
  Object.entries(resolveColors(parseTokens(readFileSync(SOURCE, "utf8")))).map(([k, v]) => [v, k]),
);
for (const [h, n] of [
  ["#ffffff", "white"],
  ["#000000", "black"],
])
  if (!palette.has(h)) palette.set(h, n);
export const nearest = (h: string): [string, number] => {
  let best: [string, number] = ["", Infinity];
  for (const [p, n] of palette) {
    const d = Math.hypot(...rgb(h).map((v, i) => v - rgb(p)[i]));
    if (d < best[1]) best = [n, d];
  }
  return best;
};

const SKIP =
  /(^|\/)(node_modules|dist|\.astro|\.next|out|coverage|public|docs|test-results|playwright-report|\.vercel|\.wrangler|worktrees|__pycache__|\.turbo|build)\//;
const EXT = new Set([".css", ".astro", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".html", ".py"]);
const TEST = /(\.test\.|\.spec\.|__tests__\/|(^|\/)tests?\/)/;
const BRAND = /(^|\/)(styles\/brand|assets\/brand)\//;
// Agent tooling the hub (~/.claude) syncs into every repo, non-h&w ones included, so it may not
// take its colours from this package: not brand surface.
const HUB = /^\.claude\/skills\/parallel-session\//;
const ENGINE =
  /^(talks\/)?(components\/(slides|ui)|lib|types|src\/slides\/(components|lib|types))\//;

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

type RepoName = keyof typeof repos;
const tally = (m: Record<string, number>, k: string) => (m[k] = (m[k] ?? 0) + 1);
const top = (m: Record<string, number>, n: number) =>
  Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

export const scan = () => {
  const report = {
    date: new Date().toISOString().slice(0, 10),
    repos: {} as Record<string, unknown>,
    skipped: [] as string[],
    files: {} as Record<string, Counts>,
    duplicates: {} as Record<string, { repo: string; path: string; identical: boolean }[]>,
  };
  const comps = new Map<string, { repo: string; path: string; sha: string }[]>();
  for (const name of Object.keys(repos) as RepoName[]) {
    const root = join(ROOT, repos[name].path);
    if (!isRepo(root)) {
      console.warn(`scan: ${name} not checked out at ${root}, skipped`);
      report.skipped.push(name);
      continue;
    }
    const copies = repos[name].copies.map(([, to]) => to);
    const files = tree(root).filter(
      ([p]) =>
        EXT.has(extname(p)) &&
        !SKIP.test(p) &&
        !p.startsWith("src/content/") &&
        !TEST.test(p) &&
        !BRAND.test(p) &&
        !HUB.test(p) &&
        !copies.some((c) => (c.endsWith("/") ? p.startsWith(c) : p === c)),
    );
    const content = blobs(
      root,
      files.map(([, id]) => id),
    );
    const totals: Counts = { hex: 0, tokenHex: 0, font: 0, palette: 0 };
    const off: Record<string, number> = {};
    const fonts: Record<string, number> = {};
    for (const [path, id] of files) {
      const raw = content.get(id)!;
      const ext = extname(path);
      const r = scanSource(raw.toString("utf8"), ext);
      for (const k of METRICS) totals[k] += r.counts[k];
      r.hexes.forEach((h) => tally(off, h));
      r.fonts.forEach((f) => tally(fonts, f));
      if (METRICS.some((k) => r.counts[k])) report.files[`${name}:${path}`] = r.counts;
      if ([".astro", ".tsx", ".jsx"].includes(ext) && /components\//.test(path)) {
        const key = basename(path, ext).toLowerCase();
        comps.set(key, [...(comps.get(key) ?? []), { repo: name, path, sha: sha256(raw) }]);
      }
    }
    report.repos[name] = {
      commit: head(root),
      files: files.length,
      totals,
      offHex: top(off, 8).map(([h, n]) => {
        const [token, d] = nearest(h);
        return { hex: h, count: n, ...(d <= 12 ? { near: token, distance: +d.toFixed(1) } : {}) };
      }),
      offFonts: top(fonts, 6).map(([font, count]) => ({ font, count })),
    };
  }
  for (const [key, list] of [...comps].sort()) {
    if (new Set(list.map((x) => x.repo)).size < 2) continue;
    const identical = new Set(list.map((x) => x.sha)).size === 1;
    if (identical && list.every((x) => ENGINE.test(x.path))) continue;
    report.duplicates[key] = list.map(({ repo, path }) => ({ repo, path, identical }));
  }
  return report;
};

/** Every way the report exceeds the allowlist, ignoring entries of skipped repos. */
export const violations = (report: ReturnType<typeof scan>, allow: Allowlist) => {
  const out: string[] = [];
  for (const [file, counts] of Object.entries(report.files))
    for (const k of METRICS) {
      const allowed = allow.files[file]?.[k] ?? 0;
      if (counts[k] > allowed) out.push(`${file}: ${k} ${counts[k]}, allowed ${allowed}`);
    }
  for (const key of Object.keys(report.duplicates))
    if (!(key in allow.duplicates)) out.push(`duplicate component not allowlisted: ${key}`);
  return out;
};

export const tighten = (report: ReturnType<typeof scan>, allow: Allowlist | undefined) => {
  const BASELINE = "Present at the first scan, not yet reviewed.";
  const skipped = (key: string) => report.skipped.includes(key.split(":")[0]);
  const files: Allowlist["files"] = {};
  for (const [file, entry] of Object.entries(allow?.files ?? {}))
    if (skipped(file)) files[file] = entry;
  for (const [file, counts] of Object.entries(report.files)) {
    const prior = allow?.files[file];
    if (allow && !prior) continue;
    const next = Object.fromEntries(
      METRICS.map((k) => [k, prior ? Math.min(prior[k], counts[k]) : counts[k]]),
    ) as Counts;
    if (METRICS.some((k) => next[k])) files[file] = { ...next, reason: prior?.reason ?? BASELINE };
  }
  // A duplicate does not name its repos, so with any repo skipped every entry stays.
  const duplicates: Allowlist["duplicates"] = report.skipped.length ? { ...allow?.duplicates } : {};
  for (const key of Object.keys(report.duplicates))
    if (!allow || key in allow.duplicates) duplicates[key] = allow?.duplicates[key] ?? BASELINE;
  return { files, duplicates };
};

if (import.meta.main) {
  const allowPath = join(ROOT, "scan-allowlist.json");
  const allow = existsSync(allowPath)
    ? (JSON.parse(readFileSync(allowPath, "utf8")) as Allowlist)
    : undefined;
  const report = scan();
  const bad = violations(report, allow ?? { files: {}, duplicates: {} });
  if (!process.argv.includes("--check"))
    writeFileSync(
      join(ROOT, "reports/scan.json"),
      JSON.stringify({ ...report, aboveAllowlist: bad }, null, 2) + "\n",
    );
  if (process.argv.includes("--tighten")) {
    writeFileSync(allowPath, JSON.stringify(tighten(report, allow), null, 2) + "\n");
    console.log("scan: allowlist tightened");
  } else if (bad.length) {
    console.error(
      `${bad.join("\n")}\nscan: ${bad.length} findings above scan-allowlist.json. Fix the file in its repo; the allowlist may only shrink.`,
    );
    process.exit(1);
  } else console.log(`scan: ${Object.keys(report.files).length} files within the allowlist`);
}
