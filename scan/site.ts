import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const pathOf = (page: string) => {
  const path = URL.parse(page)?.pathname ?? page;
  try {
    return decodeURIComponent(path);
  } catch {
    return path; // a malformed escape, which a glob reads as written
  }
};

/** A page argument as a URL: a URL as it is, a path starting with / on the served site `site`, else
 * a file. */
export const toUrl = (arg: string, site?: URL) =>
  /^[a-z]+:\/\//.test(arg)
    ? arg
    : site && arg.startsWith("/")
      ? new URL(arg, site).href
      : pathToFileURL(resolve(arg)).href;

/** The file a path names inside `root`, a folder answering with its index.html, as a static host
 * does; undefined for none or for a path leaving `root`. */
export const fileIn = (root: string, path: string) => {
  let file: string;
  try {
    file = join(root, decodeURIComponent(path));
  } catch {
    return; // a malformed escape names no file
  }
  if (!file.startsWith(`${root}/`)) return;
  // A path running on past a file (ENOTDIR) or holding a NUL throws rather than naming no file.
  const stat = (f: string) => {
    try {
      return statSync(f, { throwIfNoEntry: false });
    } catch {
      return undefined;
    }
  };
  if (stat(file)?.isDirectory()) file = join(file, "index.html");
  return stat(file)?.isFile() ? file : undefined;
};

/** A built site folder served on a free local port at `at`, its root by default, or the base path
 * it was built for, such as /mail/: pages whose links start at / then load as published, and a
 * folder's path without its slash redirects to it, so relative links resolve as on Pages. */
export const serve = (dir: string, at = "/") => {
  const root = resolve(dir);
  if (!existsSync(root)) throw new Error(`no site folder ${root}; build it first`);
  // The request path arrives URL-encoded, so a base path such as /über/ is matched as URL parses it.
  const prefix = new URL(basePath(at), "http://localhost").pathname;
  return Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      const { pathname, search } = new URL(request.url);
      if (`${pathname}/` === prefix) return Response.redirect(`${prefix}${search}`, 301);
      const file = pathname.startsWith(prefix)
        ? fileIn(root, pathname.slice(prefix.length - 1))
        : undefined;
      if (
        file &&
        !pathname.endsWith("/") &&
        file.endsWith("/index.html") &&
        !pathname.endsWith(".html")
      )
        return Response.redirect(`${pathname}/${search}`, 301);
      return file ? new Response(Bun.file(file)) : new Response("Not found", { status: 404 });
    },
  });
};

export type MountedSite = { dir: string; at: string };
export type CatalogDirectory = { dir: string; at?: string; exclude?: string[] };

/** A base path with one slash at each end: "mail", "/mail" and "/mail/" are "/mail/". */
export const basePath = (at: string) => `/${at.replace(/^\/+|\/+$/g, "")}/`.replace("//", "/");

/** Validates exclusions and discovers built story states, skipping redirects. */
function storyStates(stories: string, exclude: string[]) {
  if (!Array.isArray(exclude))
    throw new Error(`"exclude" is a list of globs, not ${JSON.stringify(exclude)}`);
  const pages = existsSync(stories)
    ? readdirSync(stories, { recursive: true, encoding: "utf8" }).filter((f) =>
        f.endsWith("/index.html"),
      )
    : [];
  // A glob that leaves out nothing is a typo or a story group since gone: it fails.
  const skip = exclude.map((g) => {
    const glob = new Bun.Glob(g);
    if (!pages.some((f) => glob.match(f)))
      throw new Error(`exclude "${g}" matches no story under ${stories}`);
    return glob;
  });
  const states = pages
    .filter(
      (f) =>
        !skip.some((g) => g.match(f)) &&
        !/<meta[^>]+http-equiv=["']?refresh/i.test(readFileSync(join(stories, f), "utf8")),
    )
    .map((f) => `stories/${f.slice(0, -"index.html".length)}`)
    .sort();
  if (!states.length) throw new Error(`no story page under ${stories}; build the catalog first`);
  return states;
}

/** Every story state page of a built catalog folder `dir`, as scaffolding writes it
 * (stories/<group>/<story>/<state>/index.html), named below `at` the way a page is: a URL or a path
 * on the served site ends in the state's folder, URL-encoded, a file names its index.html. `at` defaults to the
 * folder's path on the served `site`, else the folder; `served` (a site or a --base server) makes a
 * path starting with / one on the server. A page forwarding elsewhere (a meta refresh,
 * as a catalog that is not the site's home leaves under its old path) is no story, nor is one an
 * `exclude` glob matches, relative to the stories folder (a story group the consumer does not own,
 * such as "Slides/**"). Throws on a folder without a story page and on a glob matching no story. */
export function catalogPages(catalog: CatalogDirectory, site?: MountedSite, base?: URL) {
  const { dir, at, exclude = [] } = catalog;
  const states = storyStates(join(dir, "stories"), exclude);
  const root = at ?? (site ? `${site.at}${relative(site.dir, dir)}` : dir);
  const served = site !== undefined || base !== undefined;
  const file = !/^[a-z]+:\/\//.test(root) && !(served && root.startsWith("/"));
  const encoded = (s: string) => s.split("/").map(encodeURIComponent).join("/");
  return states.map((s) => `${root.replace(/\/?$/, "/")}${file ? `${s}index.html` : encoded(s)}`);
}
