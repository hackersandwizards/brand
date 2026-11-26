import { limit } from "@hackersandwizards/scaffolding/test-timeout";
import { afterAll, beforeAll, expect, test } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { getViteConfig } from "astro/config";
import { experimental_AstroContainer } from "astro/container";
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
const fixtures = {
  AppHeader: { props: { product: P }, marker: P },
  FilterChip: { props: { label: P, removeHref: "/" }, marker: P },
  FilterChipBar: { props: { show: true, clearHref: "/" }, marker: P },
  ListFilter: {
    props: {
      id: "f",
      action: "/",
      label: P,
      items: [],
      state: { q: "", facets: {} },
      facets: [{ param: "t", legend: P, options: [] }],
      count: "{shown}",
    },
    marker: P,
  },
  ListRow: { props: { stripeColor: "bg-teal" }, marker: P },
  PageHeader: { props: { title: P }, marker: P },
  Pill: { props: { label: P }, marker: P },
  SpaceNav: {
    props: { label: P, base: "/space", nodes: [node], currentPath: "/space", pageCount: 1 },
    marker: P,
  },
  SpaceNavTree: { props: { nodes: [node], currentPath: "/space" }, marker: P },
  ThemeToggle: { props: {}, marker: 'id="theme-toggle"' },
} satisfies Record<string, { props: Record<string, unknown>; marker: string }>;

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

type Component = Parameters<experimental_AstroContainer["renderToString"]>[0];
const isAstroFactory = (value: unknown): value is Component =>
  typeof value === "function" &&
  "isAstroComponentFactory" in value &&
  value.isAstroComponentFactory === true;

async function loadComponent(path: string) {
  const module: Record<string, unknown> = await server.ssrLoadModule(path);
  const component = module.default;
  if (!isAstroFactory(component)) throw new Error(`${path}: expected an Astro component`);
  return component;
}

test("every component has placeholder props here", () => {
  expect(components.map(nameOf).sort()).toEqual(Object.keys(fixtures).sort());
});

test.each(Object.entries(fixtures).map(([name, fixture]) => ({ name, ...fixture })))(
  "$name renders standalone",
  async ({ name, props, marker }) => {
    const component = await loadComponent(`/expert/components/${name}.astro`);
    const container = await experimental_AstroContainer.create();
    const html: string = await container.renderToString(component, {
      props,
      slots: { default: `<p>${P}</p>`, aside: `<p>${P}</p>`, lead: `<p>${P}</p>` },
    });
    expect(html).toContain(marker);
  },
  limit(30_000),
);

test("SpaceNav's home link takes hw-nav's weight: no weight class on its list", async () => {
  const component = await loadComponent("/expert/components/SpaceNav.astro");
  const container = await experimental_AstroContainer.create();
  const html: string = await container.renderToString(component, {
    props: fixtures.SpaceNav.props,
  });
  const beforeHome = html.slice(0, html.indexOf(`>${P} home<`));
  expect(html).toContain(`>${P} home<`);
  expect(beforeHome.slice(beforeHome.lastIndexOf("<ul"))).not.toMatch(/\bfont-/);
});

test("SpaceNavTree wraps the root and renders bare items directly in the branch list", async () => {
  const component = await loadComponent("/expert/components/SpaceNavTree.astro");
  const container = await experimental_AstroContainer.create();
  const child = { ...node, href: "/space/branch/page" };
  const branch = { ...node, href: "/space/branch", label: "Branch", children: [child] };
  const render = async (bare: boolean) =>
    (
      await container.renderToString(component, {
        props: { nodes: [branch], currentPath: child.href, overview: "Start", bare },
      })
    ).replace(/\s*(<[^>]+>)\s*/g, "$1");

  const items =
    '<li><details class="hw-disclosure" open><summary>Branch</summary><ul>' +
    '<li><a href="/space/branch">Start</a></li>' +
    `<li><a href="/space/branch/page" aria-current="page">${P}</a></li></ul></details></li>`;
  expect(await render(false)).toBe(`<ul>${items}</ul>`);
  expect(await render(true)).toBe(items);
});

test(
  "SpaceNav takes its words from labels, English by default",
  async () => {
    const component = await loadComponent("/expert/components/SpaceNav.astro");
    const container = await experimental_AstroContainer.create();
    const branch = { ...node, href: "/space/branch", children: [node] };
    const render = (labels?: Record<string, unknown>) =>
      container.renderToString(component, {
        props: { ...fixtures.SpaceNav.props, nodes: [branch], pageCount: 2, labels },
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
  },
  limit(30_000),
);

test(
  "ListFilter's Filters button names the chosen values the server renders",
  async () => {
    const component = await loadComponent("/expert/components/ListFilter.astro");
    const container = await experimental_AstroContainer.create();
    const facets = [{ param: "t", legend: P, options: [{ value: "a", label: "Alpha" }] }];
    const render = (t: string) =>
      container.renderToString(component, {
        props: { ...fixtures.ListFilter.props, facets, state: { q: "", facets: { t } } },
      });
    const chosen: string = await render("a");
    expect(chosen).toContain('aria-label="Filters: Alpha"');
    expect(chosen).toMatch(/data-filter-label[^>]*>Alpha</);
    // Control: nothing chosen, the button says Filters.
    expect(await render("")).toMatch(/data-filter-label[^>]*>Filters</);
  },
  limit(30_000),
);

test(
  "Pill takes the hue table's night tone: ampersand's light tone, teal's night tone",
  async () => {
    const component = await loadComponent("/expert/components/Pill.astro");
    const container = await experimental_AstroContainer.create();
    const night = async (color: string) =>
      /--hw-pill-hue-night: ([^"]*)/.exec(
        await container.renderToString(component, { props: { ...fixtures.Pill.props, color } }),
      )?.[1];
    expect(await night("bg-ampersand/15")).toContain("var(--color-ampersand-light,");
    expect(await night("bg-teal/15")).toContain("var(--color-teal-night,");
  },
  limit(30_000),
);

test(
  "Pill gives the warning role the warning tone, every other hue its wash",
  async () => {
    const component = await loadComponent("/expert/components/Pill.astro");
    const container = await experimental_AstroContainer.create();
    const render = (color: string) =>
      container.renderToString(component, { props: { ...fixtures.Pill.props, color } });
    for (const color of ["bg-warning/15 text-warning", "text-warning"]) {
      const html = await render(color);
      expect(html).toContain('data-tone="warning"');
      expect(html).not.toContain("--hw-pill-hue");
    }
    // Control: the error role keeps its hue.
    expect(await render("bg-error/15 text-error")).toContain("--hw-pill-hue: var(--error,");
  },
  limit(30_000),
);
