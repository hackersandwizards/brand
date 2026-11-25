import { escHtml } from "../../applications/linkedin-visuals/render";

export const esc = (s: unknown) => escHtml(String(s));
export const table = (head: string[], rows: unknown[][], cls?: string) =>
  `<table${cls ? ` class="${cls}"` : ""}>${head.length ? `<thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>` : ""}<tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
export const code = (s: unknown) => `<code>${esc(s)}</code>`;
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
