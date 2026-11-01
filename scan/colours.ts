#!/usr/bin/env bun
// The brand colour scan a consumer runs in its own gate, over its working tree from the current
// directory down (tracked and untracked files, .gitignore honoured). Counts per file: colour
// literals off the token set, as hex (`hex`) or as rgb()/rgba()/hsl()/hsla() (`rgb`), colour
// literals repeating a token value instead of naming it (`tokenHex`), font stacks that do not open
// on a brand family (`font`), Tailwind default palette classes (`palette`), radii (`radius`) and
// box shadows (`shadow`) whose value is no brand token, Tailwind's default radius and shadow
// classes included. Compares the counts with the consumer's brand-colours.json and exits 1 on any
// count above its entry, any unlisted file with a count, an entry without a reason, or an entry
// that grew against HEAD: the allowlist may only shrink. Prints every built-in exception it applied
// with the number of files it skipped.
// Usage: brand-colours [--tighten]
//   --tighten  lowers every entry to today's count and drops entries at zero; creates the
//              allowlist from today's counts where none exists. Never raises an entry.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import manifest from "../manifest.json";
import { colors, tokens } from "../generated/tokens";

export type Counts = {
  hex: number;
  tokenHex: number;
  font: number;
  palette: number;
  rgb: number;
  radius: number;
  shadow: number;
};
export const METRICS = ["hex", "tokenHex", "font", "palette", "rgb", "radius", "shadow"] as const;
export type Allowlist = Record<string, Partial<Counts> & { reason: string }>;
export const ALLOWLIST = "brand-colours.json";

const palette = new Set<string>([...Object.values(colors), "#ffffff", "#000000"]);

const toHex = (rgb: number[]) =>
  "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a: string, p: number, b: string) => {
  const [x, y] = [channels(a), channels(b)];
  return toHex(x.map((v, i) => v * p + y[i] * (1 - p)));
};
// The mixes a standalone SVG may write as hex, since it cannot name a token: every token colour on
// white at Tailwind's opacity steps (5 % to 95 %) and at the 7 % wash tokens.css names, and each
// hue row's text colour at 70 % with ink (tokens.css, Roles). Within 1 per channel, for rounding.
const ROWS = [
  ["teal", "teal-dark"],
  ["purple", "purple"],
  ["amber", "amber-dark"],
  ["green", "green-dark"],
  ["factory", "factory"],
  ["red", "red"],
  ["ampersand", "muted"],
] as const;
const c = (name: string) => colors[`--color-${name}` as keyof typeof colors];
const STEPS = [0.07, ...Array.from({ length: 19 }, (_, i) => (i + 1) / 20)];
const LADDER = [
  ...palette,
  ...Object.values(colors).flatMap((hex) => STEPS.map((p) => mix(hex, p, "#ffffff"))),
  ...ROWS.map(([, text]) => mix(c(text), 0.7, c("ink"))),
].map(channels);
/** Whether an SVG may write this hex: a token or a mix of one the package derives. */
export const onLadder = (hex: string) => {
  const x = channels(hex);
  return LADDER.some((l) => l.every((v, i) => Math.abs(v - x[i]) <= 1));
};

const norm = (v: string) =>
  v
    .toLowerCase()
    .replace(/!important/, "")
    .replace(/(^|[^\d])\.(\d)/g, "$10.$2")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();
const tokenValues = (prefix: string) =>
  new Set(
    Object.entries(tokens)
      .filter(([k]) => k.startsWith(prefix))
      .map(([, v]) => norm(v)),
  );
const RADII = tokenValues("--radius-");
const SHADOWS = tokenValues("--shadow-");
const NEUTRAL = /^(0|0px|none|inherit|initial|unset|revert|revert-layer)$/;
const PURE_VAR = /^(var\(--[\w-]+(, [^()]+)?\)|theme\([^()]+\))$/;

/** Exceptions the scan applies before it reads a file, each with its reason. The README names
 *  the same list; the scan prints each one it applied. */
export const EXCEPTIONS = [
  {
    name: "generated",
    reason:
      "build, cache and dependency output, and nested worktrees (other checkouts with their own gate): rebuilt from source the scan reads",
    test: (p: string) =>
      /(^|\/)(node_modules|dist|\.astro|\.next|out|coverage|test-results|playwright-report|\.vercel|\.wrangler|worktrees|__pycache__|\.turbo|build)\//.test(
        p,
      ),
  },
  {
    name: "tests",
    reason: "a test states the values it asserts, off-token ones included, and ships no surface",
    test: (p: string) => /(\.test\.|\.spec\.|__tests__\/|(^|\/)tests?\/)/.test(p),
  },
  {
    name: "allowlists",
    reason: "the scans' own exception lists, whose reasons name the values they allow",
    test: (p: string) => /(^|\/)brand-(colours|copies|scan)\.json$/.test(p),
  },
  {
    name: "hub",
    reason:
      "agent tooling the ~/.claude hub syncs into every repo, non-h&w ones included, so it cannot take its files from this package",
    test: (p: string) => p.startsWith(".claude/skills/parallel-session/"),
  },
] as const;

const EXT = new Set([
  ".css",
  ".scss",
  ".astro",
  ".tsx",
  ".ts",
  ".mts",
  ".cts",
  ".jsx",
  ".js",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".html",
  ".svg",
  ".py",
  ".json",
  ".webmanifest",
]);
export const NOT_STYLING = {
  name: "not styling",
  reason: `files that carry no styling the browser or a renderer reads: prose (.md, .mdx, .txt), images, fonts, PDFs and other binaries; read are ${[...EXT].join(" ")}`,
};
export const BRAND_COPY = {
  name: "brand copy",
  reason: "byte-identical to a package file, which brand-copies reports and its allowlist governs",
};

/** The name of the built-in exception that keeps a path out of the scans, if any. */
export const exception = (p: string) => EXCEPTIONS.find((e) => e.test(p))?.name;

/** Whether a path is brand surface the scan reads. */
export const scanned = (p: string) => EXT.has(extname(p)) && !exception(p);

const strip = (s: string, ext: string) =>
  ext === ".py"
    ? s
    : s
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`])\/\/.*$/gm, "$1")
        .replace(/<!--[\s\S]*?-->/g, "");
// 8 and 4 digits carry an alpha channel; the colour part decides token or off-token.
const HEX = /(?<![&\w])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const isColour3 = (h: string) => /\d/.test(h) || /^(.)\1\1/.test(h);
const FN = /(?<![\w-])(rgba?|hsla?)\(([^()]*)\)/gi;
const FONT = /font-family\s*:\s*([^;}"'`\n]+|["'][^;}\n]+)|fontFamily\s*[:=]\s*["'`]([^"'`]+)/g;
const BRAND_FONT =
  /^\s*(["']?(Inter|JetBrains Mono)( Variable)?["']?|var\(--|inherit|initial|unset|theme\()/i;
const PAL =
  /\b(?:bg|text|border|from|to|via|ring|fill|stroke|outline|divide|decoration|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;
const PROP =
  /(?<![\w-])(border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius|border(?:Top|Bottom|Start|End)?(?:Left|Right|Start|End)?Radius|--[\w-]*radius[\w-]*|box-shadow|boxShadow|--[\w-]*shadow[\w-]*)\s*[:=]\s*/g;
const SIDES = "(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?";
const CLASS = new RegExp(
  `(?<![\\w-])(?:rounded${SIDES}-(xs|md|lg|xl|2xl|3xl|4xl|\\[[^\\]\\s]+\\])|shadow-(2xs|xs|sm|md|lg|xl|2xl|inner|\\[[^\\]\\s]+\\]))(?![\\w-])`,
  "g",
);

/** The colour of an rgb()/hsl() literal as #rrggbb, or undefined where it names no literal. */
export const fnColour = (fn: string, args: string) => {
  const parts = args.trim().split(/[\s,/]+/);
  if (parts.length < 3 || !parts.slice(0, 3).every((x) => /^-?[\d.]+(%|deg)?$/.test(x))) return;
  const n = parts.slice(0, 3).map((x) => parseFloat(x));
  if (fn.toLowerCase().startsWith("rgb"))
    return toHex(parts.slice(0, 3).map((x, i) => (x.endsWith("%") ? n[i] * 2.55 : n[i])));
  const [h, s, l] = [n[0], n[1] / 100, n[2] / 100];
  const k = (m: number) => (m + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  return toHex([0, 8, 4].map((m) => 255 * (l - a * Math.max(-1, Math.min(k(m) - 3, 9 - k(m), 1)))));
};

/** The value a declaration sets from `i` on: a quoted string, a JS number in px, or CSS up to the
 *  declaration's end. */
const valueAt = (src: string, i: number) => {
  const q = src[i];
  if (q === '"' || q === "'" || q === "`") {
    const end = src.indexOf(q, i + 1);
    return { value: src.slice(i + 1, end < 0 ? undefined : end), end: end + 1 };
  }
  const num = /^-?\d+(\.\d+)?(?=\s*[,}\n;)])/.exec(src.slice(i, i + 20));
  if (num) return { value: num[0] === "0" ? "0" : `${num[0]}px`, end: i + num[0].length };
  const name = /^[A-Za-z_$][\w$.]*(?=\s*[,}\n;)])/.exec(src.slice(i, i + 100));
  if (name) return { value: name[0], end: i + name[0].length };
  const m = /^[^;}"'`{<>]{0,400}/.exec(src.slice(i))!;
  return { value: m[0], end: i + m[0].length };
};

/** Whether a radius or shadow value is a token, a neutral keyword or a reference to one; undefined
 *  where the scan cannot read a value (an interpolation or a variable). */
const onToken = (value: string, tokenSet: Set<string>) => {
  const v = norm(value);
  if (NEUTRAL.test(v) || PURE_VAR.test(v) || tokenSet.has(v)) return true;
  if (!v || /[${}]/.test(v) || /^[a-z_][\w.]*$/.test(v)) return undefined;
  return false;
};

/** The counts of one file's source, plus the off-token colours and off-brand fonts it holds. */
export const scanSource = (raw: string, ext: string) => {
  let src = strip(raw, ext);
  const counts: Counts = {
    hex: 0,
    tokenHex: 0,
    font: 0,
    palette: 0,
    rgb: 0,
    radius: 0,
    shadow: 0,
  };
  const hexes: string[] = [];
  const fonts: string[] = [];
  const blank = (from: number, to: number) =>
    (src = src.slice(0, from) + " ".repeat(to - from) + src.slice(to));
  // Radii and shadows first: a shadow's colour belongs to the shadow and counts there only.
  for (const m of [...src.matchAll(PROP)]) {
    const start = m.index + m[0].length;
    const { value, end } = valueAt(src, start);
    const shadow = /shadow/i.test(m[1]);
    const ok = onToken(value, shadow ? SHADOWS : RADII);
    if (ok === false) counts[shadow ? "shadow" : "radius"]++;
    if (shadow) blank(start, Math.max(start, end));
  }
  for (const m of [...src.matchAll(CLASS)]) {
    const shadow = m[2] !== undefined;
    const arb = (m[1] ?? m[2]).match(/^\[(.+)\]$/)?.[1];
    const ok = arb ? onToken(arb.replace(/_/g, " "), shadow ? SHADOWS : RADII) : false;
    if (ok === false) counts[shadow ? "shadow" : "radius"]++;
    if (shadow) blank(m.index, m.index + m[0].length);
  }
  const colour = (hex: string, literal: string, kind: "hex" | "rgb") => {
    if (ext === ".svg" && onLadder(hex)) return;
    if (palette.has(hex)) counts.tokenHex++;
    else {
      counts[kind]++;
      hexes.push(literal);
    }
  };
  for (const [, h] of src.matchAll(HEX)) {
    const short = h.length <= 4;
    if (short && !isColour3(h)) continue;
    const rgb6 = short ? [...h.slice(0, 3)].map((x) => x + x).join("") : h.slice(0, 6);
    const hex = "#" + rgb6.toLowerCase();
    colour(hex, h.length % 4 ? hex : "#" + h.toLowerCase(), "hex");
  }
  for (const [lit, fn, args] of src.matchAll(FN)) {
    const hex = fnColour(fn, args);
    if (hex) colour(hex, lit, "rgb");
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
        if ((e[k] ?? 0) > (committed[file]?.[k] ?? 0))
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
      METRICS.map((k) => [k, prior ? Math.min(prior[k] ?? 0, counts[k]) : counts[k]]),
    ) as Counts;
    if (METRICS.some((k) => c[k])) next[file] = { ...c, reason: prior?.reason ?? "" };
  }
  return next;
};

const runGit = (args: string[]) => spawnSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30 });

/** Every file under the current directory, tracked or untracked, .gitignore honoured. */
export const listTree = (cmd: string) => {
  const ls = runGit(["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (ls.status !== 0) throw new Error(`${cmd}: not a git checkout: ${ls.stderr}`);
  return [...new Set(ls.stdout.split("\0"))].filter((p) => p && existsSync(p));
};

const LFS = /^version https:\/\/git-lfs\.github\.com\/spec\/v1\noid sha256:([0-9a-f]{64})\n/;
/** A file's sha256, read through a Git LFS pointer to the object it names. */
export const contentHash = (b: Buffer) =>
  LFS.exec(b.subarray(0, 200).toString("latin1"))?.[1] ??
  createHash("sha256").update(b).digest("hex");

const PKG = join(import.meta.dir, "..");
const walk = (dir: string): string[] =>
  existsSync(join(PKG, dir))
    ? readdirSync(join(PKG, dir), { recursive: true, encoding: "utf8" })
        .map((f) => join(dir, f))
        .filter((f) => statSync(join(PKG, f)).isFile())
    : [];
/** Every file this package ships as a brand asset, by sha256: manifest.json's files (the print
 *  masters among them by hash alone) plus the generated token formats, the client marks and the
 *  mail signature template. Files under 64 bytes are left out: too small to be a copy. */
export const brandFiles = () => {
  const out = new Map<string, string>(manifest.files.map((f) => [f.sha256, f.path]));
  for (const f of ["generated", "clients", "applications/mail-signature"].flatMap(walk))
    if (statSync(join(PKG, f)).size >= 64) out.set(contentHash(readFileSync(join(PKG, f))), f);
  return out;
};
/** The sizes of the brand files present on disk, to hash only consumer files that could match. */
export const brandSizes = (files: Map<string, string>) =>
  new Set(
    [...files.values()]
      .filter((f) => existsSync(join(PKG, f)))
      .map((f) => statSync(join(PKG, f)).size),
  );
/** Whether a consumer file is byte-identical to a brand file, the size checked before the hash. */
export const isBrandCopy = (
  path: string,
  files: Map<string, string>,
  sizes: Set<number>,
): string | undefined => {
  const size = statSync(path).size;
  const pointer = size < 200 && readFileSync(path).subarray(0, 8).toString() === "version ";
  if (!sizes.has(size) && !pointer) return;
  return files.get(contentHash(readFileSync(path)));
};

/** The counts of every scanned file under the current directory that has any, and how many files
 *  each built-in exception kept out. */
export const scanTree = () => {
  const brand = brandFiles();
  const sizes = brandSizes(brand);
  const files: Record<string, Counts> = {};
  const skipped: Record<string, number> = {};
  for (const path of listTree("brand-colours")) {
    const why =
      exception(path) ??
      (!EXT.has(extname(path))
        ? NOT_STYLING.name
        : isBrandCopy(path, brand, sizes)
          ? BRAND_COPY.name
          : undefined);
    if (why) {
      skipped[why] = (skipped[why] ?? 0) + 1;
      continue;
    }
    const { counts } = scanSource(readFileSync(path, "utf8"), extname(path));
    if (METRICS.some((k) => counts[k])) files[path] = counts;
  }
  return { files, skipped };
};

/** One line per built-in exception that kept a file out, with its count and reason. */
export const exceptionReport = (cmd: string, skipped: Record<string, number>) =>
  [...EXCEPTIONS, NOT_STYLING, BRAND_COPY]
    .filter((e) => skipped[e.name])
    .map((e) => `${cmd}: not scanned, ${e.name} (${skipped[e.name]} files): ${e.reason}`)
    .join("\n");

if (import.meta.main) {
  const allow = existsSync(ALLOWLIST)
    ? (JSON.parse(readFileSync(ALLOWLIST, "utf8")) as Allowlist)
    : undefined;
  const head = runGit(["show", `HEAD:./${ALLOWLIST}`]);
  const committed = head.status === 0 ? (JSON.parse(head.stdout) as Allowlist) : undefined;
  const { files, skipped } = scanTree();
  const report = exceptionReport("brand-colours", skipped);
  if (report) console.log(report);
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
