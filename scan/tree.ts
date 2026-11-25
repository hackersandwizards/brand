// Consumer working-tree traversal, built-in scan exceptions, brand pin-change detection and
// allowlist persistence shared across brand-colours, brand-copies, brand-scan and brand-elements.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import own from "../package.json";
import { isRecord } from "./help";

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

// A style element the documents engine (@hackersandwizards/documents) wrote into a document it
// composed: the engine's own stylesheets, inlined so the document stands alone, which the engine's
// gate scans in its source. Whatever else the document carries is the consumer's and is read.
export const ENGINE_STYLE =
  /<style\s+data-hw-(?:document|components|page|onepager|readout|certificate)\b[^>]*>[\s\S]*?<\/style>/g;

/** The name of the built-in exception that keeps a path out of the scans, if any. */
export const exception = (p: string) => EXCEPTIONS.find((e) => e.test(p))?.name;

/** Whether a path is brand surface the scan reads. */
export const scanned = (p: string) => STYLING_EXTENSIONS.has(extname(p)) && !exception(p);

export const runGit = (args: string[]) =>
  spawnSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30 });

export function readAllowlists<T>(file: string, parse: (json: string) => T) {
  const allow = existsSync(file) ? parse(readFileSync(file, "utf8")) : undefined;
  const head = runGit(["show", `HEAD:./${file}`]);
  const committed = head.status === 0 ? parse(head.stdout) : undefined;
  return { allow, committed };
}

export function readReasonAllowlists(file: string) {
  const { allow = {}, committed } = readAllowlists(file, (json): Record<string, string> => {
    const value: unknown = JSON.parse(json);
    if (!isRecord(value)) throw new Error(`${file}: expected an object of reasons`);
    return Object.fromEntries(
      Object.entries(value).map(([name, reason]) => {
        if (typeof reason !== "string") throw new Error(`${file}: "${name}" needs a string reason`);
        return [name, reason] as const;
      }),
    );
  });
  return { allow, committed };
}

/** Every file under the current directory, tracked or untracked, .gitignore honoured. */
export const listTree = (cmd: string) => {
  const ls = runGit(["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (ls.status !== 0) throw new Error(`${cmd}: not a git checkout: ${ls.stderr}`);
  return [...new Set(ls.stdout.split("\0"))].filter((p) => p && existsSync(p));
};

/** The brand version a package.json pins as a Git tag (`#v<version>`), if any. */
export const pinnedVersion = (packageJson: string) => {
  const pkg: unknown = JSON.parse(packageJson);
  if (!isRecord(pkg)) return;
  for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
    const dependencies = pkg[field];
    const pin = isRecord(dependencies) ? dependencies["@hackersandwizards/brand"] : undefined;
    if (typeof pin !== "string") continue;
    const m = /#v([^#\s]+)$/.exec(pin);
    if (m) return m[1];
  }
};

/** The brand version package.json pinned at HEAD where the working tree pins this scanner's
 *  version instead; undefined otherwise, a stale install included. */
export const pinChange = (cmd: string) => {
  const head = runGit(["show", "HEAD:./package.json"]);
  const from = head.status === 0 ? pinnedVersion(head.stdout) : undefined;
  const to = existsSync("package.json")
    ? pinnedVersion(readFileSync("package.json", "utf8"))
    : undefined;
  if (!from || from === own.version || to !== own.version) return;
  console.log(
    `${cmd}: pin change v${from} to v${own.version}: the list may take what this scanner finds in the files as committed at HEAD`,
  );
  return from;
};

/** Whether a path is committed at HEAD and unchanged in the working tree. */
export const committedAsIs = (p: string) =>
  runGit(["cat-file", "-e", `HEAD:./${p}`]).status === 0 &&
  runGit(["diff", "--quiet", "HEAD", "--", p]).status === 0;

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

/** Writes a tightened allowlist when a file already exists or entries remain; returns whether it wrote. */
export const writeAllowlist = (path: string, next: object): boolean => {
  if (!existsSync(path) && !Object.keys(next).length) return false;
  writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
  return true;
};
