// The Pages workflow publishes dist/ at https://hackersandwizards.github.io/brand/, hence the base.
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { catalog } from "@hackersandwizards/scaffolding/catalog";
import { files } from "./files.ts";
import catalogs from "../expert/catalogs.json";
import { SECTIONS } from "./element-demos";

const own = (f: string) => fileURLToPath(new URL(`../${f}`, import.meta.url));

export default defineConfig({
  base: "/brand",
  srcDir: ".",
  devToolbar: { enabled: false },
  // Compiles the expert stories' stylesheet (expert.css), the only one with Tailwind directives.
  vite: { plugins: [tailwindcss()] },
  server: { host: "127.0.0.1", port: 4326 },
  integrations: [
    catalog({
      product: "Brand",
      lead: "Every shared element (elements/*.css) at the four scales and on night.",
      css: [
        own("generated/tokens.root.css"),
        own("tokens/marker.css"),
        own("elements/elements.css"),
      ],
      groupOrder: SECTIONS.map(([section]) => section),
      home: "./Home.astro",
      nav: {
        items: [
          { name: "Brand", href: "/" },
          { name: "Catalog", href: "/catalog/" },
          ...catalogs.filter((c) => c.name !== "Brand"),
        ],
        current: "Catalog",
      },
      head: "./Head.astro",
      header: {
        component: "../expert/components/AppHeader.astro",
        css: [own("expert/header.css")],
      },
    }),
    files(),
  ],
});
