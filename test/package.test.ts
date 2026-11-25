import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { packed as listPacked, ROOT } from "../scripts/git";

const SHIPPED =
  /^(package\.json|manifest\.json|README\.md|LICENSE|docs\/[\w-]+\.md|(tokens|generated|expert|elements|logos|press|verbal)\/.+|applications\/(linkedin|slide)-visuals\/[\w-]+\.(ts|txt)|applications\/mail-signature\/(template\.(html|txt)|fill\.ts|cli\.ts)|scan\/(colours|copies|components|markers|elements|retired|help)\.ts|catalog\/(Element\.astro|ElementScript\.astro|element-demos\.ts))$/;
const PRINT_MASTERS = /\.tif$|emoji-logo-short\.png$/;

const packed = listPacked();

test("the package ships only the core", () => {
  expect(packed.length).toBeGreaterThan(30);
  expect(packed.filter((f) => !SHIPPED.test(f))).toEqual([]);
  expect(packed.filter((f) => PRINT_MASTERS.test(f))).toEqual([]);
  for (const file of [
    "LICENSE",
    "tokens/fonts/OFL-Inter.txt",
    "tokens/fonts/OFL-JetBrainsMono.txt",
    "tokens/LICENSE-Lucide.txt",
  ])
    expect(packed).toContain(file);
});

test("every shipped PNG is an image, not a Git LFS pointer", () => {
  const pngs = packed.filter((f) => f.endsWith(".png"));
  expect(pngs.length).toBeGreaterThan(0);
  for (const f of pngs)
    expect({ f, magic: readFileSync(join(ROOT, f)).subarray(1, 4).toString() }).toEqual({
      f,
      magic: "PNG",
    });
});

// A consumer runs these by name (`bun run <bin>`): a bin whose file moved or lost its shebang fails
// only there.
test("every bin is a shipped script with a bun shebang", () => {
  const { bin } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")) as {
    bin: Record<string, string>;
  };
  for (const [name, file] of Object.entries(bin)) {
    expect({ name, shipped: packed.includes(file) }).toEqual({ name, shipped: true });
    expect({ name, line: readFileSync(join(ROOT, file), "utf-8").split("\n")[0] }).toEqual({
      name,
      line: "#!/usr/bin/env bun",
    });
  }
});

// A consumer imports these by name: an export whose file left `files` fails only there.
test("every export names a shipped file, a pattern at least one", () => {
  const { exports } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")) as {
    exports: Record<string, string>;
  };
  const targets = Object.values(exports).map((target) => target.replace(/^\.\//, ""));
  const literalFiles = targets.filter((target) => !target.endsWith("*"));
  const prefixes = targets
    .filter((target) => target.endsWith("*"))
    .map((target) => target.slice(0, -1));
  expect(literalFiles.filter((target) => !packed.includes(target))).toEqual([]);
  expect(prefixes.filter((prefix) => !packed.some((file) => file.startsWith(prefix)))).toEqual([]);
});
