// The Pages workflow publishes dist/ at https://hackersandwizards.github.io/brand/, hence the base.
import { defineConfig } from "astro/config";
import { catalog } from "@hackersandwizards/scaffolding/catalog";
import { files } from "./files.ts";
import catalogs from "../expert/catalogs.json";

const own = (f: string) => new URL(`../${f}`, import.meta.url).pathname;

export default defineConfig({
  base: "/brand",
  srcDir: ".",
  devToolbar: { enabled: false },
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
      groupOrder: ["Elements"],
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
