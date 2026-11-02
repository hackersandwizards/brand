// Runs portal.ts in its own Bun process from the repository root and keeps the last result: the
// portal's modules find their files through import.meta.dir, which points into the bundle once
// Astro builds them, and a fresh process reads the working tree afresh on each dev request. The
// root comes from git for the same reason: import.meta.url here points into the bundle too.
import { spawnSync } from "node:child_process";

type Portal = { html: string; assets: Record<string, string> };
let last: Portal | undefined;

export function portal(fresh = false): Portal {
  if (last && !fresh) return last;
  const cwd = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).stdout.trim();
  const run = spawnSync("bun", ["catalog/portal.ts"], {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (run.status !== 0) throw new Error(`catalog/portal.ts: ${run.stderr}`);
  last = JSON.parse(run.stdout) as Portal;
  return last;
}
