#!/usr/bin/env bun
// Captures every system's design-system catalogue and the Company OS brand applications into
// captures/ for catalogue.html. Each repo's catalogue is served from its last build by its own
// preview server on a free port, photographed by one headless Chrome, and the server is stopped by
// PID; build a repo first for a fresh capture. captures/ is gitignored: the os and trainer-hub
// stories carry Company OS fixtures, and trainers read this repo.
// Usage: bun scripts/capture.ts (CHROME=<binary> to use another Chrome)
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import repos from "../repos.json";
import { head, isRepo, ROOT } from "./git";

const OUT = join(ROOT, "captures");
const WIDTH = 1000;
const MAX_HEIGHT = 3000;
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

type Astrobook = { kind: "astrobook"; stories: string; serve: (port: number) => string[] };
type Page = {
  kind: "page";
  path: string;
  source: string;
  select: string;
  serve: (port: number) => string[];
};
const astro = (port: number) => [
  "node_modules/.bin/astro",
  "preview",
  "--host",
  "127.0.0.1",
  "--port",
  String(port),
];
const SYSTEMS: Record<string, Astrobook | Page> = {
  website: { kind: "astrobook", stories: "dist/design-system/stories", serve: astro },
  os: { kind: "astrobook", stories: "dist/client/design-system/stories", serve: astro },
  "trainer-hub": { kind: "astrobook", stories: "dist/client/design-system/stories", serve: astro },
  talks: {
    kind: "page",
    path: "/design-system",
    source: "app/design-system/page.tsx",
    select: "section[id]",
    serve: (p) => [
      "node_modules/.bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(p),
    ],
  },
  "certificate-verifier": {
    kind: "page",
    path: "/design-system",
    source: "src/worker.ts, renderDesignSystemPage",
    select: "body",
    serve: (p) => ["node_modules/.bin/wrangler", "dev", "--ip", "127.0.0.1", "--port", String(p)],
  },
};
const OS = join(ROOT, repos.os.path);
const APPLICATIONS: [string, string, RegExp][] = [
  ["Design guide", "src/content/documents/company/design-guide", /\.(png|jpe?g|svg)$/],
  [
    "Merch mockups, study of 2026-10-29",
    "docs/tracking/2026-10-29-merch/mockups",
    /^(?!.*-crop\.).*\.jpg$/,
  ],
  ["Backgrounds, study of 2026-10-29", "docs/tracking/2026-10-29-backgrounds/previews", /\.jpg$/],
];

// What a Ctrl-C must stop: the detached server groups do not receive the terminal's SIGINT.
const cleanup = new Set<() => void>();

const freePort = () => {
  const s = Bun.serve({ port: 0, fetch: () => new Response() });
  const port = s.port!;
  s.stop(true);
  return port;
};
const until = async (ok: () => Promise<boolean>, ms: number) => {
  for (const end = Date.now() + ms; Date.now() < end; await Bun.sleep(500))
    if (await ok().catch(() => false)) return true;
  return false;
};

/** A minimal Chrome DevTools Protocol client on one page target. */
const browser = async () => {
  const port = freePort();
  const profile = mkdtempSync(join(tmpdir(), "brand-capture-"));
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let target: { type: string; webSocketDebuggerUrl: string } | undefined;
  await until(async () => {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    target = list.find((t: { type: string }) => t.type === "page");
    return !!target;
  }, 20000);
  if (!target) throw new Error(`no Chrome at ${CHROME}`);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  const pending = new Map<number, (m: { result?: unknown; error?: { message: string } }) => void>();
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    pending.get(m.id)?.(m);
  };
  let id = 0;
  const send = <T = Record<string, unknown>>(method: string, params = {}) =>
    new Promise<T>((res, rej) => {
      pending.set(++id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result as T)));
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async <T>(fn: string, ...args: unknown[]) =>
    (
      await send<{ result: { value: T } }>("Runtime.evaluate", {
        expression: `(${fn})(...${JSON.stringify(args)})`,
        awaitPromise: true,
        returnByValue: true,
      })
    ).result.value;
  const goto = async (url: string) => {
    await send("Page.navigate", { url });
    await until(
      async () => (await evaluate<string>("() => document.readyState")) === "complete",
      30000,
    );
    await evaluate("() => document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 300)))");
  };
  const shoot = async (
    file: string,
    clip: { x: number; y: number; width: number; height: number },
  ) => {
    const { data } = await send<{ data: string }>("Page.captureScreenshot", {
      format: "jpeg",
      quality: 65,
      captureBeyondViewport: true,
      clip: { ...clip, height: Math.min(Math.ceil(clip.height), MAX_HEIGHT), scale: 1 },
    });
    writeFileSync(file, Buffer.from(data, "base64"));
  };
  await send("Emulation.setDeviceMetricsOverride", {
    width: WIDTH,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const close = () => {
    ws.close();
    proc.kill();
    rmSync(profile, { recursive: true, force: true });
  };
  return { goto, evaluate, shoot, close };
};
type Browser = Awaited<ReturnType<typeof browser>>;

// Runs in the page: stacks every story of one component in iframes, each sized to its content.
const STACK = `async (stories) => {
  document.documentElement.innerHTML = '<head><style>body{margin:0;background:#fff}h3{margin:12px 8px 4px;font:600 12px ui-monospace,monospace;color:#666}iframe{display:block;width:100%;height:900px;border:0}</style></head><body></body>';
  await Promise.all(stories.map(([name, url]) => new Promise((r) => {
    const h = document.createElement("h3"), f = document.createElement("iframe");
    h.textContent = name; f.src = url; f.onload = r; setTimeout(r, 15000);
    document.body.append(h, f);
  })));
  for (const f of document.querySelectorAll("iframe")) {
    await f.contentDocument?.fonts.ready;
    const d = f.contentDocument;
    if (!d?.body) continue;
    // Content ends at the last leaf with something to show; a min-height wrapper is no content.
    const leaves = [...d.body.querySelectorAll("*")].filter((e) => !e.children.length || /^(svg|IMG|BUTTON|SELECT|CANVAS|VIDEO)$/.test(e.tagName));
    const bottom = Math.max(0, ...leaves.map((e) => e.getBoundingClientRect().bottom)) + 24;
    f.style.height = Math.min(Math.ceil(bottom), 900) + "px";
  }
  await new Promise((r) => setTimeout(r, 300));
  return document.body.getBoundingClientRect().bottom;
}`;

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** The story file and the component it imports, for a story slug, relative to the repo. */
const sources = (repo: string, group: string) => {
  const dir = join(repo, "src/stories", group);
  const map: Record<string, string> = {};
  for (const f of existsSync(dir) ? readdirSync(dir) : []) {
    const m = f.match(/^(.+)\.stories\.tsx?$/);
    if (!m) continue;
    const imp = readFileSync(join(dir, f), "utf8").match(
      /^import \w+ from "(\.[^"]+\.(?:astro|tsx))"/m,
    )?.[1];
    map[kebab(m[1])] = imp ? relative(repo, resolve(dir, imp)) : relative(repo, join(dir, f));
  }
  return map;
};

const captureAstrobook = async (
  b: Browser,
  origin: string,
  repo: string,
  sys: Astrobook,
  out: string,
) => {
  const root = join(repo, sys.stories);
  // A story is a folder holding index.html, its parent the component, the path above that the
  // group: "Slides/Slide types" nests one level deeper than "People".
  const byComponent = new Map<string, string[]>();
  for (const f of (readdirSync(root, { recursive: true }) as string[]).sort()) {
    if (basename(f) !== "index.html") continue;
    const comp = dirname(dirname(f));
    byComponent.set(comp, [...(byComponent.get(comp) ?? []), basename(dirname(f))]);
  }
  const items = [];
  for (const [path, names] of byComponent) {
    const group = dirname(path);
    const comp = basename(path);
    const src = sources(repo, group);
    const stories = names.map((s) => [
      s,
      `${origin}/design-system/stories/${path.split("/").map(encodeURIComponent).join("/")}/${s}/`,
    ]);
    const file = `${kebab(group).replace(/\W+/g, "-")}--${comp}.jpg`;
    await b.goto(`${origin}/design-system/`);
    const height = await b.evaluate<number>(STACK, stories);
    await b.shoot(join(out, file), { x: 0, y: 0, width: WIDTH, height });
    items.push({
      group,
      name: comp,
      file,
      source: src[comp] ?? `src/stories/${group}`,
      states: stories.length,
    });
  }
  return items;
};

const capturePage = async (b: Browser, origin: string, sys: Page, out: string) => {
  await b.goto(origin + sys.path);
  // A lazy iframe outside the viewport never loads, and a screenshot does not scroll.
  await b.evaluate(`() => Promise.all([...document.querySelectorAll("iframe[loading=lazy]")].map((f) => new Promise((r) => {
    f.onload = r; setTimeout(r, 15000); f.loading = "eager";
  }))).then(() => new Promise((r) => setTimeout(r, 1500)))`);
  const boxes = await b.evaluate<
    { id: string; x: number; y: number; width: number; height: number }[]
  >(
    `(sel) => [...document.querySelectorAll(sel)].map((e, i) => { const r = e.getBoundingClientRect(); return { id: e.id || "page-" + i, x: r.x, y: r.y + scrollY, width: r.width, height: Math.max(r.height, e.scrollHeight) }; })`,
    sys.select,
  );
  const items = [];
  // A section taller than one capture continues in the next, numbered.
  for (const box of boxes)
    for (let y = 0, part = 1; y < box.height; y += MAX_HEIGHT, part++) {
      const name = box.height > MAX_HEIGHT ? `${box.id}-${part}` : box.id;
      const file = `${name}.jpg`;
      await b.shoot(join(out, file), {
        ...box,
        y: box.y + y,
        height: Math.min(MAX_HEIGHT, box.height - y),
      });
      items.push({ group: "", name, file, source: sys.source, states: 1 });
    }
  return items;
};

const captureSystem = async (b: Browser, name: string, sys: Astrobook | Page) => {
  const repo = join(ROOT, repos[name as keyof typeof repos].path);
  if (!isRepo(repo)) return { name, error: "no checkout next to this repo" };
  const built =
    sys.kind === "astrobook"
      ? join(repo, sys.stories)
      : name === "talks"
        ? join(repo, ".next/BUILD_ID")
        : join(repo, "src");
  if (!existsSync(built))
    return { name, error: `no build output at ${relative(repo, built)}: build the repo first` };
  const port = freePort();
  const [cmd, ...args] = sys.serve(port);
  const proc = spawn(join(repo, cmd), args, { cwd: repo, stdio: "ignore", detached: true });
  // The bin hands off to a node process outside its group, so stop whatever listens on the port,
  // with its process group (wrangler's workerd), then the launch's own group.
  const stop = () => {
    const pids = spawnSync("lsof", ["-t", `-iTCP:${port}`, "-sTCP:LISTEN"])
      .stdout.toString()
      .split("\n")
      .filter(Boolean)
      .map(Number);
    for (const pid of [...pids, proc.pid!])
      try {
        process.kill(-pid);
      } catch {
        try {
          process.kill(pid);
        } catch {
          // already gone
        }
      }
  };
  cleanup.add(stop);
  const origin = `http://127.0.0.1:${port}`;
  const out = join(OUT, name);
  try {
    if (
      !(await until(
        async () =>
          (await fetch(origin + "/design-system" + (sys.kind === "astrobook" ? "/" : ""))).ok,
        90000,
      ))
    )
      return { name, error: `the server (${cmd} ${args[0]}) answered no catalogue within 90 s` };
    mkdirSync(out, { recursive: true });
    const items =
      sys.kind === "astrobook"
        ? await captureAstrobook(b, origin, repo, sys, out)
        : await capturePage(b, origin, sys, out);
    return {
      name,
      commit: head(repo).slice(0, 9),
      built: statSync(built).mtime.toISOString(),
      items,
    };
  } catch (e) {
    return { name, error: String(e) };
  } finally {
    cleanup.delete(stop);
    stop();
    console.log(`${name}: server group ${proc.pid} stopped`);
  }
};

const thumbnails = () =>
  APPLICATIONS.map(([title, dir, match]) => {
    const out = join(OUT, "applications", basename(dir));
    mkdirSync(out, { recursive: true });
    const files = (readdirSync(join(OS, dir), { recursive: true }) as string[])
      .filter((f) => match.test(f))
      .sort();
    return {
      title,
      dir,
      items: files.map((f) => {
        const file = join(out, f.replace(/\//g, "--").replace(/\.(png|jpe?g)$/, ".jpg"));
        mkdirSync(dirname(file), { recursive: true });
        if (extname(f) === ".svg") writeFileSync(file, readFileSync(join(OS, dir, f)));
        else
          spawnSync(
            "sips",
            [
              "-s",
              "format",
              "jpeg",
              "-s",
              "formatOptions",
              "70",
              "-Z",
              "800",
              join(OS, dir, f),
              "--out",
              file,
            ],
            { stdio: "ignore" },
          );
        return { name: f, file: relative(OUT, file), source: join(dir, f) };
      }),
    };
  });

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
const b = await browser();
cleanup.add(b.close);
process.once("SIGINT", () => {
  for (const f of cleanup) f();
  process.exit(130);
});
const systems = [];
try {
  for (const [name, sys] of Object.entries(SYSTEMS)) {
    systems.push(await captureSystem(b, name, sys));
    console.log(name, systems.at(-1)!.error ?? `${systems.at(-1)!.items!.length} captures`);
  }
} finally {
  b.close();
}
writeFileSync(
  join(OUT, "index.json"),
  JSON.stringify({ date: new Date().toISOString(), systems, applications: thumbnails() }, null, 2) +
    "\n",
);
console.log("wrote captures/index.json");
