import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** A command in bin calls this first: on --help or -h before any "--" it prints its usage and exits 0. */
export const answerHelp = (usage: string) => {
  const args = process.argv.slice(2);
  const end = args.indexOf("--");
  const own = end < 0 ? args : args.slice(0, end);
  if (!own.includes("--help") && !own.includes("-h")) return;
  console.log(usage);
  process.exit(0);
};

export function printSketchPrompt(dir: string) {
  console.log(readFileSync(join(dir, "sketch-prompt.txt"), "utf-8"));
  for (const file of readdirSync(dir)
    .filter((f) => /^sketch-example-.+\.txt$/.test(f))
    .sort())
    console.log(
      `\nWorked example ${file.replace(/\.txt$/, "")}:\n\n${readFileSync(join(dir, file), "utf-8")}`,
    );
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/** Decodes URI escapes only when every percent-encoded byte forms valid UTF-8. */
export function decodeEscaped(text: string) {
  const utf8 =
    /(?:%[0-7][0-9a-f]|%(?:c[2-f]|d[0-9a-f])%[89ab][0-9a-f]|%(?:e0%[ab][0-9a-f]|e[1-9a-ce-f]%[89ab][0-9a-f]|ed%[89][0-9a-f])%[89ab][0-9a-f]|%(?:f0%[9ab][0-9a-f]|f[1-3]%[89ab][0-9a-f]|f4%8[0-9a-f])(?:%[89ab][0-9a-f]){2})/iy;
  for (let at = text.indexOf("%"); at >= 0; at = text.indexOf("%", utf8.lastIndex)) {
    utf8.lastIndex = at;
    if (!utf8.test(text)) return undefined;
  }
  return decodeURIComponent(text);
}
