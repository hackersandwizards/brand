#!/usr/bin/env bun
// Generates the token formats a non-Tailwind consumer reads from tokens/tokens.css, the source:
// generated/tokens.root.css (the @theme block as :root and on a light element under night),
// tokens.json, tokens.ts and tokens.py, and code-theme.json, the Shiki theme of the --code-* tokens
// and the terminal's ANSI colours; and from tokens/fonts.css fonts.json, its faces and fallback
// faces, for a surface that writes its own @font-face; and static-fonts.css, tokens/print.css's
// @font-face rules and fonts.css's fallback faces, for a surface that needs the static faces without
// the print scale; and cursor.svg, the slide player's pointer, three teal rings a deck's `cursor: url()` names, hotspot 6 6; and
// elements.css and document.css, elements/elements.css and tokens/document.css with every
// @import resolved in place, for a page that links them and must not wait on a request chain.
// Every value stays the CSS value as written; colours also get a resolved hex, color-mix() mixed
// in sRGB like the browser. `--check` exits 1 where a generated file is stale instead of writing.
// Usage: bun scripts/tokens.ts [--check]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./git";

export const SOURCE = join(ROOT, "tokens/tokens.css");

/** The declarations of a CSS block, comments dropped, whitespace collapsed. */
const declarations = (body: string) => {
  const out: Record<string, string> = {};
  for (const decl of body.replace(/\/\*[\s\S]*?\*\//g, "").split(";")) {
    const m = decl.match(/^\s*([\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")");
  }
  return out;
};

/** The custom properties of tokens.css in source order. */
export const parseTokens = (css: string) =>
  Object.fromEntries(
    Object.entries(
      declarations(css.replace(/\/\*[\s\S]*?\*\//g, "").match(/@theme\s*\{([\s\S]*)\}/)![1]),
    ).filter(([k]) => k.startsWith("--")),
  );

/** The two palettes, tables in tokens.css's comments: the neutrals (job | day | night, "-" where
 *  one ground alone has the job) and the hues (base | text on light | night | job). */
export const palettes = (css: string) => {
  const rows = (cols: number) =>
    [...css.matchAll(/^ {5}(\S.*?)\s*(?:\*\/)?$/gm)]
      .map((m) => m[1].split("|").map((c) => c.trim()))
      .filter((r) => r.length === cols && /^[a-z -]+$/.test(r[0]) && /^[\w-]+$/.test(r[1]));
  const neutrals = rows(3).map(([job, day, night]) => ({ job, day, night }));
  const hues = rows(4).map(([base, text, night, job]) => ({ base, text, night, job }));
  return { neutrals, hues };
};

/** The colour tokens of tokens.css's Aliases block: each resolves to another and adds no colour. */
export const aliases = (css: string) =>
  [
    ...(/\/\* Aliases\b[^]*?\*\/([^]*?)\n\s*\n/.exec(css)?.[1] ?? "").matchAll(
      /(--color-[\w-]+):/g,
    ),
  ].map((m) => m[1]!);

export const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) =>
  "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const NAMED: Record<string, string> = { white: "#ffffff", black: "#000000" };

/** A colour value as a hex, var() and color-mix() resolved against the tokens. */
export const colorValue = (tokens: Record<string, string>) => {
  const value = (v: string): string => {
    v = v.trim();
    if (NAMED[v]) return NAMED[v];
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    if (ref) return value(tokens[ref[1]]);
    const mix = v.match(/^color-mix\(in srgb, (.+?)(?: (\d+)%)?, (.+?)(?: (\d+)%)?\)$/);
    if (mix) {
      const p = mix[2] ? +mix[2] / 100 : mix[4] ? 1 - +mix[4] / 100 : 0.5;
      const [a, b] = [rgb(value(mix[1])), rgb(value(mix[3]))];
      return hex(a.map((x, i) => x * p + b[i] * (1 - p)));
    }
    throw new Error(`unresolvable colour ${v}`);
  };
  return value;
};

/** Every --color-* token as a hex, color-mix() resolved. */
export const resolveColors = (tokens: Record<string, string>) => {
  const value = colorValue(tokens);
  return Object.fromEntries(
    Object.entries(tokens)
      .filter(([k]) => k.startsWith("--color-"))
      .map(([k, v]) => [k, value(v)]),
  );
};

/** github-dark's scopes, in its order, each under the --code-* role that colours it: the theme's
 *  structure stays, the colours are the brand's. Its function and variable colours take fg, its
 *  constants keyword. A role suffixed with /<style> sets that font style. */
const CODE_SCOPES: [string, string[]][] = [
  ["comment", ["comment", "punctuation.definition.comment", "string.comment"]],
  [
    "keyword",
    [
      "constant",
      "entity.name.constant",
      "variable.other.constant",
      "variable.other.enummember",
      "variable.language",
      "support",
      "meta.property-name",
      "string variable",
      "support.constant",
      "support.variable",
      "meta.module-reference",
      "markup.inline.raw",
      "meta.diff.header",
      "meta.output",
    ],
  ],
  ["fg", ["entity", "entity.name"]],
  [
    "fg",
    [
      "variable.parameter.function",
      "storage.modifier.package",
      "storage.modifier.import",
      "storage.type.java",
      "variable",
      "variable.other",
      "punctuation.definition.list.begin.markdown",
      "markup.changed",
      "punctuation.definition.changed",
      "brackethighlighter.tag",
      "brackethighlighter.curly",
      "brackethighlighter.round",
      "brackethighlighter.square",
      "brackethighlighter.angle",
      "brackethighlighter.quote",
    ],
  ],
  [
    "inserted",
    [
      "entity.name.tag",
      "markup.quote",
      "markup.inserted",
      "meta.diff.header.to-file",
      "punctuation.definition.inserted",
    ],
  ],
  ["keyword", ["keyword", "storage", "storage.type"]],
  [
    "string",
    [
      "string",
      "punctuation.definition.string",
      "string punctuation.section.embedded source",
      "source.regexp",
      "string.regexp",
      "string.regexp.character-class",
      "string.regexp constant.character.escape",
      "string.regexp source.ruby.embedded",
      "string.regexp string.regexp.arbitrary-repitition",
    ],
  ],
  [
    "deleted/italic",
    ["invalid.broken", "invalid.deprecated", "invalid.illegal", "invalid.unimplemented"],
  ],
  [
    "deleted",
    [
      "message.error",
      "markup.deleted",
      "meta.diff.header.from-file",
      "punctuation.definition.deleted",
      "brackethighlighter.unmatched",
    ],
  ],
  ["inserted/bold", ["string.regexp constant.character.escape"]],
  ["keyword/bold", ["markup.heading", "markup.heading entity.name", "meta.separator"]],
  ["fg/italic", ["markup.italic"]],
  ["fg/bold", ["markup.bold"]],
  ["fg/bold", ["meta.diff.range"]],
  ["string/underline", ["constant.other.reference.link", "string.other.link"]],
];

// A terminal's 16 ANSI colours on the code ground, each a core colour: Shiki's ansi language reads
// them. Normal and bright differ only where the brand has a lighter step.
const ANSI: [string, string][] = [
  ["Black", "night-subtle"],
  ["Red", "red-night"],
  ["Green", "green"],
  ["Yellow", "amber"],
  ["Blue", "teal-night"],
  ["Magenta", "purple-night"],
  ["Cyan", "teal-light"],
  ["White", "night-muted"],
  ["BrightBlack", "night-subtle"],
  ["BrightRed", "factory-light"],
  ["BrightGreen", "green"],
  ["BrightYellow", "amber"],
  ["BrightBlue", "teal-light"],
  ["BrightMagenta", "purple-light"],
  ["BrightCyan", "teal-light"],
  ["BrightWhite", "night-ink"],
];

/** The Shiki theme of the --code-* tokens, named hw-code. */
export const codeTheme = (tokens: Record<string, string>, colors: Record<string, string>) => {
  const code = (role: string) => colors[tokens[`--code-${role}`].slice(4, -1)];
  return {
    name: "hw-code",
    type: "dark",
    colors: {
      "editor.background": code("bg"),
      "editor.foreground": code("fg"),
      ...Object.fromEntries(ANSI.map(([k, c]) => [`terminal.ansi${k}`, colors[`--color-${c}`]])),
    },
    tokenColors: CODE_SCOPES.map(([role, scope]) => {
      const [name, fontStyle] = role.split("/");
      return { scope, settings: { foreground: code(name), ...(fontStyle && { fontStyle }) } };
    }),
  };
};

const FONT_FACE = /@font-face\s*\{([^}]*)\}/g;
/** A src of local() fonts alone: a fallback face. A src mixing local() and url() is no fallback. */
const LOCAL = /src:(?:\s*local\("[^"]+"\),?)+;/;

/** The fallback faces of fonts.css, as written. */
export const fallbackFaces = (css: string) =>
  [...css.matchAll(FONT_FACE)].map(([face]) => face).filter((face) => LOCAL.test(face));

/** The @font-face rules of fonts.css (or print.css), each descriptor camel-cased (fontFamily
 *  unquoted, unicodeRange unspaced), src as the file under ./fonts/ and its format. A face without
 *  unicodeRange takes every character. A fallback face (a src of local() fonts alone) is left
 *  out: fallbackData lists those. */
export const fontFaces = (css: string) =>
  [...css.matchAll(FONT_FACE)]
    .filter(([face]) => !LOCAL.test(face))
    .map(([, body]): Record<string, string> => {
      const { src, ...rest } = declarations(body);
      const [, file, format] = src.match(/url\("fonts\/([^"]+)"\) format\("([^"]+)"\)/)!;
      return { file, format, ...camelCased(rest) };
    });

/** fonts.css's fallback faces as data, descriptors as fontFaces gives them, src as the local font
 *  names in order. */
const fallbackData = (css: string) =>
  [...css.matchAll(FONT_FACE)]
    .filter(([face]) => LOCAL.test(face))
    .map(([, body]): Record<string, string | string[]> => {
      const { src, ...rest } = declarations(body);
      return {
        local: [...src.matchAll(/local\("([^"]+)"\)/g)].map((m) => m[1]),
        ...camelCased(rest),
      };
    });

/** @font-face descriptors camel-cased, fontFamily unquoted, unicodeRange unspaced. */
const camelCased = (descriptors: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(descriptors).map(([k, v]) => [
      k.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()),
      k === "font-family"
        ? v.replace(/^"|"$/g, "")
        : k === "unicode-range"
          ? v.replace(/ /g, "")
          : v,
    ]),
  );

/** The --color-* tokens and every token whose value reads one of them, however indirectly. */
const dayAgain = (tokens: Record<string, string>) => {
  const out = new Set(Object.keys(tokens).filter((k) => k.startsWith("--color-")));
  for (let size = 0; size !== out.size;) {
    size = out.size;
    for (const [k, v] of Object.entries(tokens))
      if ([...v.matchAll(/var\((--[\w-]+)/g)].some((m) => out.has(m[1]!))) out.add(k);
  }
  return out;
};

const LAYER_ORDER = readFileSync(join(ROOT, "tokens/layers.css"), "utf8").trim();

const imported = (path: string): string =>
  readFileSync(path, "utf8").replace(/^@import "(\.\.?\/[\w./-]+\.css)";$/gm, (_, f: string) =>
    imported(join(path, "..", f)),
  );

/** A stylesheet with its relative @imports replaced by the files, recursively, each where the
 *  browser applies it, its comments dropped and the layer order stated once, at the top. Throws on
 *  an @import of another form and on a relative url(), which would resolve against the flat file's
 *  folder. */
export const flat = (path: string): string => {
  const css = imported(path).replace(/\/\*[^]*?\*\//g, "");
  const bad = /@import\b[^;]*;?|url\(\s*(["']?)(?!data:|https?:|\/\/|#)[^"')]+\1\s*\)/.exec(css);
  if (bad) throw new Error(`${path}: ${bad[0]} cannot be resolved in place`);
  let first = true;
  return `${css
    .replaceAll(LAYER_ORDER, () => (first ? ((first = false), LAYER_ORDER) : ""))
    .replace(/\n\s*\n/g, "\n")
    .trim()}\n`;
};

const FLAT = (source: string) =>
  `/* Generated from ${source} by scripts/tokens.ts. Edit the source, never this file.
   The source with every @import resolved in place: a page that links the stylesheet links this
   one instead, so its first paint waits on one request. */
${flat(join(ROOT, source))}`;

const generate = () => {
  const css = readFileSync(SOURCE, "utf8");
  const screen = readFileSync(join(ROOT, "tokens/fonts.css"), "utf8");
  const tokens = parseTokens(css);
  const declare = (names: string[]) => names.map((k) => `  ${k}: ${tokens[k]};`).join("\n");
  const colors = resolveColors(tokens);
  const head =
    "Generated from tokens/tokens.css by scripts/tokens.ts. Edit the source, never this file.";
  const json = JSON.stringify({ tokens, colors }, null, 2);
  return {
    // The colours and every token built from them return on a data-theme="light" element inside
    // night.css's night, which is day again there; the rest inherit, so a scale or a corner an
    // ancestor sets holds on it. :where() leaves the surface's own values on that element winning.
    "tokens.root.css": `/* ${head} */\n:root {\n${declare(Object.keys(tokens))}\n}\n:where([data-hw-night] [data-theme="light"]) {\n${declare([...dayAgain(tokens)])}\n}\n`,
    "tokens.json": json + "\n",
    "tokens.ts": `// ${head}\nexport const tokens = ${JSON.stringify(tokens, null, 2)} as const;\n\nexport const colors = ${JSON.stringify(colors, null, 2)} as const;\n`,
    "tokens.py": `# ${head}\nTOKENS = ${JSON.stringify(tokens, null, 4)}\n\nCOLORS = ${JSON.stringify(colors, null, 4)}\n`,
    "code-theme.json": JSON.stringify(codeTheme(tokens, colors), null, 2) + "\n",
    "fonts.json":
      JSON.stringify({ faces: fontFaces(screen), fallbacks: fallbackData(screen) }, null, 2) + "\n",
    "static-fonts.css": `/* Generated from tokens/print.css and tokens/fonts.css by scripts/tokens.ts. Edit the
   sources, never this file. print.css's static faces without the print scale (static files, never
   variable ones, so Chrome embeds real glyphs in a PDF), then fonts.css's fallback faces.
   Import it as @hackersandwizards/brand/static-fonts.css. */
${[...readFileSync(join(ROOT, "tokens/print.css"), "utf8").matchAll(FONT_FACE)]
  .map(([face]) => face.replaceAll('url("fonts/', 'url("../tokens/fonts/'))
  .concat(fallbackFaces(screen))
  .join("\n\n")}
`,
    "elements.css": FLAT("elements/elements.css"),
    "document.css": FLAT("tokens/document.css"),
    "cursor.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">${(
      [
        [3, ""],
        [4, ' fill-opacity="0.4"'],
        [5, ' fill-opacity="0.25"'],
      ] as const
    )
      .map(([r, o]) => `<circle cx="6" cy="6" r="${r}" fill="${colors["--color-teal"]}"${o}/>`)
      .join("")}</svg>\n`,
  };
};

if (import.meta.main) {
  const dir = join(ROOT, "generated");
  const check = process.argv.includes("--check");
  mkdirSync(dir, { recursive: true });
  let stale = 0;
  for (const [name, content] of Object.entries(generate())) {
    const path = join(dir, name);
    if (!check) writeFileSync(path, content);
    else if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
      console.error(`generated/${name} is stale: run bun run tokens`);
      stale++;
    }
  }
  if (stale) process.exit(1);
}
