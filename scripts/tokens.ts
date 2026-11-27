#!/usr/bin/env bun
// Run `bun run check:tokens` to report stale generated files without regenerating them.
// The slide cursor uses hotspot 6 6. Colour mixes resolve in sRGB like the browser.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inlineImports } from "../applications/linkedin-visuals/render";
import { codeTheme } from "./code-theme";
import { declarations } from "./css-declarations";
import { fontOutputs } from "./font-outputs";
import { ROOT } from "./git";

export const SOURCE = join(ROOT, "tokens/tokens.css");

/** The custom properties of tokens.css's theme blocks, static ones included, in source order.
 *  Throws on a theme block it cannot read, such as one holding a nested rule. */
export const parseTokens = (css: string) => {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks = [...bare.matchAll(/@theme(?:\s+(?:static|inline))?\s*\{([^{}]*)\}/g)];
  if (blocks.length !== bare.match(/@theme\b/g)?.length)
    throw new Error("a @theme block parseTokens cannot read");
  return Object.fromEntries(
    Object.entries(declarations(blocks.map((m) => m[1]).join(";"))).filter(([k]) =>
      k.startsWith("--"),
    ),
  );
};

/** expert.css's own --text-* steps, an alias of another step left out; a name tokens.css holds too
 *  throws, since the data formats hold one value per name. */
const expertSteps = (css: string, tokens: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(parseTokens(css)).filter(([k, v]) => {
      if (k.startsWith("--text-") && k in tokens) throw new Error(`expert.css repeats ${k}`);
      return k.startsWith("--text-") && !v.startsWith("var(");
    }),
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
  ].map(([, name]) => name);

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

/** The --color-* tokens and every token whose value reads one of them, however indirectly. */
const dayAgain = (tokens: Record<string, string>) => {
  const out = new Set(Object.keys(tokens).filter((k) => k.startsWith("--color-")));
  for (let size = 0; size !== out.size;) {
    size = out.size;
    for (const [k, v] of Object.entries(tokens))
      if ([...v.matchAll(/var\((--[\w-]+)/g)].some(([, name]) => out.has(name))) out.add(k);
  }
  return out;
};

/** copy.ts wired, for a page loading one script: an IIFE, so its names stay out of the page's. */
const copyScript = () => {
  const entry = join(ROOT, "scripts/copy-entry.ts");
  const built = Bun.spawnSync([process.execPath, "build", "--minify", "--format=iife", entry]);
  if (!built.success)
    throw new Error(`bun build scripts/copy-entry.ts: ${built.stderr.toString()}`);
  return built.stdout.toString();
};

const LAYER_ORDER = readFileSync(join(ROOT, "tokens/layers.css"), "utf8").trim();

const CSS_CLOSERS = new Map([
  ["{", "}"],
  ["(", ")"],
  ["[", "]"],
]);

function* topLevelCssBoundaries(css: string) {
  const closers: string[] = [];
  let previous = { token: "", end: 0 };
  // Strings, escapes and unquoted URLs can contain punctuation that does not delimit a rule.
  const tokens =
    /\\[^]|"(?:\\[^]|[^"\\])*"|'(?:\\[^]|[^'\\])*'|(?<![\w-])url\((?:\\[^]|[^"'()\\])*\)|[^ \t\n\r\f]/gi;
  for (const { 0: token, index } of css.matchAll(tokens)) {
    if (token === closers.at(-1)) closers.pop();
    if (closers.length === 0 && "{};".includes(token)) yield { token, index, previous };
    const closer = CSS_CLOSERS.get(token);
    if (closer) closers.push(closer);
    previous = { token, end: index + token.length };
  }
}

/** Adjacent top-level :root rules as one, each declaration kept in its place. */
export const mergeAdjacentRootRules = (css: string): string => {
  let start = 0;
  let root = false;
  let left: { token: string; end: number } | undefined;
  let from = 0;
  let merged = "";
  for (const { token, index, previous } of topLevelCssBoundaries(css)) {
    if (token === "{") {
      root = /^[ \t\n\r\f]*:root[ \t\n\r\f]*$/.test(css.slice(start, index));
      if (root && left) {
        merged += css.slice(from, left.end);
        if (left.token !== ";" && left.token !== "{") merged += ";";
        from = index + 1;
      }
    } else {
      left = token === "}" && root ? previous : undefined;
      start = index + 1;
    }
  }
  return merged + css.slice(from);
};

/** A stylesheet with its relative @imports replaced by the files, recursively, each where the
 *  browser applies it, its comments dropped and the layer order stated once, at the top. Throws on
 *  an @import of another form and on a relative url(), which would resolve against the flat file's
 *  folder. */
export const flat = (path: string): string => {
  const css = inlineImports(path).replace(/\/\*[^]*?\*\//g, "");
  const bad = /@import\b[^;]*;?|url\(\s*(["']?)(?!data:|https?:|\/\/|#)[^"')]+\1\s*\)/.exec(css);
  if (bad) throw new Error(`${path}: ${bad[0]} cannot be resolved in place`);
  let first = true;
  const ordered = css.replaceAll(LAYER_ORDER, () => (first ? ((first = false), LAYER_ORDER) : ""));
  return `${mergeAdjacentRootRules(ordered)
    .replace(/\n\s*\n/g, "\n")
    .trim()}\n`;
};

const FLAT = (source: string) =>
  `/* Generated from ${source} by scripts/tokens.ts. Edit the source, never this file.
   The source with every @import resolved in place: a page that links the stylesheet links this
   one instead, so its first paint waits on one request. */
${flat(join(ROOT, source))}`;

export const pythonString = (value: string) => {
  const json = JSON.stringify(value);
  const doubleQuotes = value.match(/"/g)?.length ?? 0;
  const singleQuotes = value.match(/'/g)?.length ?? 0;
  if (doubleQuotes <= singleQuotes) return json;
  const body = json
    .slice(1, -1)
    .replace(/\\\\|\\"/g, (escape) => (escape === '\\"' ? '"' : escape));
  return `'${body.replaceAll("'", "\\'")}'`;
};

export const pythonDict = (entries: Record<string, string>) =>
  `{\n${Object.entries(entries)
    .map(([key, value]) => `    ${pythonString(key)}: ${pythonString(value)},\n`)
    .join("")}}`;

const generate = () => {
  const css = readFileSync(SOURCE, "utf8");
  const tokens = parseTokens(css);
  const declare = (names: string[]) => names.map((k) => `  ${k}: ${tokens[k]};`).join("\n");
  const colors = resolveColors(tokens);
  const head =
    "Generated from tokens/tokens.css by scripts/tokens.ts. Edit the source, never this file.";
  const data = {
    ...tokens,
    ...expertSteps(readFileSync(join(ROOT, "expert/expert.css"), "utf8"), tokens),
  };
  const dataHead =
    "Generated from tokens/tokens.css and expert/expert.css by scripts/tokens.ts. Edit the sources, never this file.";
  const json = JSON.stringify({ tokens: data, colors }, null, 2);
  return {
    // The colours and every token built from them return on a data-theme="light" element inside
    // night.css's night, which is day again there; the rest inherit, so a scale or a corner an
    // ancestor sets holds on it. :where() leaves the surface's own values on that element winning.
    "tokens.root.css": `/* ${head} */\n:root {\n${declare(Object.keys(tokens))}\n}\n:where([data-hw-night] [data-theme="light"]) {\n${declare([...dayAgain(tokens)])}\n}\n`,
    "tokens.json": json + "\n",
    "tokens.ts": `// ${dataHead}\nexport const tokens = ${JSON.stringify(data, null, 2)} as const;\n\nexport const colors = ${JSON.stringify(colors, null, 2)} as const;\n`,
    "tokens.py": `# ${dataHead}\nTOKENS = ${pythonDict(data)}\n\nCOLORS = ${pythonDict(colors)}\n`,
    "code-theme.json": JSON.stringify(codeTheme(tokens, colors), null, 2) + "\n",
    ...fontOutputs(
      readFileSync(join(ROOT, "tokens/fonts.css"), "utf8"),
      readFileSync(join(ROOT, "tokens/print.css"), "utf8"),
    ),
    "elements.css": FLAT("elements/elements.css"),
    "copy.js": copyScript(),
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
  const files = generate();
  // A file no generator writes any more still ships and resolves through its export.
  if (check)
    for (const name of readdirSync(dir).filter((f) => !f.startsWith(".") && !(f in files))) {
      console.error(`generated/${name} is no output of bun run tokens: delete it`);
      stale++;
    }
  for (const [name, content] of Object.entries(files)) {
    const path = join(dir, name);
    if (!check) writeFileSync(path, content);
    else if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
      console.error(`generated/${name} is stale: run bun run tokens`);
      stale++;
    }
  }
  if (stale) process.exit(1);
}
