import { expect } from "bun:test";
import { test } from "./limit";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT } from "../scripts/git";

// Git hands a hook in a linked worktree GIT_DIR, and Bun's spawn passes the environment it started
// with, so package.json's "test" unsets it: a test's git in a scratch folder then finds the scratch
// repository. Run under a decoy GIT_DIR, a test committing in its scratch repository leaves the
// decoy without a commit.
test("a test's git in a scratch folder ignores an inherited GIT_DIR", () => {
  const decoy = mkdtempSync(join(tmpdir(), "brand-git-env-"));
  try {
    Bun.spawnSync(["git", "init", "-q", "--bare", decoy]);
    const run = Bun.spawnSync(
      ["bun", "run", "test", "test/upgrade.test.ts", "-t", "without a pin change the allowlist"],
      { cwd: ROOT, env: { ...process.env, GIT_DIR: decoy } },
    );
    expect(run.exitCode).toBe(0);
    const log = Bun.spawnSync(["git", "--git-dir", decoy, "rev-list", "--all"]);
    expect(log.stdout.toString()).toBe("");
  } finally {
    rmSync(decoy, { recursive: true, force: true });
  }
}, 60_000);
