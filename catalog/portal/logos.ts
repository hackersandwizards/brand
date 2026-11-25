import type { CatalogGroup } from "@hackersandwizards/scaffolding/catalog/render.ts";
import manifest from "../../manifest.json";
import logoRules from "../../logos/logos.json";
import { esc, table } from "./markup";
import type { PortalSearchEntry } from "./search";

const index: PortalSearchEntry[] = [];

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
      ? `<figure class="${cls}"${cls === "on-light" ? ' data-theme="light"' : ""}><img src="${src}" alt="${esc(base)}, ${esc(label)}" loading="lazy"><figcaption>${esc(label)}</figcaption></figure>`
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

const logosGroup: CatalogGroup = {
  name: "Logos",
  items: shownLogos.map((base) => ({
    name: base,
    href: `#logos/logo-${base}`,
    note: LOGO_NOTES[base],
    // The day file on the day ground, the night cut on the night one, as the logo rule says.
    html: `<img src="logos/${base}.svg" alt="" loading="lazy"><img class="tile-night" src="logos/${base}-night.svg" alt="" loading="lazy">`,
  })),
};

export const logos = {
  group: logosGroup,
  index,
  html: `<p>${logoCount} logos, each one line. The ground picks the cut: on light the day file; on night, black and black textile the night cut, with a grey edge round the wizard; on Purple Love, Stargazer and the gradient the outline cut, a white outline round the letters and a white edge round the wizard. Gap, lift and alignment: <code>docs/assets.md</code>, "The logo".</p>
<p>Which logo goes on which surface: the logo table of the Brand Guide in Company OS, which owns it.</p>
${logosHtml}`,
};
