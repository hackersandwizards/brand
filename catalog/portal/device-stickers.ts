import { readFileSync } from "node:fs";
import { join } from "node:path";
import { stickerCaptions } from "../../applications/device-stickers/devices";
import { ROOT } from "../../scripts/git";
import type { PortalAssets } from "./assets";
import { esc } from "./markup";
import type { SearchableSection } from "./search";
import { deferImages, scopeIds } from "./svg-mockups";

// Device stickers: each device's SVG inline, all at one scale, with what goes where as its caption.
const DEVICES = "applications/device-stickers";
export function renderDeviceStickers(assets: PortalAssets): SearchableSection {
  const devices = stickerCaptions().map(({ file, title, lines }) => {
    const id = `device-stickers-${file}`;
    const entry = {
      t: title,
      k: "application",
      h: `applications/${id}`,
      x: `device stickers ${lines.join(" ")}`,
    };
    const svg = assets
      .pngFiles(readFileSync(join(ROOT, DEVICES, `${file}.svg`), "utf8"))
      .replace(
        /width="([\d.]+)mm" height="([\d.]+)mm"/,
        (_, w, h) =>
          `width="${(+w * 1.35).toFixed(1)}" height="${(+h * 1.35).toFixed(1)}" role="img" aria-label="${esc(title)}"`,
      );
    const html = `<figure id="${id}">${deferImages(scopeIds(svg, id))}<figcaption><strong>${esc(title)}</strong>${lines.map((l) => `<span>${esc(l)}</span>`).join("")}<span class="dl"><a href="${DEVICES}/${file}.svg" download>svg</a></span></figcaption></figure>`;
    return { html, entry };
  });
  return {
    html: `<div class="devices" data-theme="light">${devices.map(({ html }) => html).join("")}</div>`,
    index: devices.map(({ entry }) => entry),
  };
}
