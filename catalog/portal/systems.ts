import type { CatalogGroup } from "@hackersandwizards/scaffolding/catalog/render.ts";

// Each system's own design-system page, served by its dev server, and the public address its owner
// publishes, which the Pages copy links instead; a system without a page is not listed.
const SYSTEMS: [name: string, url: string, published?: string][] = [
  ["website", "http://website.localhost/design-system/"],
  ["os", "http://os.localhost/design-system/"],
  ["trainer-hub", "http://trainer-hub.localhost/design-system/"],
  ["talks", "http://talks.localhost/design-system"],
  [
    "certificate-verifier",
    "http://localhost:8787/design-system",
    "https://certificates.hackersandwizards.dev/design-system",
  ],
];
const PUBLIC = Object.fromEntries(SYSTEMS.filter((s) => s[2]).map(([, url, pub]) => [url, pub]));

export const systemsGroup: CatalogGroup = {
  name: "Systems",
  items: SYSTEMS.map(([name, url]) => ({
    name,
    href: url,
    note: `its design-system page, ${url.replace(/^https?:\/\//, "")}`,
  })),
};

export const systemLinksScript = `<script>
// On GitHub Pages, links to a system page with a public address leave their local addresses for
// the public ones; a system page without one stays as its name, marked local only.
const PUBLIC = ${JSON.stringify(PUBLIC)};
if (location.hostname.endsWith(".github.io")) for (const a of document.querySelectorAll("a[href]")) { if (a.hostname !== "localhost" && !a.hostname.endsWith(".localhost")) continue; if (PUBLIC[a.href]) a.href = PUBLIC[a.href]; else if (a.matches(".hw-catalog-tile")) { a.removeAttribute("href"); a.querySelector(".hw-catalog-note").append(" (local only)"); } else a.replaceWith(a.textContent + " (local only)"); }
</script>`;
