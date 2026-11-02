// The tracked files the portal links (logos/, applications/, press/, generated/, tokens/, expert/
// and the rest), served beside it: in dev from the working tree, in the build copied into dist/.
// Dot folders, this app's own folder and the print masters (logos/*.tif) stay out, as the portal
// links none of them. On GitHub Actions the build first pulls the LFS files .lfsconfig keeps from a
// clone and fails on any still a pointer, so the published page never shows one.
import type { AstroIntegration } from "astro";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const POINTER = "version https://git-lfs.github.com/spec/";
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const git = (args: string[]) => {
  const run = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (run.status !== 0) throw new Error(`git ${args.join(" ")}: ${run.stderr}`);
  return run.stdout;
};
/** The tracked files the site serves, as repository paths. */
export const served = () =>
  git(["ls-files", "-z", "--", ":!:.*", ":!:**/.*", ":!:catalog/**", ":!:logos/*.tif"])
    .split("\0")
    .filter(Boolean);

export function files(): AstroIntegration {
  return {
    name: "brand-files",
    hooks: {
      "astro:server:setup": ({ server }) => {
        // Astro hands the middleware the path below the base. The base itself is the portal.
        server.middlewares.use((req, res, next) => {
          const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
          if (path === "/") {
            req.url = "/index.html";
            return next();
          }
          const file = join(ROOT, path);
          if (
            !file.startsWith(`${ROOT}/`) ||
            file.startsWith(join(ROOT, "catalog/")) ||
            !existsSync(file) ||
            !statSync(file).isFile()
          )
            return next();
          res.setHeader("Cache-Control", "no-cache");
          res.end(readFileSync(file));
        });
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
