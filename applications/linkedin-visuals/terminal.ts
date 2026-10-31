#!/usr/bin/env bun
/**
 * Renders a LinkedIn terminal snippet as a PNG for frame.ts: a dark window with a title, four to six
 * lines of code at 21 px, one line highlighted and a purple note under it, trimmed to the window, so
 * the frame shows it at full width. A line holds at most 36 characters: the window clips the rest.
 *
 *   bun run brand-linkedin-terminal <spec.json> <out.png>
 *
 * Without arguments it prints the spec format.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { tokens } from "../../generated/tokens";
import { escHtml, linkedinCss, screenshot } from "./render";

interface Spec {
  title: string;
  lines: string[];
  highlight: number;
  note: string;
}

const [SIZE, SCALE] = [540, 2];
const COLOR: Record<string, string> = {
  t: "var(--color-teal-night)",
  p: "var(--color-purple-night)",
  r: "var(--color-red-night)",
  c: "var(--color-night-subtle)",
};

const codeLine = (s: string) =>
  escHtml(s).replace(
    /&lt;([tprc])&gt;(.*?)&lt;\/\1&gt;/g,
    (_, tag: string, text: string) => `<span style="color:${COLOR[tag]}">${text}</span>`,
  ) || "&nbsp;";

function terminalHtml({ title, lines, highlight, note }: Spec): string {
  const rows = lines
    .map((l, i) =>
      i === highlight
        ? `<div class="row hi">${codeLine(l)}</div><div class="note"><span>&uarr; ${escHtml(note)}</span></div>`
        : `<div class="row">${codeLine(l)}</div>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>${linkedinCss()}
html, body { margin: 0; width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; }
body { box-sizing: border-box; background: var(--color-bg); padding: 30px 22px; display: flex; align-items: center; }
.win { width: 100%; background: var(--color-night); border-radius: 12px; overflow: hidden; }
.bar { height: 34px; background: var(--color-night-2); display: flex; align-items: center; gap: 7px; padding-left: 14px;
  font: 500 15px var(--font-code); color: var(--color-night-subtle); }
.bar i { width: 10px; height: 10px; border-radius: 50%; background: color-mix(in srgb, white 18%, var(--color-night)); }
.bar span { margin-left: 10px; }
.code { padding: 16px 0 20px; font: 500 21px/1.6 var(--font-code); color: var(--color-night-ink); }
.row { white-space: pre; padding: 2px 14px; }
.hi { background: color-mix(in srgb, var(--color-purple) 28%, transparent); box-shadow: inset 4px 0 0 var(--color-purple-night); }
.note { padding: 6px 14px 10px; }
.note span { display: inline-block; background: var(--color-purple); color: white; font: 700 19px/1.25 var(--font-mono);
  padding: 8px 12px; border-radius: 6px; }
</style></head><body><div class="win">
<div class="bar"><i></i><i></i><i></i><span>${escHtml(title)}</span></div>
<div class="code">${rows}</div></div></body></html>`;
}

if (import.meta.main) {
  const [specPath, output] = process.argv.slice(2);
  if (!specPath || !output) {
    console.error(
      'usage: brand-linkedin-terminal <spec.json> <out.png>\nspec.json: { "title": "gh pr list", "lines": ["..."], "highlight": 1, "note": "..." }, four to six lines of at most 36 characters, highlight the 0-based index of the line the note explains; a line marks a span with <t>teal</t>, <p>purple</p>, <r>red</r> or <c>grey</c>.',
    );
    process.exit(2);
  }
  const dir = mkdtempSync(join(tmpdir(), "linkedin-terminal-"));
  try {
    writeFileSync(join(dir, "t.html"), terminalHtml(JSON.parse(readFileSync(specPath, "utf-8"))));
    rmSync(output, { force: true });
    await screenshot(dir, "t.html", [SIZE, SIZE, SCALE], join(dir, "t.png"));
    await sharp(join(dir, "t.png"))
      .trim({ background: tokens["--color-bg"], threshold: 6 })
      .toFile(resolve(output));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
