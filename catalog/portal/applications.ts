import type { CatalogGroup } from "@hackersandwizards/scaffolding/catalog/render.ts";
import { MARK } from "../../applications/avatars/generate";
import { type ApplicationAsset, assetCard, assetStems } from "./application-assets";
import type { PortalAssets } from "./assets";
import { renderDeviceStickers } from "./device-stickers";
import { lfsImage } from "./lfs-image";
import { esc, slug, table } from "./markup";
import { merchPreview, renderMerch } from "./merch";
import type { SearchableSection } from "./search";
import { renderSignature, signaturePreview } from "./signature";

type Family = {
  id: string;
  title: string;
  note: string;
  dir?: string;
  packageName?: string;
  // Pages elsewhere that show the family, as [label, href]: an engine's published catalog and
  // its repository on GitHub.
  links?: [string, string][];
};
const FAMILY_DESCRIPTIONS: Family[] = [
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
  },
  {
    id: "device-stickers",
    title: "Device stickers",
    note: "One sticker combination per company device, upright like the Apple logo and centred left to right. Drawn to scale from Apple's dimensions (MacBook Pro 14-inch, iPhone 18 Pro, iPad Pro 11-inch); the dashed line is the device's centre, the measure runs from the bottom edge to the centre of the wordmark sticker. The print files are under Merch.",
    dir: "applications/device-stickers",
  },
  {
    id: "mail-signature",
    title: "Mail signature",
    note: "One signature for every mail from an h&w account, new mails and replies alike, from one template with placeholders: the typed wordmark in colour, name, role, contact line and the three lines § 35a GmbHG requires. `bun run brand-mail-signature` writes an HTML file to open in a browser and copy into the mail client, and a plain-text file for the iPhone. Links in teal #1A7285 (5.54:1 on white). Shown with a fictitious person.",
    dir: "applications/mail-signature",
  },
  {
    id: "slides",
    title: "Slides",
    note: "Decks come from the slide engine, the package @hackersandwizards/slides; there is no template file. Its catalog shows one slide of every type. The slide logo: the lockup on the title and the closing slide, the wordmark alone on every other slide. A concept slide that claims a mechanism in a few short cards may carry a generated marker sketch beside them: brand-slide-sketch-prompt prints the prompt and the worked example, the sketch-example card here; Deck structure in the slides repository, linked below, says which slides get one.",
    dir: "applications/slide-visuals",
    links: [
      ["Slide catalog", "https://hackersandwizards.github.io/slides/"],
      ["slides on GitHub", "https://github.com/hackersandwizards/slides"],
      [
        "Deck structure",
        "https://github.com/hackersandwizards/slides/blob/main/docs/deck-structure.md",
      ],
    ],
  },
  {
    id: "documents",
    packageName: "@hackersandwizards/documents",
    title: "Documents",
    note: "Proposals, rate cards, Leistungsnachweise, certificates and handouts come from the document engine, the package @hackersandwizards/documents, rendered by Company OS and the trainer hub. Its catalog shows every document type with invented data.",
    links: [
      ["Document catalog", "https://hackersandwizards.github.io/documents/"],
      ["documents on GitHub", "https://github.com/hackersandwizards/documents"],
    ],
  },
  {
    id: "mail",
    packageName: "@hackersandwizards/mail",
    title: "Mail",
    note: "Designed mails, such as the monthly customer update, come from the mail engine, the package @hackersandwizards/mail: React Email components on the brand tokens and a command that renders a mail's HTML and plain-text parts from a data file, used by Company OS. Its catalog shows every building block and every mail type with invented data. A personal mail carries the signature above.",
    links: [
      ["Mail catalog", "https://hackersandwizards.github.io/mail/"],
      ["mail on GitHub", "https://github.com/hackersandwizards/mail"],
    ],
  },
];

const FAMILIES = FAMILY_DESCRIPTIONS.map((f) => ({
  ...f,
  stems: f.dir ? assetStems(f.dir) : new Map<string, ApplicationAsset>(),
}));
type FamilyWithAssets = (typeof FAMILIES)[number];
const fileCount = (family: FamilyWithAssets) =>
  [...family.stems.values()].reduce((count, asset) => count + asset.files.length, 0);

function renderApplicationCard(asset: ApplicationAsset, family: Family) {
  const id = slug(`${family.id}-${asset.stem}`);
  return {
    html: assetCard(asset, id),
    entry: {
      t: asset.stem,
      k: "application",
      h: `applications/${id}`,
      x: `${asset.files.join(" ")} ${family.title}`,
    },
  };
}

function renderAssetCards(family: FamilyWithAssets): SearchableSection {
  if (!family.dir) return { html: "", index: [] };
  const cards = [...family.stems.values()].map((asset) => renderApplicationCard(asset, family));
  return {
    html: `<div class="assets">${cards.map(({ html }) => html).join("")}</div>`,
    index: cards.map(({ entry }) => entry),
  };
}

function familyHtml(f: Family, body: string) {
  const links = f.links
    ? `<p class="dl">${f.links.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</p>`
    : "";
  return `<h3 id="app-${f.id}">${esc(f.title)}</h3><p>${esc(f.note)}</p>${links}${f.dir ? `<p class="meta">${esc(f.dir)}</p>${body}` : ""}`;
}

export function renderApplications(assets: PortalAssets): SearchableSection {
  // A family that draws its own section instead of one card per file.
  // Search lists these sections first, then the tracked-file cards in family order.
  const merch = FAMILIES.find(({ id }) => id === "merch");
  if (merch === undefined) throw new Error("Application family missing: merch");
  const sections = new Map<string, SearchableSection>([
    ["merch", renderMerch(merch.stems)],
    ["device-stickers", renderDeviceStickers(assets)],
    ["mail-signature", renderSignature(assets)],
  ]);
  const families = FAMILIES.map((family) => {
    const section = sections.get(family.id) ?? renderAssetCards(family);
    sections.set(family.id, section);
    return familyHtml(family, section.html);
  });
  const applicationsHtml = `<p>Every family of brand files in use. The files sit in applications/ of this repo.</p>
${table(
  ["Family", "Files"],
  FAMILIES.map((f) => [
    `<a href="#applications/app-${f.id}">${esc(f.title)}</a>`,
    f.dir ? String(fileCount(f)) : "",
  ]),
)}
${families.join("")}`;
  return { html: applicationsHtml, index: [...sections.values()].flatMap(({ index }) => index) };
}

// Picks the format the family tile can show directly.
const familyPreview = (f: FamilyWithAssets, assets: PortalAssets) => {
  if (f.id === "merch") return merchPreview();
  if (f.id === "mail-signature") return signaturePreview(assets);
  const files = [...f.stems.values()].flatMap(({ files }) => files);
  const svg = files.find((x) => x.endsWith(".svg"));
  const png = files.find((x) => x.endsWith(".png"));
  return svg
    ? `<img src="${f.dir}/${esc(svg)}" alt="" loading="lazy">`
    : png
      ? lfsImage(`${f.dir}/${png}`)
      : "";
};

export const applicationsGroup = (assets: PortalAssets): CatalogGroup => ({
  name: "Applications",
  items: FAMILIES.map((f) => ({
    name: f.title,
    href: `#applications/app-${f.id}`,
    note: f.dir ?? f.packageName,
    pill: f.dir ? `${fileCount(f)} files` : undefined,
    html: familyPreview(f, assets),
  })),
});
