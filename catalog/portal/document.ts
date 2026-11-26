import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { brandFallbacks } from "@hackersandwizards/scaffolding/catalog/fallbacks.ts";
import { inlineImports } from "../../applications/linkedin-visuals/render";
import catalogs from "../../expert/catalogs.json";
import { MOON, SUN } from "../../expert/components/theme-icons";
import { tokens as brandTokens } from "../../generated/tokens";
import { ROOT } from "../../scripts/git";
import { elementsCss } from "./assets";
import { elementScripts } from "./elements";
import { esc } from "./markup";
import { pageStyles } from "./page-styles";
import { type PortalSearchEntry, searchScript } from "./search";
import { systemLinksScript } from "./systems";

// The shell's type steps are var()s of brand's tokens, which the catalog build fills in; this page
// reads the file raw, so it fills them the same way.
const catalogCss = brandFallbacks(
  readFileSync(
    createRequire(import.meta.url).resolve("@hackersandwizards/scaffolding/catalog/catalog.css"),
    "utf8",
  ),
  brandTokens,
);

// The head's stylesheets are inline, so the first paint waits on no request: without their
// comments, whose sample markup would read as the page's own, each url() made relative to the
// page. The faces the first screen sets are preloaded: found only once print.css is parsed, their
// swap shifts the page (CLS 0.15 on desktop).
const inline = (css: string, from = ".") =>
  css
    .replace(/\/\*[^]*?\*\//g, "")
    .replace(
      /url\((["']?)(?!data:|https?:|\/)([^"')]+)\1\)/g,
      (_, _q: string, url: string) => `url("${join(from, url)}")`,
    );
const ownCss = (path: string) =>
  inlineImports(join(ROOT, path), (css, dir) => inline(css, relative(ROOT, dir)));
const FONTS = [
  "inter-latin-400-normal",
  "inter-latin-500-normal",
  "inter-latin-600-normal",
  "jetbrains-mono-latin-400-normal",
  "jetbrains-mono-latin-500-normal",
  "jetbrains-mono-latin-700-normal",
];

// The header's theme switch is brand's ThemeToggle: its markup with the icon paths filled in, and its
// script, which flips html's data-theme and stores the choice under "theme". The head reads that
// choice before the first paint, else the system's theme, as every h&w app does.
const toggle = readFileSync(join(ROOT, "expert/components/ThemeToggle.astro"), "utf8").match(
  /^---[^]*?---\s*(<button[^]*?<\/button>)\s*<script>([^]*?)<\/script>/,
);
if (!toggle) throw new Error("portal: ThemeToggle.astro is no longer a button and a script");
const [, toggleButton, toggleSource] = toggle;
const themeToggle = toggleButton.replace(
  /\{(SUN|MOON)\}/g,
  (_, k: string) => `"${k === "SUN" ? SUN : MOON}"`,
);
const themeScript = new Bun.Transpiler({ loader: "ts" }).transformSync(toggleSource);

const header = `<header class="hw-header">
<div class="hw-header-strip"></div>
<div class="hw-header-row hw-container">
<a class="hw-header-brand" href="#overview" aria-label="hackers&amp;wizards Brand"><img class="hw-header-logo" src="logos/lockup-screen.svg" alt="" width="8042" height="1489"><img class="hw-header-logo-night" src="logos/lockup-screen-night.svg" alt="" width="8196" height="1641" loading="lazy"><span class="hw-header-product">Brand</span></a>
<nav class="hw-header-nav" aria-label="Main" data-hw-catalogs>
${catalogs
  .flatMap((c) =>
    c.name === "Brand"
      ? [
          '<a class="hw-header-link" href="#overview" aria-current="page">Brand</a>',
          '<a class="hw-header-link" href="catalog/">Catalog</a>',
        ]
      : [`<a class="hw-header-link" href="${esc(c.href)}">${esc(c.name)}</a>`],
  )
  .join("\n")}
${themeToggle}
</nav>
</div>
</header>`;

// Assembles the document, the shared header, and the portal's inline scripts and styles.
export const renderPortalDocument = (
  catalogPage: string,
  index: PortalSearchEntry[],
  lead: string,
) =>
  `<!doctype html>
<html lang="en" data-hw-night>
<head>
<meta charset="utf-8">
<script>
{
  let theme;
  try {
    theme = localStorage.getItem("theme");
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") throw error;
    // Blocked storage leaves the system colour scheme in effect.
    theme = null;
  }
  if (theme === "dark" || (theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches)) document.documentElement.dataset.theme = "dark";
}
</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>hackers&amp;wizards brand</title>
<meta name="description" content="${esc(lead)}">
<link rel="icon" href="logos/favicon.ico" sizes="32x32">
<link rel="icon" href="logos/favicon.svg" type="image/svg+xml">
${FONTS.map((f) => `<link rel="preload" href="tokens/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join("\n")}
<style>${["generated/tokens.root.css", "tokens/night.css", "tokens/print.css", "tokens/marker.css", "expert/header.css"].map(ownCss).join("\n")}
${inline(elementsCss)}
${inline(catalogCss)}</style>
${pageStyles}
</head>
<body class="hw-focus-ring">
${header}
<main>
${catalogPage}
</main>
<script>
${themeScript}
</script>
${searchScript(index)}
${elementScripts}
${systemLinksScript}
</body>
</html>
`;
