import { execFileSync } from "node:child_process";
export { strykerPlugins, strykerValidationSchema } from "@stryker-mutator/vitest-runner";

// Keep Stryker's CLI on Node. Its workers fork Vitest and must use the same runtime as bun run test.
if (!process.versions.bun) {
  for (const key of ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR"]) {
    delete process.env[key];
  }
  process.execPath = execFileSync("bun", ["--print", "process.execPath"], {
    encoding: "utf8",
  }).trim();
}
