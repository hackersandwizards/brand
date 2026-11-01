import { afterAll, beforeAll, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { getViteConfig } from "astro/config";
import { createServer, type ViteDevServer } from "vite";
import { ROOT } from "../scripts/git";

// Every expert component renders standalone, through Astro's compiler, from this repository alone:
// an import of an app's internals fails here. Placeholder props, no figure or term of ours.
const components = ["expert/components"].flatMap((dir) =>
  readdirSync(join(ROOT, dir))
    .filter((f) => f.endsWith(".astro"))
    .map((f) => `${dir}/${f.replace(/\.astro$/, "")}`),
);
const nameOf = (path: string) => path.slice(path.lastIndexOf("/") + 1);

const P = "[PLACEHOLDER]";
const node = { href: "/space/page", label: P, order: 0, hasPage: true, children: [] };
const props: Record<string, Record<string, unknown>> = {
  AppHeader: { product: P },
  FilterChip: { label: P, removeHref: "/" },
  FilterChipBar: { show: true, clearHref: "/" },
  PageHeader: { title: P },
  Pill: { label: P },
  SpaceNav: { label: P, base: "/space", nodes: [node], currentPath: "/space", pageCount: 1 },
  SpaceNavTree: { nodes: [node], currentPath: "/space" },
  ThemeToggle: {},
};

let server: ViteDevServer;
beforeAll(async () => {
  const config = await getViteConfig(
    {
      root: ROOT,
      cacheDir: join(ROOT, "node_modules/.vite-test"),
      appType: "custom",
      logLevel: "error",
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: [] },
    },
    { root: ROOT, configFile: false, logLevel: "silent", devToolbar: { enabled: false } },
  )({ command: "serve", mode: "development" });
  server = await createServer({ ...config, configFile: false });
});
afterAll(() => server?.close());

test("every component has placeholder props here", () => {
  expect(components.map(nameOf).sort()).toEqual(Object.keys(props).sort());
});

test.each(components)(
  "%s renders standalone",
  async (path) => {
    const name = nameOf(path);
    const { experimental_AstroContainer } = await server.ssrLoadModule("astro/container");
    const component = (await server.ssrLoadModule(`/${path}.astro`)).default;
    const container = await experimental_AstroContainer.create();
    const html: string = await container.renderToString(component, {
      props: props[name],
      slots: { default: `<p>${P}</p>`, aside: `<p>${P}</p>` },
    });
    expect(html).toContain(name === "ThemeToggle" ? 'id="theme-toggle"' : P);
  },
  30_000,
);

test("SpaceNav takes its words from labels, English by default", async () => {
  const { experimental_AstroContainer } = await server.ssrLoadModule("astro/container");
  const component = (await server.ssrLoadModule("/expert/components/SpaceNav.astro")).default;
  const container = await experimental_AstroContainer.create();
  const branch = { ...node, href: "/space/branch", children: [node] };
  const render = (labels?: Record<string, unknown>) =>
    container.renderToString(component, {
      props: { ...props.SpaceNav, nodes: [branch], pageCount: 2, labels },
    });
  const english: string = await render();
  for (const text of ["Browse " + P, "2 pages", P + " home", "Overview", P + " sections"])
    expect(english).toContain(text);
  const german: string = await render({
    sections: "Bereiche",
    browse: "Durchblättern",
    pages: (n: number) => `${n} Seiten`,
    home: "Startseite",
    overview: "Übersicht",
  });
  for (const text of [
    "Durchblättern",
    "2 Seiten",
    "Startseite",
    "Übersicht",
    'aria-label="Bereiche"',
  ])
    expect(german).toContain(text);
  for (const text of ["Browse", "pages", "home", "Overview", "sections"])
    expect(german).not.toContain(text);
}, 30_000);
