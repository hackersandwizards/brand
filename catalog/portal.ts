#!/usr/bin/env bun
// The brand portal: one page in the catalog shape every repository shares (scaffolding's
// renderCatalog and catalog.css, brand's header.css), whose search also lists every token, colour,
// logo, file and photo, and one view per area below the tiles (`pages`). It reads this repo's
// files only. Run as its own process by the catalog's routes (pages/index.html.ts,
// pages/catalog-assets/), so it reads the working tree afresh on each dev request; it prints the
// page and its assets as JSON and writes nothing.
// Usage: bun catalog/portal.ts
import { type CatalogGroup, renderCatalog } from "@hackersandwizards/scaffolding/catalog/render.ts";
import pkg from "../package.json";
import { applicationsGroup, renderApplications } from "./portal/applications";
import { PortalAssets } from "./portal/assets";
import { renderPortalDocument } from "./portal/document";
import { renderElements } from "./portal/elements";
import { logos } from "./portal/logos";
import { code, esc, table } from "./portal/markup";
import { pictures } from "./portal/pictures";
import { pressKit } from "./portal/press";
import { systemsGroup } from "./portal/systems";
import { tokenReference } from "./portal/token-reference";
import { words } from "./portal/words";

const assets = new PortalAssets();
const applications = renderApplications(assets);
const elements = renderElements(assets);

// A group named like a view anchors to it, so the rail opens the view itself; Pictures and motion
// and Systems link from their items.
const groups: CatalogGroup[] = [
  tokenReference.colours.group,
  tokenReference.type.group,
  tokenReference.tokens.group,
  logos.group,
  pictures.group,
  elements.group,
  applicationsGroup(assets),
  pressKit.group,
  words.group,
  systemsGroup,
];
const entries = groups.reduce((n, g) => n + g.items.length, 0);
const quick = `<div class="quick">
<div><h2 class="label">Quick start</h2>
<ul>
<li>Logo for a document or a screen: <a href="logos/lockup.svg" download>lockup.svg</a>, on night <a href="logos/lockup-night.svg" download>lockup-night.svg</a>, on Purple Love, Stargazer or the gradient <a href="logos/lockup-outline.svg" download>lockup-outline.svg</a>; for small spots <a href="logos/lockup-compact.svg" download>lockup-compact.svg</a>; in a header up to 40 px tall, on screen or in print, <a href="logos/lockup-screen.svg" download>lockup-screen.svg</a>. Which logo where: <a href="#logos">Logos</a>.</li>
<li>Print: textiles and stickers take the wordmark alone, the second sticker the wizard alone; the print files are under <a href="#applications/app-merch">Merch</a>, the booth files under <a href="#applications/app-booth">Booth banners</a>.</li>
<li>Slides: there is no template file. Decks come from the slide engine, <code>@hackersandwizards/slides</code>; its slide types are in its catalog, under <a href="#applications/app-slides">Slides</a>. Documents come from the document engine, <code>@hackersandwizards/documents</code>, under <a href="#applications/app-documents">Documents</a>.</li>
<li>Workshop kit for trainers: the lockup above, the night call background <a href="applications/backgrounds/call-background.png" download>call-background.png</a> (all backgrounds under <a href="#applications/app-backgrounds">Applications</a>), slides from the slide engine.</li>
<li>In code: <code>@import "@hackersandwizards/brand/tokens.css";</code>, the rest in <code>README.md</code>.</li>
</ul></div>
<div><h2 class="label">Refresh</h2>
${table(
  ["Source", "Refresh"],
  [
    ["Tokens", code("bun run tokens")],
    ["Logo cuts", code("bun scripts/outline.ts")],
    ["This page", code("bun run dev")],
  ],
)}</div>
</div>`;

const pages: [string, string, string][] = [
  ["colours", "Colours", tokenReference.colours.html],
  ["type", "Type", tokenReference.type.html],
  ["tokens", "Spacing, radius, shadow, layout", tokenReference.tokens.html],
  ["motion", "Motion", pictures.motionHtml],
  ["elements", "Elements", elements.html],
  ["logos", "Logos", logos.html],
  ["wizard", "The wizard", pictures.wizardHtml],
  ["photography", "Photography", pictures.photographyHtml],
  ["illustration", "Illustration", pictures.illustrationHtml],
  ["applications", "Applications: the brand in use", applications.html],
  ["pressekit", "Pressekit", pressKit.html],
  ["words", "Words: claim, mission, values", words.html],
];
const LEAD =
  "Everything the hackers&wizards brand is made of: tokens, logos, the files made from them and the press kit. Each system shows its components on its own design-system page.";
// The overview's mode goes in the markup: set first by show() at the end of the page, it would
// let the quick start appear above the tiles after they painted (CLS 0.41 on Lighthouse mobile).
const ROOT_DIV = 'class="hw-catalog hw-container"';
const rendered = renderCatalog({
  title: "hackers&wizards brand",
  lead: LEAD,
  provenance: `brand v${pkg.version} · tokens/tokens.css, manifest.json, applications/, press/ · ${entries} entries`,
  labels: { search: "Search  /" },
  groups,
  intro: `<div class="portal">${quick}<div id="results"></div><div class="portal-views">${pages.map(([id, title, body]) => `<section id="view-${id}" data-page="${id}" hidden><h2>${esc(title)}</h2>${body}</section>`).join("\n")}</div></div>`,
});
if (!rendered.includes(ROOT_DIV)) throw new Error(`renderCatalog wrote no ${ROOT_DIV}`);
const catalogPage = rendered.replace(ROOT_DIV, `${ROOT_DIV} data-mode="overview"`);

// The search index: what a reader types, where it leads.
const index = [
  ...tokenReference.index,
  ...logos.index,
  ...applications.index,
  ...pressKit.index,
  ...elements.index,
];
const html = renderPortalDocument(catalogPage, index, LEAD);
console.log(JSON.stringify({ html, assets: assets.files }));
