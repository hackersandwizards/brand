// The built catalog (dist/, `bun run build`), which the tests in this folder read after the build,
// and a server for it under the Pages base on a port the system hands out.
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../scripts/git";

export const DIST = join(ROOT, "dist");
export const BASE = "/brand/";
if (!existsSync(join(DIST, "index.html")))
  throw new Error("dist/index.html missing: run `bun run build` before these tests");

/** The file a site path names, or undefined: a folder serves its index.html, as Pages does. */
export const fileOf = (path: string) => {
  let file = join(DIST, decodeURIComponent(path));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  return file.startsWith(`${DIST}/`) && existsSync(file) && statSync(file).isFile()
    ? file
    : undefined;
};

export const page = (path: string) => readFileSync(join(DIST, path), "utf8");

export function serveSite() {
  return Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      const { pathname } = new URL(request.url);
      const file = pathname.startsWith(BASE) ? fileOf(pathname.slice(BASE.length)) : undefined;
      return file ? new Response(Bun.file(file)) : new Response("Not found", { status: 404 });
    },
  });
}
