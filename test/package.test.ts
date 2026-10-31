import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";

// The package holds only the core. A new folder, a slide engine file or a print master fails here.
const SHIPPED =
  /^(package\.json|manifest\.json|README\.md|LICENSE|(tokens|generated|expert|logos|clients|press)\/.+|applications\/(linkedin|slide)-visuals\/[\w-]+\.(ts|txt)|applications\/mail-signature\/(template\.(html|txt)|fill\.ts|cli\.ts)|scan\/(colours|components)\.ts)$/;
const PRINT_MASTERS = /\.tif$|emoji-logo-(long|short)\.png$/;

const packed = Bun.spawnSync(["bun", "pm", "pack", "--dry-run"], { cwd: ROOT })
  .stdout.toString()
  .split("\n")
  .flatMap((line) => line.match(/^packed \S+ (.+)$/)?.[1] ?? []);

test("the package ships only the core", () => {
  expect(packed.length).toBeGreaterThan(30);
  expect(packed.filter((f) => !SHIPPED.test(f) || PRINT_MASTERS.test(f))).toEqual([]);
  expect(packed).toEqual(
    expect.arrayContaining([
      "LICENSE",
      "tokens/fonts/OFL-Inter.txt",
      "tokens/fonts/OFL-JetBrainsMono.txt",
    ]),
  );
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

// Consumers install this repo as a Git dependency, which reads files through Git: a shipped file in
// LFS reaches a machine without git-lfs as a pointer.
test("no shipped file is tracked by Git LFS", () => {
  const attrs = Bun.spawnSync(["git", "check-attr", "filter", "--", ...packed], { cwd: ROOT })
    .stdout.toString()
    .split("\n")
    .filter((line) => line.endsWith(": filter: lfs"));
  expect(attrs).toEqual([]);
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
