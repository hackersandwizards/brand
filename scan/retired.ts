#!/usr/bin/env bun
// Fails where a text file a consumer's build wrote carries a line of verbal.json's `retired` list;
// the README's "Check your build for retired lines" says how it matches.
// Usage: brand-retired <dir or file>...
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import verbal from "../verbal/verbal.json";

const ENTITIES: Record<string, string> = {
  amp: "&",
  nbsp: " ",
  quot: '"',
  apos: "'",
  rsquo: "’",
  shy: "",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
};
// An escaped < or > stays escaped, so decoding never opens a tag the stripped form would remove.
const char = (code: number, m: string) =>
  Number.isInteger(code) && code <= 0x10ffff && code !== 60 && code !== 62
    ? String.fromCodePoint(code)
    : m;
// Whitespace collapsed, with none before punctuation: a line wrapped or set across elements matches.
const squash = (s: string) => s.replace(/\s+/g, " ").replace(/ (?=[.,;:!?])/g, "");
// HTML entities and JS escapes decoded, soft hyphens and zero-width characters dropped.
const normalise = (s: string) =>
  squash(
    s
      .replace(/&#x([\da-f]+);/gi, (m, h: string) => char(parseInt(h, 16), m))
      .replace(/&#(\d+);/g, (m, d: string) => char(Number(d), m))
      .replace(/&(\w+);/g, (m, e: string) => ENTITIES[e] ?? m)
      .replace(/\\u([\da-f]{4})/gi, (m, h: string) => char(parseInt(h, 16), m))
      .normalize("NFC")
      .replace(/[\u00ad\u200b-\u200d\u2060\ufeff]/g, ""),
  );
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// A retired line counts as a whole, in any case, with or without its closing stop, its last word
// also plural or possessive; a letter, digit or hyphen on either side makes another word. A line
// marked `capital` counts only where it opens with a capital letter, as a heading or a sentence does.
const RETIRED = verbal.retired.map((r) => {
  const re = new RegExp(
    `(?<![\\p{L}\\p{N}-])${escape(normalise(r.text).replace(/[.!?]$/, ""))}[.!?]?(?:['’]s?|s)?(?![\\p{L}\\p{N}-])`,
    "giu",
  );
  const capital = "capital" in r && r.capital;
  const hit = (f: string) => {
    for (const m of f.matchAll(re)) if (!capital || /\p{Lu}/u.test(m[0][0]!)) return true;
    return false;
  };
  return [r.text, hit] as const;
});

/** The retired lines a text carries, raw or with its tags stripped. */
export const retiredIn = (text: string) => {
  const raw = normalise(text);
  const forms = [raw, squash(raw.replace(/<[^>]*>/g, " "))];
  return RETIRED.filter(([, hit]) => forms.some(hit)).map(([line]) => line);
};

/** A file's text, or undefined for a binary (a NUL byte in its first 8000). */
export const textOf = (path: string) => {
  const buf = readFileSync(path);
  return buf.subarray(0, 8000).includes(0) ? undefined : buf.toString("utf8");
};

// statSync follows a symlinked file, which a Dirent's isFile() does not.
const filesUnder = (path: string): string[] =>
  statSync(path).isDirectory()
    ? readdirSync(path, { recursive: true, encoding: "utf8" })
        .map((f) => join(path, f))
        .filter((f) => statSync(f).isFile())
    : [path];

if (import.meta.main) {
  const paths = process.argv.slice(2);
  if (!paths.length) {
    console.error("Usage: brand-retired <dir or file>...");
    process.exit(2);
  }
  const missing = paths.filter((p) => !existsSync(p));
  if (missing.length) {
    console.error(`brand-retired: ${missing.join(", ")} not found; build first`);
    process.exit(2);
  }
  let read = 0;
  const hits = new Map<string, string[]>();
  for (const file of new Set(paths.flatMap(filesUnder))) {
    const text = textOf(file);
    if (text === undefined) continue;
    read++;
    const lines = retiredIn(text);
    if (lines.length) hits.set(file, lines);
  }
  if (!read) {
    console.error(`brand-retired: no text file in ${paths.join(", ")}; build first`);
    process.exit(2);
  }
  if (hits.size) {
    const list = [...hits].flatMap(([file, lines]) => lines.map((l) => `${file}: "${l}"`));
    console.error(
      `${list.join("\n")}\nbrand-retired: a retired line in ${hits.size} of ${read} files read. Take the current text from @hackersandwizards/brand/verbal.json.`,
    );
    process.exit(1);
  }
  console.log(
    `brand-retired: none of ${verbal.retired.length} retired lines in ${read} files under ${paths.join(", ")}`,
  );
}
