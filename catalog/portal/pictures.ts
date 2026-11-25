import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CatalogGroup } from "@hackersandwizards/scaffolding/catalog/render.ts";
import press from "../../press/press.json";
import { ROOT } from "../../scripts/git";
import { code, esc, lfsImage, table } from "./markup";
import { otherTokens, source } from "./token-reference";

// The four chapters on pictures and motion, whose motion rule, sketch style and constraints and
// photo credit are read from the files that own them, never retyped here.
const promptLine = (prompt: string, key: string) =>
  prompt.match(new RegExp(`^${key}: (.+)$`, "m"))![1]!.replace(/ \[[^\]]*\]/g, "");
const motionRule = source
  .match(/\/\*\s*Motion\. ([\s\S]*?)\*\/\s*--motion-fast/)![1]!
  .replace(/\s+/g, " ")
  .trim();
const sketchRule = (use: string, file: string) => {
  const prompt = readFileSync(join(ROOT, file), "utf8");
  return `<h3 class="label">Rule for ${use}</h3>
<p><strong>Style:</strong> ${esc(promptLine(prompt, "Style/medium"))}.</p>
<p><strong>Constraints:</strong> ${esc(promptLine(prompt, "Constraints"))}.</p>`;
};
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
${sketchRule("a LinkedIn post image", "applications/linkedin-visuals/sketch-prompt.txt")}
${sketchRule("a slide sketch", "applications/slide-visuals/sketch-prompt.txt")}
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

const picturesGroup: CatalogGroup = {
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
      html: lfsImage("applications/linkedin-visuals/sketch-example-each-person-owns.png"),
    },
    {
      name: "Motion",
      href: "#motion",
      note: "The durations, the brand's ease and reduced motion",
    },
  ],
};

export const pictures = {
  group: picturesGroup,
  wizardHtml,
  photographyHtml,
  illustrationHtml,
  motionHtml,
};
