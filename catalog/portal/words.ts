import type { CatalogGroup } from "@hackersandwizards/scaffolding/catalog/render.ts";
import verbal from "../../verbal/verbal.json";
import { code, esc, table } from "./markup";

// The words: each text that has a German and an English version in a column per language, the
// meta in the element's column, every cell one text, so a selection takes one line in one language.
const PAIRS = [
  "claim",
  "headline",
  "descriptor",
  "mission",
  "vision",
  "position",
  "boilerplate",
] as const;
const { word } = verbal.claim;
const metaOf = (k: (typeof PAIRS)[number]) =>
  [
    "since" in verbal[k] && `since ${verbal[k].since}`,
    k === "claim" &&
      `highlight word ${word.en.toLowerCase() === word.de.toLowerCase() ? word.en : `${word.en} / ${word.de}`}`,
    k === "headline" && "the website's home H1",
    k === "descriptor" &&
      "the offer line under the claim on the profile banners, and on the booth banner",
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
    `<tr><td><strong>${k.charAt(0).toUpperCase() + k.slice(1)}</strong>${metaOf(k)}</td><td data-lang>${tag("EN")}${wordText(verbal[k].en, "en")}</td><td data-lang>${tag("DE")}${wordText(verbal[k].de, "de")}</td></tr>`,
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

const wordsGroup: CatalogGroup = {
  name: "Words",
  items: [
    {
      name: "Claim",
      href: "#words",
      note: verbal.claim.en,
      pill: "verbal.json",
    },
  ],
};

export const words = { group: wordsGroup, html: wordsHtml };
