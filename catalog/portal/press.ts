import type { CatalogGroup } from "@hackersandwizards/scaffolding/catalog/render.ts";
import press from "../../press/press.json";
import { code, esc, slug } from "./markup";
import type { PortalSearchEntry } from "./search";

const index: PortalSearchEntry[] = [];

const pressHtml = `<p>The photos of the press kit, which the website's press page offers with the logos as one ZIP. Credit: "Photo: ${esc(press.credit)}". Each photo is listed with what it shows in <code>press/press.json</code>.</p>
<div class="assets">${press.photos
  .map((p) => {
    index.push({ t: p.file, k: "press", h: `pressekit/press-${slug(p.file)}`, x: p.shows });
    const cut = "cut" in p ? p.cut : undefined;
    if (cut) index.push({ t: cut, k: "press", h: `pressekit/press-${slug(p.file)}`, x: p.shows });
    return `<figure class="asset" id="press-${slug(p.file)}"><a href="press/${p.file}" target="_blank"><img src="press/${p.file}" alt="${esc(p.shows)}" loading="lazy"></a><figcaption>${code(p.file)}, ${p.width} px, ${esc(p.shows)} <a href="press/${p.file}" download>download</a>${cut ? `, <a href="press/${cut}" download>${code(cut)}</a>` : ""}</figcaption></figure>`;
  })
  .join("")}</div>`;

const pressGroup: CatalogGroup = {
  name: "Pressekit",
  items: press.photos.map((p) => ({
    name: p.file,
    href: `#pressekit/press-${slug(p.file)}`,
    note: p.shows,
    pill: `${p.width} px`,
    image: `press/${p.file}`,
  })),
};

export const pressKit = { group: pressGroup, html: pressHtml, index };
