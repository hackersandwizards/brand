#!/usr/bin/env bun
// Writes catalogue.html, the brand portal: one file opened from disk, with a left nav, a search
// over every token and logo, and one view per area (overview, colours, type, tokens, logos,
// applications, press kit). It reads this repo's files only, so `--check` can hold the committed
// page to the generator: it exits 1 where catalogue.html differs from a fresh build.
// Usage: bun scripts/catalogue.ts [--check]
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "../manifest.json";
import pkg from "../package.json";
import press from "../press/press.json";
import repos from "../repos.json";
import { ROOT } from "./git";
import { stickerUsage } from "../applications/device-stickers/devices";
import { EXAMPLE, fillSignature, TRAINER_ROLE } from "../applications/mail-signature/fill";
import { face, lid, mug, type Print, TEXTILE, wear } from "../applications/merch/mockup";
import { parseTokens, resolveColors, SOURCE } from "./tokens";

const tokens = parseTokens(readFileSync(SOURCE, "utf8"));
const colors = resolveColors(tokens);
const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
const table = (head: string[], rows: unknown[][]) =>
  `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
const code = (s: unknown) => `<code>${esc(s)}</code>`;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// The search index: what a reader types, where it leads.
const index: { t: string; k: string; h: string; x?: string }[] = [];

// Colours, grouped by family.
const family = (k: string) =>
  /night/.test(k)
    ? "Night"
    : /teal|purple|ampersand/.test(k)
      ? "Brand"
      : /green|amber|factory|red/.test(k)
        ? "Status"
        : "Surface and ink";
// A former name is a token whose value is another colour token: it resolves, but adds no colour.
const former = Object.keys(colors).filter((k) => /^var\(--color-[\w-]+\)$/.test(tokens[k]));
const own = Object.entries(colors).filter(([k]) => !former.includes(k));
const colourGroups = ["Surface and ink", "Brand", "Status", "Night"].map((g) => {
  const list = own.filter(([k]) => family(k) === g);
  for (const [k, hex] of list)
    index.push({ t: k, k: "colour", h: `colours/${slug(k)}`, x: `${hex} ${g}` });
  return `<h3 class="label">${g}</h3><div class="grid">${list
    .map(
      ([k, hex]) =>
        `<button class="swatch" id="${slug(k)}" data-copy="${esc(hex)}" title="Copy ${esc(hex)}"><span style="background:var(${k})"></span><strong>${esc(hex)}</strong>${code(k)}${
          tokens[k] !== hex ? `<small>${esc(tokens[k])}</small>` : ""
        }</button>`,
    )
    .join("")}</div>`;
});

// The role table and the chart order, read from tokens.css.
const swatchCell = (name: string) =>
  `<span class="sw" style="background:var(--color-${name})"></span>${code(name)}`;
const tintCell = (base: string, p: number) =>
  `<span class="sw" style="background:color-mix(in srgb, var(--color-${base}) ${p}%, white)"></span>${p} %`;
const roleRows = [
  ...readFileSync(SOURCE, "utf8").matchAll(
    /^\s*([\w-]+)\s*\|\s*([\w-]+)\s*\|\s*([\w-]+)\s*(?:\*\/)?$/gm,
  ),
].map(([, base, text, night]) => [
  swatchCell(base),
  swatchCell(text),
  `<span class="night-cell">${swatchCell(night)}</span>`,
  tintCell(base, 7),
  tintCell(base, 40),
]);
const chart = Object.keys(tokens)
  .filter((k) => k.startsWith("--chart-"))
  .map((k) => swatchCell(tokens[k].match(/--color-([\w-]+)/)![1]));
const rolesHtml = `<h3 class="label" id="roles">Roles</h3>
<p>Each hue has a base, a text colour on light, one colour on night, and two tints. Text on light clears 4.5:1 on bg and white, night clears 4.5:1 on night and night-2.</p>
${table(["Base", "Text on light", "Night", "Tint 7 %", "Tint 40 %"], roleRows)}
<h3 class="label" id="chart">Chart order</h3>
<p>Series take this order, ${code("--chart-1")} to ${code(`--chart-${chart.length}`)}; on night each takes its hue's night colour.</p>
<ol class="chart">${chart.map((c) => `<li>${c}</li>`).join("")}</ol>
${former.length ? `<p class="meta">Former names, resolving to their successor: ${former.map((k) => `${code(k)} → ${code(tokens[k].slice(4, -1))}`).join(", ")}.</p>` : ""}`;

const roles = [
  ...new Set(Object.keys(tokens).flatMap((k) => k.match(/^--type-(\w+)-family$/)?.[1] ?? [])),
]
  .map((r) => {
    index.push({ t: `type ${r}`, k: "type", h: `type/type-${r}` });
    const v = (p: string) => (tokens[`--type-${r}-${p}`] ? `var(--type-${r}-${p})` : "normal");
    const style = `font-family:${v("family")};font-weight:${v("weight")};font-size:${v("size")};line-height:${v("line-height")};letter-spacing:${v("tracking")};text-transform:${tokens[`--type-${r}-case`] ? `var(--type-${r}-case)` : "none"}`;
    return `<div class="role" id="type-${r}"><span class="label">${esc(r)} ${code(`--type-${r}-*`)}</span><p style="${style}">Agentic Engineering, from the first prompt to the factory</p></div>`;
  })
  .join("");

const preview = (k: string) =>
  k.startsWith("--radius-")
    ? `<div class="pv" style="border-radius:var(${k})"></div>`
    : k.startsWith("--shadow-")
      ? `<div class="pv" style="box-shadow:var(${k})"></div>`
      : k.startsWith("--spacing-")
        ? `<div class="pv bar" style="width:var(${k})"></div>`
        : k.startsWith("--gradient-")
          ? `<div class="pv" style="background:var(${k})"></div>`
          : "";
const otherTokens = Object.entries(tokens).filter(([k]) => !/^--(color|type|text|chart)-/.test(k));
const tokenKinds = [...new Set(otherTokens.map(([k]) => k.split("-")[2]))];
const tokensHtml = tokenKinds
  .map((kind) => {
    const rows = otherTokens.filter(([k]) => k.split("-")[2] === kind);
    for (const [k, v] of rows) index.push({ t: k, k: "token", h: `tokens/${slug(k)}`, x: v });
    return `<h3 class="label" id="kind-${kind}">${esc(kind)}</h3>${table(
      ["Token", "Value", "Preview"],
      rows.map(([k, v]) => [`<span id="${slug(k)}">${code(k)}</span>`, code(v), preview(k)]),
    )}`;
  })
  .join("");

// The two rules on corners and icons the design guide states, each with its example.
const LUCIDE_CHECK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
const cornersHtml = `<h3 class="label" id="corners">Corners and icons</h3>
<div class="rules">
<div><div class="corner-demo"></div><p>The brand corner, ${code("--radius-brand")}, goes on every surface large enough to show it at its full value.</p></div>
<div><p class="square-demo"><span class="sw"></span><span class="sw" style="background:var(--color-purple)"></span><span class="sw" style="background:var(--color-teal-dark)"></span></p><p>Smaller marks, a colour swatch or a list marker, are square, never a scaled corner.</p></div>
<div><p class="icon-demo">${LUCIDE_CHECK} Delivered</p><p>Icons are Lucide line icons in the colour of their text, never emoji. A kind of label carries an icon on every value or on none.</p></div>
</div>`;

// Logos: one card per logo with its light, night, outline and print files as downloads.
const logoFiles = manifest.files.map((f) => f.path).filter((p) => p.startsWith("logos/"));
const bases = [
  ...new Set(
    logoFiles.map((p) =>
      p.replace(/^logos\//, "").replace(/(-night|-outline|-white|-black|-cmyk)?\.\w+$/, ""),
    ),
  ),
];
const LOGO_NOTES: Record<string, string> = {
  lockup: "The standard logo: the wizard beside the pixel wordmark.",
  "lockup-compact": "The wizard over the wordmark, for small spots.",
  wordmark: "The wordmark alone. Its white and black cuts carry every letter in that one colour.",
};
// Which logo goes where, as the design guide's logo table states it.
const LOGO_USE = [
  [
    "Every surface without its own row: screens, documents, website, banners, notebook, cloths",
    "lockup",
  ],
  [
    "Slides",
    "lockup on the title and the closing slide, wordmark on every other slide; a delivered deck keeps the lockup on every slide",
  ],
  ["Shirts, hoodie, stickers", "wordmark"],
  ["The second sticker, beside the wordmark sticker", "the wizard alone, die-cut, under Merch"],
  ["A product app's sign-in screens", "wordmark, the heading may be in the sans face"],
  ["Small spots: mug, lock screens", "lockup-compact"],
  [
    "A surface that allows one colour only, such as a partner wall in white",
    "wordmark-white or wordmark-black",
  ],
  ["Mail signature", "its typed wordmark, under Applications"],
];
const logoCard = (base: string) => {
  const files = logoFiles.filter((p) =>
    new RegExp(`^logos/${base}(-night|-outline|-white|-black|-cmyk)?\\.\\w+$`).test(p),
  );
  const show = files.find((p) => p.endsWith(`${base}.svg`)) ?? files.find((p) => /png$/.test(p));
  const night = files.find((p) => p.endsWith(`${base}-night.svg`)) ?? show;
  const outline = files.find((p) => p.endsWith(`${base}-outline.svg`));
  const white = files.find((p) => p.endsWith(`${base}-white.svg`));
  const black = files.find((p) => p.endsWith(`${base}-black.svg`));
  const tile = (src: string | undefined, cls: string, label: string) =>
    src
      ? `<figure class="${cls}"><img src="${src}" alt="${esc(base)}, ${esc(label)}"><figcaption>${esc(label)}</figcaption></figure>`
      : "";
  index.push({
    t: base,
    k: "logo",
    h: `logos/logo-${base}`,
    x: `${files.join(" ")} download logo`,
  });
  return `<article class="logo" id="logo-${base}"><div class="pair">${tile(show, "on-light", "day · on light")}${tile(night, "on-dark", "night cut · on night, also black and black textile")}${tile(outline, "on-gradient", "outline cut · on the gradient, also Purple Love and Stargazer")}${tile(white, "on-dark", "white cut · a surface in one colour, such as a white partner wall")}${tile(black, "on-light", "black cut · a surface in one colour, such as single-colour print")}</div><h3>${esc(base)}</h3><p>${esc(LOGO_NOTES[base] ?? "")}</p><p class="dl">${files
    .map(
      (p) =>
        `<a href="${p}" download>${esc(
          p
            .replace(/^logos\//, "")
            .replace(`${base}`, "")
            .replace(/^-/, "") || p.split(".").pop(),
        )}</a>`,
    )
    .join("")}</p></article>`;
};
const order = (b: string) =>
  ["lockup", "lockup-compact", "wordmark"].indexOf(b) + 1 || 10 + bases.indexOf(b);
// The package still ships the former type-logo for the code that reads it; the emoji masters stay
// in the repo for the booth and background applications. The page shows only the logos in use.
const isLogo = (b: string) => b.startsWith("lockup") || b.startsWith("wordmark");
const logosHtml = `<div class="logos">${bases
  .filter(isLogo)
  .sort((a, b) => order(a) - order(b))
  .map(logoCard)
  .join("")}</div>`;

// Applications: every family of brand files in use, from applications/. A retired file is deleted;
// git history keeps it. One card per file name, its formats as downloads beside it.
type Family = {
  id: string;
  title: string;
  note: string;
  dir?: string;
  // The grounds a card previews its file on, where the file is made for one: [background, label].
  grounds?: (stem: string) => [string, string][];
  // A family that draws its own section instead of one card per file.
  render?: () => string;
  // Pages elsewhere that show the family, as [label, href]: an engine's specimen page and its
  // repository, at the URLs the engine's owner publishes on GitHub.
  links?: [string, string][];
};
const FAMILIES: Family[] = [
  {
    id: "backgrounds",
    title: "Backgrounds for devices and calls",
    note: "The dark (night) family: the compact lockup on MacBook, Studio Display and lock screens, the lockup across the home screens, a small lockup above the head in calls. Set on the devices by hand.",
    dir: "applications/backgrounds",
  },
  {
    id: "booth",
    title: "Booth banners",
    note: "Pixlip frames, 1 x 2 m and 1 x 1 m: the brand gradient over the whole banner, the logo in its outline cut and only large white type. Each PDF is the print file (final format plus 20 mm bleed), with a PNG preview beside it.",
    dir: "applications/booth",
  },
  {
    id: "channel-banners",
    title: "Channel banners",
    note: "The airy set in light teal, one file per platform: the LinkedIn company cover with its Canva copies, both slides of the LinkedIn profile carousel, the LinkedIn Featured-link image, YouTube and OMR Reviews.",
    dir: "applications/channel-banners",
  },
  {
    id: "linkedin-visuals",
    title: "LinkedIn post images",
    note: "Every post image, 1080 x 1350: the headline in white on the gradient band, the image as a card below it, the lockup on the tint. The package ships three commands: brand-linkedin-frame frames a photo, a sketch or a terminal; brand-linkedin-terminal renders the dark terminal window from a spec; brand-linkedin-sketch-prompt prints the prompt for a generated marker sketch and the worked examples, each sketch-example card here with the filled prompt that drew it.",
    dir: "applications/linkedin-visuals",
  },
  {
    id: "avatars",
    title: "Avatars and workspace icons",
    note: "The favicon tile, one file per platform; Google Workspace takes the lockup at 320 x 132.",
    dir: "applications/avatars",
  },
  {
    id: "gradients",
    title: "Gradients",
    note: "Linear, mesh and radial brand gradients, with the Illustrator source.",
    dir: "applications/gradients",
  },
  {
    id: "merch",
    title: "Merch",
    note: "Each product as it is printed, drawn from its print file; each file as SVG in millimetres with a PDF beside it.",
    dir: "applications/merch",
    render: () => merchHtml,
  },
  {
    id: "device-stickers",
    title: "Device stickers",
    note: stickerUsage(),
    dir: "applications/device-stickers",
  },
  {
    id: "mail-signature",
    title: "Mail signatures",
    note: 'One signature for every mail, new mails and replies alike, from one template with placeholders. From an h&w account: the typed wordmark in colour, name, role, contact line and the three lines § 35a GmbHG requires. From a trainer\'s own address: name, the role line "Freier Trainer für hackers&wizards" and the website, without wordmark and GmbH lines, which would present the trainer as part of the GmbH. `bun run brand-mail-signature` writes an HTML file to open in a browser and copy into the mail client, and a plain-text file for the iPhone. Links in teal #1A7285 (5.54:1 on white). Shown with a fictitious person.',
    dir: "applications/mail-signature",
    render: () => signatureHtml,
  },
  {
    id: "slides",
    title: "Slides",
    note: "Decks come from the slide engine, the package @hackersandwizards/slides; there is no template file. Its specimen shows one slide of every type. The slide logo: the lockup on the title and the closing slide, the wordmark alone on every other slide.",
    links: [
      [
        "Slide specimen",
        "https://github.com/hackersandwizards/slides/blob/main/specimen/index.html",
      ],
      ["slides on GitHub", "https://github.com/hackersandwizards/slides"],
    ],
  },
  {
    id: "documents",
    title: "Documents",
    note: "Proposals, rate cards, Leistungsnachweise, certificates and handouts come from the document engine, the package @hackersandwizards/documents, rendered by Company OS and the trainer hub. Its specimen shows every document type with invented data.",
    links: [
      [
        "Document specimen",
        "https://github.com/hackersandwizards/documents/blob/main/specimen/index.html",
      ],
      ["documents on GitHub", "https://github.com/hackersandwizards/documents"],
    ],
  },
];
// Not shown: the scripts that build a family and their inputs.
const SKIP = /\.(ts|py|css)$|^qr-|^__pycache__$/;
const PREVIEW = ["png", "svg", "html", "txt"];
const assetStems = (dir: string) => {
  const abs = join(ROOT, dir);
  const stems = new Map<string, string[]>();
  for (const f of existsSync(abs) ? readdirSync(abs).sort() : []) {
    if (SKIP.test(f)) continue;
    const stem = f.replace(/\.\w+$/, "");
    stems.set(stem, [...(stems.get(stem) ?? []), f]);
  }
  return stems;
};
const assetCard = (dir: string, stem: string, files: string[], fam: Family) => {
  const id = `a-${slug(`${fam.id}-${stem}`)}`;
  index.push({
    t: stem,
    k: "application",
    h: `applications/${id}`,
    x: `${files.join(" ")} ${fam.title}`,
  });
  const ext = (f: string) => f.split(".").pop()!;
  const shown = PREVIEW.map((e) => files.find((f) => ext(f) === e)).find(Boolean);
  const href = (f: string) => `${dir}/${esc(f)}`;
  const grounds = fam.grounds?.(stem) ?? [];
  const view = (bg?: string, label?: string) =>
    !shown
      ? `<span class="pdf">${esc(ext(files[0]).toUpperCase())}</span>`
      : /^(html|txt)$/.test(ext(shown))
        ? `<iframe src="${href(shown)}" title="${esc(stem)}" loading="lazy"></iframe>`
        : `<img src="${href(shown)}" alt="${esc(stem)}${label ? ` ${esc(label)}` : ""}" loading="lazy"${bg ? ` style="background:${bg}"` : ""}>`;
  const views = grounds.length
    ? grounds
        .map(
          ([bg, label]) =>
            `<a href="${href(shown ?? files[0])}" target="_blank" title="${esc(label)}">${view(bg, label)}</a>`,
        )
        .join("")
    : `<a href="${href(shown ?? files[0])}" target="_blank">${view()}</a>`;
  return `<figure class="asset" id="${id}"><div class="views">${views}</div><figcaption>${code(stem)}${grounds.length ? ` <span class="meta">${grounds.map(([, l]) => esc(l)).join(", ")}</span>` : ""}<span class="dl">${files.map((f) => `<a href="${href(f)}" download>${esc(ext(f))}</a>`).join("")}</span></figcaption></figure>`;
};
const familyStems = new Map(
  FAMILIES.map((f) => [f.id, f.dir ? assetStems(f.dir) : new Map<string, string[]>()]),
);
const fileCount = (id: string) => [...familyStems.get(id)!.values()].flat().length;
// Merch: each product drawn from its print files (applications/merch/mockup.ts), so the section
// shows the final layout and changes with the files.
const MERCH = "applications/merch";
const print = (stem: string): Print & { stem: string } => {
  const svg = readFileSync(join(ROOT, MERCH, `${stem}.svg`), "utf8");
  const [, W, H] = svg.match(/width="([\d.]+)mm" height="([\d.]+)mm"/)!;
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
const PRODUCTS: Product[] = [
  {
    name: "Shirt T12",
    note: `Purple Love and Stargazer. Front chest: the wordmark in the outline cut, ${mm(front.W - 1)} wide. Back neck: the same cut, ${mm(back.W - 1)} wide.`,
    views: (
      [
        ["Purple Love", TEXTILE["purple-love"]],
        ["Stargazer", TEXTILE.stargazer],
      ] as const
    ).flatMap(([n, col]) => [
      [wear(col, front, 380, 120, false, false), `front, ${n}`],
      [wear(col, back, 380, 60, false, true), `back, ${n}`],
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
    ).map(([n, col]) => [wear(col, hoodie, 380, 215, true, false), `front, ${n}`]),
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
    note: `Kiss-cut on night with 3 mm corners, the wordmark in the night cut, ${stickers.map((s) => mm(s.W - 12)).join(", ")} wide; the print file carries the cut line (CutContour). Shown on a 300 mm laptop lid.`,
    views: [[lid(stickers), "on a laptop lid"]],
    stems: stickers.map((s) => s.stem),
  },
  {
    name: "Wizard stickers Z1, Z2",
    note: `The second sticker beside the wordmark: the wizard alone, die-cut with a 2.5 mm white border, ${wizards.map((s) => `${mm(s.W - 6)} x ${mm(s.H - 6)}`).join(" and ")}; Z2 goes on the laptop lid. The print file carries the cut line (CutContour) and 1.5 mm white bleed. Shown on a 300 mm laptop lid.`,
    views: [[lid(wizards), "on a laptop lid"]],
    stems: wizards.map((s) => s.stem),
  },
];
const merchFiles = familyStems.get("merch") ?? new Map<string, string[]>();
const merchHtml = `<div class="products">${PRODUCTS.map((p) => {
  const id = `a-merch-${slug(p.name)}`;
  index.push({
    t: p.name,
    k: "application",
    h: `applications/${id}`,
    x: `merch ${p.stems.join(" ")}`,
  });
  return `<article class="product" id="${id}"><div class="mock">${p.views.map(([svg, c]) => `<figure${svg.includes('id="lid"') ? ' class="wide"' : ""}>${svg}<figcaption>${esc(c)}</figcaption></figure>`).join("")}</div><h4>${esc(p.name)}</h4><p>${esc(p.note)}</p><p class="dl">${p.stems.flatMap((st) => (merchFiles.get(st) ?? []).map((f) => `<a href="${MERCH}/${esc(f)}" download>${esc(f)}</a>`)).join("")}</p></article>`;
}).join("")}</div>`;
// Mail signature: the template filled for a fictitious person, once per variant.
const SIGNATURE = "applications/mail-signature";
const signatureTemplate = readFileSync(join(ROOT, SIGNATURE, "template.html"), "utf8");
const signatureHtml = `<div class="assets">${(
  [
    ["from an h&w account", "hw-account", EXAMPLE],
    [
      "from a trainer's own address",
      "own-address",
      { name: EXAMPLE.name, role: TRAINER_ROLE, mail: "kim@example.com" },
    ],
  ] as const
)
  .map(([label, stem, fields]) => {
    index.push({
      t: `mail signature ${stem}`,
      k: "application",
      h: `applications/a-mail-signature-${stem}`,
      x: `mail signature ${label}`,
    });
    return `<figure class="asset" id="a-mail-signature-${stem}"><div class="views"><iframe srcdoc="${esc(fillSignature(signatureTemplate, fields, "html"))}" title="mail signature ${esc(label)}" loading="lazy"></iframe></div><figcaption>${esc(label)}</figcaption></figure>`;
  })
  .join(
    "",
  )}</div><p class="dl"><a href="${SIGNATURE}/template.html" download>template.html</a><a href="${SIGNATURE}/template.txt" download>template.txt</a></p>`;
const applicationsHtml = `<p>Every family of brand files in use. The files sit in applications/ of this repo.</p>
${table(
  ["Family", "Files"],
  FAMILIES.map((f) => [
    `<a href="#applications/app-${f.id}">${esc(f.title)}</a>`,
    f.dir ? String(fileCount(f.id)) : "",
  ]),
)}
${FAMILIES.map((f) => {
  const stems = familyStems.get(f.id)!;
  const links = f.links
    ? `<p class="dl">${f.links.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</p>`
    : "";
  return `<h3 id="app-${f.id}">${esc(f.title)}</h3><p>${esc(f.note)}</p>${links}${
    f.render
      ? `<p class="meta">${esc(f.dir)}</p>${f.render()}`
      : f.dir
        ? `<p class="meta">${esc(f.dir)}</p><div class="assets">${[...stems].map(([stem, files]) => assetCard(f.dir!, stem, files, f)).join("")}</div>`
        : ""
  }`;
}).join("")}`;

// Press kit: the photos in press/, each with what it shows, its size and the credit.
const pressHtml = `<p>The photos of the press kit, which the website's press page offers with the logos as one ZIP. Credit: "Photo: ${esc(press.credit)}". Each photo is listed with what it shows in <code>press/press.json</code>.</p>
<div class="assets">${press.photos
  .map((p) => {
    index.push({ t: p.file, k: "press", h: "press", x: p.shows });
    return `<figure class="asset"><a href="press/${p.file}" target="_blank"><img src="press/${p.file}" alt="${esc(p.shows)}" loading="lazy"></a><figcaption>${code(p.file)}, ${p.width} px, ${esc(p.shows)} <a href="press/${p.file}" download>download</a></figcaption></figure>`;
  })
  .join("")}</div>`;
// Each system's own design-system page, from repos.json; a system without one is not listed.
const systemLinks = Object.entries(repos)
  .flatMap(([name, r]) =>
    r.catalogues.map((url) => `<li><a href="${esc(url)}">${esc(name)}</a></li>`),
  )
  .join("");

// Overview: what is here and where each system shows its own components.
const tile = (href: string, title: string, body: string) =>
  `<a class="tile" href="#${href}"><strong>${title}</strong><span>${body}</span></a>`;
const overview = `<p class="lead">Everything the hackers&amp;wizards brand is made of: tokens, logos, the files made from them and the press kit.</p>
<div class="tiles">
${tile("colours", "Colours", `${own.length} colours in four families, their roles and the chart order, click to copy`)}
${tile("type", "Type", "Type roles in JetBrains Mono and Inter")}
${tile("logos", "Logos", "Lockup, compact, wordmark, light, night and outline, SVG and PNG downloads")}
${tile("applications", "Applications", `${FAMILIES.length} families: ${FAMILIES.map((f) => f.id.replace("-", " ")).join(", ")}`)}
${tile("press", "Pressekit", "The founders' photos for the press kit, with credit and downloads")}
</div>
<h3>Systems</h3>
<p>Each system shows its components on its own design-system page, served by its dev server.</p>
<ul>${systemLinks}</ul>
<h3>Refresh</h3>
${table(
  ["Source", "Refresh"],
  [
    ["Tokens", code("bun run tokens")],
    ["Logo cuts", code("bun scripts/outline.ts")],
    ["This page", code("bun run catalogue")],
  ],
)}
<h3>Quick start</h3>
<ul>
<li>Logo for a document or a screen: <a href="logos/lockup.svg" download>lockup.svg</a>, on night <a href="logos/lockup-night.svg" download>lockup-night.svg</a>, on Purple Love, Stargazer or the gradient <a href="logos/lockup-outline.svg" download>lockup-outline.svg</a>; for small spots <a href="logos/lockup-compact.svg" download>lockup-compact.svg</a>. Which logo where: <a href="#logos">Logos</a>.</li>
<li>Print: textiles and stickers take the wordmark alone, the second sticker the wizard alone; the print files are under <a href="#applications/app-merch">Merch</a>, the booth files under <a href="#applications/app-booth">Booth banners</a>.</li>
<li>Slides: there is no template file. Decks come from the slide engine, <code>@hackersandwizards/slides</code>; its slide types are on its specimen page, under <a href="#applications/app-slides">Slides</a>. Documents come from the document engine, <code>@hackersandwizards/documents</code>, under <a href="#applications/app-documents">Documents</a>.</li>
<li>Workshop kit for trainers: the lockup above, the night call background <a href="applications/backgrounds/call-background.png" download>call-background.png</a> (all backgrounds under <a href="#applications/app-backgrounds">Applications</a>), slides from the slide engine.</li>
<li>In code: <code>@import "@hackersandwizards/brand/tokens.css";</code>, the rest in <code>README.md</code>.</li>
</ul>`;

const pages: [string, string, string][] = [
  ["overview", "Overview", overview],
  ["colours", "Colours", colourGroups.join("") + rolesHtml],
  ["type", "Type", roles],
  ["tokens", "Spacing, radius, shadow, layout", cornersHtml + tokensHtml],
  [
    "logos",
    "Logos",
    `<p>Three logos, each one line. The ground picks the cut: on light the day file; on night, black and black textile the night cut, with a grey edge round the wizard; on Purple Love, Stargazer and the gradient the outline cut, a white outline round the letters and a white edge round the wizard. Gap, lift and alignment: <code>README.md</code>, "Use it in another repo".</p>
${table(
  ["Surface", "Logo"],
  LOGO_USE.map(([where, logo]) => [esc(where), esc(logo)]),
)}
${logosHtml}`,
  ],
  ["applications", "Applications: the brand in use", applicationsHtml],
  ["press", "Pressekit", pressHtml],
];
const nav = (id: string, title: string) => `<a href="#${id}"><span>${esc(title)}</span></a>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>hackers&amp;wizards brand</title>
<link rel="stylesheet" href="generated/tokens.root.css">
<link rel="stylesheet" href="tokens/print.css">
<style>
  /* Controls take the website's own roles: a field is white with the brand corner, a choice is a
     pill that fills teal-dark when checked, focus is the 3 px purple ring. */
  html { accent-color: var(--color-teal); caret-color: var(--color-purple); }
  :focus-visible { outline: 3px solid var(--color-purple); outline-offset: 2px; }
  body { margin: 0; display: grid; grid-template-columns: 17rem 1fr; min-height: 100vh; background: var(--color-bg); color: var(--color-ink); font: var(--type-body-weight) var(--text-small)/1.5 var(--type-body-family); }
  aside.side { position: sticky; top: 0; height: 100vh; overflow: auto; box-sizing: border-box; padding: 1.25rem 0.75rem 2rem; border-right: 1px solid var(--color-border); background: var(--color-white); border-top: 3px solid; border-image: var(--gradient-magic) 1; }
  aside.side > a img { width: 100%; margin-bottom: 0.25rem; padding: 0 0.25rem; box-sizing: border-box; }
  aside.side .version { margin: 0 0.5rem 0.75rem; }
  aside.side nav { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1px; margin-top: 0.5rem; }
  aside.side nav a { display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.3rem 0.5rem; border-radius: var(--radius-sm); color: var(--color-ink); text-decoration: none; }
  aside.side nav a span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  aside.side nav a:hover { background: var(--color-tint); }
  aside.side nav a.on { background: var(--color-teal-dark); color: var(--color-white); }
  aside.side nav small { color: var(--color-muted); font: 0.7rem var(--font-code); align-self: center; }
  aside.side nav a.on small { color: inherit; opacity: 0.8; }
  aside.side .label { margin: 1.25rem 0.5rem 0.25rem; }
  .label, th { font-family: var(--type-label-family); font-size: var(--type-label-size); letter-spacing: var(--type-label-tracking); text-transform: uppercase; color: var(--color-muted); font-weight: 500; }
  .input { box-sizing: border-box; min-height: 2.5rem; width: 100%; padding: 0 0.875rem; border: 1px solid var(--color-border-strong); border-radius: var(--radius-brand); background: var(--color-white); color: var(--color-ink); font: inherit; }
  .input::placeholder { color: var(--color-muted); }
  .input:hover { border-color: var(--color-muted); }
  .input:focus-visible { border-color: var(--color-teal); }
  input[type=search]::-webkit-search-cancel-button { cursor: pointer; }
  #q { margin: 0 0.25rem; width: calc(100% - 0.5rem); }
  main { padding: 1.5rem clamp(1rem, 3vw, 3rem) 4rem; min-width: 0; }
  section { display: none; max-width: var(--container-wide); }
  section.on { display: block; }
  h1, h2, h3 { font-family: var(--font-mono); letter-spacing: -0.02em; }
  h2 { font-size: var(--text-h2); margin: 0 0 1rem; }
  h3 { font-size: var(--text-h4); margin: 2rem 0 0.75rem; scroll-margin-top: 1rem; }
  .lead { font-size: var(--text-lead); max-width: 40em; }
  .meta { color: var(--color-muted); }
  code { font-family: var(--font-code); font-size: 0.9em; }
  a { color: var(--color-teal-dark); }
  table { border-collapse: collapse; width: 100%; background: var(--color-white); }
  th, td { text-align: left; vertical-align: top; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); }
  .grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); }
  .swatch { all: unset; cursor: copy; display: grid; gap: 0.15rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 0.5rem; }
  .swatch:focus-visible { outline: 3px solid var(--color-purple); outline-offset: 2px; }
  .swatch span { height: 3.5rem; border-radius: var(--radius-brand); border: 1px solid var(--color-border); margin-bottom: 0.3rem; }
  .swatch strong { font-family: var(--font-code); }
  .swatch small { color: var(--color-muted); font-size: 0.7rem; }
  .swatch.copied strong::after { content: " copied"; color: var(--color-teal); font-weight: 400; }
  .tiles { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); }
  .tile { display: grid; gap: 0.25rem; padding: 1rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); color: var(--color-ink); text-decoration: none; }
  .tile:hover { border-color: var(--color-teal); }
  .tile strong { font-family: var(--font-mono); font-size: var(--text-h4); }
  .tile span { color: var(--color-muted); }
  .logos { display: grid; gap: 1rem; margin-top: 1.5rem; }
  .logo { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 1rem; }
  .logo h3 { margin: 0.75rem 0 0.25rem; }
  .logo p { margin: 0.25rem 0; }
  .pair { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 0.5rem; }
  .pair figure { margin: 0; border-radius: var(--radius-brand); }
  .pair img { display: block; width: 100%; height: 7.5rem; object-fit: contain; padding: 1rem 1.25rem 0.5rem; box-sizing: border-box; }
  .pair figcaption { padding: 0 0.75rem 0.5rem; font: 0.7rem var(--font-code); color: var(--color-muted); }
  .pair .on-dark figcaption, .pair .on-gradient figcaption { color: rgb(255 255 255 / 0.8); }
  .on-light { background: var(--color-bg); border: 1px solid var(--color-border); }
  .on-dark { background: var(--color-night); }
  .on-gradient { background: var(--gradient-magic); }
  .on-purple-love { background: #6c5a9e; } /* Purple Love, the Stanley/Stella textile C115, no brand token */
  .dl a { display: inline-block; margin: 0.25rem 0.4rem 0 0; padding: 0.15rem 0.5rem; border: 1px solid var(--color-border-strong); border-radius: var(--radius-pill); color: var(--color-ink); text-decoration: none; font-family: var(--font-code); font-size: 0.75rem; }
  .dl a::before { content: "↓ "; }
  .dl a:hover { background: var(--color-tint); }
  .pv { width: 4rem; height: 2rem; background: var(--color-white); border: 1px solid var(--color-border); }
  .pv.bar { height: 0.5rem; max-width: 100%; background: var(--color-teal); border: 0; }
  .rules { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); margin-bottom: 1rem; }
  .rules > div { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 1rem; }
  .rules p { margin: 0.5rem 0 0; }
  .corner-demo { height: 3rem; background: var(--color-tint); border: 1px solid var(--color-border); border-radius: var(--radius-brand); }
  .square-demo, .icon-demo { display: flex; align-items: center; gap: 0.5rem; height: 3rem; margin: 0 !important; }
  .square-demo .sw { width: 1.25rem; height: 1.25rem; background: var(--color-teal); }
  .icon-demo { color: var(--color-teal-dark); font-weight: 500; }
  .role { border-bottom: 1px solid var(--color-border); padding: 0.75rem 0; }
  .role p { margin: 0.25rem 0 0; }
  #results { display: none; }
  #results.on { display: block; }
  #results a { display: flex; gap: 0.75rem; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); color: var(--color-ink); text-decoration: none; background: var(--color-white); }
  #results a:hover { background: var(--color-tint); }
  #results .label { min-width: 7rem; }
  .night-cell { display: inline-block; padding: 0.15rem 0.4rem; background: var(--color-night); color: var(--color-night-ink); border-radius: 0; }
  .night-cell code { color: inherit; }
  .chart { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; padding-left: 1.25rem; }
  .sw { display: inline-block; width: 1rem; height: 1rem; border-radius: 0; border: 1px solid var(--color-border); vertical-align: -0.2rem; margin-right: 0.3rem; }
  .assets { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
  .products { display: grid; gap: 1rem; }
  .product { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 1rem; scroll-margin-top: 1rem; }
  .product h4 { font-family: var(--font-mono); font-size: var(--text-h4); margin: 0.75rem 0 0.25rem; }
  .product p { margin: 0.25rem 0; }
  .mock { display: grid; gap: 0.5rem; grid-template-columns: repeat(auto-fill, 15.5rem); }
  .mock figure.wide { grid-column: span 2; }
  .mock figure { margin: 0; padding: 0.75rem 0.75rem 0.5rem; background: #e4e6ea; border-radius: var(--radius-brand); }
  .mock svg { display: block; height: 15rem; }
  .mock figcaption { margin-top: 0.4rem; font: 0.75rem var(--font-code); color: var(--color-muted); }
  .asset { margin: 0; }
  .asset .views { display: grid; grid-auto-columns: 1fr; grid-auto-flow: column; gap: 0.25rem; }
  .asset:has(.views > a + a) { grid-column: span 2; }
  .asset img[style] { padding: 0.75rem; }
  .asset .dl { display: block; }
  .asset img, .asset .pdf { display: grid; place-items: center; width: 100%; height: 8rem; object-fit: contain; background: var(--color-tint); border: 1px solid var(--color-border); border-radius: var(--radius-brand); box-sizing: border-box; }
  .asset img[src$=".png"] { object-fit: scale-down; }
  .assets:has(iframe) { grid-template-columns: repeat(auto-fill, minmax(36rem, 1fr)); }
  .asset iframe { display: block; width: 100%; height: 11.5rem; background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-brand); box-sizing: border-box; }
  .asset figcaption { padding-top: 0.25rem; overflow-wrap: anywhere; font-size: 0.75rem; }
  /* Below 600 px the side bar turns into a top bar: logo, Search and Menu. Search opens the field
     under the bar, Menu opens the nav as a drawer over the page. */
  .bar-btn { display: none; }
  @media (max-width: 599.98px) {
    html { scroll-padding-top: 4.5rem; }
    body { display: block; }
    aside.side { position: sticky; top: 0; z-index: 10; height: auto; overflow: visible; display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-right: 0; border-bottom: 1px solid var(--color-border); }
    aside.side > a { flex: 1; min-width: 0; display: flex; }
    aside.side > a img { width: auto; height: 1.75rem; margin: 0; padding: 0; }
    aside.side .version, aside.side #q { display: none; }
    .bar-btn { display: inline-flex; align-items: center; min-height: 2.75rem; box-sizing: border-box; padding: 0 1rem; border: 1px solid var(--color-teal); border-radius: var(--radius-brand); background: var(--color-white); color: var(--color-teal-dark); font: 500 var(--text-small) var(--font-sans); cursor: pointer; }
    .bar-btn:hover { border-color: var(--color-purple); color: var(--color-purple); }
    .bar-btn[aria-expanded=true] { background: var(--color-teal-dark); border-color: var(--color-teal-dark); color: var(--color-white); }
    aside.side.searching #q { display: block; flex-basis: 100%; width: 100%; min-height: 2.75rem; margin: 0.25rem 0; }
    aside.side nav { display: none; }
    aside.side.menu nav { display: grid; position: fixed; z-index: 1; top: var(--bar); bottom: 0; left: 0; width: min(20rem, 85vw); margin: 0; padding: 0.75rem; overflow: auto; overscroll-behavior: contain; box-sizing: border-box; align-content: start; background: var(--color-white); border-right: 1px solid var(--color-border); }
    aside.side.menu::after { content: ""; position: fixed; top: var(--bar); right: 0; bottom: 0; left: 0; background: color-mix(in srgb, var(--color-night) 40%, transparent); }
    aside.side nav a { min-height: 2.75rem; align-items: center; }
    #results a { flex-wrap: wrap; gap: 0.25rem 0.75rem; }
    #results .label { min-width: 0; flex-basis: 100%; }
  }
</style>
</head>
<body>
<aside class="side">
<a href="#overview"><img src="logos/lockup.svg" alt="hackers&amp;wizards"></a>
<button type="button" class="bar-btn" id="search-btn" aria-controls="q" aria-expanded="false">Search</button>
<button type="button" class="bar-btn" id="menu-btn" aria-controls="side-nav" aria-expanded="false">Menu</button>
<p class="label version">Brand v${esc(pkg.version)}</p>
<input type="search" id="q" class="input" placeholder="Search  /" aria-label="Search tokens and logos" autocomplete="off">
<nav id="side-nav" aria-label="Catalogue">
${nav("overview", "Overview")}
<p class="label">Foundations</p>
${nav("colours", "Colours")}${nav("type", "Type")}${nav("tokens", "Spacing and more")}${nav("logos", "Logos")}
<p class="label">Brand in use</p>
${nav("applications", "Applications")}${nav("press", "Pressekit")}
</nav>
</aside>
<main>
<section id="results"><h2>Search</h2><div></div></section>
${pages.map(([id, title, body]) => `<section id="${id}" data-page><h2>${esc(title)}</h2>${body}</section>`).join("\n")}
</main>
<script>
const INDEX = ${JSON.stringify(index).replace(/</g, "\\u003c")};
const q = document.getElementById("q"), results = document.getElementById("results");
const h = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const show = () => {
  const [page, anchor] = decodeURIComponent(location.hash.slice(1)).split("/");
  const target = document.getElementById(page)?.matches("[data-page]") ? page : "overview";
  for (const s of document.querySelectorAll("section[data-page]")) s.classList.toggle("on", s.id === target && !q.value);
  for (const a of document.querySelectorAll("aside nav a")) a.classList.toggle("on", a.getAttribute("href").slice(1) === target);
  const el = anchor && document.getElementById(anchor);
  if (el) { el.scrollIntoView({ block: "start" }); el.style.outline = "3px solid var(--color-purple)"; el.style.outlineOffset = "3px"; setTimeout(() => (el.style.outline = ""), 2000); }
  else scrollTo(0, 0);
};
const search = () => {
  const words = q.value.toLowerCase().split(/\\s+/).filter(Boolean);
  results.classList.toggle("on", words.length > 0);
  const hits = INDEX.filter((e) => words.every((w) => (e.t + " " + e.k + " " + (e.x || "")).toLowerCase().includes(w))).slice(0, 60);
  results.querySelector("div").innerHTML = hits.map((e) => '<a href="#' + e.h + '"><span class="label">' + e.k + "</span>" + (e.k === "colour" ? '<i style="width:1rem;height:1rem;border-radius:0;border:1px solid var(--color-border);background:' + e.x.split(" ")[0] + '"></i>' : "") + "<strong>" + h(e.t) + "</strong><span class=meta>" + h(e.x || "").slice(0, 80) + "</span></a>").join("") || "<p>Nothing found.</p>";
  show();
};
q.addEventListener("input", search);
results.addEventListener("click", () => { q.value = ""; results.classList.remove("on"); });
addEventListener("hashchange", show);
// The phone's top bar: one of Search or Menu is open at a time; a link, Escape or a tap outside
// the drawer closes the menu.
const side = document.querySelector("aside.side"), searchBtn = document.getElementById("search-btn"), menuBtn = document.getElementById("menu-btn");
const bar = (open) => {
  side.classList.toggle("searching", open === "search");
  side.classList.toggle("menu", open === "menu");
  searchBtn.setAttribute("aria-expanded", open === "search");
  menuBtn.setAttribute("aria-expanded", open === "menu");
  side.style.setProperty("--bar", side.getBoundingClientRect().bottom + "px");
};
searchBtn.addEventListener("click", () => { const open = !side.classList.contains("searching"); bar(open ? "search" : ""); if (open) q.focus(); });
menuBtn.addEventListener("click", () => { const open = !side.classList.contains("menu"); bar(open ? "menu" : ""); if (open) side.querySelector("nav a")?.focus(); });
side.addEventListener("click", (e) => { if (e.target === side && side.classList.contains("menu")) bar(""); });
addEventListener("hashchange", () => { if (side.classList.contains("menu")) bar(""); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && side.classList.contains("menu")) { bar(""); menuBtn.focus(); } });
// Keys as in Storybook: / or Cmd+K searches.
addEventListener("keydown", (e) => {
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
  if ((e.key === "/" && !typing) || (e.key === "k" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); q.focus(); }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-copy]");
  if (b) navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.classList.add("copied"); setTimeout(() => b.classList.remove("copied"), 1200); });
});
show();
</script>
</body>
</html>
`;

const out = join(ROOT, "catalogue.html");
if (!process.argv.includes("--check")) {
  writeFileSync(out, html);
  console.log("wrote catalogue.html");
} else if (readFileSync(out, "utf8") !== html) {
  console.error("catalogue.html is stale: run bun run catalogue");
  process.exit(1);
}
