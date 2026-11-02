// The catalogue shape every h&w design system shares (decision catalogue-shape, 2026-11-02): a left
// rail with search and the groups with their counts, the title and lead, a provenance line, and a
// grid of hw-card tiles per group. It renders the markup as a string, so an Astro page
// (components/Catalogue.astro, components/AstrobookHome.astro) and a generated static page take the
// same shape. The page wears the internal header (AppHeader, header.css) above it and loads
// catalogue.css, the package's tokens and its elements.

export type CatalogueItem = {
  name: string;
  href: string;
  /** Words under the name, searched with it and the group's name. */
  note?: string;
  /** A short count or kind in a neutral pill, such as "3 states". */
  pill?: string;
  /** A page drawn in the tile at three quarters, loaded when the tile scrolls into view. */
  frame?: string;
  /** An image drawn in the tile. */
  image?: string;
  /** Markup drawn in the tile, trusted. */
  html?: string;
};

export type CatalogueGroup = { name: string; items: CatalogueItem[] };

export type CatalogueData = {
  title: string;
  lead: string;
  /** One line in mono: where the shown values come from, such as the brand version. */
  provenance: string;
  groups: CatalogueGroup[];
  /** Markup between the provenance line and the first group, trusted: the system's foundations. */
  intro?: string;
  /** The rail's words, English unless the page passes its own. */
  labels?: { search?: string; groups?: string };
};

const escapeCatalogue = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
const anchorOf = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const tilePreview = (item: CatalogueItem) =>
  item.frame
    ? `<iframe src="${escapeCatalogue(item.frame)}" loading="lazy" tabindex="-1" aria-hidden="true" title=""></iframe>`
    : item.image
      ? `<img src="${escapeCatalogue(item.image)}" alt="" loading="lazy">`
      : (item.html ?? "");

const catalogueTile = (item: CatalogueItem, group: string) =>
  `<li><a class="hw-card hw-catalogue-tile" href="${escapeCatalogue(item.href)}" data-search="${escapeCatalogue(`${group} ${item.name} ${item.note ?? ""}`.toLowerCase())}">${
    item.frame || item.image || item.html
      ? `<span class="hw-catalogue-preview">${tilePreview(item)}</span>`
      : ""
  }<span class="hw-catalogue-name">${escapeCatalogue(item.name)}</span>${
    item.note ? `<span class="hw-catalogue-note">${escapeCatalogue(item.note)}</span>` : ""
  }${item.pill ? `<span class="hw-pill" data-tone="neutral">${escapeCatalogue(item.pill)}</span>` : ""}</a></li>`;

// Filters the tiles by every word in the search field and hides a group left empty; delegated on the document,
// so it holds across Astro's client router swaps and runs once.
const SCRIPT = `<script>(()=>{if(window.hwCatalogue)return;window.hwCatalogue=1;document.addEventListener("input",(e)=>{const f=e.target;if(!(f instanceof HTMLInputElement)||!f.matches(".hw-catalogue-search"))return;const q=f.value.trim().toLowerCase().split(/\\s+/);const root=f.closest(".hw-catalogue");for(const g of root.querySelectorAll(".hw-catalogue-group")){let n=0;for(const t of g.querySelectorAll(".hw-catalogue-tile")){const hit=q.every((w)=>t.dataset.search.includes(w));t.parentElement.hidden=!hit;if(hit)n++;}g.hidden=n===0;const link=root.querySelector('.hw-catalogue-rail a[href="#'+g.id+'"]');if(link)link.parentElement.hidden=n===0;}});})();</script>`;

export function renderCatalogue(data: CatalogueData): string {
  const { search = "Search", groups: groupsLabel = "Groups" } = data.labels ?? {};
  const groups = data.groups.filter((g) => g.items.length > 0);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const rail = groups
    .map(
      (g) =>
        `<li><a href="#${anchorOf(g.name)}"><span>${escapeCatalogue(g.name)}</span><span class="hw-catalogue-count">${g.items.length}</span></a></li>`,
    )
    .join("");
  const sections = groups
    .map(
      (g) =>
        `<section class="hw-catalogue-group" id="${anchorOf(g.name)}"><h2>${escapeCatalogue(g.name)} <span class="hw-catalogue-count">${g.items.length}</span></h2><ul class="hw-catalogue-grid">${g.items.map((i) => catalogueTile(i, g.name)).join("")}</ul></section>`,
    )
    .join("");
  return `<div class="hw-catalogue hw-container"><aside class="hw-catalogue-rail"><input class="hw-catalogue-search" type="search" placeholder="${escapeCatalogue(search)}" aria-label="${escapeCatalogue(search)}"><nav aria-label="${escapeCatalogue(groupsLabel)}"><ul>${rail}</ul></nav></aside><div class="hw-catalogue-main"><h1>${escapeCatalogue(data.title)} <span class="hw-catalogue-count">${total}</span></h1><p class="hw-catalogue-lead">${escapeCatalogue(data.lead)}</p><p class="hw-catalogue-provenance">${escapeCatalogue(data.provenance)}</p>${data.intro ?? ""}${sections}</div></div>${SCRIPT}`;
}
