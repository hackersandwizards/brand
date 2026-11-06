#!/usr/bin/env bun
// Generates the token formats a non-Tailwind consumer reads from tokens/tokens.css, the source:
// generated/tokens.root.css (the @theme block as :root), tokens.json, tokens.ts and tokens.py, and
// code-theme.json, the Shiki theme of the --code-* tokens and the terminal's ANSI colours; and from
// tokens/fonts.css fonts.json, its faces, for a surface that writes its own @font-face.
// Every value stays the CSS value as written; colours also get a resolved hex, color-mix() mixed
// in sRGB like the browser. `--check` exits 1 where a generated file is stale instead of writing.
// Usage: bun scripts/tokens.ts [--check]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./git";

export const SOURCE = join(ROOT, "tokens/tokens.css");

/** The custom properties of tokens.css in source order, comments dropped, whitespace collapsed. */
export const parseTokens = (css: string) => {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, "").match(/@theme\s*\{([\s\S]*)\}/)![1];
  const tokens: Record<string, string> = {};
  for (const decl of body.split(";")) {
    const m = decl.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) tokens[m[1]] = m[2].replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")");
  }
  return tokens;
};

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
// them. Normal and bright differ only where the brand has a lighter step (blind panel, 2026-11-02).
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

/** The @font-face rules of fonts.css: family, weight range, file (under ./fonts/) and unicode-range. */
export const fontFaces = (css: string) =>
  [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, body]) => {
    const get = (prop: string) => body.match(new RegExp(`${prop}:\\s*([^;]+);`))![1].trim();
    return {
      family: get("font-family").slice(1, -1),
      weight: get("font-weight"),
      file: get("src").match(/fonts\/([\w-]+\.woff2)/)![1],
      unicodeRange: get("unicode-range").replace(/\s+/g, ""),
    };
  });

const generate = () => {
  const css = readFileSync(SOURCE, "utf8");
  const tokens = parseTokens(css);
  const colors = resolveColors(tokens);
  const head =
    "Generated from tokens/tokens.css by scripts/tokens.ts. Edit the source, never this file.";
  const json = JSON.stringify({ tokens, colors }, null, 2);
  return {
    "tokens.root.css": `/* ${head} */\n:root {\n${Object.entries(tokens)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n")}\n}\n`,
    "tokens.json": json + "\n",
    "tokens.ts": `// ${head}\nexport const tokens = ${JSON.stringify(tokens, null, 2)} as const;\n\nexport const colors = ${JSON.stringify(colors, null, 2)} as const;\n`,
    "tokens.py": `# ${head}\nTOKENS = ${JSON.stringify(tokens, null, 4)}\n\nCOLORS = ${JSON.stringify(colors, null, 4)}\n`,
    "code-theme.json": JSON.stringify(codeTheme(tokens, colors), null, 2) + "\n",
    "fonts.json":
      JSON.stringify(
        { faces: fontFaces(readFileSync(join(ROOT, "tokens/fonts.css"), "utf8")) },
        null,
        2,
      ) + "\n",
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
    else if (readFileSync(path, "utf8") !== content) {
      console.error(`generated/${name} is stale: run bun run tokens`);
      stale++;
    }
  }
  if (stale) process.exit(1);
}
