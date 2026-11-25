import { escHtml } from "../../applications/linkedin-visuals/render";

export const esc = (s: unknown) => escHtml(String(s));
export const table = (head: string[], rows: unknown[][], cls?: string) =>
  `<table${cls ? ` class="${cls}"` : ""}>${head.length ? `<thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>` : ""}<tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
export const code = (s: unknown) => `<code>${esc(s)}</code>`;
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// An SVG <image> loads even inside a hidden section, so the merch and device mockups (1.9 MB of
// print files) name theirs in data-href, and show() sets href once their section opens.
export const deferImages = (svg: string) =>
  svg.replace(/(<image\b[^>]*?\s)href="/g, '$1data-href="');

// An SVG inlined more than once keeps its internal ids unique on the page: each one takes a prefix.
export const scopeIds = (svg: string, prefix: string) =>
  svg.replace(/(id="|url\(#|href="#)([^")]+)/g, `$1${prefix}-$2`);

// An image under applications/ is in Git LFS and a pointer in a checkout without it: the preview
// leaves the tile rather than show a broken image.
export const lfsImage = (src: string) =>
  `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.parentElement.hidden=true">`;
