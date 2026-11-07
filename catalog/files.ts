// The tracked brand files, served beside the portal, which links them: in dev from the working
// tree, in the build copied into dist/. Only the brand folders: the repo's code, tests and docs
// stay out, as a test copied into dist/ runs again under a bare `bun test`. The print masters
// (logos/*.tif) stay out too, as the portal links none of them. Dev and the build first pull the
// LFS files .lfsconfig keeps from a clone, since a pointer shows as a broken image. Dev pulls beside
// the running server. Offline the pointers stay, with a warning, and on GitHub Actions the build
// fails on any, so the published page never shows one.
import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import { execFile, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const POINTER = "version https://git-lfs.github.com/spec/";
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const git = (args: string[]) => {
  const run = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (run.status !== 0) throw new Error(`git ${args.join(" ")}: ${run.stderr}`);
  return run.stdout;
};
const BRAND = [
  "applications",
  "clients",
  "elements",
  "expert",
  "generated",
  "logos",
  "press",
  "tokens",
  "verbal",
];
const pullLfs = (logger: AstroIntegrationLogger) =>
  promisify(execFile)("git", ["-c", "lfs.fetchexclude=", "lfs", "pull", "--exclude=logos/*.tif"], {
    cwd: ROOT,
  }).catch((error: Error) => logger.warn(`git lfs pull: ${error.message}`));

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
  const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  if (path === "/") {
    req.url = "/index.html";
    return next();
  }
  // Only what the build copies, so a link to an untracked file fails here as on Pages.
  const file = path.slice(1);
  if (!existsSync(join(ROOT, file)) || !isServed(file)) return next();
  res.setHeader("Cache-Control", "no-cache");
  // A browser refuses an SVG served without its type.
  res.setHeader("Content-Type", Bun.file(file).type);
  res.end(readFileSync(join(ROOT, file)));
}

export function files(): AstroIntegration {
  return {
    name: "brand-files",
    hooks: {
      "astro:server:setup": ({ server, logger }) => {
        void pullLfs(logger);
        server.middlewares.use(serveFile);
      },
      "astro:build:done": async ({ dir, logger }) => {
        await pullLfs(logger);
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
        if (pointers.length) {
          const message = `brand-files: still LFS pointers: ${pointers.join(", ")}`;
          if (process.env.GITHUB_ACTIONS) throw new Error(message);
          logger.warn(message);
        }
      },
    },
  };
}
