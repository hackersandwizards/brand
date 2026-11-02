// The brand catalog (repo-uniformity-plan, hub-max): one Astro app in scaffolding's catalog shell.
// The element stories sit in catalog/stories at /catalog/; the file catalogue, the brand portal
// that reads this repository's files (pages/index.html.ts), is the site's root, the tracked files
// it links beside it. `bun run build` writes dist/, which the Pages workflow publishes at
// https://hackersandwizards.github.io/brand/, hence the base.
import { defineConfig } from "astro/config";
import { catalog } from "@hackersandwizards/scaffolding/catalog";
import { files } from "./files.ts";

const own = (f: string) => new URL(`../${f}`, import.meta.url).pathname;

export default defineConfig({
  base: "/brand",
  srcDir: ".",
  devToolbar: { enabled: false },
  server: { host: "127.0.0.1", port: 4326 },
  integrations: [
    catalog({
      product: "Brand",
      lead: "Every shared element (elements/*.css) at the four scales and on night. Colours, type, tokens, logos, the files made from them and the press kit are in the brand portal.",
      css: [
        own("generated/tokens.root.css"),
        own("tokens/marker.css"),
        own("elements/elements.css"),
      ],
      groupOrder: ["Elements"],
      home: "./Home.astro",
      header: {
        component: "../expert/components/AppHeader.astro",
        css: [own("expert/header.css")],
      },
    }),
    files(),
  ],
});
