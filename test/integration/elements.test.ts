import { defined } from "@hackersandwizards/scaffolding/defined";
import { limit } from "@hackersandwizards/scaffolding/test-timeout";
import { afterAll, assert, beforeAll, expect, test } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { transform } from "lightningcss";
import type { Browser } from "puppeteer-core";
import own from "../../package.json";
import { installElementDom } from "../../scan/element-dom";
import { ELEMENTS } from "../../scan/element-rules";
import { elementPage, measureLightPage, measurePage } from "../../scan/element-page";
import { launch, open } from "../../scan/browser";
import type { Csp } from "../../scan/browser-csp";
import { DEMOS } from "../../catalog/element-demos";
import { ROOT } from "../../scripts/git";
import { DRIFT } from "../element-drift";
import { createBrowserColorProbe } from "./color-probe";

declare const browserDefined: typeof defined;

// Every element in every scale and theme, as a spoke's page shows it: tiles holding the samples.
const brand = (f: string) => pathToFileURL(join(ROOT, f)).href;
const tiles = Object.keys(ELEMENTS)
  .map(
    (name) =>
      `<div data-hw-tile="${name}" data-hw-version="${own.version}">${DEMOS[name] ?? ""}</div>`,
  )
  .join("\n");
const page = (css = "") => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${brand("generated/tokens.root.css")}">
<link rel="stylesheet" href="${brand("tokens/print.css")}">
<link rel="stylesheet" href="${brand("elements/elements.css")}">
<style>body { font-family: var(--font-sans); } [data-hw-exception] td { padding-left: 9px } ${css}</style></head>
<body class="hw-focus-ring">
${["screen", "dense", "print", "stage"]
  .flatMap((scale) =>
    ["light", "dark"].map(
      (theme) =>
        `<section data-hw-scale="${scale}" data-theme="${theme}">${theme === "light" ? tiles : tiles.replaceAll("data-hw-tile", "data-hw-sample")}</section>`,
    ),
  )
  .join("\n")}
<div data-hw-exception="total-band"><table class="hw-table"><tr><td>Sum</td></tr></table></div>
</body></html>`;

const only = (body: string, bodyClass = "", sheets: string[] = []) =>
  `<!doctype html><html><head>${["generated/tokens.root.css", "elements/elements.css", ...sheets].map((f) => `<link rel="stylesheet" href="${brand(f)}">`).join("")}</head><body class="${bodyClass}">${body}</body></html>`;

const dir = mkdtempSync(join(tmpdir(), "brand-elements-"));
const file = (name: string, html: string) => {
  writeFileSync(join(dir, name), html);
  return join(dir, name);
};

/** A fixture page with a resolved navigation URL and its report name. */
const targetFile = (name: string, html: string) => elementPage(file(name, html));

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(async () => {
  await browser?.close();
  rmSync(dir, { recursive: true, force: true });
});

// An element inside an exception's instance is not measured.
test(
  "every element matches its rule in every scale and theme",
  async () => {
    const r = await measurePage(browser, targetFile("clean.html", page()));
    expect(r.findings).toEqual([]);
    expect(r.seen.sort()).toEqual(Object.keys(ELEMENTS).sort());
    expect(r.exceptions).toEqual(["total-band"]);
  },
  limit(60_000),
);

test.each(Object.entries(DRIFT))(
  "a drifted %s is red",
  async (name, css) => {
    const r = await measurePage(browser, targetFile(`drift-${name}.html`, page(css)));
    expect(r.findings.some((f) => f.element === name)).toBe(true);
  },
  limit(60_000),
);

test(
  "a read-only check that loses its tick mask or its ring's scale is red",
  async () => {
    const r = await measurePage(
      browser,
      targetFile(
        "drift-readonly.html",
        page(".hw-check[data-readonly] { mask: none; scale: none }"),
      ),
    );
    const props = r.findings.filter((f) => f.element === "check").map((f) => f.prop);
    expect(props).toContain("mask-image");
    expect(props).toContain("scale");
  },
  limit(60_000),
);

// Every instance is measured, not one per kind: one drifted pill among 2,000 is red, and only it.
test(
  "one drifted instance among many is red",
  async () => {
    const pill = '<span class="hw-pill">pdf</span>';
    const pills =
      pill.repeat(1234) + '<span class="hw-pill" id="odd">pdf</span>' + pill.repeat(765);
    const r = await measurePage(
      browser,
      targetFile(
        "one-of-many.html",
        page("#odd { padding-left: 13px }").replace("</body>", `${pills}</body>`),
      ),
    );
    expect(r.findings.map((f) => f.prop)).toEqual(["padding-left"]);
  },
  limit(60_000),
);

test.each([
  { kind: "opaque", color: "rgb(51 102 153)", alpha: 1 },
  { kind: "translucent", color: "rgb(51 102 153 / 0.5)", alpha: 0.5 },
  { kind: "transparent", color: "rgb(51 102 153 / 0)", alpha: 0 },
])(
  "reads $kind alpha from the browser",
  async ({ color, alpha }) => {
    const tab = await browser.newPage();
    try {
      const colors = await tab.evaluateHandle(createBrowserColorProbe);
      const result = await tab.evaluate(
        ({ rgba }, input) => rgba(document.body, input),
        colors,
        color,
      );
      expect(result).toEqual([0.2, 0.4, 0.6, alpha]);
    } finally {
      await tab.close();
    }
  },
  limit(30_000),
);

// A set priority never takes the outline that means "no value": P2 to P4 fill, each lighter, on
// the theme's own neutral (P3 and P4 share P2's text and fill colour, at less strength).
test(
  "priority pills P2 to P4 fade on a fill, day and night, and none is the outline",
  async () => {
    const row = [2, 3, 4]
      .map((p) => `<span class="hw-pill" data-priority="${p}">P${p}</span>`)
      .join("");
    const html = only(`<div>${row}</div><div data-theme="dark">${row}</div>`);
    const tab = await browser.newPage();
    await tab.goto(pathToFileURL(file("priority.html", html)).href);
    const colors = await tab.evaluateHandle(createBrowserColorProbe);
    const themes = await tab.evaluate(({ rgba }) => {
      const read = (color: string) => {
        const [r, g, b, a] = rgba(document.body, color);
        return { rgb: [r, g, b].join(" "), a };
      };
      return [...document.querySelectorAll("body > div")].map((d) =>
        [...d.children].map((e) => {
          const s = getComputedStyle(e);
          return {
            bg: read(s.backgroundColor),
            border: read(s.borderTopColor),
            text: read(s.color),
          };
        }),
      );
    }, colors);
    await tab.close();
    const fades = themes.map(([p2, p3, p4]) => {
      assert(p2, "Expected a measured P2 pill");
      assert(p3, "Expected a measured P3 pill");
      assert(p4, "Expected a measured P4 pill");
      return [p2.bg.a > p3.bg.a, p3.bg.a > p4.bg.a, p4.bg.a > 0];
    });
    expect(fades).toEqual([
      [true, true, true],
      [true, true, true],
    ]);
    expect(themes.map((theme) => theme.map(({ border }) => border.a))).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
    const pigments = themes.map((theme) => theme.map(({ bg, text }) => [bg.rgb, text.rgb]));
    expect(pigments).toEqual(pigments.map(([p2]) => [p2, p2, p2]));
  },
  limit(60_000),
);

// The scaffolding catalog shell's own card and pill (data-hw-shell): neither measured nor shown.
test(
  "an element of the catalog shell is not measured",
  async () => {
    const shell =
      '<a data-hw-shell class="hw-card" style="border-radius: 0"><span data-hw-shell class="hw-pill" style="padding: 0">3 states</span></a>';
    const html = only(
      `${shell}<div data-hw-tile="label" data-hw-version="${own.version}">${DEMOS.label}</div>`,
    );
    const r = await measurePage(browser, targetFile("shell.html", html));
    expect(r.findings).toEqual([]);
    expect(r.seen).toEqual(["label"]);
    // Control: the same markup without the marker is measured.
    const bare = await measurePage(
      browser,
      targetFile("no-shell.html", html.replaceAll("data-hw-shell ", "")),
    );
    expect(bare.findings.map((f) => f.element)).toContain("card");
    expect(bare.seen).toContain("card");
  },
  limit(60_000),
);

// A focus-ring tile names its source beside the sample, a link into brand's published portal or to
// the element's entry on any host: the sample is measured, those links not.
test(
  "the focus-ring tile measures its sample, not the link to brand's catalogue beside it",
  async () => {
    const meta = `<p>from brand · <a href="https://hackersandwizards.github.io/brand/#elements/hw-focus-ring">entry</a> · <a href="https://hackersandwizards.github.io/brand/catalog/">catalog</a> · <a href="http://brand.localhost/#elements/hw-focus-ring">local</a></p>`;
    const tile = (sample: string) =>
      `<div data-hw-tile="focus-ring" data-hw-version="${own.version}">${meta}<div class="body">${sample}</div></div>`;
    const run = async (name: string, sample: string, css = "") => {
      const r = await measurePage(
        browser,
        targetFile(name, only(`<style>${css}</style>${tile(sample)}`, "hw-focus-ring")),
      );
      return { labels: [...new Set(r.findings.map((f) => f.label))], seen: r.seen };
    };
    const styled = await run(
      "meta-styled.html",
      '<a href="#">A link to focus</a>',
      "p a { outline: none !important }",
    );
    expect(styled.labels).toEqual([]);
    // Control: the sample's own ring broken fails, naming the sample.
    const broken = await run(
      "sample-broken.html",
      '<a href="#">A link to focus</a>',
      ".body a { outline: none !important }",
    );
    expect(broken.labels).toEqual(['a "A link to focus"']);
    // A tile holding only the link shows no focus ring.
    const empty = await run("meta-only.html", "<span>No sample</span>");
    expect(empty.seen).toEqual([]);
  },
  limit(60_000),
);

// A closed fold draws its elements once opened, so they are measured open: a focusable in a shut
// fold takes no focus and reads as having no ring.
test(
  "an element in a closed details is measured open; a header's menu stays shut",
  async () => {
    const fold = (inner: string) => only(inner, "hw-focus-ring");
    const tile = `<div data-hw-tile="focus-ring" data-hw-version="${own.version}">${DEMOS["focus-ring"]}</div>`;
    const closed = await measurePage(
      browser,
      targetFile("fold.html", fold(`<details><summary>Mehr</summary>${tile}</details>`)),
    );
    expect(closed.findings).toEqual([]);
    // Control: the menu in a header is left shut, and its focusable reads no ring.
    const menu = await measurePage(
      browser,
      targetFile(
        "menu.html",
        fold(`<header><details><summary>Menü</summary>${tile}</details></header>`),
      ),
    );
    expect(menu.findings.map((f) => f.prop)).toEqual(["outline-style"]);
  },
  limit(60_000),
);

// Tailwind's preflight: every element a solid border of no width, which draws nothing.
test(
  "a border of no width is no drift, whatever its style; a drawn one is",
  async () => {
    const unruled = (css: string) =>
      page(css).replace(
        "</body>",
        '<dl class="hw-facts"><div><dt class="hw-label" data-tone="muted">Dauer</dt><dd>2 Tage</dd></div></dl></body>',
      );
    const none = await measurePage(
      browser,
      targetFile(
        "zero-border.html",
        unruled(".hw-facts:not([data-variant]) > div { border: 0 solid red }"),
      ),
    );
    expect(none.findings).toEqual([]);
    const drawn = await measurePage(
      browser,
      targetFile(
        "drawn-border.html",
        unruled(".hw-facts:not([data-variant]) > div { border-top: 1px solid }"),
      ),
    );
    expect(drawn.findings.some((f) => f.element === "facts")).toBe(true);
  },
  limit(60_000),
);

test(
  "a setting the medium sets, or a property the element leaves to it, is no drift",
  async () => {
    const r = await measurePage(
      browser,
      targetFile(
        "setting.html",
        page(
          ".hw-card { --hw-card-pad: 3rem; font-size: 9pt } .hw-label { --hw-label-size: 9.5pt }",
        ),
      ),
    );
    expect(r.findings).toEqual([]);
  },
  limit(60_000),
);

test(
  "inside a brand corner every block takes the small corner; a brand corner there is red, hidden too",
  async () => {
    const nested = `<div class="hw-card"><pre class="hw-code">x</pre><div class="hw-callout">y</div><img style="border-radius: var(--radius-brand); width: 40px; height: 40px" alt=""></div>`;
    const r = await measurePage(browser, targetFile("nested.html", only(nested)));
    expect(r.findings).toEqual([]);
    const hard = await measurePage(
      browser,
      targetFile(
        "nested-hard.html",
        only(
          `<div class="hw-card"><div style="border-radius: 20px 5px; height: 40px">z</div></div><div class="hw-card" hidden><i style="border-radius: 20px 5px">h</i></div>`,
        ),
      ),
    );
    expect(hard.findings.map((f) => [f.element, f.got])).toEqual([
      ["corner", 'the brand corner inside div.hw-card "z"'],
      ["corner", 'the brand corner inside div.hw-card "h"'],
    ]);
  },
  limit(60_000),
);

// A build that rewrites color-mix() into rgba() (Lightning CSS) draws the same colour.
test(
  "the same colour in another notation is no drift, another colour is",
  async () => {
    const same = await measurePage(
      browser,
      targetFile(
        "notation.html",
        page(
          '[data-theme="dark"] .hw-card:not([data-variant]) { border-color: rgba(255, 255, 255, 0.15); background-color: rgba(255, 255, 255, 0.07) }',
        ),
      ),
    );
    expect(same.findings).toEqual([]);
    const other = await measurePage(
      browser,
      targetFile(
        "notation-drift.html",
        page(
          '[data-theme="dark"] .hw-card:not([data-variant]) { background-color: rgba(255, 255, 255, 0.12) }',
        ),
      ),
    );
    expect(other.findings.some((f) => f.element === "card")).toBe(true);
  },
  limit(60_000),
);

// A light-only page (brand-elements.json "lightOnly") may leave the night tokens out: the night
// rules never draw there. A day token still counts.
test(
  "a light-only page needs no night token, a day token still counts",
  async () => {
    const noNight = page(":root { --color-night-muted: initial }");
    const strict = await measurePage(browser, targetFile("light-strict.html", noNight));
    expect(strict.findings.some((f) => f.prop === "--color-night-muted")).toBe(true);
    const light = await measureLightPage(browser, targetFile("light-only.html", noNight));
    expect(light.findings.filter((f) => f.got === "undefined")).toEqual([]);
    const noDay = page(":root { --color-teal-dark: initial }");
    const day = await measureLightPage(browser, targetFile("light-day.html", noDay));
    expect(day.findings.some((f) => f.prop === "--color-teal-dark")).toBe(true);
  },
  limit(60_000),
);

test(
  "a brand token the surface never defines is red",
  async () => {
    const r = await measurePage(
      browser,
      targetFile("token.html", page(":root { --type-small-family: initial }")),
    );
    expect(r.findings.some((f) => f.prop === "--type-small-family")).toBe(true);
  },
  limit(60_000),
);

// Every label, toned or hued, on every 7 % wash, on each ground of its theme, at a phone's 412 px:
// 4.5:1 or more. The plain hue on a status wash is drift.
test(
  "every label clears 4.5:1 on every wash, light and night, at 412 px",
  async () => {
    const labels = ["", 'data-tone="muted"', 'data-tone="ink"']
      .concat(["purple", "amber", "green", "red"].map((h) => `data-hue="${h}"`))
      .map((a) => `<span class="hw-label" ${a}>Label</span>`)
      .join(" ");
    const washes = ["warning", "error", "success", "info"]
      .map((t) => `<div class="hw-status" data-tone="${t}">${labels}</div>`)
      .concat(
        `<div class="hw-callout">${labels}</div>`,
        `<div class="hw-callout" data-hue="purple">${labels}</div>`,
        `<div class="hw-card" data-variant="tint">${labels}</div>`,
      )
      .join("");
    const grounds = [
      ["light", "--color-bg"],
      ["light", "--color-white"],
      ["dark", "--color-night"],
      ["dark", "--color-night-2"],
    ]
      .map(
        ([t, g]) =>
          `<div data-theme="${t}" style="background: var(${g}); padding: 1px">${washes}</div>`,
      )
      .join("");
    const tab = await browser.newPage();
    await tab.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await tab.setViewport({ width: 412, height: 900 });
    await tab.goto(pathToFileURL(file("wash.html", only(grounds))).href);
    const colors = await tab.evaluateHandle(createBrowserColorProbe);
    const low = await tab.evaluate(({ rgba, luminance }) => {
      return [...document.querySelectorAll<HTMLElement>(".hw-label")]
        .map((el) => {
          const box = browserDefined(el.parentElement, "control parent");
          const ground = rgba(
            document.body,
            getComputedStyle(browserDefined(box.parentElement, "status label background"))
              .backgroundColor,
          );
          const wash = rgba(document.body, getComputedStyle(box).backgroundColor);
          const under = ground
            .slice(0, 3)
            .map(
              (g, i) =>
                browserDefined(wash[i], "label wash RGB channel") * wash[3] + g * (1 - wash[3]),
            );
          const [x, y] = [
            luminance(document.body, rgba(document.body, getComputedStyle(el).color)),
            luminance(document.body, under),
          ].sort((p, q) => q - p);
          const ratio =
            (browserDefined(x, "higher luminance") + 0.05) /
            (browserDefined(y, "lower luminance") + 0.05);
          const name = `${browserDefined(box.closest("[data-theme]"), "label theme section").getAttribute("style")} ${box.outerHTML.split(">")[0]} ${el.outerHTML}`;
          return { name, ratio };
        })
        .filter(({ ratio }) => !(ratio >= 4.5));
    }, colors);
    await tab.close();
    expect(low).toEqual([]);
    const plain = await measurePage(
      browser,
      targetFile(
        "wash-drift.html",
        page('.hw-status .hw-label[data-hue="red"] { color: var(--color-red) }'),
      ),
    );
    const labelFindings = plain.findings.filter((f) => f.element === "label");
    expect(labelFindings.map((f) => f.prop)).toContain("color");
  },
  limit(60_000),
);

// Every text of every sample, in every scale and theme, against the background colours behind it:
// 4.5:1, 3:1 at large size (24 px, or 18.66 px bold). A control's own fill counts, the browser's
// included. A disabled control is exempt. The control page gives the sort buttons back the
// browser's fill, border and padding, and must fail both checks.
test(
  "every text in every sample clears WCAG AA in every scale, day and night",
  async () => {
    const grounds =
      '[data-theme="light"] { background: var(--color-white); color: var(--color-ink) } [data-theme="dark"] { background: var(--color-night); color: var(--color-night-ink) }';
    const measure = async (name: string, css: string) => {
      const tab = await browser.newPage();
      await tab.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
      await tab.goto(pathToFileURL(file(name, page(css))).href);
      const colors = await tab.evaluateHandle(createBrowserColorProbe);
      const low = await tab.evaluate(({ rgba, luminance }) => {
        const over = (top: readonly [number, number, number, number], under: number[]) =>
          under.map(
            (u, i) => browserDefined(top[i], "overlay RGB channel") * top[3] + u * (1 - top[3]),
          );
        // The fills from the theme section down to el, composited in order.
        const behind = (el: Element) => {
          const chain: Element[] = [];
          const theme = browserDefined(el.closest("[data-theme]"), "text theme section");
          for (
            let current = el;
            current !== theme;
            current = browserDefined(current.parentElement, "theme ancestor")
          ) {
            chain.unshift(current);
          }
          chain.unshift(theme);
          return chain.reduce(
            (c, e) => over(rgba(document.body, getComputedStyle(e).backgroundColor), c),
            [1, 1, 1],
          );
        };
        const tiles = document.querySelectorAll(
          "[data-hw-scale] > :is([data-hw-tile], [data-hw-sample])",
        );
        const measurements = [...tiles].flatMap((tile) => {
          const text = [tile, ...tile.querySelectorAll("*")]
            .filter((el) => !el.closest(":disabled, [aria-hidden]"))
            .filter((el) =>
              [...el.childNodes]
                .filter((node) => node.nodeType === Node.TEXT_NODE)
                .some((node) =>
                  Boolean(browserDefined(node.textContent, "text node content").trim()),
                ),
            )
            .map((el) => ({ el, style: getComputedStyle(el) }))
            .filter(({ style }) => style.visibility !== "hidden")
            .filter(({ style }) => style.display !== "none");
          return text.map(({ el, style: s }) => {
            const under = behind(el);
            const [x, y] = [
              luminance(document.body, over(rgba(document.body, s.color), under)),
              luminance(document.body, under),
            ].sort((p, q) => q - p);
            const ratio =
              (browserDefined(x, "higher luminance") + 0.05) /
              (browserDefined(y, "lower luminance") + 0.05);
            const px = parseFloat(s.fontSize);
            const weight = Number(s.fontWeight);
            const section = browserDefined(tile.parentElement, "tile scale section");
            const name = [
              tile.getAttribute("data-hw-tile"),
              tile.getAttribute("data-hw-sample"),
            ].join("");
            return {
              element: `${section.dataset.hwScale} ${section.dataset.theme} ${name} ${el.tagName.toLowerCase()} "${browserDefined(el.textContent, "element text content").trim().slice(0, 20)}"`,
              ratio,
              px,
              weight,
            };
          });
        });
        const large = new Set([
          ...measurements.filter(({ px }) => px >= 24),
          ...measurements.filter(({ px }) => px >= 18.66).filter(({ weight }) => weight >= 700),
        ]);
        const regular = measurements.filter((reading) => !large.has(reading));
        return [
          ...regular.filter(({ ratio }) => !(ratio >= 4.5)),
          ...[...large].filter(({ ratio }) => !(ratio >= 3)),
        ];
      }, colors);
      // A button or select in a label or a table head takes the role it sits in: its colour, no face.
      const faced = await tab.evaluate(() =>
        [
          ...document.querySelectorAll(
            "[data-hw-scale] :is(.hw-label, .hw-table th) :is(button, select):not([class])",
          ),
        ]
          .map((el) => {
            const style = getComputedStyle(el);
            const { hwScale, theme } = browserDefined(
              el.closest<HTMLElement>("[data-hw-scale]"),
              "control scale section",
            ).dataset;
            return {
              element: `${hwScale} ${theme} ${browserDefined(el.textContent, "element text content").trim()}`,
              paint: [style.color, style.backgroundColor, style.borderWidth, style.padding].join(
                "/",
              ),
              expected: [
                getComputedStyle(browserDefined(el.parentElement, "control parent")).color,
                "rgba(0, 0, 0, 0)",
                "0px",
                "0px",
              ].join("/"),
            };
          })
          .filter(({ paint, expected }) => paint !== expected),
      );
      await tab.close();
      return { low, faced };
    };
    expect(await measure("contrast.html", grounds)).toEqual({ low: [], faced: [] });
    const ua = await measure(
      "contrast-ua.html",
      `${grounds} :is(.hw-label, .hw-table th) button { background: revert; border: revert; padding: revert }`,
    );
    expect(ua.low.length).toBeGreaterThan(0);
    expect(ua.faced.length).toBeGreaterThan(0);
  },
  limit(60_000),
);

// The nearest theme decides: a light slide inside a dark page draws its elements by day.
test(
  "a light subtree inside a dark one draws the day rule",
  async () => {
    const r = await measurePage(
      browser,
      targetFile(
        "nested.html",
        page().replace(
          "</body>",
          '<div data-theme="dark"><div data-theme="light"><div data-hw-sample class="hw-card">Tag</div><span class="hw-label">Tag</span></div></div></body>',
        ),
      ),
    );
    expect(r.findings).toEqual([]);
    const html = await browser.newPage();
    await html.goto(
      `file://${file("nested2.html", page().replace("</body>", '<div data-theme="dark"><div data-theme="light"><span id="probe" class="hw-label">Tag</span></div></div></body>'))}`,
    );
    const [day, probe] = await html.$eval("#probe", (probe) => {
      const ref = document.createElement("span");
      ref.className = "hw-label";
      document.body.append(ref);
      return [getComputedStyle(ref).color, getComputedStyle(probe).color];
    });
    await html.close();
    expect(probe).toBe(day);
  },
  limit(60_000),
);

// A cell takes no shadow root; a remove button's icon sizes by the pill, not the browser's button
// font, inside a 24 px target.
test(
  "an element in a table cell and a pill's remove button are measured",
  async () => {
    const r = await measurePage(
      browser,
      targetFile(
        "cell.html",
        page().replace(
          "</body>",
          '<table><tr><td class="hw-label">Zeitraum</td><td><span class="hw-pill">agentic<button type="button" class="hw-pill-remove" aria-label="Entfernen"></button></span></td></tr></table></body>',
        ),
      ),
    );
    expect(r.findings).toEqual([]);
    const page2 = await browser.newPage();
    await page2.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await page2.goto(`file://${file("cell2.html", page())}`);
    const [target, icon, pill] = await page2.$eval(".hw-pill-remove", (b) => {
      return [
        b.getBoundingClientRect().width,
        getComputedStyle(b, "::before").width,
        getComputedStyle(browserDefined(b.parentElement, "pill remove button parent")).fontSize,
      ];
    });
    await page2.close();
    expect([target, icon]).toEqual([24, pill]);
  },
  limit(60_000),
);

// The link's underline offset is in em: its reference reads the cell's 14 px, not the table's parent.
test(
  "a link in a smaller table cell is measured at the cell's size",
  async () => {
    const r = await measurePage(
      browser,
      targetFile(
        "cell-link.html",
        page().replace(
          "</body>",
          '<table style="font-size: 14px"><tr><td><a class="hw-link" href="#x">Agenda</a></td></tr></table></body>',
        ),
      ),
    );
    expect(r.findings).toEqual([]);
  },
  limit(60_000),
);

// A link a surface sizes itself, in a flex row, an icon link too, keeps its em lengths: they compare
// in em of each one's size, and a flex item's blockified display is the surface's.
test(
  "a link sized by its own class is measured in em of that size",
  async () => {
    const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/></svg>';
    const row = (offset = "") =>
      `<style>.own-size { font-size: 13px; ${offset} }</style><p style="display:flex"><a class="hw-link own-size" href="#y">Profil</a><a class="hw-link own-size" href="#z">${icon}Ada</a></p></body>`;
    const r = await measurePage(
      browser,
      targetFile("sized-link.html", page().replace("</body>", row())),
    );
    expect(r.findings).toEqual([]);
    // Control: the same links drawn 0.3em below the baseline fail.
    const drift = await measurePage(
      browser,
      targetFile(
        "sized-link-drift.html",
        page().replace("</body>", row("text-underline-offset: 0.3em;")),
      ),
    );
    expect(
      drift.findings.map(({ element, label, prop, got, want }) => ({
        element,
        label,
        prop,
        got,
        want,
      })),
    ).toEqual([
      {
        element: "link",
        label: 'a.hw-link "Profil"',
        prop: "text-underline-offset",
        got: "0.3em",
        want: "0.2em",
      },
      {
        element: "link",
        label: 'a.hw-link "Ada"',
        prop: "text-underline-offset",
        got: "0.3em",
        want: "0.2em",
      },
    ]);
  },
  limit(60_000),
);

test(
  "a joined field row is measured joined",
  async () => {
    const joined =
      '<div class="hw-field-row" data-joined><input class="hw-field" aria-label="Suche"><button type="button" class="hw-button">Go</button></div>';
    const r = await measurePage(
      browser,
      targetFile("joined.html", page().replace("</body>", `${joined}</body>`)),
    );
    expect(r.findings).toEqual([]);
  },
  limit(60_000),
);

test(
  "night is measured against the night rule",
  async () => {
    const r = await measurePage(
      browser,
      targetFile("night.html", page('[data-theme="dark"] .hw-pill { color: var(--color-ink) }')),
    );
    expect(r.findings.filter((f) => f.element === "pill").length).toBeGreaterThan(0);
  },
  limit(60_000),
);

// os 13 px, trainer hub 14 px, both dense.
test(
  "dense with data-hw-type=regular takes the expert set's regular text, dense alone 13 px",
  async () => {
    const p = await browser.newPage();
    const read = async (attrs: string) => {
      await p.goto(
        pathToFileURL(
          file(
            `type-${attrs.length}.html`,
            `<!doctype html><html ${attrs}><head><link rel="stylesheet" href="${brand("elements/scales.css")}"></head><body></body></html>`,
          ),
        ).href,
      );
      return p.evaluate(() => {
        const s = getComputedStyle(document.documentElement);
        return ["--text-ui", "--text-ui--line-height", "--text-micro"].map((v) =>
          s.getPropertyValue(v).trim(),
        );
      });
    };
    const expert = readFileSync(join(ROOT, "expert/expert.css"), "utf8");
    const regular = ["--text-ui", "--text-ui--line-height", "--text-micro"].map((v) =>
      defined(expert.match(new RegExp(`\\n\\s*${v}: ([^;]+);`))?.[1], `expert type value for ${v}`),
    );
    expect(await read('data-hw-scale="dense" data-hw-type="regular"')).toEqual(regular);
    expect(await read('data-hw-scale="dense"')).toEqual(["0.8125rem", "1.45", "0.6875rem"]);
    await p.close();
  },
  limit(60_000),
);

test(
  "the print button stands as tall as its text in the brand corner at paper size, a carded one in the small corner",
  async () => {
    const p = await browser.newPage();
    await open(
      p,
      pathToFileURL(
        file(
          "button-print.html",
          only(
            '<div data-hw-scale="print"><a class="hw-button" id="paper" href="#">Go</a><div class="hw-card"><a class="hw-button" id="carded-paper" href="#">Go</a></div></div><div data-hw-scale="screen"><a class="hw-button" id="screen" href="#">Go</a><div class="hw-card"><a class="hw-button" id="carded" href="#">Go</a></div></div>',
            "",
            ["tokens/print.css"],
          ),
        ),
      ).href,
    );
    const read = (id: string) =>
      p.$eval(`#${id}`, (e) => {
        const s = getComputedStyle(e);
        return [
          s.minHeight,
          s.fontSize,
          s.paddingTop,
          s.borderTopLeftRadius,
          s.borderTopRightRadius,
        ];
      });
    expect(await read("paper")).toEqual(["0px", "12.6667px", "4px", "16px", "4px"]);
    expect((await read("screen"))[3]).toBe("20px");
    expect((await read("carded"))[3]).toBe("5px");
    expect((await read("carded-paper")).slice(3)).toEqual(["4px", "4px"]);
    await p.setViewport({ width: 1280, height: 800 });
    expect((await read("paper"))[0]).toBe("0px");
    await p.close();
  },
  limit(60_000),
);

// Size scales with the medium, shape never: every sample draws the same corner kind and border on
// every scale and theme, and a brand corner is the medium's own, the card's.
test(
  "every element keeps one shape on every scale and theme",
  async () => {
    const p = await browser.newPage();
    await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await open(p, pathToFileURL(file("shapes.html", page())).href);
    const shapes = await p.$$eval("section", (sections) =>
      sections.map((section) => {
        const corners = (s: CSSStyleDeclaration) =>
          [
            parseFloat(s.borderTopLeftRadius),
            parseFloat(s.borderTopRightRadius),
            parseFloat(s.borderBottomRightRadius),
            parseFloat(s.borderBottomLeftRadius),
          ] as const;
        const [card] = corners(
          getComputedStyle(
            browserDefined(
              section.querySelector(
                "[data-hw-tile='card'] > .hw-card, [data-hw-sample='card'] > .hw-card",
              ),
              "section card",
            ),
          ),
        );
        const profile = ([tl, tr, br, bl]: ReturnType<typeof corners>) => ({
          oppositeCornersMatch: [tl, tr].join("/") === [br, bl].join("/"),
          asymmetric: tl !== tr,
          usesCardRadii: tl === card,
          square: tl === 0,
          pill: tl > 999,
        });
        return [...section.querySelectorAll("[data-hw-tile], [data-hw-sample]")].flatMap((tile) =>
          [...tile.querySelectorAll("[class*='hw-']")].map((e, i) => {
            const s = getComputedStyle(e);
            const border = [
              s.borderTopStyle,
              s.borderRightStyle,
              s.borderBottomStyle,
              s.borderLeftStyle,
            ].join(" ");
            const name = [
              tile.getAttribute("data-hw-tile"),
              tile.getAttribute("data-hw-sample"),
            ].join("");
            const radii = corners(s);
            return {
              name,
              i,
              className: e.getAttribute("class"),
              shape: profile(radii),
              border,
              radii,
            };
          }),
        );
      }),
    );
    await p.close();
    const outline = (section: (typeof shapes)[number]) =>
      section.map(({ radii: _radii, shape, ...info }) => ({
        ...info,
        square: shape.square,
        pill: shape.pill,
        asymmetric: shape.asymmetric,
      }));
    expect(shapes.map(outline)).toEqual(
      Array<(typeof shapes)[number]>(8)
        .fill(defined(shapes[0], "first scale shape profile"))
        .map(outline),
    );
    const corners = shapes.flat();
    expect(corners.filter(({ shape }) => !shape.oppositeCornersMatch)).toEqual([]);
    const brandRatios = shapes.map((section) =>
      section.filter(({ shape }) => shape.asymmetric).map(({ radii }) => radii[0] / radii[1]),
    );
    expect(brandRatios).toEqual(
      Array<number[]>(8).fill(defined(brandRatios[0], "first scale corner ratios")),
    );
    const custom = corners.filter(({ shape }) => shape.asymmetric);
    expect(custom.filter(({ shape }) => !shape.usesCardRadii)).toEqual([]);
  },
  limit(60_000),
);

// Typography's prose rules come in a later layer than the elements: its link weight and list
// indent must lose to the prose block, and the same values written unlayered must turn it red.
test(
  "the prose block's links and lists hold against Typography's layer",
  async () => {
    const typography =
      "@layer utilities { .prose :where(a) { color: #111; font-weight: 500 } .prose :where(ul, ol) { padding-inline-start: 1.625em } }";
    const html = (css: string) =>
      only(
        `<style>${css}</style><div data-hw-tile="prose" data-hw-version="${own.version}">${defined(DEMOS.prose, "prose demo").replace('class="hw-prose"', 'class="prose hw-prose"')}</div>`,
      );
    const clean = await measurePage(browser, targetFile("prose-typography.html", html(typography)));
    expect(clean.findings).toEqual([]);
    for (const [drift, want] of [
      [".prose.hw-prose a:not(.not-prose) { font-weight: 500 }", "a font-weight"],
      [".prose.hw-prose ul:not(.not-prose) { padding-inline-start: 1.625em }", "ul padding-left"],
      [".prose.hw-prose ol:not(.not-prose) { padding-inline-start: 1.625em }", "ol padding-left"],
    ] as const) {
      const r = await measurePage(browser, targetFile("prose-drift.html", html(drift)));
      expect(
        r.findings.map(
          (f) => `${f.label.slice(f.label.lastIndexOf('" ') + 2).split(":")[0]} ${f.prop}`,
        ),
      ).toContain(want);
    }
  },
  limit(60_000),
);

// The consumer's policy (brand-elements.json "csp") applies while a page renders: the form field's
// error icon is a data: image, which a policy whose img-src leaves out data: refuses.
const POLICY = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'";
const formPage = () =>
  file(
    "csp.html",
    only(
      `<div data-hw-tile="form-field" data-hw-version="${own.version}">${DEMOS["form-field"]}</div>`,
    ),
  );
test(
  "a policy refusing data: images is red on the form field's error icon, green with img-src data:",
  async () => {
    const url = formPage();
    const red = await measurePage(browser, { ...elementPage(url), csp: POLICY });
    expect(red.refused).toContainEqual({
      page: url,
      element: "p.hw-form-error::before",
      source: "data",
      directive: "img-src",
    });
    const green = await measurePage(browser, { ...elementPage(url), csp: `${POLICY} data:` });
    expect(green.refused).toEqual([]);
    expect(green.findings).toEqual([]);
  },
  limit(60_000),
);

test(
  "brand-elements fails on a source the policy in brand-elements.json refuses, naming page, element and source",
  () => {
    const url = formPage();
    // The CLI reads the consumer's tree from git.
    const repo = join(dir, "csp-repo");
    mkdirSync(repo);
    Bun.spawnSync(["git", "init", "-q"], { cwd: repo });
    const run = (csp: Csp) => {
      writeFileSync(join(repo, "brand-elements.json"), JSON.stringify({ pages: [url], csp }));
      return Bun.spawnSync(["bun", join(import.meta.dir, "../../scan/elements.ts")], { cwd: repo });
    };
    const red = run(POLICY);
    expect(red.exitCode).toBe(1);
    expect(red.stderr.toString()).toContain(
      `${url} p.hw-form-error::before: the page's Content-Security-Policy refuses data (img-src)`,
    );
    expect(run(`${POLICY} data:`).stderr.toString()).not.toContain("refuses");
    const outside = run({ "**/elsewhere.html": POLICY });
    expect(outside.exitCode).not.toBe(0);
    expect(outside.stderr.toString()).toContain('"csp": no glob matches');
  },
  limit(60_000),
);

test(
  "a keycap leaves a line of UI text as high as an inline keycap does, in the screen, dense and print scales",
  async () => {
    const p = await browser.newPage();
    const text = (style = "") =>
      `<p style="width:16rem;font:400 0.875rem/1.5 var(--font-sans)">Mit ${["/", "⌘", "K", "Esc"].map((k) => `<kbd class="hw-kbd"${style}>${k}</kbd>`).join(" ")} öffnen Suche und Befehle, schließen sie und springen zurück.</p>`;
    const body = ["screen", "dense", "print"]
      .map(
        (scale) =>
          `<div data-hw-scale="${scale}">${text()}${text(' style="display:inline"')}</div>`,
      )
      .join("");
    await open(p, pathToFileURL(file("kbd-line.html", only(body, "", ["tokens/fonts.css"]))).href);
    await p.evaluate(() => document.fonts.ready);
    const lines = await p.evaluate(() =>
      [...document.querySelectorAll("div")].map((d) =>
        [...d.querySelectorAll("p")].map((q) => q.getBoundingClientRect().height),
      ),
    );
    await p.close();
    for (const [keycap, inline] of lines)
      expect(keycap).toBe(defined(inline, "inline keycap height"));
  },
  limit(60_000),
);

// On a phone the unjoined row stacks; inside a form field its button goes under the error message,
// which stays next to the field it is about. Outside a form field, and on a desktop, the row keeps
// field and button together.
const fieldRow = (id: string) =>
  `<div class="hw-field-row"><input class="hw-field" id="${id}-in" aria-invalid="true"><button class="hw-button" id="${id}-btn" type="submit">Prüfen</button></div>`;
const fieldWithError = `<div class="hw-form-field">${fieldRow("ff")}<p class="hw-form-error" id="ff-err">Gebt eine ID ein.</p></div>`;

async function fieldEdges(width: number, fixture: { name: string; body: string; ids: string[] }) {
  const tab = await browser.newPage();
  await tab.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
  try {
    const html = only(`<div data-hw-scale="screen">${fixture.body}</div>`);
    await open(tab, pathToFileURL(file(`field-row-${fixture.name}.html`, html)).href);
    await tab.setViewport({ width, height: 800 });
    return await tab.evaluate(
      (ids) =>
        Object.fromEntries(
          ids.map((id) => {
            const box = browserDefined(
              document.getElementById(id),
              `field edge probe #${id}`,
            ).getBoundingClientRect();
            return [id, { top: box.top, bottom: box.bottom }];
          }),
        ),
      fixture.ids,
    );
  } finally {
    await tab.close();
  }
}

test(
  "a stacked form field on a phone puts the error between the field and button",
  async () => {
    const phone = await fieldEdges(390, {
      name: "phone-form",
      body: fieldWithError,
      ids: ["ff-in", "ff-err", "ff-btn"],
    });
    const field = defined(phone["ff-in"], "field bounds");
    const error = defined(phone["ff-err"], "field error bounds");
    const button = defined(phone["ff-btn"], "form button bounds");
    expect(field.bottom < error.top).toBe(true);
    expect(error.bottom < button.top).toBe(true);
    expect(button.top - error.bottom).toBeCloseTo(12, 1);
  },
  limit(60_000),
);

test(
  "a bare field row on a phone leaves 0.75rem between the field and the stacked button",
  async () => {
    const phone = await fieldEdges(390, {
      name: "phone-bare",
      body: fieldRow("bare"),
      ids: ["bare-in", "bare-btn"],
    });
    const button = defined(phone["bare-btn"], "bare button bounds");
    const field = defined(phone["bare-in"], "bare field bounds");
    expect(button.top - field.bottom).toBeCloseTo(12, 1);
  },
  limit(60_000),
);

test(
  "a form field on a desktop keeps the field and button inline above the error",
  async () => {
    const desk = await fieldEdges(1280, {
      name: "desktop-form",
      body: fieldWithError,
      ids: ["ff-in", "ff-err", "ff-btn"],
    });
    const button = defined(desk["ff-btn"], "form button bounds");
    const field = defined(desk["ff-in"], "field bounds");
    const error = defined(desk["ff-err"], "field error bounds");
    expect(button.top).toBe(field.top);
    expect(error.top > button.bottom).toBe(true);
  },
  limit(60_000),
);

// A disabled button keeps its look under the pointer, teal and purple, primary and secondary, day and night.
test(
  "a disabled button does not change on hover, on day or night",
  async () => {
    const p = await browser.newPage();
    await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    const buttons = ["", ' data-hue="purple"']
      .flatMap((hue) =>
        ["", ' data-variant="secondary"'].map(
          (v) => `<button class="hw-button"${hue}${v} disabled>Go</button>`,
        ),
      )
      .join("");
    await open(
      p,
      pathToFileURL(
        file(
          "button-disabled.html",
          only(
            `<div data-hw-scale="screen">${buttons}</div><div data-theme="dark" data-hw-scale="screen">${buttons}</div>`,
          ),
        ),
      ).href,
    );
    const n = await p.$$eval(".hw-button", (b) => b.length);
    for (let i = 0; i < n; i++) {
      const look = () =>
        p.$$eval(
          ".hw-button",
          (b, i) => {
            const s = getComputedStyle(browserDefined(b[i], `disabled button ${i}`));
            return [s.backgroundColor, s.borderTopColor, s.color, s.opacity, s.cursor];
          },
          i,
        );
      await p.mouse.move(0, 0);
      const rest = await look();
      await defined((await p.$$(".hw-button"))[i], "disabled button to hover").hover();
      expect(await look()).toEqual(rest);
      expect(rest.slice(3)).toEqual(["0.5", "not-allowed"]);
    }
    await p.close();
  },
  limit(60_000),
);

// The cascade layers' order is declared by every brand file that opens one, so a surface loading
// the elements before the text base still lets the element win over the heading's weight.
test(
  "a label on a heading keeps its weight whichever brand file loads first",
  async () => {
    const heading = `<div data-hw-tile="label" data-hw-version="${own.version}"><h2 class="hw-label">Kurs</h2></div>`;
    // The label owns its weight, so a heading's 700 over the reference's 500 is a finding.
    const measure = (name: string, sheets: readonly string[]) =>
      measurePage(
        browser,
        targetFile(
          name,
          `<!doctype html><html><head>${sheets.map((f) => `<link rel="stylesheet" href="${brand(f)}">`).join("")}</head><body>${heading}</body></html>`,
        ),
      );
    for (const [name, order] of [
      [
        "layers-elements-first.html",
        ["generated/tokens.root.css", "elements/elements.css", "tokens/text-base.css"],
      ],
      [
        "layers-label-first.html",
        ["generated/tokens.root.css", "elements/label.css", "tokens/text-base.css"],
      ],
      [
        "layers-base-first.html",
        ["generated/tokens.root.css", "tokens/text-base.css", "elements/elements.css"],
      ],
    ] as const) {
      const r = await measure(name, order);
      expect([name, r.findings]).toEqual([name, []]);
      expect(r.seen).toEqual(["label"]);
    }
  },
  limit(60_000),
);

// A hidden element draws nothing, so it is not measured; the same markup shown is.
test(
  "an element carrying hidden, or inside one, is not measured",
  async () => {
    const drift = `<style>.hw-card { border-radius: 0 }</style>`;
    const tile = `<div data-hw-tile="label" data-hw-version="${own.version}">${DEMOS.label}</div>`;
    const hidden = await measurePage(
      browser,
      targetFile(
        "hidden.html",
        only(
          `${drift}${tile}<div class="hw-card" hidden>a</div><div hidden><div class="hw-card">b</div></div>`,
        ),
      ),
    );
    expect(hidden.findings).toEqual([]);
    expect(hidden.seen).toEqual(["label"]);
    const shown = await measurePage(
      browser,
      targetFile(
        "shown.html",
        only(`${drift}${tile}<div class="hw-card">a</div><div><div class="hw-card">b</div></div>`),
      ),
    );
    expect(shown.findings.filter((f) => f.element === "card").length).toBeGreaterThan(0);
  },
  limit(60_000),
);

// A page that focuses an element (a story's focused state) draws its focus rules; the reference
// is read holding focus too.
test(
  "a focused element is measured against its focused reference",
  async () => {
    const tile = `<div data-hw-tile="icon-button" data-hw-version="${own.version}">${DEMOS["icon-button"]}</div>`;
    const page = (theme: string) =>
      only(
        `<div data-theme="${theme}">${tile}<button class="hw-icon-button" data-tone="danger" aria-label="Entfernen"><svg viewBox="0 0 20 20"></svg></button></div><script>document.querySelector('[data-tone="danger"]').focus({ focusVisible: true })</script>`,
        "hw-focus-ring",
      );
    for (const theme of ["light", "dark"]) {
      const r = await measurePage(browser, targetFile(`focused-${theme}.html`, page(theme)));
      expect(r.findings).toEqual([]);
    }
    // Control: a surface's own focus colour on the same button is still red.
    const drift = await measurePage(
      browser,
      targetFile(
        "focused-drift.html",
        page("light").replace(
          "</body>",
          "<style>.hw-icon-button:focus-visible { color: rgb(0, 128, 0) }</style></body>",
        ),
      ),
    );
    expect(drift.findings.map((f) => f.prop)).toContain("color");
  },
  limit(60_000),
);

// The target is the label: an option row and a lone box's label are 32 px under a mouse and 44 px
// on a touch screen, at the screen and dense scales; paper and stage keep the line.
test(
  "an option row and a lone box's label are the target, 32 px by mouse, 44 px by touch",
  async () => {
    const body = ["screen", "dense", "print"]
      .map(
        (scale) =>
          `<div data-hw-scale="${scale}"><fieldset class="hw-form-field"><legend class="hw-form-label">Rolle</legend><label><input type="radio" class="hw-check"> Trainer</label></fieldset><label class="hw-check-target"><input type="checkbox" class="hw-check" aria-label="Erledigt"></label></div>`,
      )
      .join("");
    const url = pathToFileURL(file("target.html", only(body))).href;
    const sizes = async (touch: boolean) => {
      const p = await browser.newPage();
      await p.emulate({
        viewport: { width: 800, height: 600, isMobile: touch, hasTouch: touch },
        userAgent: "",
      });
      await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
      await open(p, url);
      const out = await p.$$eval("[data-hw-scale]", (scales) =>
        scales.map((s) => {
          const row = browserDefined(
            s.querySelector(".hw-form-field > label"),
            "form field label",
          ).getBoundingClientRect();
          const lone = browserDefined(
            s.querySelector(".hw-check-target"),
            "checkbox target",
          ).getBoundingClientRect();
          return [Math.round(row.height), Math.round(lone.width), Math.round(lone.height)];
        }),
      );
      await p.close();
      return out;
    };
    const [mouse, touch] = [await sizes(false), await sizes(true)];
    expect(mouse.slice(0, 2)).toEqual([
      [32, 32, 32],
      [32, 32, 32],
    ]);
    expect(touch.slice(0, 2)).toEqual([
      [44, 44, 44],
      [44, 44, 44],
    ]);
    // Control: paper keeps the option at its line and the lone box at its own size.
    expect(defined(mouse[2], "paper checkbox target size")[0]).toBeLessThan(32);
    expect(touch[2]).toEqual(mouse[2]);
  },
  limit(60_000),
);

// The reference is built from the instance as it was before any reference went in beside an
// element inside it, so the focused node keeps its place; and the lone box's target is measured.
test(
  "a focused node after an element in the same parent is read at its own place; a shrunk target is red",
  async () => {
    const card = `<div data-theme="light"><div class="hw-card"><span class="hw-label">Kurs</span><button class="hw-icon-button" data-tone="danger" aria-label="Entfernen"><svg viewBox="0 0 20 20"></svg></button></div></div>`;
    const focused = await measurePage(
      browser,
      targetFile(
        "focused-nested.html",
        only(
          `${card}<script>document.querySelector('[data-tone="danger"]').focus({ focusVisible: true })</script>`,
          "hw-focus-ring",
        ),
      ),
    );
    expect(focused.findings).toEqual([]);
    const target = (css: string) =>
      measurePage(
        browser,
        targetFile(
          "target-drift.html",
          only(
            `<style>${css}</style><label class="hw-check-target"><input type="checkbox" class="hw-check" aria-label="Erledigt"></label>`,
          ),
        ),
      );
    expect((await target("")).findings).toEqual([]);
    expect(
      (await target(".hw-check-target { min-width: 24px; min-height: 24px }")).findings.map(
        (f) => f.prop,
      ),
    ).toEqual(["width", "height"]);
  },
  limit(60_000),
);

test(
  "a reference focuses the matching descendant beyond an earlier measured sibling",
  async () => {
    const css = ".target { color: rgb(4, 5, 6) } .target:focus-visible { color: rgb(1, 2, 3) }";
    const html = `<!doctype html><style>${css}</style><div class="sample"><span class="sibling">Before</span><button class="target">Focus</button></div>`;
    const tab = await browser.newPage();
    try {
      await open(tab, pathToFileURL(file("reference-focus-descendant.html", html)).href);
      await tab.$eval("button", (button) => button.focus({ focusVisible: true }));
      const dom = await installElementDom(tab);
      try {
        const result = await dom.evaluate(
          (api, css) =>
            api.compare({
              css,
              selectors: { label: ".sibling", card: ".sample" },
              styles: {
                label: { own: [], parts: [] },
                card: { own: [], parts: [{ selector: ".target", properties: ["color"] }] },
              },
              tokens: {},
              settings: [],
              tolerance: 0.02,
            }),
          css,
        );
        expect(result.findings).toEqual([]);
        expect(await tab.$eval("button", (button) => document.activeElement === button)).toBe(true);
      } finally {
        await dom.dispose();
      }
    } finally {
      await tab.close();
    }
  },
  limit(60_000),
);

test(
  "a light-only scan recognizes a brand class defined by supplemental CSS",
  async () => {
    const target = targetFile(
      "light-supplemental-css.html",
      only('<button class="btn-secondary">Pick</button>'),
    );
    const bare = await measureLightPage(browser, target);
    expect(bare.unstyled).toEqual([
      { page: target.name, cls: "btn-secondary", label: 'button "Pick"' },
    ]);
    const styled = await measureLightPage(browser, target, ".btn-secondary { display: block }");
    expect(styled.unstyled).toEqual([]);
  },
  limit(60_000),
);

// A class whose rule is gone leaves its element unstyled, which no other check sees.
test(
  "a class brand once defined, or an hw-* class, that no loaded sheet defines is red",
  async () => {
    const buttons = `<button class="hw-button">Copy answers</button><button class="pick btn-secondary">Pick recommended</button><button class="btn-primary">Copy answers</button><span class="hw-buton">x</span><p class="flex mt-2 own">Utility and own classes</p><div data-hw-shell><span class="hw-shell-only">shell</span></div>`;
    const [bare, own, negated] = await Promise.all([
      measurePage(browser, targetFile("removed.html", only(buttons))),
      // Control: the shared element and a consumer's own rule for the old name pass.
      measurePage(
        browser,
        targetFile(
          "own.html",
          only(`${buttons}<style>.btn-primary, .btn-secondary, .hw-buton { color: red }</style>`),
        ),
      ),
      // A name only inside :not() styles nothing of its own.
      measurePage(
        browser,
        targetFile(
          "negated.html",
          only(`${buttons}<style>button:not(.btn-primary) { color: red }</style>`),
        ),
      ),
    ]);
    expect(bare.unstyled.map((u) => u.cls)).toEqual(["btn-secondary", "btn-primary", "hw-buton"]);
    expect(own.unstyled).toEqual([]);
    expect(negated.unstyled.map((u) => u.cls)).toEqual([
      "btn-secondary",
      "btn-primary",
      "hw-buton",
    ]);
  },
  limit(30_000),
);

test(
  "a chosen choice, segment and pressed icon button share one fill, day and night",
  async () => {
    const set = `<div class="hw-choices"><label class="hw-choice"><input type="radio" checked>A</label></div><div class="hw-segmented"><button aria-pressed="true">B</button></div><button class="hw-icon-button" aria-pressed="true" data-variant="quiet">C</button>`;
    const body = `<div data-hw-scale="screen">${set}</div><div data-hw-scale="screen" data-theme="dark">${set}</div>`;
    const p = await browser.newPage();
    await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await open(p, pathToFileURL(file("chosen.html", only(body))).href);
    const fills = await p.$$eval("[data-hw-scale]", (scales) =>
      scales.map((s) =>
        [".hw-choice", ".hw-segmented > button", ".hw-icon-button"].map((sel) => {
          const cs = getComputedStyle(
            browserDefined(s.querySelector(sel), `selected control matching ${sel}`),
          );
          return `${cs.backgroundColor} ${cs.color}`;
        }),
      ),
    );
    await p.close();
    for (const theme of fills) expect(new Set(theme).size).toBe(1);
    expect(defined(fills[0], "day selected control fills")[0]).not.toBe(
      defined(fills[1], "night selected control fills")[0],
    );
  },
  limit(30_000),
);

test(
  "a menu entry, tab and accordion row hold the dense item height by mouse, 44 px by touch",
  async () => {
    const body = `<div data-hw-scale="dense"><div class="hw-menu" role="menu"><button class="hw-menu-item" role="menuitem">A</button></div><div class="hw-tabs" role="tablist"><button class="hw-tab" role="tab">B</button></div><div class="hw-accordion"><details><summary>C</summary></details></div></div>`;
    const url = pathToFileURL(file("items.html", only(body))).href;
    const heights = async (touch: boolean) => {
      const p = await browser.newPage();
      await p.emulate({
        viewport: { width: 800, height: 600, isMobile: touch, hasTouch: touch },
        userAgent: "",
      });
      await open(p, url);
      const out = await p.$$eval(".hw-menu-item, .hw-tab, .hw-accordion summary", (els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().height)),
      );
      await p.close();
      return out;
    };
    // The accordion row is its line and padding above the 32 px floor.
    expect(await heights(false)).toEqual([32, 32, 37]);
    expect(await heights(true)).toEqual([44, 44, 44]);
  },
  limit(30_000),
);

test(
  "a nav section holding the current page drops its fill; one marked alone keeps it; the ring sits inside",
  async () => {
    const body = `<div data-hw-scale="dense"><nav class="hw-nav" id="held"><ul><li><a href="#" aria-current="true">S</a><ul><li><a href="#" aria-current="page">P</a></li></ul></li></ul></nav><nav class="hw-nav" id="alone"><ul><li><a href="#" aria-current="true">S</a></li></ul></nav></div>`;
    const p = await browser.newPage();
    await open(p, pathToFileURL(file("nav.html", only(body, "hw-focus-ring"))).href);
    const look = (sel: string) =>
      p.$eval(sel, (a) => {
        const cs = getComputedStyle(a);
        return { fill: cs.backgroundColor, color: cs.color, weight: cs.fontWeight };
      });
    const held = await look('#held a[aria-current="true"]');
    const page = await look('#held a[aria-current="page"]');
    const alone = await look('#alone a[aria-current="true"]');
    expect(held.fill).toBe("rgba(0, 0, 0, 0)");
    expect(held.weight).toBe("500");
    expect(held.color).not.toBe(page.color);
    expect(alone).toEqual(page);
    await p.focus('#alone a[aria-current="true"]');
    await p.keyboard.press("Tab");
    await p.keyboard.down("Shift");
    await p.keyboard.press("Tab");
    await p.keyboard.up("Shift");
    expect(await p.$eval(":focus-visible", (a) => getComputedStyle(a).outlineOffset)).toBe("-3px");
    await p.close();
  },
  limit(30_000),
);

test(
  "a popover holding a nav pads 0.75rem all round, a text popover keeps 1rem inline; the check measures both",
  async () => {
    const body = `<div data-hw-scale="dense"><div class="hw-popover" id="text">Gate</div><div class="hw-popover" id="nav"><nav class="hw-nav"><ul><li><a href="#">A</a></li></ul></nav></div></div>`;
    const p = await browser.newPage();
    await open(p, pathToFileURL(file("popover-nav.html", only(body))).href);
    const pad = (sel: string) => p.$eval(sel, (e) => getComputedStyle(e).padding);
    expect(await pad("#text")).toBe("12px 16px");
    expect(await pad("#nav")).toBe("12px");
    await p.close();
    const drifted = await measurePage(
      browser,
      targetFile(
        "popover-nav-drift.html",
        only(`<style>#nav { padding-inline: 1rem }</style>${body}`),
      ),
    );
    expect(drifted.findings.filter((f) => f.element === "popover").map((f) => f.prop)).toEqual([
      "padding-right",
      "padding-left",
    ]);
    const clean = await measurePage(browser, targetFile("popover-nav-clean.html", only(body)));
    expect(clean.findings.filter((f) => f.element === "popover")).toEqual([]);
  },
  limit(60_000),
);

test(
  "a nav group's caption starts on its items' text edge at every scale and under a set --hw-nav-pad",
  async () => {
    const nav = `<nav class="hw-nav"><p class="hw-label hw-nav-group" data-tone="muted">Konten</p><ul><li><a href="#">Firmen</a></li></ul></nav>`;
    const body = ["screen", "dense", "print", "stage"]
      .map((scale) => `<div data-hw-scale="${scale}">${nav}</div>`)
      .concat(`<div data-hw-scale="dense" style="--hw-nav-pad: 0.5625rem 0.5rem">${nav}</div>`)
      .join("");
    const p = await browser.newPage();
    await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await open(p, pathToFileURL(file("nav-caption.html", only(body))).href);
    const edges = await p.$$eval(".hw-nav", (navs) =>
      navs.map((n) =>
        [".hw-nav-group", "a"].map((selector) => {
          const e = browserDefined(n.querySelector(selector), `nav element matching ${selector}`);
          const r = document.createRange();
          r.selectNodeContents(e);
          return (
            Math.round(browserDefined(r.getClientRects()[0], "nav text rectangle").left * 100) / 100
          );
        }),
      ),
    );
    await p.close();
    expect(edges.filter(([caption, link]) => caption !== link)).toEqual([]);
  },
  limit(30_000),
);

test(
  "a nav caption after a list keeps its margin: a page resetting it is red",
  async () => {
    const body = `<div data-hw-scale="dense"><nav class="hw-nav"><p class="hw-label hw-nav-group" data-tone="muted">A</p><ul><li><a href="#">B</a></li></ul><p class="hw-label hw-nav-group" data-tone="muted">C</p><ul><li><a href="#">D</a></li></ul></nav></div>`;
    const reset = await measurePage(
      browser,
      targetFile(
        "nav-caption-reset.html",
        only(`<style>.hw-nav p { margin-block: 0 }</style>${body}`),
      ),
    );
    expect(reset.findings.filter((f) => f.element === "nav").map((f) => f.prop)).toEqual([
      "margin-bottom",
      "margin-top",
    ]);
    const clean = await measurePage(browser, targetFile("nav-caption-clean.html", only(body)));
    expect(clean.findings.filter((f) => f.element === "nav")).toEqual([]);
  },
  limit(60_000),
);

test(
  "toasts stack at the bottom centre; on a phone data-place=top holds them at the top",
  async () => {
    const body = `<div class="hw-toasts" data-place="top"><div class="hw-toast"><span class="hw-toast-text">Gespeichert</span></div></div>`;
    const url = pathToFileURL(file("toasts.html", only(body))).href;
    const where = async (width: number) => {
      const p = await browser.newPage();
      await p.setViewport({ width, height: 800 });
      await open(p, url);
      const r = await p.$eval(".hw-toast", (t) => {
        const { left, top, bottom, width } = t.getBoundingClientRect();
        return { left, top, bottom, width };
      });
      await p.close();
      return r;
    };
    const wide = await where(1280);
    expect(Math.abs(wide.left + wide.width / 2 - 640)).toBeLessThan(1);
    expect(wide.bottom).toBeGreaterThan(700);
    expect(wide.width).toBeLessThan(200);
    expect((await where(390)).top).toBeLessThan(100);
  },
  limit(30_000),
);

// Markdown rendered into a card: its top-level running text takes the measure in its own em, a
// list in a list item, a block holding code or a table, a heading and a utility keep their own.
test(
  "hw-measure gives a container's running text the measure and nothing else",
  async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const body = `<style>@layer utilities { .max-w-none { max-width: none } }</style><div class="hw-measure" style="font-size:16px"><h2>H</h2><p>P</p><p style="font-size:12px">Small</p><ul><li>U<ol><li>N</li></ol></li></ul><ol><li>O</li></ol><dl><dt>T</dt><dd>D</dd></dl><blockquote>Q</blockquote><blockquote class="hw-quote">Q</blockquote><ul><li><pre>code</pre></li></ul><blockquote><table><tr><td>T</td></tr></table></blockquote><p class="max-w-none">Own</p><div><p>Nested</p></div></div>`;
    await page.goto(pathToFileURL(file("measure.html", only(body))).href);
    const widths = await page.$$eval(".hw-measure *:is(h2, p, ul, ol, dl, blockquote)", (els) =>
      els.map((el) => `${el.tagName} ${getComputedStyle(el).maxWidth}`),
    );
    expect(widths).toEqual([
      "H2 none",
      "P 528px",
      "P 396px",
      "UL 528px",
      "OL none",
      "OL 528px",
      "DL 528px",
      "BLOCKQUOTE 528px",
      "BLOCKQUOTE 528px",
      "UL none",
      "BLOCKQUOTE none",
      "P none",
      "P none",
    ]);
    const h2 = await page.$eval(".hw-measure h2", (el) => getComputedStyle(el).fontSize);
    expect(h2).toBe("24px");
    await page.close();
  },
  limit(60_000),
);

// A list holding a code block, a table or a picture in one item keeps the measure in the others:
// each ends where an item of the same list without one ends. Border-box, as under Tailwind.
test(
  "one wide list item leaves its siblings at the measure",
  async () => {
    const p = await browser.newPage();
    await p.setViewport({ width: 1440, height: 900 });
    const lists = ["ul", "ol"]
      .map(
        (l) =>
          `<${l}><li>One</li><li>Two</li></${l}><${l}><li>One</li><li><pre>code</pre></li><li>Four</li></${l}>`,
      )
      .join("");
    const body = `<style>* { box-sizing: border-box } body { margin: 0 } ul { padding: 0 }</style><div class="prose hw-prose" style="font-size:16px">${lists}</div><div class="hw-measure" style="font-size:16px;width:768px">${lists}</div>`;
    await open(p, pathToFileURL(file("wide-item.html", only(body))).href);
    const rights = await p.$$eval(":is(.hw-prose, .hw-measure) > *", (lists) =>
      lists.map((l) => [...l.children].map((li) => Math.round(li.getBoundingClientRect().right))),
    );
    await p.close();
    const [ul, wideUl, ol, wideOl, mUl, mWideUl] = rights;
    const firstUl = defined(ul?.[0], "first prose unordered item edge");
    const firstOl = defined(ol?.[0], "first prose ordered item edge");
    const firstMeasureUl = defined(mUl?.[0], "first measure unordered item edge");
    expect(wideUl).toEqual([firstUl, 768, firstUl]);
    expect(wideOl).toEqual([firstOl, 768, firstOl]);
    expect(firstUl).toBe(528);
    expect(mWideUl).toEqual([firstMeasureUl, 768, firstMeasureUl]);
  },
  limit(60_000),
);

// A priority's figures are tabular, so a column of P0 to P4 pills holds one width.
test(
  "the priority pills are one width",
  async () => {
    const p = await browser.newPage();
    const body = [0, 1, 2, 3, 4]
      .map((n) => `<span class="hw-pill" data-priority="${n}">P${n}</span>`)
      .join(" ");
    await open(p, pathToFileURL(file("priority.html", only(body, "", ["tokens/fonts.css"]))).href);
    await p.evaluate(() => document.fonts.ready);
    const widths = await p.$$eval(".hw-pill", (els) =>
      els.map((el) => el.getBoundingClientRect().width),
    );
    await p.close();
    expect(new Set(widths).size).toBe(1);
  },
  limit(60_000),
);

test("a scroll-driven animation survives a minifier without browser targets: longhands only", () => {
  for (const f of ["generated/elements.css", "expert/header.css"]) {
    const code = readFileSync(join(ROOT, f));
    const out = transform({ filename: f, code, minify: true }).code.toString();
    expect(out).toContain("animation-timeline:");
    // The shorthand cannot set a timeline: Chrome drops the whole declaration.
    expect([...out.matchAll(/animation:[^;}]*(scroll|view)\(/g)]).toEqual([]);
  }
});

/** `read` run on a page holding `html` at 1440 px by mouse, then at 390 px on a touch screen. */
const byPointer = async <T>(name: string, html: string, read: () => T) => {
  const url = pathToFileURL(file(name, html)).href;
  const out: Awaited<T>[] = [];
  for (const touch of [false, true]) {
    const p = await browser.newPage();
    await p.emulate({
      viewport: { width: touch ? 390 : 1440, height: 900, isMobile: touch, hasTouch: touch },
      userAgent: "",
    });
    await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await open(p, url);
    out.push(await p.evaluate(read));
    await p.close();
  }
  return out as [Awaited<T>, Awaited<T>];
};

// A filter bar sets choices beside selects: in dense the choice, the field and the field select
// stand one height, the control height by mouse, the touch floor on a touch screen.
test(
  "in dense a choice, a field and a field select stand 38 px by mouse, 44 px by touch",
  async () => {
    const bar = `<div class="hw-choices"><button type="button" class="hw-choice" aria-pressed="true">Alle</button></div><select class="hw-field hw-select" aria-label="Thema"><option>Alle</option></select><input class="hw-field" aria-label="Suche">`;
    const heights = await byPointer(
      "control-height.html",
      only(
        ["light", "dark"]
          .map((t) => `<div data-hw-scale="dense" data-theme="${t}">${bar}</div>`)
          .join(""),
      ),
      () =>
        [...document.querySelectorAll(".hw-choice, .hw-field")].map((e) =>
          Math.round(e.getBoundingClientRect().height),
        ),
    );
    expect(heights).toEqual([Array<number>(6).fill(38), Array<number>(6).fill(44)]);
  },
  limit(30_000),
);

// The night field's fill is a colour only, so the select keeps one chevron at every scale, in a
// joined row too, and a surface loading select.css before field.css keeps it; a read-only
// combobox shows none.
test(
  "a select and a combobox keep one chevron, no-repeat, at every scale, day and night",
  async () => {
    const set = `<select class="hw-field hw-select" aria-label="Thema"><option>Alle</option></select><input class="hw-field hw-select" list="t" aria-label="Thema"><datalist id="t"></datalist><div class="hw-field-row" data-joined><select class="hw-field hw-select" aria-label="Ort"><option>Alle</option></select><button type="button">Los</button></div><input class="hw-field hw-select" list="t" readonly aria-label="Fest">`;
    const body = ["screen", "dense", "print", "stage"]
      .flatMap((s) =>
        ["light", "dark"].map((t) => `<div data-hw-scale="${s}" data-theme="${t}">${set}</div>`),
      )
      .join("");
    const reversed = `<!doctype html><html><head>${["generated/tokens.root.css", "elements/scales.css", "elements/select.css", "elements/field.css"].map((f) => `<link rel="stylesheet" href="${brand(f)}">`).join("")}</head><body>${body}</body></html>`;
    for (const [name, html] of [
      ["chevron.html", only(body)],
      ["chevron-reversed.html", reversed],
    ] as const) {
      const p = await browser.newPage();
      await open(p, pathToFileURL(file(name, html)).href);
      const repeats = await p.$$eval(".hw-select:not([readonly])", (els) =>
        els.map((e) => {
          const cs = getComputedStyle(e);
          return { repeat: cs.backgroundRepeat, chevron: cs.backgroundImage.startsWith("url(") };
        }),
      );
      const readOnly = await p.$$eval(".hw-select[readonly]", (els) => [
        ...new Set(els.map((e) => getComputedStyle(e).backgroundImage)),
      ]);
      await p.close();
      expect(repeats).toEqual(
        Array.from({ length: 24 }, () => ({ repeat: "no-repeat", chevron: true })),
      );
      expect([name, ...readOnly]).toEqual([name, "none"]);
    }
  },
  limit(30_000),
);

// The form elements take the small corner of the scale, the brand corner staying on blocks and a
// button standing alone.
test(
  "a field, select, textarea, file field, joined row and the button beside a field take the small corner",
  async () => {
    const set = `${DEMOS.field}<a class="hw-button" href="#">Allein</a>`;
    const body = ["screen", "dense", "print", "stage"]
      .map(
        (s) =>
          `<div data-hw-scale="${s}"><span class="probe" style="border-radius: var(--hw-corner-sm)"></span><span class="brand" style="border-radius: var(--hw-card-corner)"></span>${set}</div>`,
      )
      .join("");
    const p = await browser.newPage();
    await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await open(
      p,
      pathToFileURL(file("form-corner.html", only(body, "", ["tokens/print.css"]))).href,
    );
    const corners = await p.$$eval("[data-hw-scale]", (scales) =>
      scales.map((s) => {
        const r = (e: Element) => getComputedStyle(e).borderRadius;
        const sm = r(browserDefined(s.querySelector(".probe"), "small corner probe"));
        const brandRadius = r(browserDefined(s.querySelector(".brand"), "brand corner probe"));
        const form = [
          ...s.querySelectorAll(
            ".hw-field:not(.hw-field-row[data-joined] > *), .hw-field-row[data-joined], .hw-field-row > .hw-button",
          ),
        ];
        return {
          off: form.filter((e) => r(e) !== sm).map((e) => e.outerHTML.slice(0, 60)),
          count: form.length,
          alone:
            r(browserDefined(s.querySelector(":scope > a.hw-button"), "standalone form button")) ===
            brandRadius,
          differ: sm !== brandRadius,
        };
      }),
    );
    await p.close();
    for (const c of corners)
      expect(c).toEqual({ off: [], count: c.count, alone: true, differ: true });
    expect(defined(corners[0], "first scale form corners").count).toBeGreaterThan(8);
  },
  limit(30_000),
);

// Every mark of a check list stands on one vertical axis at one row pitch in every scale, the box
// without text beside it included, while its target keeps its size.
test(
  "the marks of a check list share one axis and one pitch in every scale, by mouse and touch",
  async () => {
    const body = ["screen", "dense", "print", "stage"]
      .map((s) => `<div data-hw-scale="${s}">${DEMOS.check}</div>`)
      .join("");
    const [mouse, touch] = await byPointer("check-column.html", only(body), () =>
      [...document.querySelectorAll("[data-hw-scale]")].map((s) => {
        const boxes = [...s.querySelectorAll(".hw-check")].map((e) => e.getBoundingClientRect());
        const mid = (b: DOMRect) => [b.left + b.width / 2, b.top + b.height / 2] as const;
        const centres = boxes.map(mid);
        const pitches = centres
          .slice(1)
          .map(
            ([, y], i) =>
              Math.round((y - browserDefined(centres[i], "preceding checkbox center")[1]) * 4) / 4,
          );
        const target = browserDefined(
          s.querySelector(".hw-check-target"),
          "checkbox target",
        ).getBoundingClientRect();
        return {
          axes: [...new Set(centres.map(([x]) => Math.round(x * 4) / 4))].length,
          pitches: [...new Set(pitches)].length,
          target: Math.round(target.width),
        };
      }),
    );
    const one = { axes: 1, pitches: 1 };
    expect(mouse).toEqual([32, 32, 16, 16].map((target) => ({ ...one, target })));
    expect(touch).toEqual([44, 44, 16, 16].map((target) => ({ ...one, target })));
  },
  limit(30_000),
);

test(
  "repeated cards, buttons and [data-hw-repeat] groups take the small corner while standalone blocks keep the brand corner",
  async () => {
    const html = only(
      `<div data-hw-scale="screen">
        <div class="hw-card" id="alone-card">Cover</div>
        <h2>Section</h2>
        <div class="hw-card" id="second-alone-card">Summary</div>
        <a class="hw-button" id="alone-btn" href="#">Offer</a>
        <div class="grid"><div class="hw-card" id="adj-card-1">A</div><div class="hw-card" id="adj-card-2">B</div></div>
        <div class="row"><a class="hw-button" id="adj-btn-1" href="#">A</a><a class="hw-button" id="adj-btn-2" href="#">B</a></div>
        <ul><li><article class="hw-card" id="li-card-1">One</article></li><li><article class="hw-card" id="li-card-2">Two</article></li></ul>
        <div data-hw-repeat><div><div class="hw-card" id="wrap-card-1">W1</div></div><div><div class="hw-card" id="wrap-card-2">W2</div></div></div>
      </div>`,
    );
    const r = await measurePage(browser, targetFile("repeat-corners.html", html));
    expect(r.findings).toEqual([]);
    const p = await browser.newPage();
    await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await open(p, pathToFileURL(file("repeat-corners-read.html", html)).href);
    const radii = await p.evaluate(() => {
      const ids = [
        "alone-card",
        "second-alone-card",
        "alone-btn",
        "adj-card-1",
        "adj-card-2",
        "adj-btn-1",
        "adj-btn-2",
        "li-card-1",
        "li-card-2",
        "wrap-card-1",
        "wrap-card-2",
      ];
      return Object.fromEntries(
        ids.map((id) => [
          id,
          getComputedStyle(browserDefined(document.getElementById(id), `element #${id}`))
            .borderRadius,
        ]),
      );
    });
    await p.close();
    expect(radii).toEqual({
      "alone-card": "20px 5px",
      "second-alone-card": "20px 5px",
      "alone-btn": "20px 5px",
      "adj-card-1": "5px",
      "adj-card-2": "5px",
      "adj-btn-1": "5px",
      "adj-btn-2": "5px",
      "li-card-1": "5px",
      "li-card-2": "5px",
      "wrap-card-1": "5px",
      "wrap-card-2": "5px",
    });
    const hard = await measurePage(
      browser,
      targetFile(
        "repeat-hard.html",
        only(`<div data-hw-repeat><div style="border-radius: 20px 5px">R</div></div>`),
      ),
    );
    expect(hard.findings.map((f) => [f.element, f.got])).toEqual([
      ["corner", "the brand corner on a repeated item"],
    ]);
  },
  limit(60_000),
);

test(
  "internal surfaces draw no brand corner while nested print and stage subtrees keep theirs",
  async () => {
    const html = only(
      `<div data-hw-scale="dense" data-hw-surface="internal">
        <div class="hw-card" id="int-card">Card</div>
        <button type="button" class="hw-button" id="int-btn">Save</button>
        <div class="hw-callout" id="int-callout">Note</div>
        <div id="int-var" style="border-radius: var(--radius-brand)">Box</div>
        <div data-hw-scale="print">
          <div class="hw-card" id="print-card">Offer</div>
          <a class="hw-button" id="print-btn" href="#">Contact</a>
        </div>
        <div data-hw-scale="stage">
          <div class="hw-card" id="stage-card">Slide</div>
        </div>
      </div>`,
      "",
      ["tokens/print.css"],
    );
    const r = await measurePage(browser, targetFile("internal-corners.html", html));
    expect(r.findings).toEqual([]);
    const p = await browser.newPage();
    await p.evaluateOnNewDocument(`globalThis.browserDefined = ${defined.toString()}`);
    await open(p, pathToFileURL(file("internal-corners-read.html", html)).href);
    const radii = await p.evaluate(() => {
      const ids = [
        "int-card",
        "int-btn",
        "int-callout",
        "int-var",
        "print-card",
        "print-btn",
        "stage-card",
      ];
      return Object.fromEntries(
        ids.map((id) => [
          id,
          getComputedStyle(browserDefined(document.getElementById(id), `element #${id}`))
            .borderRadius,
        ]),
      );
    });
    await p.close();
    expect(radii).toEqual({
      "int-card": "5px",
      "int-btn": "5px",
      "int-callout": "5px",
      "int-var": "5px",
      "print-card": "16px 4px",
      "print-btn": "16px 4px",
      "stage-card": "30px 7.5px",
    });
    const hard = await measurePage(
      browser,
      targetFile(
        "internal-hard.html",
        only(
          `<div data-hw-scale="dense" data-hw-surface="internal"><div style="border-radius: 20px 5px">Leak</div></div>`,
        ),
      ),
    );
    expect(hard.findings.map((f) => [f.element, f.got])).toEqual([
      ["corner", "the brand corner on an internal surface"],
    ]);
  },
  limit(60_000),
);
