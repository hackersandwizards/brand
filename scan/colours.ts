#!/usr/bin/env bun
// The brand colour scan a consumer runs in its own gate, over its working tree from the current
// directory down (tracked and untracked files, .gitignore honoured). Counts per file: colour
// literals off the token set, as hex or a CSS colour name in a colour property (a JSX or Astro
// expression prop's strings included), SVG colour attribute, color-mix(), Tailwind arbitrary value
// or a custom property set to that name alone (`hex`), or as a colour function, rgb() and hsl()
// through oklch(), lab(), hwb() and color() (`rgb`), an interpolation's names (${...}) never
// read as one, colour literals repeating a token value instead of naming it, white and black included
// (`tokenHex`), font stacks that do not open on a brand family, in font-family, the font
// shorthand, an SVG attribute or a style key, and Tailwind's font-serif (`font`), Tailwind default
// palette classes (`palette`), radii (`radius`)
// and box shadows (`shadow`) whose value is no brand token, vendor-prefixed ones included,
// Tailwind's default radius and shadow classes with a size included (bare `rounded` and `shadow`
// match prose, so they are not read). Compares the counts with the consumer's brand-colours.json
// and exits 1 on any count above or below its entry (an allowance above the count would let a new
// finding there pass), any unlisted file with a count, an entry without a reason, an entry on a
// file with no count (stale, so an old allowance cannot hide a new finding there), or an entry
// that grew against HEAD: the allowlist may only shrink. An entry may grow, a new file's included,
// where the allowlist's total for that metric does not grow against HEAD, so a value moved from one
// file to another moves its entry in the same commit. Where the working tree changes the brand
// pin package.json holds at HEAD, an entry may also grow to what this scanner finds in the file as
// committed at HEAD, so a pin raise lists a newer scanner's findings in the same commit while
// anything the consumer's own new code adds still fails. An entry on an SVG naming a `partner`, the
// third party whose mark it is (a conference's or a client's logo), keeps that file out of the
// counts with its reason, and may be added in any commit: its colours are its owner's. Prints every
// built-in exception it applied with the number of files it skipped, and every partner mark it
// allowed.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import manifest from "../manifest.json";
import own from "../package.json";
import { colors, tokens } from "../generated/tokens";
import { answerHelp } from "./help";

const USAGE = `usage: brand-colours [--tighten]
Counts colours, radii, shadows and fonts off the brand tokens in the working tree and compares
them with brand-colours.json; exits 1 on a finding.
  --tighten  lowers every entry to today's count and drops metrics and entries at zero; creates
             the allowlist from today's counts where none exists and a count is found. Raises an
             entry, or adds one with an empty reason, only during a pin change, to what HEAD's
             file holds.`;

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
export type Allowlist = Record<string, Partial<Counts> & { reason: string; partner?: string }>;
/** Whether an entry is a partner's mark: an SVG naming the third party it belongs to. */
export const isPartner = (file: string, e: Allowlist[string] | undefined) =>
  Boolean(e?.partner?.trim()) && extname(file) === ".svg";
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
// hue row's text colour at 70 % with ink (tokens.css, Hues). Within 1 per channel, for rounding.
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
// A var() whose fallback is a literal or another such var(), at any depth, and theme().
const VAR = /var\(--[\w-]+(, [^()]+)?\)/g;
const pureVar = (v: string) => {
  for (let prev = ""; prev !== v;) [prev, v] = [v, v.replace(VAR, "var")];
  return v === "var" || /^theme\([^()]+\)$/.test(v);
};

/** Exceptions the scan applies before it reads a file, each with its reason. `docs/checks.md` names
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
    test: (p: string) =>
      /(\.test\.|\.spec\.|__tests__\/|(^|\/)tests?\/|(^|\/)(test_[^/]*|[^/]*_test|conftest)\.py$)/.test(
        p,
      ),
  },
  {
    name: "allowlists",
    reason: "the scans' own exception lists, whose reasons name the values they allow",
    test: (p: string) => /(^|\/)brand-(colours|copies|scan|elements)\.json$/.test(p),
  },
  {
    name: "hub",
    reason:
      "agent tooling the ~/.claude hub syncs into every repo, non-h&w ones included, so it cannot take its files from this package",
    test: (p: string) =>
      p.startsWith(".claude/skills/parallel-session/") || p === ".claude/skills/voice/verbal.json",
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

/** The extensions of a component file, in the frameworks a consumer builds with. */
export const COMPONENT = new Set([".astro", ".tsx", ".jsx", ".vue", ".svelte"]);

/** The name of the built-in exception that keeps a path out of the scans, if any. */
export const exception = (p: string) => EXCEPTIONS.find((e) => e.test(p))?.name;

/** Whether a path is brand surface the scan reads. */
export const scanned = (p: string) => EXT.has(extname(p)) && !exception(p);

// A style element the documents engine (@hackersandwizards/documents) wrote into a document it
// composed: the engine's own stylesheets, inlined so the document stands alone, which the engine's
// gate scans in its source. Whatever else the document carries is the consumer's and is read.
export const ENGINE_STYLE =
  /<style\s+data-hw-(?:document|components|page|onepager|readout|certificate)\b[^>]*>[\s\S]*?<\/style>/g;
// A string such as the glob "src/*" holds what reads as a comment opener, so a string is kept whole
// before a block comment is dropped, in every file but CSS and SVG, which hold no such string.
const CSS_OR_SVG = /^\.(css|svg)$/;
const SCRIPT_EXT = /^\.([cm]?[jt]sx?|json|webmanifest)$/;
const MARKUP = /^\.(astro|vue|svelte|html)$/;
// The files whose markup takes a prop as a {...} expression.
const PROPS = /^\.(astro|svelte|[jt]sx|[cm]?js)$/;
const BLOCK = /\/\*[\s\S]*?\*\//g;
const STRING_OR_BLOCK =
  /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\//g;
const lineComments = (s: string) => s.replace(/(^|[^:"'`(])\/\/.*$/gm, "$1");
// In markup strings and line comments exist only in script (the frontmatter and <script>) and
// strings in <style>. Elsewhere an apostrophe is prose and a // is a URL, such as href=//host or a
// srcset's //cdn/b.png 2x.
const CODE_PART =
  /^---\r?\n[\s\S]*?\r?\n---|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/g;
const keepStrings = (s: string) => s.replace(STRING_OR_BLOCK, (_, str?: string) => str ?? "");
const markup = (s: string) => {
  let out = "";
  let last = 0;
  for (const m of s.matchAll(CODE_PART)) {
    const code = keepStrings(m[0]);
    out += s.slice(last, m.index).replace(BLOCK, "");
    out += m[0].startsWith("<style") ? code : lineComments(code);
    last = m.index + m[0].length;
  }
  return out + s.slice(last).replace(BLOCK, "");
};
const strip = (s: string, ext: string) => {
  if (ext === ".py") return s;
  const out = s.replace(ENGINE_STYLE, "").replace(/<!--[\s\S]*?-->/g, "");
  if (CSS_OR_SVG.test(ext)) return out.replace(BLOCK, "");
  return MARKUP.test(ext) ? markup(out) : lineComments(keepStrings(out));
};
// 8 and 4 digits carry an alpha channel; the colour part decides token or off-token.
const HEX = /(?<![&\w])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
// A 3- or 4-digit hex of letters alone (#add, #fab) is a colour only in the value of a colour
// property, attribute or key, or a Tailwind class's brackets; never a url(#id) or a selector.
const VALUE_BEFORE =
  /(?:(?:colou?r|fill|stroke|background|border|outline|shadow|caret|accent|decoration)[\w-]*["']?\s*[:=]\s*["'`]?(?:[^;{}<>"'`\n]*[\s,(])?|-\[)$/i;
const isColour3 = (h: string, before: string) =>
  /\d/.test(h) || /^(.)\1\1/.test(h) || (VALUE_BEFORE.test(before) && !/url\(\s*$/i.test(before));
const FN = /(?<![\w-])(rgba?|hsla?)\(([^()]*)\)/gi;
// The other colour functions, counted as rgb without conversion where their arguments are a
// colour's: numbers, percentages, angles or none, or color()'s colour space first.
const NUM = String.raw`(?:-?[\d.]+(?:%|deg|g?rad|turn)?|none)`;
const MODERN = new RegExp(
  String.raw`(?<![\w-])(?:(?:oklch|oklab|lab|lch|hwb)\(\s*${NUM}(?:[\s,_/]+${NUM}){2,3}\s*\)|color\(\s*(?:srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65)[\s_][^()]*\))`,
  "gi",
);
// The CSS named colours, white and black aside (tokens, counted as such); transparent and
// currentColor name no colour.
const NAMED = new Set(
  "aliceblue antiquewhite aqua aquamarine azure beige bisque blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat yellow yellowgreen".split(
    " ",
  ),
);
const WORD = /(?<![\w$.#/-])([a-z]+)(?![\w./-])/gi;
// Where a value is a colour: a colour property in CSS or JS, a colour attribute in SVG, a
// color-mix(), and a Tailwind colour class's arbitrary value. The value runs to the declaration's
// end; a bare identifier in script (color: teal, a variable) is no literal and is left alone.
const COLOUR_AT =
  /(?<![\w-])(?:color|background(?:-color)?|backgroundColor|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|border(?:Top|Right|Bottom|Left)?Color|outline(?:-color)?|outlineColor|fill|stroke|stop-color|stopColor|flood-color|lighting-color|caret-color|caretColor|accent-color|accentColor|text-decoration(?:-color)?|textDecorationColor|column-rule(?:-color)?|--[\w-]*colou?r[\w-]*)\s*[:=]\s*|color-mix\(/g;
// A custom property set to one colour name and nothing else, in CSS or as a style key.
const CUSTOM =
  /(?<![\w-])--[\w-]+["']?\s*:\s*(["'`]?)([a-z]+)\1\s*(?:!important\s*)?(?=[;},\n"']|$)/gim;
/** The strings an expression can take as its value: one at its own level, grouping parentheses
 * included, that opens it or a branch (after {, (, ?, :, && or ||), never one it compares or tests
 * with in, nor one inside a key, a call's arguments or an object. */
const valueStrings = (code: string) => {
  const out: RegExpExecArray[] = [];
  // Per open bracket, whether it starts a level of its own; a grouping ( does not.
  const levels: boolean[] = [];
  for (const m of code.matchAll(/"[^"\n]*"|'[^'\n]*'|`[^`]*`|[[({]|[\])}]/g)) {
    const t = m[0];
    if ("[({".includes(t)) levels.push(t !== "(" || /[\w$\])]\s*$/.test(code.slice(0, m.index)));
    else if ("])}".includes(t)) levels.pop();
    else if (
      levels.filter(Boolean).length === 1 &&
      /(?:[{(?:]|&&|\|\|)\s*$/.test(code.slice(0, m.index)) &&
      !/^\s*(?:[!=]=|in\b)/.test(code.slice(m.index + t.length))
    )
      out.push(m);
  }
  return out;
};
/** The expression a { at `i` opens, to its matching }, read at most 400 characters on. */
const expression = (src: string, i: number) => {
  let depth = 0;
  for (let j = i; j < Math.min(src.length, i + 400); j++) {
    depth += src[j] === "{" ? 1 : src[j] === "}" ? -1 : 0;
    if (!depth) return src.slice(i, j + 1);
  }
  return src.slice(i, i + 400);
};
const ARBITRARY =
  /(?<![\w-])(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|fill|stroke|outline|divide|decoration|shadow|accent|caret|from|to|via|placeholder)-\[([^\]\s]+)\]/g;
const FONT =
  /font-family\s*:\s*([^;}"'`\n]+|["'][^;}\n]+)|fontFamily\s*[:=]\s*["'`]([^"'`]+)|["']font-family["']\s*:\s*["']([^"']+)|font-family\s*=\s*["']([^"']+)/g;
// The font shorthand: style, variant and weight, then the size (with a line height), then the
// family list, which must open on a brand family like font-family's.
const SHORTHAND = /(?<![\w-])font\s*[:=]\s*/g;
const SIZE =
  /(?:^|\s)(?:[\d.]+(?:px|r?em|pt|pc|%|vw|vh|ch|ex|r?lh|cap|ic|[sld]?v(?:h|w|min|max)|cq[iwbh]|q|mm|cm|in)|(?:xx?-|xxx-)?(?:small|large)|medium|larger|smaller|var\([^()]*\)|calc\([^()]*\))(?:\s*\/\s*\S+)?\s+(.+)$/;
const BRAND_FONT =
  /^\s*(["']?(Inter|JetBrains Mono)( Variable)?["']?(?=\s*(?:[,;!}"'`]|$))|var\(--|inherit|initial|unset|theme\()/i;
const PAL =
  /\b(?:bg|text|border(?:-[trblxyse])?|from|to|via|ring(?:-offset)?|inset-ring|fill|stroke|outline|divide|decoration|shadow|inset-shadow|text-shadow|drop-shadow|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;
// Tailwind's serif stack, which no brand theme maps to a brand family.
const SERIF = /(?<![\w-])font-serif(?![\w-])/g;
const PROP =
  /(?<![\w-])(?:-(?:webkit|moz)-)?(border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius|border(?:Top|Bottom|Start|End)?(?:Left|Right|Start|End)?Radius|--[\w-]*radius[\w-]*|box-shadow|boxShadow|--[\w-]*shadow[\w-]*)\s*[:=]\s*/g;
const SIDES = "(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?";
const CLASS = new RegExp(
  `(?<![\\w-])(?:rounded${SIDES}-(xs|md|lg|xl|2xl|3xl|4xl|\\[[^\\]\\s]+\\])|shadow-(2xs|xs|sm|md|lg|xl|2xl|inner|\\[[^\\]\\s]+\\]))(?![\\w-])`,
  "g",
);

/** The colour of an rgb()/hsl() literal as #rrggbb, or undefined where it names no literal. */
export const fnColour = (fn: string, args: string) => {
  const parts = args.trim().split(/[\s,/_]+/);
  if (parts.length < 3 || !parts.slice(0, 3).every((x) => /^-?[\d.]+(%|deg|g?rad|turn)?$/.test(x)))
    return;
  const n = parts.slice(0, 3).map((x) => parseFloat(x));
  const unit = /[a-z]+$/.exec(parts[0])?.[0];
  n[0] *= unit === "turn" ? 360 : unit === "rad" ? 180 / Math.PI : unit === "grad" ? 0.9 : 1;
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
  const name = /^[A-Za-z_$][\w$.]*(\[(["'`])[^"'`\]]*\2\])*(?=\s*[,}\n;)])/.exec(
    src.slice(i, i + 100),
  );
  if (name) return { value: name[0], end: i + name[0].length };
  const m = /^[^;}"'`{<>]{0,400}/.exec(src.slice(i))!;
  return { value: m[0], end: i + m[0].length };
};

/** Whether a radius or shadow value is a token, a neutral keyword or a reference to one, the
 *  generated tokens' own key (`tokens["--radius-brand"]`) included; undefined where the scan cannot
 *  read a value (an interpolation or a variable). */
const onToken = (value: string, shadow: boolean) => {
  const v = norm(value);
  if (NEUTRAL.test(v) || pureVar(v) || (shadow ? SHADOWS : RADII).has(v)) return true;
  if (!v || /[${}]/.test(v) || /^[a-z_][\w.]*$/.test(v)) return undefined;
  const key = /^[a-z_$][\w$.]*\[(["'`])([^"'`]*)\1\]$/.exec(v)?.[2];
  if (key !== undefined)
    return key.startsWith("--")
      ? key.startsWith(shadow ? "--shadow-" : "--radius-") && key in tokens
      : undefined;
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
    const ok = onToken(value, shadow);
    if (ok === false) counts[shadow ? "shadow" : "radius"]++;
    if (shadow) blank(start, Math.max(start, end));
  }
  for (const m of [...src.matchAll(CLASS)]) {
    const shadow = m[2] !== undefined;
    const arb = (m[1] ?? m[2]).match(/^\[(.+)\]$/)?.[1];
    const ok = arb ? onToken(arb.replace(/_/g, " "), shadow) : false;
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
  for (const m of src.matchAll(HEX)) {
    const h = m[1];
    const short = h.length <= 4;
    if (short && !isColour3(h, src.slice(Math.max(0, m.index - 40), m.index))) continue;
    const rgb6 = short ? [...h.slice(0, 3)].map((x) => x + x).join("") : h.slice(0, 6);
    const hex = "#" + rgb6.toLowerCase();
    colour(hex, h.length % 4 ? hex : "#" + h.toLowerCase(), "hex");
  }
  for (const [lit, fn, args] of src.matchAll(FN)) {
    const hex = fnColour(fn, args);
    if (hex) colour(hex, lit, "rgb");
  }
  for (const [lit] of src.matchAll(MODERN)) {
    counts.rgb++;
    hexes.push(lit);
  }
  const named = (word: string) => {
    const w = word.toLowerCase();
    if (w === "white" || w === "black") colour(w === "white" ? "#ffffff" : "#000000", w, "hex");
    else if (NAMED.has(w)) colour(w, w, "hex");
  };
  // In script and Python a bare name after color: or color= is a variable, never a literal.
  const script = SCRIPT_EXT.test(ext) || ext === ".py";
  // A color-mix() inside a colour property is read once, by the position of each word.
  const seen = new Set<number>();
  const words = (value: string, from: number) => {
    // An interpolation (${...}) adds only the strings it can take; its names are the code's.
    let read = value;
    for (let i = value.indexOf("${"); i >= 0;) {
      const x = expression(value, i + 1);
      for (const s of valueStrings(x)) words(s[0], from + i + 1 + s.index);
      read = read.slice(0, i) + " ".repeat(x.length + 1) + read.slice(i + 1 + x.length);
      i = value.indexOf("${", i + 1 + x.length);
    }
    for (const w of read.matchAll(WORD))
      if (!seen.has(from + w.index)) {
        seen.add(from + w.index);
        named(w[1]);
      }
  };
  for (const m of src.matchAll(COLOUR_AT)) {
    const start = m.index + m[0].length;
    // In markup color= and background= are a component's props, which map a name to a token; no
    // element takes them as a colour. In script only inside a component's tag (<Badge color=...).
    if (
      /^(?:color|background)\s*=/.test(m[0]) &&
      (MARKUP.test(ext) ||
        (PROPS.test(ext) &&
          /<[A-Z][\w.]*\s(?:[^<>]|=>)*$/.test(src.slice(Math.max(0, m.index - 400), m.index))))
    )
      continue;
    // A JSX, Astro or Svelte expression prop (fill={on ? "teal" : "white"}): the strings it can
    // take. Any other brace opens an object or a dict, a map of names, which is no value.
    if (src[start] === "{") {
      if (PROPS.test(ext) && /[\w-]=$/.test(m[0].trimEnd()))
        for (const s of valueStrings(expression(src, start))) words(s[0], start + s.index);
      continue;
    }
    const quoted = /["'`]/.test(src[start] ?? "");
    if (script && !quoted && !m[0].startsWith("color-mix")) continue;
    const { value } = valueAt(src, start);
    // A type's union of names (color: "teal" | "purple") is no value.
    if (script && /^(["'`])[^"'`]*\1\s*\|/.test(src.slice(start, start + 200))) continue;
    words(value, start + (quoted ? 1 : 0));
  }
  // A custom property whose whole value is one colour name (--mark: white); in script quoted only,
  // as a bare name there is a variable, and in CSS unquoted only, as a quoted one is a string.
  for (const m of src.matchAll(CUSTOM))
    if (script ? m[1] : !(m[1] && /^\.(s?css|svg)$/.test(ext)))
      words(m[2], m.index + m[0].lastIndexOf(m[2]));
  for (const [, v] of src.matchAll(ARBITRARY)) if (/^[a-z]+$/i.test(v)) named(v);
  for (const m of src.matchAll(FONT)) {
    const v = (m[1] ?? m[2] ?? m[3] ?? m[4]).trim();
    // An interpolated family (font-family="${big ? 'Arial' : FAM[fam]}") counts the strings it
    // can take; its names are the code's.
    const families = v.startsWith("${")
      ? valueStrings(expression(src, src.indexOf("${", m.index) + 1))
          .map((s) => s[0].slice(1, -1))
          .filter((f) => !f.includes("${"))
      : [v];
    for (const f of families)
      if (!BRAND_FONT.test(f)) {
        counts.font++;
        fonts.push(f.split(",")[0].trim().replace(/["']/g, ""));
      }
  }
  for (const m of src.matchAll(SHORTHAND)) {
    const start = m.index + m[0].length;
    if (script && !/["'`]/.test(src[start] ?? "")) continue;
    const family = SIZE.exec(valueAt(src, start).value.trim())?.[1];
    if (family && !BRAND_FONT.test(family)) {
      counts.font++;
      fonts.push(family.split(",")[0].trim().replace(/["']/g, ""));
    }
  }
  for (const [lit] of src.matchAll(SERIF)) {
    counts.font++;
    fonts.push(lit);
  }
  counts.palette = src.match(PAL)?.length ?? 0;
  return { counts, hexes, fonts };
};

/** The allowlist's sum of one metric, the files in `skip` left out. */
const total = (allow: Allowlist, k: (typeof METRICS)[number], skip: Set<string>) =>
  Object.entries(allow).reduce((sum, [f, e]) => sum + (skip.has(f) ? 0 : (e[k] ?? 0)), 0);

/** Every way the counts exceed the allowlist, and every entry without a reason or grown against
 *  the committed allowlist beyond `ceiling`, this scanner's counts of the files as committed, which
 *  a pin change passes, where the list's total for that metric grew too: within the total, a value
 *  moved from one file to another. */
export const violations = (
  files: Record<string, Counts>,
  allow: Allowlist,
  committed: Allowlist | undefined,
  ceiling: Record<string, Counts> = {},
) => {
  const out: string[] = [];
  for (const [file, counts] of Object.entries(files)) {
    if (isPartner(file, allow[file])) continue;
    for (const k of METRICS) {
      const allowed = allow[file]?.[k] ?? 0;
      if (counts[k] > allowed) out.push(`${file}: ${k} ${counts[k]}, allowed ${allowed}`);
      // An allowance above the count would let a new finding there pass unseen.
      else if (counts[k] < allowed)
        out.push(
          `${ALLOWLIST}: ${file}: ${k} ${counts[k]}, allowed ${allowed}; lower it (brand-colours --tighten)`,
        );
    }
  }
  // Partner marks count in no total. One in the committed list counts there too where the working
  // tree turns it partner, so that frees no total for another entry to grow into.
  const partnersOf = (a: Allowlist) => Object.keys(a).filter((f) => isPartner(f, a[f]));
  const now = new Set(partnersOf(allow));
  const before = new Set([...now, ...partnersOf(committed ?? {})]);
  const totalGrew = Object.fromEntries(
    METRICS.map((k) => [k, !!committed && total(allow, k, now) > total(committed, k, before)]),
  );
  for (const [file, e] of Object.entries(allow)) {
    if (!e.reason?.trim()) out.push(`${ALLOWLIST}: ${file} names no reason`);
    // An entry left on a clean file would let a new finding there pass unseen.
    if (!isPartner(file, e) && METRICS.every((k) => !files[file]?.[k]))
      out.push(`${ALLOWLIST}: ${file} is clean; drop its entry (brand-colours --tighten)`);
    if (e.partner !== undefined && !isPartner(file, e))
      out.push(`${ALLOWLIST}: ${file}: "partner" names a third party's mark, an SVG, by name`);
    if (committed && !isPartner(file, e))
      for (const k of METRICS)
        if (
          totalGrew[k] &&
          (e[k] ?? 0) > Math.max(committed[file]?.[k] ?? 0, ceiling[file]?.[k] ?? 0)
        )
          out.push(
            `${ALLOWLIST}: ${file} ${k} grew against HEAD; the allowlist's total may only shrink, or during a pin change an entry grow to the count of the file as committed`,
          );
  }
  return out;
};

export const tighten = (
  files: Record<string, Counts>,
  allow: Allowlist | undefined,
  ceiling: Record<string, Counts> = {},
) => {
  const next: Allowlist = {};
  for (const [file, counts] of Object.entries(files)) {
    const prior = allow?.[file];
    if (isPartner(file, prior)) {
      next[file] = prior!;
      continue;
    }
    const limit = (k: (typeof METRICS)[number]) =>
      allow ? Math.max(prior?.[k] ?? 0, ceiling[file]?.[k] ?? 0) : Infinity;
    // Only the metrics with a count: a zero allows nothing.
    const c = Object.fromEntries(
      METRICS.map((k) => [k, Math.min(limit(k), counts[k])]).filter(([, n]) => n),
    ) as Partial<Counts>;
    // A misplaced partner stays, so the next run still reports it.
    if (Object.keys(c).length)
      next[file] = {
        ...c,
        reason: prior?.reason ?? "",
        ...(prior?.partner !== undefined && { partner: prior.partner }),
      };
  }
  return next;
};

export const runGit = (args: string[]) =>
  spawnSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30 });

/** Every file under the current directory, tracked or untracked, .gitignore honoured. */
export const listTree = (cmd: string) => {
  const ls = runGit(["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (ls.status !== 0) throw new Error(`${cmd}: not a git checkout: ${ls.stderr}`);
  return [...new Set(ls.stdout.split("\0"))].filter((p) => p && existsSync(p));
};

/** The brand version a package.json pins as a Git tag (`#v<version>`), if any. */
export const pinnedVersion = (packageJson: string) => {
  const pkg = JSON.parse(packageJson);
  for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
    const m = /#v([^#\s]+)$/.exec(pkg[field]?.["@hackersandwizards/brand"] ?? "");
    if (m) return m[1];
  }
};

/** The brand version package.json pinned at HEAD where the working tree pins this scanner's
 *  version instead; undefined otherwise, a stale install included. */
export const pinChange = (cmd: string) => {
  const head = runGit(["show", "HEAD:./package.json"]);
  const from = head.status === 0 ? pinnedVersion(head.stdout) : undefined;
  const to = existsSync("package.json")
    ? pinnedVersion(readFileSync("package.json", "utf8"))
    : undefined;
  if (!from || from === own.version || to !== own.version) return;
  console.log(
    `${cmd}: pin change v${from} to v${own.version}: the list may take what this scanner finds in the files as committed at HEAD`,
  );
  return from;
};

/** Whether a path is committed at HEAD and unchanged in the working tree. */
export const committedAsIs = (p: string) =>
  runGit(["cat-file", "-e", `HEAD:./${p}`]).status === 0 &&
  runGit(["diff", "--quiet", "HEAD", "--", p]).status === 0;

/** This scanner's counts of a file as committed at HEAD, none where HEAD has no such file. */
const committedCounts = (p: string) => {
  const head = runGit(["show", `HEAD:./${p}`]);
  return head.status === 0 ? scanSource(head.stdout, extname(p)).counts : undefined;
};

// The spec puts any ext-* lines between version and oid.
const LFS =
  /^version https:\/\/git-lfs\.github\.com\/spec\/v1\r?\n(?:ext-[^\n]*\n)*oid sha256:([0-9a-f]{64})\r?\n/;
/** The object id a Git LFS pointer names, the sha256 of the real file; undefined for any other. */
export const lfsOid = (b: Buffer) => LFS.exec(b.subarray(0, 1024).toString("latin1"))?.[1];
/** A file's sha256, read through a Git LFS pointer to the object it names. */
export const contentHash = (b: Buffer) => lfsOid(b) ?? createHash("sha256").update(b).digest("hex");

const PKG = join(import.meta.dir, "..");
const walk = (dir: string): string[] =>
  existsSync(join(PKG, dir))
    ? readdirSync(join(PKG, dir), { recursive: true, encoding: "utf8" })
        .map((f) => join(dir, f))
        .filter((f) => statSync(join(PKG, f)).isFile())
    : [];
/** Every file this package ships as a brand asset, by sha256: manifest.json's files (the print
 *  masters among them by hash alone) plus the generated token formats and the mail signature
 *  template. Files under 64 bytes are left out: too small to be a copy. */
export const brandFiles = () => {
  const out = new Map<string, string>(manifest.files.map((f) => [f.sha256, f.path]));
  for (const f of ["generated", "applications/mail-signature"].flatMap(walk))
    if (statSync(join(PKG, f)).size >= 64) out.set(contentHash(readFileSync(join(PKG, f))), f);
  return out;
};
const isPointer = (path: string) => statSync(path).size < 1024 && !!lfsOid(readFileSync(path));
/** The sizes of the brand files present on disk, to hash only consumer files that could match, and
 *  the extensions of those known by hash alone (the print masters: not shipped, or an LFS pointer
 *  here), whose every file is hashed. */
export const brandSizes = (files: Map<string, string>) => {
  const sizes = new Set<number>();
  const unsized = new Set<string>();
  for (const f of files.values()) {
    const p = join(PKG, f);
    if (existsSync(p) && !isPointer(p)) sizes.add(statSync(p).size);
    else unsized.add(extname(f).toLowerCase());
  }
  return { sizes, unsized };
};
/** Whether a consumer file is byte-identical to a brand file, the size checked before the hash. */
export const isBrandCopy = (
  path: string,
  files: Map<string, string>,
  { sizes, unsized }: ReturnType<typeof brandSizes>,
): string | undefined => {
  const stat = statSync(path);
  if (!stat.isFile()) return;
  if (!sizes.has(stat.size) && !isPointer(path) && !unsized.has(extname(path).toLowerCase()))
    return;
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

/** exceptionReport over a path list, for a scan whose own filter is only `scanned`. */
export const skippedReport = (cmd: string, paths: string[]) => {
  const skipped: Record<string, number> = {};
  for (const p of paths) {
    const why = exception(p);
    if (why) skipped[why] = (skipped[why] ?? 0) + 1;
  }
  return exceptionReport(cmd, skipped);
};

/** Writes a tightened list and says so; a list that allows nothing is no file where none was. */
export const writeAllowlist = (cmd: string, path: string, next: object, done = "tightened") => {
  if (!existsSync(path) && !Object.keys(next).length)
    console.log(`${cmd}: nothing to allow; no ${path} written`);
  else {
    writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
    console.log(`${cmd}: ${path} ${done}`);
  }
};

if (import.meta.main) {
  answerHelp(USAGE);
  const allow = existsSync(ALLOWLIST)
    ? (JSON.parse(readFileSync(ALLOWLIST, "utf8")) as Allowlist)
    : undefined;
  const head = runGit(["show", `HEAD:./${ALLOWLIST}`]);
  const committed = head.status === 0 ? (JSON.parse(head.stdout) as Allowlist) : undefined;
  const { files, skipped } = scanTree();
  const report = exceptionReport("brand-colours", skipped);
  if (report) console.log(report);
  for (const [file, e] of Object.entries(allow ?? {}))
    if (isPartner(file, e))
      console.log(`brand-colours: partner mark ${file} (${e.partner}): ${e.reason}`);
  // Only a file holding more than the committed list allows is read at HEAD.
  const ceiling: Record<string, Counts> = {};
  if (committed && pinChange("brand-colours"))
    for (const [file, counts] of Object.entries(files)) {
      const c =
        METRICS.some((k) => counts[k] > (committed[file]?.[k] ?? 0)) && committedCounts(file);
      if (c) ceiling[file] = c;
    }
  if (process.argv.includes("--tighten")) {
    writeAllowlist(
      "brand-colours",
      ALLOWLIST,
      tighten(files, allow, ceiling),
      "tightened; give every new entry its reason",
    );
  } else {
    const bad = violations(files, allow ?? {}, committed, ceiling);
    if (bad.length) {
      console.error(
        `${bad.join("\n")}\nbrand-colours: ${bad.length} findings. Use the brand token, or name the exception with its reason in ${ALLOWLIST}.`,
      );
      process.exit(1);
    }
    console.log(`brand-colours: ${Object.keys(files).length} files within ${ALLOWLIST}`);
  }
}
