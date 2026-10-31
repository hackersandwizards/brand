#!/usr/bin/env bun
/**
 * Prints the prompt for a generated LinkedIn sketch, then each worked example: a filled prompt and
 * the post image it produced, sketch-example-<name>.png beside it in this folder (the brand
 * catalogue shows them).
 *
 *   bun run brand-linkedin-sketch-prompt
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = import.meta.dir;
console.log(readFileSync(join(dir, "sketch-prompt.txt"), "utf-8"));
for (const file of readdirSync(dir)
  .filter((f) => /^sketch-example-.+\.txt$/.test(f))
  .sort())
  console.log(
    `\nWorked example ${file.replace(/\.txt$/, "")}:\n\n${readFileSync(join(dir, file), "utf-8")}`,
  );
