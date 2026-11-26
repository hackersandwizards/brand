import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../scripts/git";
import { face, lid, mug, type Print, TEXTILE, wear } from "../../applications/merch/mockup";
import type { ApplicationAsset } from "./application-assets";
import { esc, slug } from "./markup";
import type { SearchableSection } from "./search";
import { deferImages, scopeIds } from "./svg-mockups";

// Merch: each product drawn from its print files (applications/merch/mockup.ts), so the section
// shows the final layout and changes with the files.
const MERCH = "applications/merch";
const print = (stem: string): Print & { stem: string } => {
  const svg = readFileSync(join(ROOT, MERCH, `${stem}.svg`), "utf8");
  const size = svg.match(/width="([\d.]+)mm" height="([\d.]+)mm"/);
  if (size === null) throw new Error(`Merch dimensions missing: ${stem}.svg`);
  const [, W, H] = size;
  const cut = svg.match(/<g id="CutContour"><path d="([^"]+)"/)?.[1];
  return { stem, href: `${MERCH}/${stem}.svg`, W: +W, H: +H, cut };
};
// A textile print carries 0.5 mm air on every side; a sheet print 3 mm bleed.
const mm = (v: number) => `${Math.round(v)} mm`;
type Product = { name: string; note: string; views: [string, string][]; stems: string[] };
const front = print("shirt-T12-front");
const back = print("shirt-T12-back");
const hoodie = print("hoodie-H12-front");
const mugPrint = print("mug-M6");
const stickers = ["stickerP-P10", "stickerL-L13", "stickerB-B16", "stickerD-D1"].map(print);
const wizards = ["stickerZ-Z1", "stickerZ-Z2"].map(print);
const cloths = ["cloth-K9", "cloth-K10", "cloth-K12"].map(print);
const notebook = print("notebook-N6");
const PRODUCTS: [Product, ...Product[]] = [
  {
    name: "Shirt T12",
    note: `Purple Love and Stargazer. Front chest: the wordmark in the outline cut, ${mm(front.W - 1)} wide. Back neck: the same cut, ${mm(back.W - 1)} wide.`,
    views: (
      [
        ["Purple Love", TEXTILE["purple-love"]],
        ["Stargazer", TEXTILE.stargazer],
      ] as const
    ).flatMap(([n, col]) => [
      [
        wear({ kind: "shirt", side: "front", color: col }, front, { x: 380, y: 120 }),
        `front, ${n}`,
      ],
      [wear({ kind: "shirt", side: "back", color: col }, back, { x: 380, y: 60 }), `back, ${n}`],
    ]),
    stems: ["shirt-T12-front", "shirt-T12-back"],
  },
  {
    name: "Hoodie H12",
    note: `Purple Love and Stargazer. Chest, above the pocket: the wordmark in the outline cut, ${mm(hoodie.W - 1)} wide.`,
    views: (
      [
        ["Purple Love", TEXTILE["purple-love"]],
        ["Stargazer", TEXTILE.stargazer],
      ] as const
    ).map(([n, col]) => [
      wear({ kind: "hoodie", side: "front", color: col }, hoodie, { x: 380, y: 215 }),
      `front, ${n}`,
    ]),
    stems: ["hoodie-H12-front"],
  },
  {
    name: "Mug M6",
    note: `The compact lockup on each side, the wrap ${mm(mugPrint.W - 6)} by ${mm(mugPrint.H - 6)}.`,
    views: [
      [mug(mugPrint, 0), "left side"],
      [mug(mugPrint, 1), "right side"],
    ],
    stems: ["mug-M6"],
  },
  {
    name: "Notebook N6",
    note: `The cover, ${mm(notebook.W - 6)} by ${mm(notebook.H - 6)}, with the lockup.`,
    views: [[face(notebook, 3), "cover"]],
    stems: ["notebook-N6"],
  },
  {
    name: "Cleaning cloths K9, K10, K12",
    note: "Printed edge to edge, each with the lockup.",
    views: cloths.map((c) => [face(c, 2), `${c.stem.slice(6)}, ${mm(c.W - 6)} by ${mm(c.H - 6)}`]),
    stems: cloths.map((c) => c.stem),
  },
  {
    name: "Stickers P10, L13, B16, D1",
    note: `Kiss-cut on night with 3 mm corners, ${stickers.map((s) => `${Math.round(s.W - 6)} x ${mm(s.H - 6)}`).join(", ")}, the wordmark in the night cut 3 mm inside the edge; the print file carries the cut line (CutContour). Shown together on a 300 mm laptop lid to compare their sizes; which sticker goes where: Device stickers.`,
    views: [[lid(stickers), "the four sizes compared, not a placement"]],
    stems: stickers.map((s) => s.stem),
  },
  {
    name: "Wizard stickers Z1, Z2",
    note: `The second motif after the wordmark: the wizard alone, die-cut with a 2.5 mm white border, ${wizards.map((s) => `${mm(s.W - 6)} x ${mm(s.H - 6)}`).join(" and ")}; Z2 goes on the laptop lid. The print file carries the cut line (CutContour) and 1.5 mm white bleed. Shown together on a 300 mm laptop lid to compare their sizes; which sticker goes where: Device stickers.`,
    views: [[lid(wizards), "the two sizes compared, not a placement"]],
    stems: wizards.map((s) => s.stem),
  },
];

// Draws each product with its print dimensions and links to the tracked print variants.
export function renderMerch(merchFiles: ReadonlyMap<string, ApplicationAsset>): SearchableSection {
  const products = PRODUCTS.map((p) => {
    const id = `merch-${slug(p.name)}`;
    const entry = {
      t: p.name,
      k: "application",
      h: `applications/${id}`,
      x: `merch ${p.stems.join(" ")}`,
    };
    const html = `<article class="product" id="${id}"><div class="mock" data-theme="light">${p.views.map(([svg, c], i) => `<figure${svg.includes('id="lid"') ? ' class="wide"' : ""}>${deferImages(scopeIds(svg, `${id}-${i}`))}<figcaption>${esc(c)}</figcaption></figure>`).join("")}</div><h4>${esc(p.name)}</h4><p>${esc(p.note)}</p><p class="dl">${p.stems.flatMap((st) => (merchFiles.get(st)?.files ?? []).map((f) => `<a href="${MERCH}/${esc(f)}" download>${esc(f)}</a>`)).join("")}</p></article>`;
    return { html, entry };
  });
  return {
    html: `<div class="products">${products.map(({ html }) => html).join("")}</div>`,
    index: products.map(({ entry }) => entry),
  };
}

// Shows the first garment on the Merch tile.
export const merchPreview = () => {
  const [view] = PRODUCTS[0].views;
  if (view === undefined) throw new Error(`Merch preview missing: ${PRODUCTS[0].name}`);
  return scopeIds(view[0], "tile-merch");
};
