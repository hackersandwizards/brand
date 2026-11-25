// Source stripping and off-token colour, radius, shadow and font extraction for a single file.
import {
  fnColour,
  isTokenValue,
  resolveNamedColour,
  summariseColours,
  type ColourLiteral,
  type TokenKind,
} from "./colour-tokens";
import { ENGINE_STYLE } from "./engine-style";

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
export type Metric = (typeof METRICS)[number];

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
const CODE_PART =
  /^---\r?\n[\s\S]*?\r?\n---|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/g;
const QUOTES = new Set(['"', "'", "`"]);

// 8 and 4 digits carry an alpha channel; the colour part decides token or off-token.
const HEX = /(?<![&\w])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
// A 3- or 4-digit hex of letters alone (#add, #fab) or digits alone (#128, an issue's number) is a
// colour only in the value of a colour property, attribute or key, or a Tailwind class's brackets;
// never a url(#id) or a selector.
const VALUE_BEFORE =
  /(?:(?:colou?r|fill|stroke|background|border|outline|shadow|caret|accent|decoration)[\w-]*["']?\s*[:=]\s*["'`]?(?:[^;{}<>"'`\n]*[\s,(])?|-\[)$/i;
const FN = /(?<![\w-])(rgba?|hsla?)\(([^()]*)\)/gi;
// The other colour functions, counted as rgb without conversion where their arguments are a
// colour's: numbers, percentages, angles or none, or color()'s colour space first.
const NUM = String.raw`(?:-?[\d.]+(?:%|deg|g?rad|turn)?|none)`;
const MODERN = new RegExp(
  String.raw`(?<![\w-])(?:(?:oklch|oklab|lab|lch|hwb)\(\s*${NUM}(?:[\s,_/]+${NUM}){2,3}\s*\)|color\(\s*(?:srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65)[\s_][^()]*\))`,
  "gi",
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
const BRAND_FACE = /^["']?(Inter|JetBrains Mono)( Variable| Fallback( Roboto)?)?$/i;
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

/** Identifies source whose bare colour and font names are script identifiers. */
const isScriptExt = (ext: string) => SCRIPT_EXT.test(ext) || ext === ".py";
/** Removes script line comments while leaving URL-like slashes alone. */
const stripLineComments = (s: string) => s.replace(/(^|[^:"'`(])\/\/.*$/gm, "$1");
/** Removes block comments outside quoted strings. */
const keepQuotedStrings = (s: string) => s.replace(STRING_OR_BLOCK, (_, str?: string) => str ?? "");

// In markup strings and line comments exist only in script (the frontmatter and <script>) and
// strings in <style>. Elsewhere an apostrophe is prose and a // is a URL, such as href=//host or a
// srcset's //cdn/b.png 2x.
/** Removes comments from markup and its embedded code. */
const stripMarkupComments = (s: string) => {
  let out = "";
  let last = 0;
  for (const m of s.matchAll(CODE_PART)) {
    const code = keepQuotedStrings(m[0]);
    out += s.slice(last, m.index).replace(BLOCK, "");
    out += m[0].startsWith("<style") ? code : stripLineComments(code);
    last = m.index + m[0].length;
  }
  return out + s.slice(last).replace(BLOCK, "");
};

/** Removes engine styles and comments according to file syntax before token scanning. */
export const stripSource = (s: string, ext: string) => {
  if (ext === ".py") return s;
  const out = s.replace(ENGINE_STYLE, "").replace(/<!--[\s\S]*?-->/g, "");
  if (CSS_OR_SVG.test(ext)) return out.replace(BLOCK, "");
  return MARKUP.test(ext) ? stripMarkupComments(out) : stripLineComments(keepQuotedStrings(out));
};

/** Blanks a source span without shifting subsequent match offsets. */
const blankRange = (src: string, from: number, to: number) =>
  src.slice(0, from) + " ".repeat(to - from) + src.slice(to);

/** Distinguishes short hex colours from fragment IDs, selectors and prose. */
export const isShortHexColour = (h: string, before: string) =>
  (/\d/.test(h) && /[a-f]/i.test(h)) ||
  /^(.)\1\1/.test(h) ||
  (VALUE_BEFORE.test(before) && !/url\(\s*$/i.test(before));

/** The strings an expression can take as its value: one at its own level, grouping parentheses
 *  included, that opens it or a branch (after {, (, ?, :, && or ||), never one it compares or tests
 *  with in, nor one inside a key, a call's arguments or an object. */
export const valueStrings = (code: string) => {
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
const expressionSlice = (src: string, i: number) => {
  let depth = 0;
  for (let j = i; j < Math.min(src.length, i + 400); j++) {
    depth += src[j] === "{" ? 1 : src[j] === "}" ? -1 : 0;
    if (!depth) return src.slice(i, j + 1);
  }
  return src.slice(i, i + 400);
};

/** The value a declaration sets from `i` on: a quoted string, a JS number in px, or CSS up to the
 *  declaration's end. */
const readDeclarationValue = (src: string, i: number) => {
  const q = src.charAt(i);
  if (QUOTES.has(q)) {
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

/** Counts off-token CSS/JS radius and shadow declarations and blanks shadow values so their colours
 *  are not counted a second time. */
export const scanStyleRadiiAndShadows = (source: string) => {
  let src = source;
  const counts = { radius: 0, shadow: 0 };
  for (const m of [...src.matchAll(PROP)]) {
    const start = m.index + m[0].length;
    const { value, end } = readDeclarationValue(src, start);
    const kind: TokenKind = /shadow/i.test(m[1]) ? "shadow" : "radius";
    if (isTokenValue(value, kind) === false) counts[kind]++;
    if (kind === "shadow") src = blankRange(src, start, Math.max(start, end));
  }
  return { src, ...counts };
};

/** Counts off-token Tailwind radius and shadow utility classes and blanks shadow classes. */
export const scanUtilityRadiiAndShadows = (source: string) => {
  let src = source;
  const counts = { radius: 0, shadow: 0 };
  for (const m of [...src.matchAll(CLASS)]) {
    const kind: TokenKind = m[2] !== undefined ? "shadow" : "radius";
    const arb = (m[1] ?? m[2]).match(/^\[(.+)\]$/)?.[1];
    const ok = arb ? isTokenValue(arb.replace(/_/g, " "), kind) : false;
    if (ok === false) counts[kind]++;
    if (kind === "shadow") src = blankRange(src, m.index, m.index + m[0].length);
  }
  return { src, ...counts };
};

/** Extracts hex colour literals (3, 4, 6 and 8 digits) from stripped source. */
export const extractHexColours = (src: string): ColourLiteral[] => {
  const hits: ColourLiteral[] = [];
  for (const m of src.matchAll(HEX)) {
    const h = m[1];
    const short = h.length <= 4;
    if (short && !isShortHexColour(h, src.slice(Math.max(0, m.index - 40), m.index))) continue;
    const rgb6 = short ? [...h.slice(0, 3)].map((x) => x + x).join("") : h.slice(0, 6);
    const hex = "#" + rgb6.toLowerCase();
    hits.push({ value: hex, literal: h.length % 4 ? hex : "#" + h.toLowerCase(), kind: "hex" });
  }
  return hits;
};

/** Extracts rgb(), hsl() and modern CSS colour function literals from stripped source. */
export const extractFunctionColours = (src: string): ColourLiteral[] => {
  const hits: ColourLiteral[] = [];
  for (const [lit, fn, args] of src.matchAll(FN)) {
    const hex = fnColour(fn, args);
    if (hex) hits.push({ value: hex, literal: lit, kind: "rgb" });
  }
  for (const [lit] of src.matchAll(MODERN)) hits.push({ literal: lit, kind: "rgb" });
  return hits;
};

/** Extracts candidate words with source offsets, reading only value strings inside `${...}`. */
export const extractInterpolatedWords = (value: string, from: number) => {
  const words: { word: string; at: number }[] = [];
  // An interpolation (${...}) adds only the strings it can take; its names are the code's.
  let read = value;
  for (let i = value.indexOf("${"); i >= 0;) {
    const x = expressionSlice(value, i + 1);
    for (const s of valueStrings(x))
      words.push(...extractInterpolatedWords(s[0], from + i + 1 + s.index));
    read = blankRange(read, i, i + 1 + x.length);
    i = value.indexOf("${", i + 1 + x.length);
  }
  for (const w of read.matchAll(WORD)) words.push({ word: w[1], at: from + w.index });
  return words;
};

/** Identifies markup colour roles that a component resolves to tokens. */
export const isComponentColourProp = (src: string, match: RegExpExecArray, ext: string) => {
  // In markup color= and background= are a component's props, which map a name to a token; no
  // element takes them as a colour. In script only inside a component's tag (<Badge color=...).
  if (!/^(?:color|background)\s*=/.test(match[0])) return false;
  if (MARKUP.test(ext)) return true;
  return (
    PROPS.test(ext) &&
    /<[A-Z][\w.]*\s(?:[^<>]|=>)*$/.test(src.slice(Math.max(0, match.index - 400), match.index))
  );
};

/** Reads the literal result words of a colour prop written as a brace expression. */
export const expressionPropWords = (src: string, match: RegExpExecArray, ext: string) => {
  const start = match.index + match[0].length;
  if (!PROPS.test(ext) || !/[\w-]=$/.test(match[0].trimEnd())) return [];
  return valueStrings(expressionSlice(src, start)).flatMap((s) =>
    extractInterpolatedWords(s[0], start + s.index),
  );
};

/** Reads literal colour words and offsets from one property or function match. */
export const colourPropertyWords = (src: string, match: RegExpExecArray, ext: string) => {
  if (isComponentColourProp(src, match, ext)) return [];
  const start = match.index + match[0].length;
  // A JSX, Astro or Svelte expression prop (fill={on ? "teal" : "white"}): the strings it can
  // take. Any other brace opens an object or a dict, a map of names, which is no value.
  if (src[start] === "{") return expressionPropWords(src, match, ext);
  const quoted = QUOTES.has(src.charAt(start));
  if (isScriptExt(ext)) {
    // In script and Python a bare name after color: or color= is a variable, never a literal.
    if (!quoted && !match[0].startsWith("color-mix")) return [];
    // A type's union of names (color: "teal" | "purple") is no value.
    if (/^(["'`])[^"'`]*\1\s*\|/.test(src.slice(start, start + 200))) return [];
  }
  return extractInterpolatedWords(readDeclarationValue(src, start).value, start + Number(quoted));
};

/** Reads a standalone colour word from each custom property that sets one. */
export const customPropertyWords = (src: string, ext: string) => {
  const script = isScriptExt(ext);
  const cssLike = /^\.(s?css|svg)$/.test(ext);
  const words: { word: string; at: number }[] = [];
  for (const m of src.matchAll(CUSTOM)) {
    // A custom property whose whole value is one colour name (--mark: white); in script quoted only,
    // as a bare name there is a variable, and in CSS unquoted only, as a quoted one is a string.
    const allow = script ? Boolean(m[1]) : !(m[1] && cssLike);
    if (allow) words.push(...extractInterpolatedWords(m[2], m.index + m[0].lastIndexOf(m[2])));
  }
  return words;
};

/** Extracts CSS named colour literals from colour declarations, custom properties and Tailwind
 *  arbitrary colour classes, deduplicating overlapping color-mix() and custom-property spans. */
export const extractNamedColours = (src: string, ext: string): ColourLiteral[] => {
  const positioned = [
    ...[...src.matchAll(COLOUR_AT)].flatMap((m) => colourPropertyWords(src, m, ext)),
    ...customPropertyWords(src, ext),
  ];
  // A color-mix() inside a colour property is read once, by the position of each word.
  const seen = new Set<number>();
  const hits: ColourLiteral[] = [];
  for (const { word, at } of positioned) {
    if (seen.has(at)) continue;
    seen.add(at);
    const resolved = resolveNamedColour(word);
    if (resolved) hits.push(resolved);
  }
  for (const [, v] of src.matchAll(ARBITRARY)) {
    const resolved = /^[a-z]+$/i.test(v) ? resolveNamedColour(v) : undefined;
    if (resolved) hits.push(resolved);
  }
  return hits;
};

/** Returns the first family from a font stack, with quotes removed. */
const leadingFamily = (stack: string) => stack.split(",")[0].trim().replace(/["']/g, "");

/** Reports the off-brand leading families in font-family declarations and attributes. */
export const extractFontFamilies = (src: string) => {
  const fonts: string[] = [];
  for (const m of src.matchAll(FONT)) {
    const v = (m.slice(1).find((g) => g !== undefined) ?? "").trim();
    // An @font-face naming one of brand's faces, a fallback face of tokens/fonts.css included.
    if (
      BRAND_FACE.test(v.replace(/["';\s]+$/, "")) &&
      src.lastIndexOf("@font-face", m.index) > src.lastIndexOf("}", m.index)
    )
      continue;
    // An interpolated family (font-family="${big ? 'Arial' : FAM[fam]}") counts the strings it
    // can take; its names are the code's.
    const families = v.startsWith("${")
      ? valueStrings(expressionSlice(src, src.indexOf("${", m.index) + 1))
          .map((s) => s[0].slice(1, -1))
          .filter((f) => !f.includes("${"))
      : [v];
    for (const f of families) if (!BRAND_FONT.test(f)) fonts.push(leadingFamily(f));
  }
  return fonts;
};

/** Reports the off-brand leading families in literal font shorthands. */
export const extractShorthandFonts = (src: string, ext: string) => {
  const script = isScriptExt(ext);
  const fonts: string[] = [];
  for (const m of src.matchAll(SHORTHAND)) {
    const start = m.index + m[0].length;
    if (script && !QUOTES.has(src.charAt(start))) continue;
    const family = SIZE.exec(readDeclarationValue(src, start).value.trim())?.[1];
    if (family && !BRAND_FONT.test(family)) fonts.push(leadingFamily(family));
  }
  return fonts;
};

/** Extracts off-brand font families from font-family declarations, font shorthands and font-serif. */
export const scanFonts = (src: string, ext: string) => [
  ...extractFontFamilies(src),
  ...extractShorthandFonts(src, ext),
  ...[...src.matchAll(SERIF)].map(([lit]) => lit),
];

/** The counts of one file's source, plus the off-token colours and off-brand fonts it holds. */
export const scanSource = (raw: string, ext: string) => {
  // Radii and shadows first: a shadow's colour belongs to the shadow and counts there only.
  const style = scanStyleRadiiAndShadows(stripSource(raw, ext));
  const utility = scanUtilityRadiiAndShadows(style.src);
  const src = utility.src;
  const { counts: colours, hexes } = summariseColours(
    [...extractHexColours(src), ...extractFunctionColours(src), ...extractNamedColours(src, ext)],
    ext,
  );
  const fonts = scanFonts(src, ext);
  const counts: Counts = {
    hex: colours.hex,
    tokenHex: colours.tokenHex,
    font: fonts.length,
    palette: src.match(PAL)?.length ?? 0,
    rgb: colours.rgb,
    radius: style.radius + utility.radius,
    shadow: style.shadow + utility.shadow,
  };
  return { counts, hexes, fonts };
};
