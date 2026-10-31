#!/usr/bin/env bun
/**
 * Prints the prompt for a generated slide sketch, then each worked example: the filled parts of the
 * prompt and the sketch it produced, sketch-example-<name>.png beside it in this folder (the brand
 * catalogue shows them).
 *
 *   bun run brand-slide-sketch-prompt
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
