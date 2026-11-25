import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileIn } from "../../scan/site";
import { ROOT } from "../../scripts/git";

export const DIST = join(ROOT, "dist");
export const BASE = "/brand/";
if (!existsSync(join(DIST, "index.html")))
  throw new Error("dist/index.html missing: run `bun run build` before these tests");

/** The file a site path names, or undefined: a folder serves its index.html, as Pages does. */
export const fileOf = (path: string) => fileIn(DIST, `/${path}`);

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
export function contrastMessageKey(data: unknown) {
  if (
    data &&
    typeof data === "object" &&
    "messageKey" in data &&
    typeof data.messageKey === "string"
  )
    return data.messageKey;
}
