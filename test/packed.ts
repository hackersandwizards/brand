import { ROOT } from "../scripts/git";

/** The paths the package ships, as `bun pm pack` lists them. */
export const packed = () =>
  Bun.spawnSync(["bun", "pm", "pack", "--dry-run", "--ignore-scripts"], { cwd: ROOT })
    .stdout.toString()
    .split("\n")
    .flatMap((line) => line.match(/^packed \S+ (.+)$/)?.[1] ?? []);
