import { readFileSync } from "node:fs";
import type { CatalogGroup } from "@hackersandwizards/scaffolding/catalog/render.ts";
import {
  aliases,
  colorValue,
  palettes,
  parseTokens,
  resolveColors,
  SOURCE,
} from "../../scripts/tokens";
import { code, esc, slug, table } from "./markup";
import type { PortalSearchEntry } from "./search";

export const source = readFileSync(SOURCE, "utf8");
const tokens = parseTokens(source);
const colors = resolveColors(tokens);
const index: PortalSearchEntry[] = [];

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
// A colour cell: a button that copies the hex, filled with that value rather than its token, which
// night turns. A colour in a second cell (muted, a hue that is its own text colour) keeps its anchor
// and search entry on the first.
const anchored = new Set<string>();
const swatch = (hex: string, label = "", id = "") =>
  `<button class="swatch"${id} data-copy="${esc(hex)}" title="Copy ${esc(hex)}"><span style="background:${esc(hex)}"></span>${label}<small>${esc(hex)}</small></button>`;
const colourCell = (name: string, palette: string) => {
  if (name === "-") return `<span class="meta">none</span>`;
  const k = `--color-${name}`;
  const first = !anchored.has(k);
  anchored.add(k);
  const hex = colors[k];
  if (hex === undefined) throw new Error(`Colour token missing: ${k}`);
  if (first)
    index.push({
      t: k,
      k: "colour",
      h: `colours/color-${slug(name)}`,
      x: `${hex} ${palette}`,
    });
  return swatch(hex, code(name), first ? ` id="color-${slug(name)}"` : "");
};
const tintCell = (base: string, p: number) => {
  const k = tintToken(base, p);
  return k
    ? colourCell(k.slice("--color-".length), "Hues")
    : swatch(colorValue(tokens)(hueMix(base, p)));
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
const chartCell = (series: string) => {
  const label = code(series);
  const colour = tokens[series]?.match(/--color-([\w-]+)/)?.[1];
  if (colour === undefined) throw new Error(`Chart colour reference missing: ${series}`);
  return `${label} ${code(colour)}`;
};
const hueRows = hues.map((r) => {
  const series = chartOf(r.base, r.text);
  return [
    colourCell(r.base, "Hues"),
    esc(r.job),
    colourCell(r.text, "Hues"),
    nightCell(r.night, "Hues"),
    tintCell(r.base, 7),
    tintCell(r.base, 40),
    series ? chartCell(series) : "",
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
export const otherTokens = Object.entries(tokens).filter(
  ([k]) => !/^--(color|type|text|chart)-/.test(k),
);
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
<div><div class="corner-demo"></div><p>The brand corner, ${code("--radius-brand")}: only on a block or action that stands alone in its view on a marketing website, deck or document — a hero panel, a single callout, a cover box, a lone button, a single code block or a dialog. Never on a card, tile or button that repeats in a grid, list or row, never inside another brand-cornered block, and never in internal tools (Company OS, admin, trainer hub).</p></div>
<div><p class="shape-demo"><span class="hw-label hw-label-box">Part one</span></p><p>The small corner, ${code("--radius-sm")}: everything one text line tall that is no pill (a label box, a number tile, inline code, a segmented control and its segments, every form field and the button beside one, a picture in a mail), every repeated card, tile or button in a grid, list or row, every block inside a brand-cornered block, and every block and button in internal tools.</p></div>
<div><p class="shape-demo"><span class="hw-pill">Remote</span> <span class="hw-icon-button">${LUCIDE_CHECK}</span></p><p>Round, ${code("--radius-pill")}: chips, badges and toggles, and every control that holds only an icon.</p></div>
<div><p class="square-demo"><span class="sw"></span><span class="sw" style="background:var(--color-purple)"></span><span class="sw" style="background:var(--color-teal-dark)"></span></p><p>Square: a mark smaller than a line, a list marker or a colour swatch.</p></div>
<div><p class="icon-demo">${LUCIDE_CHECK} Delivered</p><p>Icons are Lucide line icons in the colour of their text, never emoji. A kind of label carries an icon on every value or on none.</p></div>
<div><div class="shape-demo"><hr class="hw-rule" data-variant="bar" aria-hidden="true"></div><p>A rule line under a title or over a block is teal; the gradient stays on the strip along the top edge.</p></div>
</div>`;

const swatches = (names: string[]) =>
  `<span class="pv-colours">${names.map((k) => `<span style="background:${colors[k]}"></span>`).join("")}</span>`;

const coloursGroup: CatalogGroup = {
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
};
const typeGroup: CatalogGroup = {
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
};
const tokensGroup: CatalogGroup = {
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
};

export const tokenReference = {
  index,
  colours: { html: coloursHtml, group: coloursGroup },
  type: { html: roles, group: typeGroup },
  tokens: { html: cornersHtml + tokensHtml, group: tokensGroup },
};
