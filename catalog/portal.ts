#!/usr/bin/env bun
// The brand portal: one page in the catalog shape every repository shares (scaffolding's
// renderCatalog and catalog.css, brand's header.css), whose search also lists every token, colour,
// logo, file and photo, and one view per area below the tiles (colours, type, tokens, elements,
// logos, applications, press kit). It reads this repo's files only. Run as its own process by the
// catalog's routes (pages/index.html.ts, pages/catalog-assets/), so it reads the working tree
// afresh on each dev request; it prints the page and its assets as JSON and writes nothing.
// Usage: bun catalog/portal.ts
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, join, relative } from "node:path";
import manifest from "../manifest.json";
import pkg from "../package.json";
import logoRules from "../logos/logos.json";
import press from "../press/press.json";
import verbal from "../verbal/verbal.json";
import catalogs from "../expert/catalogs.json";
import { ROOT } from "../scripts/git";
import { DEMOS, SECTIONS } from "./element-demos";
import { MARK } from "../applications/avatars/generate";
import { escHtml, inlineImports } from "../applications/linkedin-visuals/render";
import { stickerCaptions } from "../applications/device-stickers/devices";
import { EXAMPLE, fillSignature } from "../applications/mail-signature/fill";
import { face, lid, mug, type Print, TEXTILE, wear } from "../applications/merch/mockup";
import {
  aliases,
  colorValue,
  flat,
  palettes,
  parseTokens,
  resolveColors,
  SOURCE,
} from "../scripts/tokens";
import { brandFallbacks } from "@hackersandwizards/scaffolding/catalog/fallbacks.ts";
import { type CatalogGroup, renderCatalog } from "@hackersandwizards/scaffolding/catalog/render.ts";
import { tokens as brandTokens } from "../generated/tokens";

const source = readFileSync(SOURCE, "utf8");
const tokens = parseTokens(source);
const colors = resolveColors(tokens);
const esc = (s: unknown) => escHtml(String(s));
const table = (head: string[], rows: unknown[][], cls?: string) =>
  `<table${cls ? ` class="${cls}"` : ""}>${head.length ? `<thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>` : ""}<tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
const code = (s: unknown) => `<code>${esc(s)}</code>`;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
// Files the page loads beside it (catalog-assets/, served by their own route): its frames'
// documents, the elements as one stylesheet, so each sample frame loads one file instead of
// elements.css and its imports, and each PNG an inlined SVG embeds, so the HTML carries no image
// as base64 text (the MacBook stickers' wizard was 0.95 MB of 1.28 MB).
const ASSETS = "catalog-assets";
const assets: Record<string, string> = {};
const writeAsset = (name: string, content: string | Buffer) => {
  assets[name] = Buffer.from(content).toString("base64");
};
// The shell's type steps are var()s of brand's tokens, which the catalog build fills in; this page
// reads the file raw, so it fills them the same way.
const catalogCss = brandFallbacks(
  readFileSync(
    createRequire(import.meta.url).resolve("@hackersandwizards/scaffolding/catalog/catalog.css"),
    "utf8",
  ),
  brandTokens,
);
const elementsCss = flat(join(ROOT, "elements/elements.css"));
writeAsset("elements.css", elementsCss);
// An asset named by its content's hash; returns its path from the page.
const hashedAsset = (content: string | Buffer, ext: string) => {
  const name = `${createHash("sha256").update(content).digest("hex").slice(0, 16)}.${ext}`;
  writeAsset(name, content);
  return `${ASSETS}/${name}`;
};
const pngFiles = (svg: string) =>
  svg.replace(
    /href="data:image\/png;base64,([A-Za-z0-9+/=]+)"/g,
    (_, data: string) => `href="${hashedAsset(Buffer.from(data, "base64"), "png")}"`,
  );

// A frame's document is a file beside the page too: Chrome loads a srcdoc frame at once, below the
// fold or in a hidden view, where an src frame waits for loading="lazy" (FCP 4.4 s to 1.8 s on
// Lighthouse mobile). Its links stay relative to the page through <base>.
const frame = (doc: string, attrs: string) => {
  const src = hashedAsset(
    doc.includes("<head>")
      ? doc.replace("<head>", '<head><base href="../">')
      : `<!doctype html><base href="../">${doc}`,
    "html",
  );
  return `<iframe src="${src}" ${attrs} loading="lazy"></iframe>`;
};

// An SVG <image> loads even inside a hidden section, so the merch and device mockups (1.9 MB of
// print files) name theirs in data-href, and show() sets href once their section opens.
const deferImages = (svg: string) => svg.replace(/(<image\b[^>]*?\s)href="/g, '$1data-href="');

// An SVG inlined more than once keeps its internal ids unique on the page: each one takes a prefix.
const scopeIds = (svg: string, prefix: string) =>
  svg.replace(/(id="|url\(#|href="#)([^")]+)/g, `$1${prefix}-$2`);

// The search index: what a reader types, where it leads.
const index: { t: string; k: string; h: string; x?: string }[] = [];

// A role token such as --color-label-text also resolves to another colour, and is no alias.
const aliasNames = aliases(source);
const { neutrals, hues } = palettes(source);
const chartKeys = Object.keys(tokens).filter((k) => k.startsWith("--chart-"));
// The chart series a hue gives, by its base or its text colour (amber and green chart dark).
const chartOf = (...names: string[]) =>
  chartKeys.find((k) => names.some((n) => tokens[k] === `var(--color-${n})`));
// A hue's wash or tint on white, and the token that carries it where one does (teal-light).
const hueMix = (base: string, p: number) => `color-mix(in srgb, var(--color-${base}) ${p}%, white)`;
const tintToken = (base: string, p: number) =>
  Object.keys(colors).find((k) => tokens[k] === hueMix(base, p) && !aliasNames.includes(k));
// A colour cell: a button that copies the hex. A colour in a second cell (muted, a hue that is its
// own text colour) keeps its anchor and search entry on the first.
const anchored = new Set<string>();
const swatch = (fill: string, hex: string, label = "", id = "") =>
  `<button class="swatch"${id} data-copy="${esc(hex)}" title="Copy ${esc(hex)}"><span style="background:${fill}"></span>${label}<small>${esc(hex)}</small></button>`;
const colourCell = (name: string, palette: string) => {
  if (name === "-") return `<span class="meta">none</span>`;
  const k = `--color-${name}`;
  const first = !anchored.has(k);
  anchored.add(k);
  if (first)
    index.push({
      t: k,
      k: "colour",
      h: `colours/color-${slug(name)}`,
      x: `${colors[k]} ${palette}`,
    });
  return swatch(`var(${k})`, colors[k]!, code(name), first ? ` id="color-${slug(name)}"` : "");
};
const tintCell = (base: string, p: number) => {
  const k = tintToken(base, p);
  return k
    ? colourCell(k.slice("--color-".length), "Hues")
    : swatch(hueMix(base, p), colorValue(tokens)(hueMix(base, p)));
};
const nightCell = (name: string, palette: string) =>
  name === "-"
    ? colourCell(name, palette)
    : `<span class="night-cell">${colourCell(name, palette)}</span>`;
const neutralRows = neutrals.map((r) => [
  `<strong>${esc(r.job)}</strong>`,
  colourCell(r.day, "Neutrals"),
  nightCell(r.night, "Neutrals"),
]);
const hueRows = hues.map((r) => {
  const series = chartOf(r.base, r.text);
  return [
    colourCell(r.base, "Hues"),
    esc(r.job),
    colourCell(r.text, "Hues"),
    nightCell(r.night, "Hues"),
    tintCell(r.base, 7),
    tintCell(r.base, 40),
    series ? `${code(series)} ${code(tokens[series]!.match(/--color-([\w-]+)/)![1])}` : "",
  ];
});
const coloursHtml = `<p>Two palettes hold every brand colour. The neutrals build every page, by day and by night; the hues carry meaning. Copy a hex with a click.</p>
<h3 class="label" id="neutrals">Neutrals</h3>
${table(["Job", "Day", "Night"], neutralRows)}
<h3 class="label" id="hues">Hues</h3>
<p>Text on day clears 4.5:1 on bg and white, night clears 4.5:1 on night and night-2. A wash is the hue at 7 % on white, a tint at 40 %. Chart series take the hues in ${code("--chart-*")} order, each the colour named by day and its hue's night colour by night.</p>
${table(["Hue", "Job", "Text on day", "Night", "Wash 7 %", "Tint 40 %", "Chart"], hueRows)}
${aliasNames.length ? `<p class="meta">Aliases, each resolving to the token to write: ${aliasNames.map((k) => `${code(k)} → ${code(tokens[k].slice(4, -1))}`).join(", ")}.</p>` : ""}`;

const roleNames = [
  ...new Set(Object.keys(tokens).flatMap((k) => k.match(/^--type-(\w+)-family$/)?.[1] ?? [])),
];
const roleSample = (r: string) => {
  const v = (p: string) => (tokens[`--type-${r}-${p}`] ? `var(--type-${r}-${p})` : "normal");
  const style = `font-family:${v("family")};font-weight:${v("weight")};font-size:${v("size")};line-height:${v("line-height")};letter-spacing:${v("tracking")};text-transform:${tokens[`--type-${r}-case`] ? `var(--type-${r}-case)` : "none"}`;
  return `<p style="${style}">Agentic Engineering, from the first prompt to the factory</p>`;
};
const roles = roleNames
  .map((r) => {
    index.push({ t: `type ${r}`, k: "type", h: `type/type-${r}` });
    return `<div class="role" id="type-${r}"><span class="label">${esc(r)} ${code(`--type-${r}-*`)}</span>${roleSample(r)}</div>`;
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
          : k.startsWith("--code-")
            ? `<div class="pv" style="background:var(--code-bg);color:var(${k});font:var(--type-code-weight) var(--type-code-size)/1.6 var(--type-code-family);padding:0.25rem 0.5rem;width:max-content;height:auto;white-space:nowrap">${k === "--code-bg" ? "&nbsp;" : "const x = 1;"}</div>`
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

const LUCIDE_CHECK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
const cornersHtml = `<h3 class="label" id="corners">Corners and icons</h3>
<div class="rules">
<div><div class="corner-demo"></div><p>The brand corner, ${code("--radius-brand")}: everything that holds content or is pressed with words on it, cards, panels, callouts, code blocks, pictures and buttons. Only the outermost block takes it: whatever sits inside takes the small corner.</p></div>
<div><p class="shape-demo"><span class="hw-label hw-label-box">Part one</span></p><p>The small corner, ${code("--radius-sm")}: everything one text line tall that is no pill, a label box, a number tile, inline code, a segmented control and its segments, every form field and the button beside one, a picture in a mail, and every block inside a block with the brand corner.</p></div>
<div><p class="shape-demo"><span class="hw-pill">Remote</span> <span class="hw-icon-button">${LUCIDE_CHECK}</span></p><p>Round, ${code("--radius-pill")}: chips, badges and toggles, and every control that holds only an icon.</p></div>
<div><p class="square-demo"><span class="sw"></span><span class="sw" style="background:var(--color-purple)"></span><span class="sw" style="background:var(--color-teal-dark)"></span></p><p>Square: a mark smaller than a line, a list marker or a colour swatch.</p></div>
<div><p class="icon-demo">${LUCIDE_CHECK} Delivered</p><p>Icons are Lucide line icons in the colour of their text, never emoji. A kind of label carries an icon on every value or on none.</p></div>
<div><div class="shape-demo"><hr class="hw-rule" data-variant="bar" aria-hidden="true"></div><p>A rule line under a title or over a block is teal; the gradient stays on the strip along the top edge.</p></div>
</div>`;

const logoFiles = manifest.files.map((f) => f.path).filter((p) => p.startsWith("logos/"));
const LOGO_NOTES: Record<string, string> = {
  lockup: "The standard logo: the wizard beside the pixel wordmark.",
  "lockup-compact": "The wizard over the wordmark, for small spots.",
  wordmark: "The wordmark alone. Its white and black cuts carry every letter in that one colour.",
};
const logoRule = (base: string) => {
  const rule = (logoRules.logos as Record<string, { minWidthPx: number; minWidthMm: number }>)[
    base
  ];
  return rule
    ? `<p>Clear space: the height of the h in the name, on every side. Minimum width: ${rule.minWidthPx} px on screen, ${rule.minWidthMm} mm in print.</p>`
    : "";
};
/** Download links, each labelled with its file name below logos/ unless `label` says otherwise. */
const dl = (paths: string[], label = (p: string) => p.replace(/^logos\//, "")) =>
  `<p class="dl">${paths.map((p) => `<a href="${p}" download>${esc(label(p))}</a>`).join("")}</p>`;
const logoCard = (base: string) => {
  const files = logoFiles.filter((p) =>
    new RegExp(`^logos/${base}(-night|-outline|-white|-black)?\\.svg$`).test(p),
  );
  const show = files.find((p) => p.endsWith(`${base}.svg`));
  const night = files.find((p) => p.endsWith(`${base}-night.svg`)) ?? show;
  const outline = files.find((p) => p.endsWith(`${base}-outline.svg`));
  const white = files.find((p) => p.endsWith(`${base}-white.svg`));
  const black = files.find((p) => p.endsWith(`${base}-black.svg`));
  const tile = (src: string | undefined, cls: string, label: string) =>
    src
      ? `<figure class="${cls}"><img src="${src}" alt="${esc(base)}, ${esc(label)}" loading="lazy"><figcaption>${esc(label)}</figcaption></figure>`
      : "";
  index.push({
    t: base,
    k: "logo",
    h: `logos/logo-${base}`,
    x: `${files.join(" ")} download logo`,
  });
  return `<article class="logo" id="logo-${base}"><div class="pair">${tile(show, "on-light", "day · on light")}${tile(night, "on-dark", "night cut · on night, also black and black textile")}${tile(outline, "on-gradient", "outline cut · on the gradient, also Purple Love and Stargazer")}${tile(white, "on-dark", "white cut · a surface in one colour, such as a white partner wall")}${tile(black, "on-light", "black cut · a surface in one colour, such as single-colour print")}</div><h3>${esc(base)}</h3><p>${esc(LOGO_NOTES[base] ?? "")}</p>${logoRule(base)}${dl(files, (p) => p.replace(`logos/${base}`, "").replace(/^-/, ""))}</article>`;
};
// The masters: each logo someone draws, with its cuts. Every other file in logos/ is made from them
// for one use and listed below as a delivery file; the emoji master and its print file serve the
// booth, background and merch applications.
const shownLogos = ["lockup", "lockup-compact", "wordmark"];
const pick = (re: RegExp) => logoFiles.filter((p) => re.test(p));
const DELIVERY: [string, string[]][] = [
  [
    "A header up to 40 px tall, on screen or in print: the lockup with the wizard embedded at 256 px, under half the lockup's weight, alike at that size.",
    pick(/^logos\/lockup-screen/),
  ],
  [
    "A tool that cannot draw SVG, such as a PPTX export or the press kit's ZIP: each cut as a PNG.",
    pick(/^logos\/(lockup|wordmark)[\w-]*\.png$/),
  ],
  [
    "The wizard alone as an icon a page or document shows or inlines, 256 px, from the emoji master.",
    pick(/^logos\/emoji-256/),
  ],
  [
    "The favicon set every page serves from the package, and the web app icons.",
    pick(/^logos\/(favicon|apple-touch-icon|icon-)/),
  ],
];
index.push({ t: "type-logo-short.svg", k: "logo", h: "logos/logos-delivery", x: "hw mark master" });
for (const [use, paths] of DELIVERY)
  for (const p of paths)
    index.push({ t: p.replace(/^logos\//, ""), k: "logo", h: "logos/logos-delivery", x: use });
const deliveryHtml = `<h3 id="logos-delivery">Delivery files</h3>
<p>Made for one use each from the logos above by <code>scripts/outline.ts</code> and <code>scripts/ampersand.ts</code>, and by <code>applications/avatars/generate.ts</code> from the hw mark, its own master:</p>
${dl(["logos/type-logo-short.svg"])}
${table(
  ["For", "Files"],
  DELIVERY.map(([use, paths]) => [esc(use), dl(paths)]),
)}`;
const logosHtml = `<div class="logos">${shownLogos.map(logoCard).join("")}</div>
${deliveryHtml}`;
const logoCount =
  ["One", "Two", "Three", "Four", "Five", "Six"][shownLogos.length - 1] ??
  String(shownLogos.length);

type Family = {
  id: string;
  title: string;
  note: string;
  dir?: string;
  // A family that draws its own section instead of one card per file.
  render?: () => string;
  // Pages elsewhere that show the family, as [label, href]: an engine's published catalog and
  // its repository on GitHub.
  links?: [string, string][];
};
const FAMILIES: Family[] = [
  {
    id: "backgrounds",
    title: "Backgrounds for devices and calls",
    note: "The dark (night) family: the lockup on every file, low on the device screens (bottom right on the landscape ones, centred on the others), small above the head in calls. Set on the devices by hand.",
    dir: "applications/backgrounds",
  },
  {
    id: "booth",
    title: "Booth banners",
    note: "Pixlip frames, 1 x 2 m and 1 x 1 m: the brand gradient over the whole banner, the logo in its outline cut and only large white type. The 1 x 2 m takes the lockup, the 1 x 1 m the wordmark with the large wizard below it, whole inside the margins. Each PDF is the print file (final format plus 20 mm bleed), with a PNG preview beside it.",
    dir: "applications/booth",
  },
  {
    id: "channel-banners",
    title: "Channel banners",
    note: "The airy set, one file per platform: the LinkedIn company cover with its Canva copies, both slides of the LinkedIn profile carousel, the LinkedIn Featured-link image, the X profile header, the XING and Sessionize profile covers, YouTube and OMR Reviews.",
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
    note: `The white hw on the brand gradient, one file per platform, the hw at ${MARK * 100}% of the tile width, the largest that stays inside a maskable icon's safe circle; generate.ts builds them. The Google Workspace logo is the wide avatar, the hw centred on the gradient at 320 x 132. The Qonto invoice logo is the wordmark, full width and top-aligned in a transparent 1000 px square.`,
    dir: "applications/avatars",
  },
  {
    id: "social-previews",
    title: "GitHub social previews",
    note: "One 1280 x 640 card per public repository, the image a shared link shows: the night lockup, a teal tile with the category's Lucide icon, the category, the repository name and its GitHub description. generate.ts renders them from the current descriptions; each is uploaded by hand under the repository's Settings, Social preview, since GitHub has no API for it.",
    dir: "applications/social-previews",
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
    note: "One sticker combination per company device, upright like the Apple logo and centred left to right. Drawn to scale from Apple's dimensions (MacBook Pro 14-inch, iPhone 18 Pro, iPad Pro 11-inch); the dashed line is the device's centre, the measure runs from the bottom edge to the centre of the wordmark sticker. The print files are under Merch.",
    dir: "applications/device-stickers",
    render: () => deviceHtml,
  },
  {
    id: "mail-signature",
    title: "Mail signature",
    note: "One signature for every mail from an h&w account, new mails and replies alike, from one template with placeholders: the typed wordmark in colour, name, role, contact line and the three lines § 35a GmbHG requires. `bun run brand-mail-signature` writes an HTML file to open in a browser and copy into the mail client, and a plain-text file for the iPhone. Links in teal #1A7285 (5.54:1 on white). Shown with a fictitious person.",
    dir: "applications/mail-signature",
    render: () => signatureHtml,
  },
  {
    id: "slides",
    title: "Slides",
    note: 'Decks come from the slide engine, the package @hackersandwizards/slides; there is no template file. Its catalog shows one slide of every type. The slide logo: the lockup on the title and the closing slide, the wordmark alone on every other slide. A concept slide that claims a mechanism in a few short cards may carry a generated marker sketch beside them: brand-slide-sketch-prompt prints the prompt and the worked example, the sketch-example card here; the slides README, "Deck structure", says which slides get one.',
    dir: "applications/slide-visuals",
    links: [
      ["Slide catalog", "https://hackersandwizards.github.io/slides/"],
      ["slides on GitHub", "https://github.com/hackersandwizards/slides"],
    ],
  },
  {
    id: "documents",
    title: "Documents",
    note: "Proposals, rate cards, Leistungsnachweise, certificates and handouts come from the document engine, the package @hackersandwizards/documents, rendered by Company OS and the trainer hub. Its catalog shows every document type with invented data.",
    links: [
      ["Document catalog", "https://hackersandwizards.github.io/documents/"],
      ["documents on GitHub", "https://github.com/hackersandwizards/documents"],
    ],
  },
  {
    id: "mail",
    title: "Mail",
    note: "Designed mails, such as the monthly customer update, come from the mail engine, the package @hackersandwizards/mail: React Email components on the brand tokens and a command that renders a mail's HTML and plain-text parts from a data file, used by Company OS. Its catalog shows every building block and every mail type with invented data. A personal mail carries the signature above.",
    links: [
      ["Mail catalog", "https://hackersandwizards.github.io/mail/"],
      ["mail on GitHub", "https://github.com/hackersandwizards/mail"],
    ],
  },
];
// Not shown: the scripts that build a family and their inputs.
const SKIP = /\.(ts|py|css)$|^qr-/;
const PREVIEW = ["png", "svg", "html", "txt"];
// Tracked files only, so a scratch render or a .DS_Store in the folder never reaches the page.
const assetStems = (dir: string) => {
  const ls = spawnSync("git", ["ls-files", "-z", "--", dir], { cwd: ROOT, encoding: "utf8" });
  if (ls.status !== 0) throw new Error(`portal: git ls-files ${dir}: ${ls.stderr}`);
  const stems = new Map<string, string[]>();
  for (const f of ls.stdout
    .split("\0")
    .filter(Boolean)
    .map((p) => basename(p))
    .sort()) {
    if (SKIP.test(f)) continue;
    const stem = f.replace(/\.\w+$/, "");
    stems.set(stem, [...(stems.get(stem) ?? []), f]);
  }
  return stems;
};
const assetCard = (dir: string, stem: string, files: string[], fam: Family) => {
  const id = slug(`${fam.id}-${stem}`);
  index.push({
    t: stem,
    k: "application",
    h: `applications/${id}`,
    x: `${files.join(" ")} ${fam.title}`,
  });
  const ext = (f: string) => f.split(".").pop()!;
  const shown = PREVIEW.map((e) => files.find((f) => ext(f) === e)).find(Boolean);
  const href = (f: string) => `${dir}/${esc(f)}`;
  const view = !shown
    ? `<span class="pdf">${esc(ext(files[0]).toUpperCase())}</span>`
    : /^(html|txt)$/.test(ext(shown))
      ? `<iframe src="${href(shown)}" title="${esc(stem)}" loading="lazy"></iframe>`
      : `<img src="${href(shown)}" alt="${esc(stem)}" loading="lazy">`;
  return `<figure class="asset" id="${id}"><div class="views"><a href="${href(shown ?? files[0])}" target="_blank">${view}</a></div><figcaption>${code(stem)}<span class="dl">${files.map((f) => `<a href="${href(f)}" download>${esc(ext(f))}</a>`).join("")}</span></figcaption></figure>`;
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
const merchFiles = familyStems.get("merch")!;
const merchHtml = `<div class="products">${PRODUCTS.map((p) => {
  const id = `merch-${slug(p.name)}`;
  index.push({
    t: p.name,
    k: "application",
    h: `applications/${id}`,
    x: `merch ${p.stems.join(" ")}`,
  });
  return `<article class="product" id="${id}"><div class="mock">${p.views.map(([svg, c], i) => `<figure${svg.includes('id="lid"') ? ' class="wide"' : ""}>${deferImages(scopeIds(svg, `${id}-${i}`))}<figcaption>${esc(c)}</figcaption></figure>`).join("")}</div><h4>${esc(p.name)}</h4><p>${esc(p.note)}</p><p class="dl">${p.stems.flatMap((st) => (merchFiles.get(st) ?? []).map((f) => `<a href="${MERCH}/${esc(f)}" download>${esc(f)}</a>`)).join("")}</p></article>`;
}).join("")}</div>`;
// Device stickers: each device's SVG inline, all at one scale, with what goes where as its caption.
const DEVICES = "applications/device-stickers";
const deviceHtml = `<div class="devices">${stickerCaptions()
  .map(({ file, title, lines }) => {
    const id = `device-stickers-${file}`;
    index.push({
      t: title,
      k: "application",
      h: `applications/${id}`,
      x: `device stickers ${lines.join(" ")}`,
    });
    const svg = pngFiles(readFileSync(join(ROOT, DEVICES, `${file}.svg`), "utf8")).replace(
      /width="([\d.]+)mm" height="([\d.]+)mm"/,
      (_, w, h) =>
        `width="${(+w * 1.35).toFixed(1)}" height="${(+h * 1.35).toFixed(1)}" role="img" aria-label="${esc(title)}"`,
    );
    return `<figure id="${id}">${deferImages(scopeIds(svg, id))}<figcaption><strong>${esc(title)}</strong>${lines.map((l) => `<span>${esc(l)}</span>`).join("")}<span class="dl"><a href="${DEVICES}/${file}.svg" download>svg</a></span></figcaption></figure>`;
  })
  .join("")}</div>`;
// Mail signature: the template filled for a fictitious person.
const SIGNATURE = "applications/mail-signature";
const signatureTemplate = readFileSync(join(ROOT, SIGNATURE, "template.html"), "utf8");
index.push({
  t: "mail signature",
  k: "application",
  h: "applications/mail-signature",
  x: "mail signature template",
});
const signatureHtml = `<div class="assets"><figure class="asset" id="mail-signature"><div class="views">${frame(fillSignature(signatureTemplate, EXAMPLE, "html"), 'title="mail signature"')}</div><figcaption>the filled template</figcaption></figure></div><p class="dl"><a href="${SIGNATURE}/template.html" download>template.html</a><a href="${SIGNATURE}/template.txt" download>template.txt</a></p>`;
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

const pressHtml = `<p>The photos of the press kit, which the website's press page offers with the logos as one ZIP. Credit: "Photo: ${esc(press.credit)}". Each photo is listed with what it shows in <code>press/press.json</code>.</p>
<div class="assets">${press.photos
  .map((p) => {
    index.push({ t: p.file, k: "press", h: `pressekit/press-${slug(p.file)}`, x: p.shows });
    const cut = "cut" in p ? p.cut : undefined;
    if (cut) index.push({ t: cut, k: "press", h: `pressekit/press-${slug(p.file)}`, x: p.shows });
    return `<figure class="asset" id="press-${slug(p.file)}"><a href="press/${p.file}" target="_blank"><img src="press/${p.file}" alt="${esc(p.shows)}" loading="lazy"></a><figcaption>${code(p.file)}, ${p.width} px, ${esc(p.shows)} <a href="press/${p.file}" download>download</a>${cut ? `, <a href="press/${cut}" download>${code(cut)}</a>` : ""}</figcaption></figure>`;
  })
  .join("")}</div>`;
// The shared elements: each file's own words (its first paragraph and its settings), then its
// sample live in a matrix of the four scales by light and night. Every cell loads the same file;
// only the data-hw-scale on the cell changes.
const ELEMENT_ORDER = SECTIONS.flatMap(([section, els]) =>
  els.map(([name, title, file]) => ({ section, name, title, file })),
);
const sectionId = (section: string) => `el-${section.toLowerCase().replace(/ /g, "-")}`;
const SCALES: [string, string][] = [
  ["screen", "website, verifier: px"],
  ["dense", "os, trainer hub, talks"],
  ["print", "documents: pt"],
  ["stage", "slides: the 1440 stage, at half size"],
];
const elementDoc = (file: string) => {
  const head = readFileSync(join(ROOT, "elements", `${file}.css`), "utf8").match(
    /^\/\*([\s\S]*?)\*\//,
  )![1]!;
  const [rule, settings = ""] = head.split(/\n\s*Settings[^\n]*\n/);
  return {
    words: rule!.replace(/\s+/g, " ").trim(),
    names: [...settings.matchAll(/(--hw-[\w-]+)/g)].map((m) => m[1]!),
  };
};
// A sample's ids, every attribute naming one of them and its radio groups' names, suffixed so they
// stay unique across the cells.
const uniqueIds = (html: string, suffix: string) => {
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const own = (attr: string, token: string) => attr === "id" || attr === "name" || ids.has(token);
  return html.replace(/ ([\w-]+)="([^"]*)"/g, (all, attr: string, value: string) =>
    attr !== "class" && value.split(" ").some((token) => own(attr, token))
      ? ` ${attr}="${value.replace(/\S+/g, (token) => (own(attr, token) ? `${token}-${suffix}` : token))}"`
      : all,
  );
};
const CLASS: Record<string, string> = { "focus-ring": ".hw-focus-ring", link: ".hw-link" };
// Search words for what an element holds beyond its name.
const KEYWORDS: Record<string, string> = {
  field:
    "select dropdown hw-select textarea form-input readonly read-only file upload date combobox datalist autocomplete size small large password toggle",
  "form-field":
    "label hint error message optional fieldset legend validation warning success character count floating label",
  switch: "toggle on off setting",
  range: "slider",
  "error-summary": "validation errors form submit",
  dialog: "modal confirm alertdialog",
  drawer: "sheet offcanvas side panel",
  menu: "dropdown context right click actions",
  command: "cmd k search palette spotlight",
  tooltip: "hint title hover",
  popover: "click reveal glossary",
  toast: "notification snackbar",
  tabs: "tablist panels",
  progress: "loading bar",
  spinner: "loading",
  skeleton: "placeholder loading",
  empty: "blank state nothing yet",
  disclosure: "details summary chevron collapse expand fold",
  accordion: "faq collapse details",
  avatar: "person initials portrait",
  pagination: "pages prev next sequence",
  stepper: "steps wizard progress indicator",
  tree: "hierarchy folders treeitem",
  carousel: "slider swipe scroller",
};
const elementHtml = ({ name, title, file }: { name: string; title: string; file: string }) => {
  const { words, names } = elementDoc(file);
  index.push({
    t: title.toLowerCase(),
    k: "element",
    h: `elements/hw-${name}`,
    x: `hw-${name} ${file}.css${KEYWORDS[name] ? ` ${KEYWORDS[name]}` : ""}`,
  });
  const cell = (scale: string, night: boolean) =>
    `<div class="el-cell" data-hw-scale="${scale}"${night ? ' data-theme="dark"' : ""}><div class="el-inner">${uniqueIds(DEMOS[name]!, `${scale}${night ? "-night" : ""}`)}</div></div>`;
  const row = (night: boolean) =>
    `<span class="el-row label">${night ? "Night" : "Light"}</span>${SCALES.map(([scale]) => cell(scale, night)).join("")}`;
  return `<h4 id="hw-${name}">${title} <code>${CLASS[name] ?? `.hw-${name}`}</code></h4>
<p class="meta">${code(`elements/${file}.css`)} · brand v${pkg.version}</p>
<p>${esc(words)}</p>
<div class="el-matrix"><span></span>${SCALES.map(([scale, note]) => `<span class="el-head"><strong>${scale}</strong><br><span class="meta">${note}</span></span>`).join("")}${row(false)}${row(true)}</div>
<p class="meta">Settings: ${names.map(code).join(" · ")}</p>`;
};
// The element samples' scripts, unminified so their exports `enhance` and `enhanceForms` keep those
// names, as catalog/ElementScript.astro wires the stories.
const bundled = (f: string) => {
  const r = spawnSync(process.execPath, ["build", join(ROOT, f), "--format=esm"], {
    encoding: "utf8",
  });
  if (r.status !== 0) throw new Error(`portal: bun build ${f}: ${r.stderr}`);
  return r.stdout.replace(/<\/script/g, "<\\/script");
};
const BEHAVIOUR = bundled("elements/behaviour.ts");
const FORMS = bundled("elements/form.ts");
const EXPERT_COMPONENTS = readdirSync(join(ROOT, "expert/components"))
  .sort()
  .flatMap((f) => f.match(/^(\w+)\.astro$/)?.[1] ?? []);
const sharedIntro = `<p>Every element two or more systems show lives here once: one CSS file, shown live in light and night at each of the four scales. A system sets the scale, never a colour or a shape, and shows its exceptions in full on its own design-system page, beside a tile per hub element it uses. ${code('@import "@hackersandwizards/brand/elements.css";')} takes them all, ${code("elements/<name>.css")} with ${code("elements/scales.css")} one each; the scale is ${code('data-hw-scale="screen | dense | print | stage"')} on any container. ${code("brand-elements")} measures each element on the system's own page against this rule, in that system's gate.</p>
<p>The list marker is ${code("tokens/marker.css")}. Staying with each system, since they only look alike: total band, section band, stage and status markers, chart bars, slide table, header bars, ghost button. The slide engine's number tile, a step's number on a square, is a slide part.</p>`;
const elementsHtml = `${sharedIntro}
${SECTIONS.map(
  ([section, els]) =>
    `<h3 id="${sectionId(section)}">${section}</h3>\n${els
      .map(([name, title, file]) => elementHtml({ name, title, file }))
      .join("\n")}`,
).join("\n")}
<h3 id="expert-group">Expert: the apps</h3>
<p>The pieces os and the trainer hub both render, dense, in two themes: the expert components (${EXPERT_COMPONENTS.map(code).join(", ")}), each with its stories in <a href="catalog/">the catalog</a>. Their field is ${code("form-input")}, which takes the field's states and the form field's parts above.</p>`;

// Each system's own design-system page, served by its dev server, and the public address its owner
// publishes, which the Pages copy links instead; a system without a page is not listed.
const SYSTEMS = [
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

// A tile's preview of a shared element is its sample in a frame of its own, as a story draws it.
const sampleFrame = (body: string) =>
  frame(
    `<!doctype html><html><head><link rel="stylesheet" href="generated/tokens.root.css"><link rel="stylesheet" href="${ASSETS}/elements.css"><style>body{margin:0;padding:1.5rem;color:var(--color-ink);font:400 var(--text-body)/var(--text-body--line-height) var(--type-body-family)}body>*+*{margin-top:0.5em}:is(p,blockquote,pre){margin-block:0}</style></head><body data-hw-scale="screen">${body}</body></html>`,
    'tabindex="-1" aria-hidden="true" title=""',
  );
// An image under applications/ is in Git LFS and a pointer in a checkout without it: the preview
// leaves the tile rather than show a broken image.
const lfsImage = (src: string) =>
  `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.parentElement.hidden=true">`;
const familyPreview = (f: Family) => {
  if (f.id === "merch") return scopeIds(PRODUCTS[0]!.views[0]![0], "tile-merch");
  if (f.id === "mail-signature")
    return sampleFrame(fillSignature(signatureTemplate, EXAMPLE, "html"));
  const files = [...familyStems.get(f.id)!.values()].flat();
  const svg = files.find((x) => x.endsWith(".svg"));
  const png = files.find((x) => x.endsWith(".png"));
  return svg
    ? `<img src="${f.dir}/${esc(svg)}" alt="" loading="lazy">`
    : png
      ? lfsImage(`${f.dir}/${png}`)
      : "";
};
const swatches = (names: string[]) =>
  `<span class="pv-colours">${names.map((k) => `<span style="background:var(${k})"></span>`).join("")}</span>`;
// One group per view, named so its anchor is the view's key: the rail opens the view itself.
const groups: CatalogGroup[] = [
  {
    name: "Colours",
    items: [
      {
        name: "Neutrals",
        href: "#colours/neutrals",
        note: "Ground, raised, text, muted, lines: one row per job, by day and by night",
        pill: `${neutrals.length} jobs`,
        html: swatches(
          neutrals
            .flatMap((r) => [r.day, r.night])
            .filter((n) => n !== "-")
            .map((n) => `--color-${n}`),
        ),
      },
      {
        name: "Hues",
        href: "#colours/hues",
        note: "Base, text on day, night, two tints and the chart order per hue",
        pill: `${hues.length} hues`,
        html: swatches(hues.map((r) => `--color-${r.base}`)),
      },
    ],
  },
  {
    name: "Type",
    items: [
      {
        name: "Type roles",
        href: "#type",
        note: `${roleNames.join(", ")}: in JetBrains Mono and Inter`,
        pill: `${roleNames.length} roles`,
        html: `<span class="pv-type">${roleNames.map(roleSample).join("")}</span>`,
      },
    ],
  },
  {
    name: "Tokens",
    items: [
      {
        name: "Spacing, radius, shadow, layout",
        href: "#tokens",
        note: `Corners and icons, then ${tokenKinds.join(", ")}`,
        pill: `${otherTokens.length} tokens`,
        html: `<span class="pv-tokens"><span style="border-radius:var(--radius-brand)"></span><span style="box-shadow:var(--shadow-card)"></span><span style="background:var(--gradient-magic)"></span></span>`,
      },
    ],
  },
  {
    name: "Logos",
    items: shownLogos.map((base) => ({
      name: base,
      href: `#logos/logo-${base}`,
      note: LOGO_NOTES[base],
      image: `logos/${base}.svg`,
    })),
  },
  {
    name: "Pictures and motion",
    items: [
      {
        name: "The wizard",
        href: "#wizard",
        note: "One pose, beside the wordmark and alone",
        image: "logos/emoji-256.png",
      },
      {
        name: "Photography",
        href: "#photography",
        note: `The press kit's ${press.photos.length} photos and their credit`,
        image: `press/${press.photos[0]!.file}`,
      },
      {
        name: "Illustration",
        href: "#illustration",
        note: "The marker sketch, from two prompts",
        image: "applications/linkedin-visuals/sketch-example-each-person-owns.png",
      },
      {
        name: "Motion",
        href: "#motion",
        note: "The durations, the brand's ease and reduced motion",
      },
    ],
  },
  {
    name: "Elements",
    items: [
      ...ELEMENT_ORDER.map(({ section, name, title, file }) => ({
        name: title,
        href: `#elements/hw-${name}`,
        note: `${CLASS[name] ?? `.hw-${name}`} · elements/${file}.css`,
        pill: section,
        html: sampleFrame(DEMOS[name]!),
      })),
    ],
  },
  {
    name: "Applications",
    items: FAMILIES.map((f) => ({
      name: f.title,
      href: `#applications/app-${f.id}`,
      note: f.dir ?? "@hackersandwizards/documents",
      pill: f.dir ? `${fileCount(f.id)} files` : undefined,
      html: familyPreview(f),
    })),
  },
  {
    name: "Pressekit",
    items: press.photos.map((p) => ({
      name: p.file,
      href: `#pressekit/press-${slug(p.file)}`,
      note: p.shows,
      pill: `${p.width} px`,
      image: `press/${p.file}`,
    })),
  },
  {
    name: "Words",
    items: [
      {
        name: "Claim",
        href: "#words",
        note: verbal.claim.en,
        pill: "verbal.json",
      },
    ],
  },
  {
    name: "Systems",
    items: SYSTEMS.map(([name, url]) => ({
      name: name!,
      href: url!,
      note: `its design-system page, ${url!.replace(/^https?:\/\//, "")}`,
    })),
  },
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

// The words: each text that has a German and an English version in a column per language, the
// meta in the element's column, every cell one text, so a selection takes one line in one language.
const PAIRS = ["claim", "headline", "mission", "vision", "position", "boilerplate"] as const;
const { word } = verbal.claim;
const metaOf = (k: (typeof PAIRS)[number]) =>
  [
    "since" in verbal[k] && `since ${verbal[k].since}`,
    k === "claim" &&
      `highlight word ${word.en.toLowerCase() === word.de.toLowerCase() ? word.en : `${word.en} / ${word.de}`}`,
    k === "headline" && "the website's home H1",
  ]
    .filter(Boolean)
    .map((m) => `<small class="meta">${esc(m)}</small>`)
    .join("");
// The language tag shows where the columns stack, on a phone.
const tag = (lang: string) => `<span class="hw-label words-tag" data-tone="muted">${lang}</span>`;
const wordText = (v: string | null, lang: string) =>
  v
    ? `<p lang="${lang}">${esc(v)}</p>`
    : `<p><span class="hw-label" data-tone="muted">No ${lang === "de" ? "German" : "English"} text yet</span></p>`;
const wordsHtml = `<p>The claim, mission, vision, values and terms as ${code("verbal/verbal.json")}, exported as ${code("@hackersandwizards/brand/verbal.json")}: a surface imports the text instead of retyping it. Source: ${esc(verbal.source)}</p>
<table class="hw-table words words-cols"><thead><tr><th>Element</th><th>English</th><th>Deutsch</th></tr></thead><tbody>${PAIRS.map(
  (k) =>
    `<tr><td><strong>${k[0]!.toUpperCase() + k.slice(1)}</strong>${metaOf(k)}</td><td data-lang>${tag("EN")}${wordText(verbal[k].en, "en")}</td><td data-lang>${tag("DE")}${wordText(verbal[k].de, "de")}</td></tr>`,
).join("")}</tbody></table>
<h3>Name, values, terms</h3>
${table(
  [],
  [
    [
      "<strong>Name</strong>",
      `<p>${esc(verbal.name.company)}, legal ${esc(verbal.name.legal)}. ${esc(verbal.name.rule)}</p>`,
    ],
    [
      "<strong>Values</strong>",
      verbal.values.map((v) => `<p><strong>${esc(v.name)}</strong>: ${esc(v.line)}</p>`).join(""),
    ],
    [
      "<strong>Terms</strong>",
      `<p>${esc(verbal.terms.primary)}, with its components ${esc(verbal.terms.components.join(", "))}; the anti-pattern: ${esc(verbal.terms.antiPattern)}</p>`,
    ],
  ],
  "hw-table words",
)}
<details class="hw-disclosure words-fold"><summary>Retired lines <span class="hw-disclosure-count">${verbal.retired.length}</span></summary>
<p>No longer used anywhere; each was replaced by the claim, the home headline or the mission. ${code("brand-retired")} fails a build that still shows one.</p>
${table(
  ["Line", "Language", "Retired"],
  verbal.retired.map((r) => [
    `<span lang="${r.lang}">${esc(r.text)}</span>`,
    r.lang.toUpperCase(),
    "retired" in r ? r.retired : "before the claim",
  ]),
  "hw-table",
)}</details>`;

// The four chapters on pictures and motion: what exists, its rule, and what is not set yet. Each
// rule is read from the file that owns it, never retyped here.
const promptLine = (file: string, key: string) =>
  readFileSync(join(ROOT, file), "utf8")
    .match(new RegExp(`^${key}: (.+)$`, "m"))![1]!
    .replace(/ \[[^\]]*\]/g, "");
const motionRule = source
  .match(/\/\*\s*Motion\. ([\s\S]*?)\*\/\s*--motion-fast/)![1]!
  .replace(/\s+/g, " ")
  .trim();
const notSetYet = (items: string[]) =>
  `<h3 class="label">Not set yet</h3><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const photographyHtml = `<p>The brand holds ${press.photos.length} photos, the press kit's: ${press.photos.map((p) => esc(p.shows)).join("; ")}. They are shown under <a href="#pressekit">Pressekit</a>.</p>
<h3 class="label">Rule</h3>
<ul><li>Credit each one "Photo: ${esc(press.credit)}".</li><li>Each is a square JPEG without camera data; a portrait has a 640 px cut beside it for a slide or a small spot.</li><li>Which designs carry a person: "The voice of the visuals" in the Brand Guide in Company OS, which owns it.</li></ul>
${notSetYet(["Crop, light and colour treatment for a new photo.", "Photos of anyone but the founders, and of a training or a team at work."])}`;
const illustrationHtml = `<p>One drawn style: the marker sketch, generated from a prompt the package prints. Two uses:</p>
${table(
  ["Use", "Prompt", "Command", "Examples"],
  [
    [
      "A LinkedIn post image, framed afterwards",
      code("applications/linkedin-visuals/sketch-prompt.txt"),
      code("brand-linkedin-sketch-prompt"),
      `<a href="#applications/app-linkedin-visuals">LinkedIn post images</a>`,
    ],
    [
      "Beside a concept slide's cards",
      code("applications/slide-visuals/sketch-prompt.txt"),
      code("brand-slide-sketch-prompt"),
      `<a href="#applications/app-slides">Slides</a>`,
    ],
  ],
)}
<h3 class="label">Rule</h3>
<p><strong>Style:</strong> ${esc(promptLine("applications/linkedin-visuals/sketch-prompt.txt", "Style/medium"))}.</p>
<p><strong>Constraints:</strong> ${esc(promptLine("applications/linkedin-visuals/sketch-prompt.txt", "Constraints"))}.</p>
<p>Icons are no illustration: the area marks (${code(".hw-mark")} in ${code("tokens/marker.css")}, Lucide) and the disclosure chevron are the only icons the brand exports.</p>
${notSetYet(["A drawn style beside the marker sketch, such as a scene or a character."])}`;
const wizardHtml = `<figure class="asset"><img src="logos/emoji-256.png" alt="The wizard" width="128" height="128"><figcaption>${code("logos/emoji-256.png")}, the wizard alone</figcaption></figure>
<p>One wizard in one pose. Till drew it, and hackers&amp;wizards GmbH holds the rights to it. It appears:</p>
<ul><li>beside the pixel wordmark in the lockup and the compact lockup, under <a href="#logos">Logos</a>, where the gap between wizard and letters is part of the logo;</li><li>alone as ${code("logos/emoji-256.png")}, for a page or document that shows it as an icon;</li><li>alone, die-cut, as the second sticker, under <a href="#applications/app-merch">Merch</a>;</li><li>large below the wordmark on the 1 x 1 m booth banner, under <a href="#applications/app-booth">Booth banners</a>.</li></ul>
<p>Which logo goes where, the wizard alone included: the logo table of the Brand Guide in Company OS, which owns it.</p>
${notSetYet(["A second pose, and where the wizard never appears."])}`;
const motionHtml = `<p>${esc(motionRule)}</p>
${table(
  ["Token", "Value"],
  otherTokens.filter(([k]) => k.startsWith("--motion-")).map(([k, v]) => [code(k), code(v)]),
)}
${notSetYet(["A transition between pages or views."])}`;

const pages: [string, string, string][] = [
  ["colours", "Colours", coloursHtml],
  ["type", "Type", roles],
  ["tokens", "Spacing, radius, shadow, layout", cornersHtml + tokensHtml],
  ["motion", "Motion", motionHtml],
  ["elements", "Elements", elementsHtml],
  [
    "logos",
    "Logos",
    `<p>${logoCount} logos, each one line. The ground picks the cut: on light the day file; on night, black and black textile the night cut, with a grey edge round the wizard; on Purple Love, Stargazer and the gradient the outline cut, a white outline round the letters and a white edge round the wizard. Gap, lift and alignment: <code>docs/assets.md</code>, "The logo".</p>
<p>Which logo goes on which surface: the logo table of the Brand Guide in Company OS, which owns it.</p>
${logosHtml}`,
  ],
  ["wizard", "The wizard", wizardHtml],
  ["photography", "Photography", photographyHtml],
  ["illustration", "Illustration", illustrationHtml],
  ["applications", "Applications: the brand in use", applicationsHtml],
  ["pressekit", "Pressekit", pressHtml],
  ["words", "Words: claim, mission, values", wordsHtml],
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

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>hackers&amp;wizards brand</title>
<meta name="description" content="${esc(LEAD)}">
<link rel="icon" href="logos/favicon.ico" sizes="32x32">
<link rel="icon" href="logos/favicon.svg" type="image/svg+xml">
${FONTS.map((f) => `<link rel="preload" href="tokens/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join("\n")}
<style>${["generated/tokens.root.css", "tokens/print.css", "tokens/marker.css", "expert/header.css"].map(ownCss).join("\n")}
${inline(elementsCss)}
${inline(catalogCss)}</style>
<style>
  /* Controls take the website's own roles: a field is white with the small corner, a choice is a
     pill that fills teal-dark when checked, focus is the 3 px purple ring. */
  html { accent-color: var(--color-teal); }
  body { margin: 0; min-height: 100vh; background: var(--color-bg); color: var(--color-ink); font: var(--type-body-weight) var(--text-small)/1.5 var(--type-body-family); }
  :root { --header-h: var(--spacing-app-header); }
  input[type=search]::-webkit-search-cancel-button { cursor: pointer; }
  /* The overview shows the tiles, quick start and refresh; a search the tiles it hits and the other
     matches; a view its own section only. */
  .hw-catalog:not([data-mode="overview"]) .quick,
  .hw-catalog:not([data-mode="search"]) #results,
  .hw-catalog:not([data-mode="view"]) .portal-views,
  .hw-catalog[data-mode="view"] .hw-catalog-main > :not(.portal) { display: none; }
  .pv-colours { display: grid; grid-template-columns: repeat(8, 1fr); height: 100%; }
  .pv-type { display: block; padding: 1rem; zoom: 0.5; }
  .pv-type p { margin: 0 0 0.75rem; white-space: nowrap; }
  .pv-tokens { display: flex; gap: 1.25rem; align-items: center; justify-content: center; height: 100%; }
  .pv-tokens span { width: 4.5rem; height: 4.5rem; background: var(--color-white); border: 1px solid var(--color-border); }
  .hw-catalog-preview > svg { display: block; width: 100%; height: 100%; }
  /* The portal's own parts, the views included; the catalog shape and its tiles are catalog.css's. */
  .portal {
    --hw-markers: on;
    .quick { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 2rem; margin-top: 2rem; }
    .quick h2 { margin: 0 0 0.5rem; letter-spacing: var(--type-label-tracking); }
    .quick ul { margin: 0; padding-left: 1.25rem; }
    .quick li + li { margin-top: 0.25rem; }
    #results { margin-top: 2rem; }
    .label, th:not(.el-cell *, .hw-table *) { font-family: var(--type-label-family); font-size: var(--type-label-size); letter-spacing: var(--type-label-tracking); text-transform: uppercase; color: var(--color-muted); font-weight: 500; }
    .input { box-sizing: border-box; min-height: 2.5rem; width: 100%; padding: 0 0.875rem; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); background: var(--color-white); color: var(--color-ink); font: inherit; }
    .input:hover { border-color: var(--color-muted); }
    .input:focus-visible { border-color: var(--color-teal); }
    section[data-page] { max-width: var(--container-wide); }
    .portal-views :is(h2, h3, h4):not(.el-cell *) { font-family: var(--font-mono); letter-spacing: -0.02em; }
    .portal-views h2:not(.el-cell *) { font-size: var(--text-h2); margin: 0 0 1rem; }
    .portal-views :is(h3, h4):not(.el-cell *) { font-size: var(--text-h4); margin: 2rem 0 0.75rem; scroll-margin-top: calc(var(--header-h) + 1rem); }
    /* A section of the elements: a ruled heading above its elements. */
    .portal-views h3[id^="el-"] { font-size: var(--text-h3); margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
    .meta { color: var(--color-muted); }
    /* The words view: ruled tables (hw-table) at the view's width, one paragraph per text. */
    .portal-views .hw-table { width: 100%; }
    .portal-views .hw-table p { margin: 0; }
    .portal-views .hw-table p + p { margin-top: 0.25rem; }
    .words { --words-el: 11rem; }
    .words td:first-child { width: var(--words-el); min-width: var(--words-el); }
    .words-cols td[data-lang] { width: calc(50% - var(--words-el) / 2); }
    .words-tag { display: none; }
    .words-cols .meta { display: block; margin-top: 0.125rem; font: 400 0.75rem var(--font-code); white-space: nowrap; }
    .words-fold { margin-top: 2rem; }
    .words-fold > summary { font-family: var(--font-mono); font-size: var(--text-h4); padding: 0.25rem 0; }
    code:not(.el-cell *) { font-family: var(--font-code); font-size: 0.9em; }
    a:not(.el-cell *) { color: var(--color-teal-dark); }
    table:not(.el-cell *, .hw-table) { border-collapse: collapse; width: 100%; background: var(--color-white); }
    :is(th, td):not(.el-cell *, .hw-table *) { text-align: left; vertical-align: top; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); }
    .swatch { all: unset; cursor: copy; display: inline-grid; grid-template-columns: 1.5rem auto; column-gap: 0.5rem; align-items: center; }
    .swatch:focus-visible { outline: 3px solid var(--color-purple); outline-offset: 2px; }
    .swatch span { grid-row: span 2; width: 1.5rem; height: 1.5rem; border-radius: 0; border: 1px solid var(--color-border); }
    .swatch small { grid-column: 2; color: var(--color-muted); font-size: 0.7rem; }
    .swatch.copied small::after { content: " copied"; color: var(--color-teal); }
    .logos { display: grid; gap: 1rem; margin-top: 1.5rem; }
    .logo { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 1rem; }
    .logo h3 { margin: 0.75rem 0 0.25rem; }
    .logo p { margin: 0.25rem 0; }
    .pair { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 0.5rem; }
    .pair figure { margin: 0; border-radius: var(--radius-sm); }
    .pair img { display: block; width: 100%; height: 7.5rem; object-fit: contain; padding: 1rem 1.25rem 0.5rem; box-sizing: border-box; }
    .pair figcaption { padding: 0 0.75rem 0.5rem; font: 0.7rem var(--font-code); color: var(--color-muted); }
    .pair .on-dark figcaption, .pair .on-gradient figcaption { color: rgb(255 255 255 / 0.8); }
    .on-light { background: var(--color-bg); border: 1px solid var(--color-border); }
    .on-dark { background: var(--color-night); }
    .on-gradient { background: var(--gradient-magic); }
    .dl a { display: inline-block; margin: 0.25rem 0.4rem 0 0; padding: 0.15rem 0.5rem; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); color: var(--color-ink); text-decoration: none; font-family: var(--font-code); font-size: 0.75rem; }
    .dl a::before { content: "↓ "; }
    .dl a:hover { background: var(--color-tint); }
    .pv { width: 4rem; height: 2rem; background: var(--color-white); border: 1px solid var(--color-border); }
    .pv.bar { height: 0.5rem; max-width: 100%; background: var(--color-teal); border: 0; }
    .rules { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); margin-bottom: 1rem; }
    .rules > div { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 1rem; }
    .rules > div:has(> .corner-demo) { border-radius: var(--radius-sm); }
    .rules p { margin: 0.5rem 0 0; }
    .corner-demo { height: 3rem; background: var(--color-tint); border: 1px solid var(--color-border); border-radius: var(--radius-brand); }
    .square-demo, .icon-demo, .shape-demo { display: flex; align-items: center; gap: 0.5rem; height: 3rem; margin: 0 !important; }
    .square-demo .sw { width: 1.25rem; height: 1.25rem; background: var(--color-teal); }
    .icon-demo { color: var(--color-teal-dark); font-weight: 500; }
    .role { border-bottom: 1px solid var(--color-border); padding: 0.75rem 0; }
    .role p { margin: 0.25rem 0 0; }
    #results a { display: flex; gap: 0.75rem; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); color: var(--color-ink); text-decoration: none; background: var(--color-white); }
    #results a:hover { background: var(--color-tint); }
    #results a .label { min-width: 7rem; }
    .night-cell { display: inline-block; padding: 0.25rem 0.5rem; background: var(--color-night); color: var(--color-night-ink); border-radius: 0; }
    .night-cell small { color: var(--color-night-muted); }
    .night-cell code { color: inherit; }
    .sw { display: inline-block; width: 1rem; height: 1rem; border-radius: 0; border: 1px solid var(--color-border); vertical-align: -0.2rem; margin-right: 0.3rem; }
    .assets { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
    .products { display: grid; gap: 1rem; }
    .product { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 1rem; scroll-margin-top: 1rem; }
    .product h4 { font-family: var(--font-mono); font-size: var(--text-h4); margin: 0.75rem 0 0.25rem; }
    .product p { margin: 0.25rem 0; }
    .mock { display: grid; gap: 0.5rem; grid-template-columns: repeat(auto-fill, 15.5rem); }
    .mock figure.wide { grid-column: span 2; }
    .mock figure { margin: 0; padding: 0.75rem 0.75rem 0.5rem; background: #e4e6ea; border-radius: var(--radius-sm); }
    .mock svg { display: block; height: 15rem; }
    .devices { display: grid; grid-template-columns: repeat(3, auto); justify-content: start; column-gap: 2rem; }
    .devices figure { margin: 0; display: grid; grid-row: span 2; grid-template-rows: subgrid; row-gap: 0.75rem; }
    .devices svg { display: block; align-self: end; max-width: 100%; height: auto; }
    .devices figcaption { display: grid; align-content: start; gap: 0.25rem; contain: inline-size; min-width: 13rem; }
    .devices figcaption strong { font-family: var(--font-mono); font-size: var(--text-h4); }
    .mock figcaption { margin-top: 0.4rem; font: 0.75rem var(--font-code); color: var(--color-muted); }
    .asset { margin: 0; }
    .asset .views { display: grid; grid-auto-columns: 1fr; grid-auto-flow: column; gap: 0.25rem; }
    .asset .dl { display: block; }
    .asset img, .asset .pdf { display: grid; place-items: center; width: 100%; height: 8rem; object-fit: contain; background: var(--color-tint); border: 1px solid var(--color-border); border-radius: var(--radius-brand); box-sizing: border-box; }
    .asset img[src$=".png"] { object-fit: scale-down; }
    .assets:has(iframe) { grid-template-columns: repeat(auto-fill, minmax(36rem, 1fr)); }
    .el-matrix { display: grid; grid-template-columns: auto repeat(4, minmax(0, 1fr)); gap: 0.5rem; }
    .el-head { align-self: end; }
    .el-row { align-self: center; }
    .el-cell { min-height: 7rem; overflow: hidden; padding: 1rem; border: 1px solid var(--color-border); background: var(--color-white); color: var(--color-ink); font-size: var(--text-body); line-height: var(--text-body--line-height); }
    .el-cell[data-theme="dark"] { border-color: var(--color-night); background: var(--color-night); color: var(--color-night-ink); }
    .el-cell[data-hw-scale="dense"] { font-size: 0.875rem; line-height: 1.5; }
    .el-cell[data-hw-scale="print"] { font-size: var(--type-body-size); line-height: var(--type-body-line-height); }
    .el-cell[data-hw-scale="stage"] > .el-inner { zoom: 0.5; --hw-zoom: 0.5; font-size: 1.5rem; line-height: 1.4; }
    .el-inner > * + *:not(.hw-check-target) { margin-top: 0.5em; }
    .el-inner :is(p, blockquote, pre) { margin-block: 0; }
    .asset iframe { display: block; width: 100%; height: 11.5rem; background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-brand); box-sizing: border-box; }
    .asset figcaption { padding-top: 0.25rem; overflow-wrap: anywhere; font-size: 0.75rem; }
  }
  @media (max-width: 47.98rem) {
    html { scroll-padding-top: calc(var(--header-h) + 1rem); }
    .portal .quick { grid-template-columns: minmax(0, 1fr); }
    .portal #results a { flex-wrap: wrap; gap: 0.25rem 0.75rem; }
    .portal #results a .label { min-width: 0; flex-basis: 100%; }
    .portal .words { --words-el: 5.5rem; }
    .portal .words-cols thead { display: none; }
    .portal .words-cols :is(tr, td) { display: block; }
    .portal .words-cols :is(td, td:first-child) { width: auto; min-width: 0; border-bottom: 0; padding-bottom: 0.25rem; }
    .portal .words-cols td[data-lang] { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr); }
    .portal .words-cols .words-tag { display: block; padding-top: 0.15em; }
    .portal .words-cols tr { border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
  }
</style>
</head>
<body class="hw-focus-ring">
<header class="hw-header">
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
</nav>
</div>
</header>
<main>
${catalogPage}
</main>
<script>
const INDEX = ${JSON.stringify(index).replace(/</g, "\\u003c")};
const cat = document.querySelector(".hw-catalog"), q = cat.querySelector(".hw-catalog-search"), results = document.getElementById("results");
const tiles = [...cat.querySelectorAll(".hw-catalog-tile")];
const h = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const words = () => q.value.toLowerCase().split(/\\s+/).filter(Boolean);
const show = () => {
  const raw = location.hash.slice(1);
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch {} // a stray % in a hand-typed link
  const [page, anchor] = decoded.split("/");
  const view = document.querySelector('section[data-page="' + CSS.escape(page) + '"]') ? page : "";
  const searching = words().length > 0;
  cat.dataset.mode = searching ? "search" : view ? "view" : "overview";
  for (const s of document.querySelectorAll("section[data-page]")) s.hidden = s.dataset.page !== view;
  for (const i of document.querySelectorAll("section[data-page]:not([hidden]) image[data-href]")) i.setAttribute("href", i.dataset.href);
  for (const a of cat.querySelectorAll(".hw-catalog-rail .hw-catalog-names a")) if (!searching && view && [location.hash, "#" + view].includes(a.getAttribute("href"))) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  const el = !searching && (view ? anchor && document.getElementById(anchor) : page !== "overview" && page && document.getElementById(page));
  if (el) { el.scrollIntoView({ block: "start" }); if (view) { el.style.outline = "3px solid var(--color-purple)"; el.style.outlineOffset = "3px"; setTimeout(() => (el.style.outline = ""), 2000); } }
  else scrollTo(0, 0);
};
// The search filters the tiles (renderCatalog) and lists every token, colour, logo, file and photo
// it hits that no shown tile already leads to.
const search = () => {
  const w = words();
  const hit = (s) => w.every((x) => s.toLowerCase().includes(x));
  const shown = new Set(tiles.filter((t) => hit(t.dataset.search)).map((t) => t.getAttribute("href")));
  const hits = INDEX.filter((e) => !shown.has("#" + e.h) && hit(e.t + " " + e.k + " " + (e.x || ""))).slice(0, 60);
  results.innerHTML = hits.length ? '<h2 class="label">Tokens, colours, logos and files</h2>' + hits.map((e) => '<a href="#' + e.h + '"><span class="label">' + e.k + "</span>" + (e.k === "colour" ? '<i style="width:1rem;height:1rem;border-radius:0;border:1px solid var(--color-border);background:' + e.x.split(" ")[0] + '"></i>' : "") + "<strong>" + h(e.t) + "</strong><span class=meta>" + h((e.x || "").slice(0, 80)) + "</span></a>").join("") : shown.size ? "" : "<p>Nothing found.</p>";
  show();
};
q.addEventListener("input", search);
// A link followed from a search clears it; one to the page already open fires no hashchange, so
// the cleared search shows it.
cat.addEventListener("click", (e) => { if (!words().length || !e.target.closest('.hw-catalog-main a[href^="#"]')) return; q.value = ""; q.dispatchEvent(new Event("input", { bubbles: true })); });
addEventListener("hashchange", show);
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
<script type="module">
${BEHAVIOUR}
enhance();
</script>
<script type="module">
${FORMS}
enhanceForms();
</script>
<script>
// On GitHub Pages, links to a system page with a public address leave their local addresses for
// the public ones; a system page without one stays as its name, marked local only.
const PUBLIC = ${JSON.stringify(PUBLIC)};
if (location.hostname.endsWith(".github.io")) for (const a of document.querySelectorAll("a[href]")) { if (a.hostname !== "localhost" && !a.hostname.endsWith(".localhost")) continue; if (PUBLIC[a.href]) a.href = PUBLIC[a.href]; else if (a.matches(".hw-catalog-tile")) { a.removeAttribute("href"); a.querySelector(".hw-catalog-note").append(" (local only)"); } else a.replaceWith(a.textContent + " (local only)"); }
</script>
</body>
</html>
`;

console.log(JSON.stringify({ html, assets }));
