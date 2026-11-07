#!/usr/bin/env bun
// Fails where a text file a consumer's build wrote carries a line of verbal.json's `retired` list;
// the README's "Check your build for retired lines" says how it matches.
// Usage: brand-retired <dir or file>...
import {
  closeSync,
  existsSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  statSync,
} from "node:fs";
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
// A run of `*` or `_` at a word's edge is markdown emphasis; inside a word, as in snake_case, it stays.
const EMPHASIS = /(?<![\p{L}\p{N}*_])[*_]+|[*_]+(?![\p{L}\p{N}*_])/gu;
// JS and JSON escapes decoded first (`\b`, `\f`, `\n`, `\r` and `\t` as whitespace), then HTML
// entities; soft hyphens, zero-width characters and markdown emphasis dropped.
const normalise = (s: string) =>
  squash(
    s
      .replace(
        /\\(?:u([\da-fA-F]{4})|([bfnrt])|(["/\\]))/g,
        (m, h?: string, ws?: string, c?: string) => (h ? char(parseInt(h, 16), m) : ws ? " " : c!),
      )
      .replace(/&#x([\da-f]+);/gi, (m, h: string) => char(parseInt(h, 16), m))
      .replace(/&#(\d+);/g, (m, d: string) => char(Number(d), m))
      .replace(/&(\w+);/g, (m, e: string) => ENTITIES[e] ?? m)
      .normalize("NFC")
      .replace(/[\u00ad\u200b-\u200d\u2060\ufeff]/g, "")
      .replace(EMPHASIS, ""),
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
  const fd = openSync(path, "r");
  try {
    const head = Buffer.alloc(8000);
    const n = readSync(fd, head, 0, head.length, 0);
    // A positioned read leaves the file position at 0, so readFileSync reads the whole file.
    return head.subarray(0, n).includes(0) ? undefined : readFileSync(fd, "utf8");
  } finally {
    closeSync(fd);
  }
};

// statSync follows a symlinked file, which a Dirent's isFile() does not; a link that leads
// nowhere, in a loop or through a file is none.
const isFile = (f: string) => {
  try {
    return statSync(f).isFile();
  } catch {
    return false;
  }
};
const filesUnder = (path: string): string[] =>
  statSync(path).isDirectory()
    ? readdirSync(path, { recursive: true, encoding: "utf8" })
        .map((f) => join(path, f))
        .filter(isFile)
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
  const hits = new Map<string, string[]>();
  const isText = new Map<string, boolean>();
  const empty: string[] = [];
  for (const path of paths) {
    let found = false;
    for (const file of filesUnder(path)) {
      if (!isText.has(file)) {
        const text = textOf(file);
        isText.set(file, text !== undefined);
        const lines = text === undefined ? [] : retiredIn(text);
        if (lines.length) hits.set(file, lines);
      }
      found ||= isText.get(file)!;
    }
    if (!found) empty.push(path);
  }
  const read = [...isText.values()].filter(Boolean).length;
  if (empty.length) {
    console.error(`brand-retired: no text file in ${empty.join(", ")}; build first`);
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
