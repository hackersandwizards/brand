import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EXAMPLE, fillSignature } from "../../applications/mail-signature/fill";
import { ROOT } from "../../scripts/git";
import type { PortalAssets } from "./assets";
import type { SearchableSection } from "./search";

// Mail signature: the template filled for a fictitious person.
const SIGNATURE = "applications/mail-signature";
const signatureTemplate = readFileSync(join(ROOT, SIGNATURE, "template.html"), "utf8");
const signatureDocument = fillSignature(signatureTemplate, EXAMPLE, "html");

// Shows the filled example signature and links the unfilled templates.
export function renderSignature(assets: PortalAssets): SearchableSection {
  return {
    index: [
      {
        t: "mail signature",
        k: "application",
        h: "applications/mail-signature",
        x: "mail signature template",
      },
    ],
    html: `<div class="assets"><figure class="asset" id="mail-signature"><div class="views">${assets.frame(signatureDocument, 'title="mail signature"')}</div><figcaption>the filled template</figcaption></figure></div><p class="dl"><a href="${SIGNATURE}/template.html" download>template.html</a><a href="${SIGNATURE}/template.txt" download>template.txt</a></p>`,
  };
}

// Frames the filled signature for its family tile.
export const signaturePreview = (assets: PortalAssets) => assets.sampleFrame(signatureDocument);
