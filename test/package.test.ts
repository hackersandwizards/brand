import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";

// The package holds only the core. A new folder, a slide engine file or a print master fails here.
const SHIPPED = /^(package\.json|README\.md|LICENSE|(tokens|generated|expert|logos)\/.+)$/;
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
