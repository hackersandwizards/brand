#!/usr/bin/env bun
// Generates the token formats a non-Tailwind consumer reads from tokens/tokens.css, the source:
// generated/tokens.root.css (the @theme block as :root), tokens.json, tokens.ts and tokens.py.
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

export const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) =>
  "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const NAMED: Record<string, string> = { white: "#ffffff", black: "#000000" };

/** Every --color-* token as a hex, color-mix() resolved. */
export const resolveColors = (tokens: Record<string, string>) => {
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
  return Object.fromEntries(
    Object.entries(tokens)
      .filter(([k]) => k.startsWith("--color-"))
      .map(([k, v]) => [k, value(v)]),
  );
};

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
