import { createHash } from "node:crypto";
import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "..");

export const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");

/** The paths the package ships, as `bun pm pack` lists them. */
export const packed = () =>
  Bun.spawnSync(["bun", "pm", "pack", "--dry-run", "--ignore-scripts"], { cwd: ROOT })
    .stdout.toString()
    .split("\n")
    .flatMap((line) => line.match(/^packed \S+ (.+)$/)?.[1] ?? []);
