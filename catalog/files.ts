// The tracked brand files, served beside the portal, which links them: in dev from the working
// tree, in the build copied into dist/. Only the brand folders, the scripts inside them included:
// the repo's tests, scan/, scripts/ and docs stay out, as a test copied into dist/ runs again
// under a bare `bun test`. The print masters (logos/*.tif) stay out too, as the portal links none
// of them. `bun install` pulls the LFS files .lfsconfig keeps from a clone, as a pointer shows as
// a broken image. On GitHub Actions the build pulls them too and fails on any still a pointer, so
// the published page never shows one.
import type { AstroIntegration } from "astro";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
// Its own pointer test, not scan/colours.ts: the Astro config loads this under Vite, without Bun's
// import.meta.dir.
const POINTER = "version https://git-lfs.github.com/spec/";
const git = (args: string[]) => {
  const run = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (run.status !== 0) throw new Error(`git ${args.join(" ")}: ${run.stderr}`);
  return run.stdout;
};
const BRAND = [
  "applications",
  "elements",
  "expert",
  "generated",
  "logos",
  "press",
  "tokens",
  "verbal",
];
/** The tracked files the site serves, as repository paths. */
export const served = () =>
  git(["ls-files", "-z", "--", ...BRAND, ":!:**/.*", ":!:logos/*.tif"])
    .split("\0")
    .filter(Boolean);

// One listing per second at most: a portal load requests some 200 files.
let listed: { at: number; paths: Set<string> } | undefined;
const isServed = (path: string) => {
  if (!listed || Date.now() - listed.at > 1000)
    listed = { at: Date.now(), paths: new Set(served()) };
  return listed.paths.has(path);
};

/** The dev server's middleware. Astro hands it the path below the base; the base is the portal. */
export function serveFile(req: IncomingMessage, res: ServerResponse, next: () => void) {
  let path: string;
  try {
    path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  } catch {
    return next(); // A malformed escape names no file.
  }
  if (path === "/") {
    req.url = "/index.html";
    return next();
  }
  // Only what the build copies, so a link to an untracked file fails here as on Pages.
  const file = join(ROOT, path);
  if (!existsSync(file) || !isServed(path.slice(1))) return next();
  res.setHeader("Cache-Control", "no-cache");
  // A browser refuses an SVG served without its type.
  res.setHeader("Content-Type", Bun.file(file).type);
  res.end(readFileSync(file));
}

export function files(): AstroIntegration {
  return {
    name: "brand-files",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(serveFile);
      },
      "astro:build:done": ({ dir }) => {
        if (process.env.GITHUB_ACTIONS)
          git(["-c", "lfs.fetchexclude=", "lfs", "pull", "--exclude=logos/*.tif"]);
        const out = fileURLToPath(dir);
        const pointers: string[] = [];
        for (const path of served()) {
          const target = join(out, path);
          if (existsSync(target))
            throw new Error(`brand-files: ${path} collides with a built page`);
          mkdirSync(dirname(target), { recursive: true });
          copyFileSync(join(ROOT, path), target);
          if (readFileSync(target).subarray(0, 40).toString().startsWith(POINTER))
            pointers.push(path);
        }
        if (process.env.GITHUB_ACTIONS && pointers.length)
          throw new Error(`brand-files: still LFS pointers: ${pointers.join(", ")}`);
      },
    },
  };
}
