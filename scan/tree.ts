import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname } from "node:path";

/** Exceptions the scan applies before it reads a file, each with its reason. `docs/checks.md` names
 *  the same list; the scan prints each one it applied. */
export const EXCEPTIONS = [
  {
    name: "generated",
    reason:
      "build, cache and dependency output, and nested worktrees (other checkouts with their own gate): rebuilt from source the scan reads",
    test: (p: string) =>
      /(^|\/)(node_modules|dist|\.astro|\.next|out|coverage|test-results|playwright-report|\.vercel|\.wrangler|worktrees|__pycache__|\.turbo|build)\//.test(
        p,
      ),
  },
  {
    name: "tests",
    reason: "a test states the values it asserts, off-token ones included, and ships no surface",
    test: (p: string) =>
      /(\.test\.|\.spec\.|__tests__\/|(^|\/)tests?\/|(^|\/)(test_[^/]*|[^/]*_test|conftest)\.py$)/.test(
        p,
      ),
  },
  {
    name: "allowlists",
    reason: "the scans' own exception lists, whose reasons name the values they allow",
    test: (p: string) => /(^|\/)brand-(colours|copies|scan|elements)\.json$/.test(p),
  },
  {
    name: "hub",
    reason:
      "agent tooling the ~/.claude hub syncs into every repo, non-h&w ones included, so it cannot take its files from this package",
    test: (p: string) =>
      p.startsWith(".claude/skills/parallel-session/") || p === ".claude/skills/voice/verbal.json",
  },
] as const;

export const STYLING_EXTENSIONS = new Set([
  ".css",
  ".scss",
  ".astro",
  ".tsx",
  ".ts",
  ".mts",
  ".cts",
  ".jsx",
  ".js",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".html",
  ".svg",
  ".py",
  ".json",
  ".webmanifest",
]);

export const NOT_STYLING = {
  name: "not styling",
  reason: `files that carry no styling the browser or a renderer reads: prose (.md, .mdx, .txt), images, fonts, PDFs and other binaries; read are ${[...STYLING_EXTENSIONS].join(" ")}`,
};

export const BRAND_COPY = {
  name: "brand copy",
  reason: "byte-identical to a package file, which brand-copies reports and its allowlist governs",
};

/** The extensions of a component file, in the frameworks a consumer builds with. */
export const COMPONENT = new Set([".astro", ".tsx", ".jsx", ".vue", ".svelte"]);

/** The name of the built-in exception that keeps a path out of the scans, if any. */
export const exception = (p: string) => EXCEPTIONS.find((e) => e.test(p))?.name;

/** Whether a path is brand surface the scan reads. */
export const scanned = (p: string) => STYLING_EXTENSIONS.has(extname(p)) && !exception(p);

export const runGit = (args: string[]) =>
  spawnSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30 });

/** Every file under the current directory, tracked or untracked, .gitignore honoured. */
export const listTree = (cmd: string) => {
  const ls = runGit(["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (ls.status !== 0)
    throw new Error(
      `${cmd}: Git could not list the files to check (${ls.stderr?.trim() ?? ls.error?.message}). Run from the project's Git checkout and make sure git ls-files works there.`,
    );
  return [...new Set(ls.stdout.split("\0"))].filter((p) => p && existsSync(p));
};

/** One line per built-in exception that kept a file out, with its count and reason. */
export const exceptionReport = (cmd: string, skipped: Record<string, number>) =>
  [...EXCEPTIONS, NOT_STYLING, BRAND_COPY]
    .filter((e) => skipped[e.name])
    .map((e) => `${cmd}: not scanned, ${e.name} (${skipped[e.name]} files): ${e.reason}`)
    .join("\n");

/** exceptionReport over a path list, for a scan whose own filter is only `scanned`. */
export const skippedReport = (cmd: string, paths: string[]) => {
  const skipped: Record<string, number> = {};
  for (const p of paths) {
    const why = exception(p);
    if (why) skipped[why] = (skipped[why] ?? 0) + 1;
  }
  return exceptionReport(cmd, skipped);
};
