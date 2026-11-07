import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Browser } from "puppeteer-core";
import { findChrome, NO_KEYCHAIN } from "../applications/linkedin-visuals/render";
import { launch } from "../scan/markers";
import catalogs from "../expert/catalogs.json";
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

describe("expert/header.css", () => {
  const css = readFileSync(join(ROOT, "expert/header.css"), "utf8");
  for (const width of [1440, 390])
    it(`makes the whole lockup one link with the pointer and no text selection at ${width} px`, () => {
      expect(misses(css, width)).toEqual([]);
    });
});

// The nav scrolls sideways, so it clips on every side and is exactly as tall as its links: a focus
// ring drawn outside a link lost its top and bottom edges. No consumer sets a ring, so the page gives
// the link one as wide as Chrome's own. A scripted focus does not reliably take in headless Chrome,
// so header.css's :focus-visible rules apply to a class here, and a missing ring reads NaN.
const ringOutside = (css: string): number => {
  const file = join(SCRATCH, "focus.html");
  writeFileSync(
    file,
    `<!doctype html><html><head><style>${readFileSync(join(ROOT, "generated/tokens.root.css"), "utf8")}a.ring{outline:2px solid}${css.replaceAll(":focus-visible", ".ring")}</style></head><body>
<header class="hw-header"><div class="hw-header-row hw-container"><nav class="hw-header-nav"><a class="hw-header-link" href="/a">Deals</a></nav></div></header>
<pre id="out"></pre><script>
const link = document.querySelector(".hw-header-link");
link.classList.add("ring");
const s = getComputedStyle(link);
const grow = s.outlineStyle === "solid" ? parseFloat(s.outlineOffset) + parseFloat(s.outlineWidth) : NaN;
const [l, n] = [link.getBoundingClientRect(), link.parentElement.getBoundingClientRect()];
document.getElementById("out").textContent = String(Math.max(n.top - (l.top - grow), l.bottom + grow - n.bottom));
</script></body></html>`,
  );
  const dom = execFileSync(
    findChrome(),
    [
      "--headless",
      ...NO_KEYCHAIN,
      "--allow-file-access-from-files",
      "--virtual-time-budget=2000",
      "--dump-dom",
      `file://${file}`,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );
  return Number(/<pre id="out">(.*?)<\/pre>/s.exec(dom)![1]);
};

describe("expert/header.css focus", () => {
  it("draws a nav link's focus ring inside the nav, which clips it", () => {
    expect(ringOutside(readFileSync(join(ROOT, "expert/header.css"), "utf8"))).toBeLessThanOrEqual(
      0,
    );
  });
});

// The header with the catalog list (catalogs.json, Mail current) at `width`: whether every link
// lies inside the nav's box and the viewport, the header's height beside --spacing-app-header, and
// the bar's colour. `nested` puts the list in a nav inside the bar's nav group, as scaffolding's
// catalog shell does, followed by a round control. Through puppeteer, since headless Chrome's
// window keeps a minimum width above a phone's.
const style = ["generated/tokens.root.css", "expert/header.css"]
  .map((f) => readFileSync(join(ROOT, f), "utf8"))
  .join("");
const links = catalogs
  .map(
    (c) =>
      `<a class="hw-header-link" href="${c.href}"${c.name === "Mail" ? ' aria-current="page"' : ""}>${c.name}</a>`,
  )
  .join("");

describe("expert/header.css with the catalog list", () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await launch();
  });
  afterAll(() => browser?.close());

  const catalogPage = async (width: number, { theme = "light", nested = false } = {}) => {
    const tab = await browser.newPage();
    await tab.setViewport({ width, height: 800 });
    const nav = nested
      ? `<div class="hw-header-nav"><nav class="hw-header-nav" data-hw-catalogs>${links}</nav></div><button class="hw-header-link" data-icon type="button"><svg></svg></button>`
      : `<nav class="hw-header-nav" data-hw-catalogs>${links}</nav>`;
    await tab.setContent(`<!doctype html><html data-theme="${theme}"><head><style>${style}body{margin:0}</style></head><body>
<header class="hw-header"><div class="hw-header-strip"></div><div class="hw-header-row hw-container">
<a class="hw-header-brand" href="/"><img class="hw-header-logo" alt="" width="8042" height="1489"><span class="hw-header-product">Mail</span></a>
${nav}</div></header>
<div id="probe" style="height: var(--spacing-app-header)"></div></body></html>`);
    const r = await tab.evaluate(() => {
      const box = document.querySelector("[data-hw-catalogs]")!.getBoundingClientRect();
      return {
        inView: [...document.querySelectorAll("[data-hw-catalogs] .hw-header-link")]
          .map((a) => a.getBoundingClientRect())
          .every(
            (b) =>
              b.left >= 0 && b.right <= innerWidth && b.top >= box.top && b.bottom <= box.bottom,
          ),
        height: document.querySelector(".hw-header")!.getBoundingClientRect().height,
        token: document.getElementById("probe")!.getBoundingClientRect().height,
        bg: getComputedStyle(document.querySelector(".hw-header")!).backgroundColor,
      };
    });
    await tab.close();
    return r;
  };

  for (const width of [375, 1440])
    for (const nested of [false, true])
      it(`shows every catalog at ${width} px${nested ? ", nested beside a control" : ""}, the header as tall as --spacing-app-header`, async () => {
        const r = await catalogPage(width, { nested });
        expect(r.inView).toBe(true);
        expect(r.height).toBe(r.token);
      });
  it("takes two rows on a phone and one on a desktop", async () => {
    expect((await catalogPage(375)).height).toBeGreaterThan((await catalogPage(1440)).height);
  });
  it("turns the bar night under a dark html without expert.css or night.css", async () => {
    expect((await catalogPage(1440, { theme: "dark" })).bg).toBe("rgb(11, 17, 24)");
  });
});
