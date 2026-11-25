import { createHash } from "node:crypto";
import { join } from "node:path";
import { ROOT } from "../../scripts/git";
import { flat } from "../../scripts/tokens";

// Files the page loads beside it (catalog-assets/, served by their own route): its frames'
// documents, the elements as one stylesheet, so each sample frame loads one file instead of
// elements.css and its imports, and each PNG an inlined SVG embeds, so the HTML carries no image
// as base64 text (the MacBook stickers' wizard was 0.95 MB of 1.28 MB).
const ASSETS = "catalog-assets";
export const elementsCss = flat(join(ROOT, "elements/elements.css"));

export class PortalAssets {
  readonly files: Record<string, string> = {
    "elements.css": Buffer.from(elementsCss).toString("base64"),
  };

  // An asset named by its content's hash; returns its path from the page.
  private hashedAsset(content: string | Buffer, ext: string) {
    const name = `${createHash("sha256").update(content).digest("hex").slice(0, 16)}.${ext}`;
    this.files[name] = Buffer.from(content).toString("base64");
    return `${ASSETS}/${name}`;
  }

  // Gives each PNG embedded in an SVG a URL beside the portal.
  pngFiles(svg: string) {
    return svg.replace(
      /href="data:image\/png;base64,([A-Za-z0-9+/=]+)"/g,
      (_, data: string) => `href="${this.hashedAsset(Buffer.from(data, "base64"), "png")}"`,
    );
  }

  // A frame's document is a file beside the page too: Chrome loads a srcdoc frame at once, below the
  // fold or in a hidden view, where an src frame waits for loading="lazy" (FCP 4.4 s to 1.8 s on
  // Lighthouse mobile). Its links stay relative to the page through <base>.
  frame(doc: string, attrs: string) {
    const src = this.hashedAsset(
      doc.includes("<head>")
        ? doc.replace("<head>", '<head><base href="../">')
        : `<!doctype html><base href="../">${doc}`,
      "html",
    );
    return `<iframe src="${src}" ${attrs} loading="lazy"></iframe>`;
  }

  // A tile's preview of a shared element is its sample in a frame of its own, as a story draws it.
  sampleFrame(body: string) {
    return this.frame(
      `<!doctype html><html><head><link rel="stylesheet" href="generated/tokens.root.css"><link rel="stylesheet" href="${ASSETS}/elements.css"><style>body{margin:0;padding:1.5rem;color:var(--color-ink);font:400 var(--text-body)/var(--text-body--line-height) var(--type-body-family)}body>*+*:where(:not(.hw-check-target)){margin-top:0.5em}@layer base{:is(p,blockquote,pre){margin-block:0}}</style></head><body class="hw-focus-ring" data-hw-scale="screen">${body}</body></html>`,
      'tabindex="-1" aria-hidden="true" title=""',
    );
  }
}
