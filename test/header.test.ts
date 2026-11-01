import { afterAll, describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findChrome, NO_KEYCHAIN } from "../applications/linkedin-visuals/render";
import { ROOT } from "../scripts/git";

const SCRATCH = mkdtempSync(join(tmpdir(), "hw-header-"));
afterAll(() => rmSync(SCRATCH, { recursive: true, force: true }));

// The header's markup from the opening comment of header.css, in headless Chrome. Every point of a
// grid over the lockup lands in the one link, with the pointer and no text selection (Benedikt
// 2026-11-01: "das logo ist teilweise nicht auf der ganzen fläche verlinkt").
const page = (css: string) => `<!doctype html><html><head><style>
${readFileSync(join(ROOT, "generated/tokens.root.css"), "utf8")}
${css}
</style></head><body>
<header class="hw-header"><div class="hw-header-strip"></div><div class="hw-header-row hw-container">
<a class="hw-header-brand" href="/" aria-label="hackers&amp;wizards OS"><img class="hw-header-logo" src="file://${ROOT}/logos/lockup-screen.svg" alt="" width="8042" height="1489"><img class="hw-header-logo-night" src="file://${ROOT}/logos/lockup-screen-night.svg" alt="" width="8196" height="1641"><span class="hw-header-product">OS</span></a>
<nav class="hw-header-nav"><a class="hw-header-link" href="/a">Deals</a></nav></div></header>
<pre id="out"></pre>
<script>
const link = document.querySelector(".hw-header-brand");
const boxes = [link, ...link.querySelectorAll("*")].map((e) => e.getBoundingClientRect()).filter((b) => b.width > 2 && b.height > 2);
const [l, t] = [Math.min(...boxes.map((b) => b.left)), Math.min(...boxes.map((b) => b.top))];
const [r, b] = [Math.max(...boxes.map((b) => b.right)), Math.max(...boxes.map((b) => b.bottom))];
const misses = [];
for (let y = 0; y < 8; y++) for (let x = 0; x < 16; x++) {
  const el = document.elementFromPoint(l + ((x + 0.5) * (r - l)) / 16, t + ((y + 0.5) * (b - t)) / 8);
  const style = el && getComputedStyle(el);
  if (!el || !link.contains(el) || style.cursor !== "pointer" || style.userSelect !== "none")
    misses.push(el ? el.tagName + ":" + style.cursor + ":" + style.userSelect : "nothing");
}
document.getElementById("out").textContent = JSON.stringify(misses);
</script></body></html>`;

const misses = (css: string, width: number): string[] => {
  const file = join(SCRATCH, `header-${width}.html`);
  writeFileSync(file, page(css));
  const dom = execFileSync(
    findChrome(),
    [
      "--headless",
      ...NO_KEYCHAIN,
      "--allow-file-access-from-files",
      `--window-size=${width},900`,
      "--virtual-time-budget=2000",
      "--dump-dom",
      `file://${file}`,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );
  return JSON.parse(/<pre id="out">(.*?)<\/pre>/s.exec(dom)![1].replace(/&quot;/g, '"'));
};

// Needs Chrome, as the LinkedIn renderers do.
describe("expert/header.css", () => {
  const css = readFileSync(join(ROOT, "expert/header.css"), "utf8");
  for (const width of [1440, 390])
    it(`makes the whole lockup one link with the pointer and no text selection at ${width} px`, () => {
      expect(misses(css, width)).toEqual([]);
    });
});
