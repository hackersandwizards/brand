#!/usr/bin/env bun
// Turns every system's design-system catalogue, from its last build, into pages that open from
// disk: each story keeps its own markup and its own app's CSS, with fonts and images copied beside
// it and scripts dropped, so catalogue.html can embed the real component instead of a picture.
// Writes captures/live/<system>/ and captures/live/index.json. Reads build output only, never
// writes to another repo; captures/ is gitignored because the os and trainer-hub stories carry
// Company OS fixtures. Usage: bun scripts/live.ts
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, dirname, join, posix, relative } from "node:path";
import repos from "../repos.json";
import { head, isRepo, ROOT, sha256 } from "./git";

const OUT = join(ROOT, "captures/live");

/** Where a system's pages come from and where an absolute URL path resolves on disk. */
type Source = {
  pages: (repo: string) => { group: string; name: string; story: string; html: string }[];
  resolve: (repo: string, path: string) => string | undefined;
  built: string;
};

const first = (...paths: string[]) => paths.find((p) => existsSync(p) && statSync(p).isFile());

const astrobook = (dist: string): Source => ({
  built: join(dist, "design-system/stories"),
  resolve: (repo, p) => first(join(repo, dist, p)),
  pages: (repo) => {
    const root = join(repo, dist, "design-system/stories");
    return (readdirSync(root, { recursive: true }) as string[])
      .filter((f) => basename(f) === "index.html")
      .sort()
      .map((f) => {
        const comp = dirname(dirname(f));
        return {
          group: dirname(comp) === "." ? "" : dirname(comp),
          name: basename(comp),
          story: basename(dirname(f)),
          html: readFileSync(join(root, f), "utf8"),
        };
      });
  },
});

/** One page per top-level section: every other section of the same selector is removed. */
const split = async (html: string, select: string) => {
  const ids = [
    ...html.matchAll(
      new RegExp(`<section[^>]*class="${select}"[^>]*id="([^"]+)"|<section id="([^"]+)"`, "g"),
    ),
  ].map((m) => m[1] ?? m[2]);
  return Promise.all(
    ids.map(async (id) => ({
      id,
      html: await new HTMLRewriter()
        .on(select ? `section.${select}` : "section[id]", {
          element: (el) => {
            if (el.getAttribute("id") !== id) el.remove();
          },
        })
        .transform(new Response(html))
        .text(),
    })),
  );
};

const SOURCES: Record<string, Source> = {
  website: astrobook("dist"),
  os: astrobook("dist/client"),
  "trainer-hub": astrobook("dist/client"),
  talks: {
    built: ".next/server/app/design-system.html",
    resolve: (repo, p) =>
      p.startsWith("/_next/")
        ? first(join(repo, ".next", p.slice("/_next".length)))
        : first(join(repo, "public", p)),
    pages: () => [],
  },
  "certificate-verifier": {
    built: "src/worker.ts",
    resolve: (repo, p) => first(join(repo, "public", p)),
    pages: () => [],
  },
};

// Section pages for the two systems that render one long page.
const sectionPages = async (name: string, repo: string) => {
  if (name === "talks") {
    const html = readFileSync(join(repo, SOURCES.talks.built), "utf8");
    return (await split(html, "")).map((s) => ({
      group: "",
      name: s.id,
      story: s.id,
      html: s.html,
    }));
  }
  const { renderDesignSystemPage } = await import(join(repo, "src/worker.ts"));
  return (await split(renderDesignSystemPage(), "ds-section")).map((s) => ({
    group: "",
    name: s.id,
    story: s.id,
    html: s.html,
  }));
};

// Sizes the frame to its content: the last leaf with something to show, since story wrappers
// stretch to the viewport.
const POSTER = `<script>(()=>{const p=()=>{const l=[...document.body.querySelectorAll("*")].filter((e)=>!e.children.length||/^(svg|IMG|BUTTON|SELECT|CANVAS|VIDEO)$/.test(e.tagName));parent.postMessage({liveHeight:Math.ceil(Math.max(0,...l.map((e)=>e.getBoundingClientRect().bottom+scrollY)))+48},"*")};addEventListener("load",p);document.fonts.ready.then(p)})()</script>`;

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const fileSlug = (s: string) =>
  kebab(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Colour tokens a system's CSS declares, first declaration wins. */
const colourTokens = (css: string) => {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/(--color-[\w-]+)\s*:\s*([^;}]+)/g)) out[m[1]] ??= m[2].trim();
  return out;
};

const snapshot = (
  name: string,
  repo: string,
  src: Source,
  html: string,
  out: string,
  seenCss: string[],
) => {
  const files = join(out, "_files");
  const local = (p: string) => {
    const clean = decodeURI(p.split(/[?#]/)[0]);
    const file = src.resolve(repo, clean);
    if (!file) return undefined;
    const target = join(files, clean);
    if (!existsSync(target)) {
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(file, target);
    }
    return relative(out, target);
  };
  // A relative url() in a linked sheet resolves against the sheet's own path.
  const urls = (css: string, base = "/") =>
    css.replace(/url\((["']?)(?!data:|https?:|#)([^)"']+)\1\)/g, (m, q, p) => {
      const l = local(posix.resolve(base, p));
      return l ? `url(${q}${l}${q})` : m;
    });
  let page = html
    .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    // A motion library's start state waits for a script that no longer runs.
    .replace(/ style="opacity:0;[^"]*"/g, "")
    .replace(/<link[^>]*rel="(preload|modulepreload|icon|apple-touch-icon|prefetch)"[^>]*>/g, "")
    .replace(
      /<link[^>]*rel="stylesheet"[^>]*href="(\/[^"]+)"[^>]*>|<link[^>]*href="(\/[^"]+)"[^>]*rel="stylesheet"[^>]*>/g,
      (m, a, b) => {
        const file = src.resolve(repo, (a ?? b).split("?")[0]);
        if (!file) return m;
        const css = readFileSync(file, "utf8");
        seenCss.push(css);
        const sheet = `_css-${sha256(Buffer.from(css)).slice(0, 12)}.css`;
        if (!existsSync(join(out, sheet)))
          writeFileSync(join(out, sheet), urls(css, posix.dirname(a ?? b)));
        return `<link rel="stylesheet" href="${sheet}">`;
      },
    );
  for (const m of page.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) seenCss.push(m[1]);
  page = urls(page).replace(/\b(src|href)="(\/[^"]*)"/g, (m, attr, p) => {
    const l = local(p);
    return l ? `${attr}="${l}"` : attr === "href" ? `href="#"` : m;
  });
  return page.replace("</body>", `${POSTER}</body>`);
};

rmSync(OUT, { recursive: true, force: true });
const systems = [];
for (const [name, src] of Object.entries(SOURCES)) {
  const repo = join(ROOT, repos[name as keyof typeof repos].path);
  if (!isRepo(repo) || !existsSync(join(repo, src.built))) {
    systems.push({ name, error: `no build output at ${src.built}: build the repo first` });
    console.log(name, "skipped: no build output");
    continue;
  }
  const out = join(OUT, name);
  mkdirSync(out, { recursive: true });
  const listed = src.pages(repo);
  const pages = listed.length ? listed : await sectionPages(name, repo);
  const css: string[] = [];
  const stories = pages.map((p) => {
    const file = `${fileSlug([p.group, p.name, p.story].filter(Boolean).join("-"))}.html`;
    writeFileSync(join(out, file), snapshot(name, repo, src, p.html, out, css));
    return { group: p.group, name: p.name, story: p.story, file: `${name}/${file}` };
  });
  // A build older than the repo's last commit shows an old state: say so here, where it can be
  // rebuilt, not on the page. A tracked `built` is source rendered on each run, never stale.
  const built = statSync(join(repo, src.built)).mtime;
  const git = (...a: string[]) => spawnSync("git", ["-C", repo, ...a]);
  if (
    git("ls-files", "--error-unmatch", src.built).status !== 0 &&
    Number(git("log", "-1", "--format=%ct").stdout.toString()) * 1000 > built.getTime()
  )
    console.warn(`${name}: the build predates the last commit; rebuild it, then run bun run live`);
  systems.push({
    name,
    commit: head(repo).slice(0, 9),
    built: built.toISOString(),
    stories,
    colours: colourTokens(css.join("\n")),
  });
  console.log(name, `${stories.length} pages`);
}
writeFileSync(
  join(OUT, "index.json"),
  JSON.stringify({ date: new Date().toISOString(), systems }, null, 2) + "\n",
);
console.log("wrote captures/live/index.json");
