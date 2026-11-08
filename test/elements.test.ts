import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "puppeteer-core";
import own from "../package.json";
import {
  coverage,
  ELEMENTS,
  measurePage,
  rules,
  SETTINGS,
  setsOwned,
  sourceFindings,
  type Config,
} from "../scan/elements";
import { launch, open } from "../scan/markers";
import { DEMOS } from "../scripts/element-demos";
import { tokens } from "../generated/tokens";
import { ROOT } from "../scripts/git";

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

/** A page holding only `body`, on the tokens, the elements and any further brand `sheets`. */
const only = (body: string, bodyClass = "", sheets: string[] = []) =>
  `<!doctype html><html><head>${["generated/tokens.root.css", "elements/elements.css", ...sheets].map((f) => `<link rel="stylesheet" href="${brand(f)}">`).join("")}</head><body class="${bodyClass}">${body}</body></html>`;

const dir = mkdtempSync(join(tmpdir(), "brand-elements-"));
const file = (name: string, html: string) => {
  writeFileSync(join(dir, name), html);
  return join(dir, name);
};

let browser: Browser;
beforeAll(async () => {
  browser = await launch();
});
afterAll(async () => {
  await browser?.close();
  rmSync(dir, { recursive: true, force: true });
});

// An element inside an exception's instance is not measured.
test("every element matches its rule in every scale and theme", async () => {
  const r = await measurePage(browser, file("clean.html", page()));
  expect(r.findings).toEqual([]);
  expect(r.seen.sort()).toEqual(Object.keys(ELEMENTS).sort());
  expect(r.exceptions).toEqual(["total-band"]);
}, 60_000);

// One drift per element, as a surface's own rule overrides the element: each must turn red.
const DRIFT: Record<string, string> = {
  label: ".hw-label { letter-spacing: 0.1em }",
  pill: ".hw-pill { background: color-mix(in srgb, var(--color-teal) 40%, white) }",
  card: ".hw-card { border-color: var(--color-teal) }",
  callout: ".hw-callout { border-radius: 0 }",
  quote: ".hw-quote { border-left-width: 4px }",
  table: ".hw-table th { color: var(--color-ink) }",
  link: ".hw-link { text-decoration-line: none }",
  "focus-ring": ".hw-focus-ring :focus-visible { outline-width: 2px }",
  "icon-button": ".hw-icon-button { border-radius: 5px }",
  strip: ".hw-strip { height: 2px }",
  rule: ".hw-rule { background: linear-gradient(90deg, #1a7285, #9333ea) }",
  code: ".hw-code { background: #24292e }",
  "inline-code": ".hw-inline-code { border-radius: 0 }",
  button: ".hw-button { border-radius: 5px }",
  "arrow-link": ".hw-arrow-link { color: var(--color-teal) }",
  field: ".hw-field { border-color: var(--color-border) }",
  check: ".hw-check { border-width: 2px }",
  facts: ".hw-facts > div { row-gap: 8px }",
  "dot-list": ".hw-dot-list { align-items: center }",
  segmented: ".hw-segmented { padding: 4px }",
  row: ".hw-row { padding: 12px }",
  breadcrumb: ".hw-breadcrumb a { color: var(--color-purple) }",
  status: ".hw-status { background: transparent }",
  frame: ".hw-frame { border-style: solid }",
  kpi: ".hw-kpi-value { font-weight: 500 }",
  "label-box": ".hw-label-box { padding: 9px }",
  prose: ".hw-prose h3 { font-weight: 400 }",
  kbd: ".hw-kbd { border-radius: 0 }",
};
test("every element has its drift", () => {
  expect(Object.keys(DRIFT).sort()).toEqual(Object.keys(ELEMENTS).sort());
});
test.each(Object.entries(DRIFT))(
  "a drifted %s is red",
  async (name, css) => {
    const r = await measurePage(browser, file(`drift-${name}.html`, page(css)));
    expect(r.findings.some((f) => f.element === name)).toBe(true);
  },
  60_000,
);

test("a read-only check that loses its tick mask or its ring's scale is red", async () => {
  const r = await measurePage(
    browser,
    file("drift-readonly.html", page(".hw-check[data-readonly] { mask: none; scale: none }")),
  );
  const props = r.findings.filter((f) => f.element === "check").map((f) => f.prop);
  expect(props).toContain("mask-image");
  expect(props).toContain("scale");
}, 60_000);

// Every instance is measured, not one per kind: one drifted pill among 2,000 is red, and only it.
test("one drifted instance among many is red", async () => {
  const pills = Array.from({ length: 2000 }, (_, i) =>
    i === 1234 ? '<span class="hw-pill" id="odd">pdf</span>' : '<span class="hw-pill">pdf</span>',
  ).join("");
  const r = await measurePage(
    browser,
    file(
      "one-of-many.html",
      page("#odd { padding-left: 13px }").replace("</body>", `${pills}</body>`),
    ),
  );
  expect(r.findings.map((f) => f.prop)).toEqual(["padding-left"]);
}, 60_000);

// A set priority never takes the outline that means "no value": P2 to P4 fill, each lighter, on
// the theme's own neutral (P3 and P4 share P2's text and fill colour, at less strength).
test("priority pills P2 to P4 fade on a fill, day and night, and none is the outline", async () => {
  const row = [2, 3, 4]
    .map((p) => `<span class="hw-pill" data-priority="${p}">P${p}</span>`)
    .join("");
  const html = only(`<div>${row}</div><div data-theme="dark">${row}</div>`);
  const tab = await browser.newPage();
  await tab.goto(pathToFileURL(file("priority.html", html)).href);
  const themes = await tab.evaluate(() =>
    [...document.querySelectorAll("body > div")].map((d) =>
      [...d.children].map((e) => {
        const s = getComputedStyle(e);
        return { bg: s.backgroundColor, border: s.borderTopColor, text: s.color };
      }),
    ),
  );
  await tab.close();
  // rgb(), rgba() or color(srgb ...): three channels, then the alpha if any.
  const parse = (c: string) => {
    const [r, g, b, a = 1] = (c.match(/[\d.]+/g) ?? []).map(Number);
    return { rgb: [r, g, b].join(" "), a };
  };
  for (const [p2, p3, p4] of themes) {
    const [b2, b3, b4] = [p2!, p3!, p4!].map((p) => parse(p.bg));
    expect(b2!.a).toBeGreaterThan(b3!.a);
    expect(b3!.a).toBeGreaterThan(b4!.a);
    expect(b4!.a).toBeGreaterThan(0);
    for (const p of [p2!, p3!, p4!]) expect(parse(p.border).a).toBe(0);
    for (const p of [p3!, p4!]) {
      expect(parse(p.bg).rgb).toBe(b2!.rgb);
      expect(parse(p.text).rgb).toBe(parse(p2!.text).rgb);
    }
  }
}, 60_000);

// The scaffolding catalog shell's own card and pill (data-hw-shell): neither measured nor shown.
test("an element of the catalog shell is not measured and needs no uses entry", async () => {
  const shell =
    '<a data-hw-shell class="hw-card" style="border-radius: 0"><span data-hw-shell class="hw-pill" style="padding: 0">3 states</span></a>';
  const html = only(
    `${shell}<div data-hw-tile="label" data-hw-version="${own.version}">${DEMOS.label}</div>`,
  );
  const r = await measurePage(browser, file("shell.html", html));
  expect(r.findings).toEqual([]);
  expect(r.seen).toEqual(["label"]);
  expect(coverage({ pages: [], uses: ["label"] }, [r])).toEqual([]);
  // Control: the same markup without the marker is measured and must be listed.
  const bare = await measurePage(
    browser,
    file("no-shell.html", html.replaceAll("data-hw-shell ", "")),
  );
  expect(bare.findings.map((f) => f.element)).toContain("card");
  expect(coverage({ pages: [], uses: ["label"] }, [bare])).toContain(
    'card: a page shows it, but brand-elements.json does not list it in "uses"',
  );
}, 60_000);

// A closed fold draws its elements once opened, so they are measured open: a focusable in a shut
// fold takes no focus and reads as having no ring.
test("an element in a closed details is measured open; a header's menu stays shut", async () => {
  const fold = (inner: string) => only(inner, "hw-focus-ring");
  const tile = `<div data-hw-tile="focus-ring" data-hw-version="${own.version}">${DEMOS["focus-ring"]}</div>`;
  const closed = await measurePage(
    browser,
    file("fold.html", fold(`<details><summary>Mehr</summary>${tile}</details>`)),
  );
  expect(closed.findings).toEqual([]);
  // Control: the menu in a header is left shut, and its focusable reads no ring.
  const menu = await measurePage(
    browser,
    file("menu.html", fold(`<header><details><summary>Menü</summary>${tile}</details></header>`)),
  );
  expect(menu.findings.map((f) => f.prop)).toEqual(["outline-style"]);
}, 60_000);

// Tailwind's preflight: every element a solid border of no width, which draws nothing.
test("a border of no width is no drift, whatever its style; a drawn one is", async () => {
  const unruled = (css: string) =>
    page(css).replace(
      "</body>",
      '<dl class="hw-facts"><div><dt class="hw-label" data-tone="muted">Dauer</dt><dd>2 Tage</dd></div></dl></body>',
    );
  const none = await measurePage(
    browser,
    file(
      "zero-border.html",
      unruled(".hw-facts:not([data-variant]) > div { border: 0 solid red }"),
    ),
  );
  expect(none.findings).toEqual([]);
  const drawn = await measurePage(
    browser,
    file(
      "drawn-border.html",
      unruled(".hw-facts:not([data-variant]) > div { border-top: 1px solid }"),
    ),
  );
  expect(drawn.findings.some((f) => f.element === "facts")).toBe(true);
}, 60_000);

test("a setting the medium sets, or a property the element leaves to it, is no drift", async () => {
  const r = await measurePage(
    browser,
    file(
      "setting.html",
      page(".hw-card { --hw-card-pad: 3rem; font-size: 9pt } .hw-label { --hw-label-size: 9.5pt }"),
    ),
  );
  expect(r.findings).toEqual([]);
}, 60_000);

test("inside a brand corner every block takes the small corner; a brand corner there is red, hidden too", async () => {
  const nested = `<div class="hw-card"><pre class="hw-code">x</pre><div class="hw-callout">y</div><img style="border-radius: var(--radius-brand); width: 40px; height: 40px" alt=""></div>`;
  const r = await measurePage(browser, file("nested.html", only(nested)));
  expect(r.findings).toEqual([]);
  const hard = await measurePage(
    browser,
    file(
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
}, 60_000);

// A build that rewrites color-mix() into rgba() (Lightning CSS) draws the same colour.
test("the same colour in another notation is no drift, another colour is", async () => {
  const same = await measurePage(
    browser,
    file(
      "notation.html",
      page(
        '[data-theme="dark"] .hw-card:not([data-variant]) { border-color: rgba(255, 255, 255, 0.15); background-color: rgba(255, 255, 255, 0.07) }',
      ),
    ),
  );
  expect(same.findings).toEqual([]);
  const other = await measurePage(
    browser,
    file(
      "notation-drift.html",
      page(
        '[data-theme="dark"] .hw-card:not([data-variant]) { background-color: rgba(255, 255, 255, 0.12) }',
      ),
    ),
  );
  expect(other.findings.some((f) => f.element === "card")).toBe(true);
}, 60_000);

// A light-only page (brand-elements.json "lightOnly") may leave the night tokens out: the night
// rules never draw there. A day token still counts.
test("a light-only page needs no night token, a day token still counts", async () => {
  const noNight = page(":root { --color-night-muted: initial }");
  const strict = await measurePage(browser, file("light-strict.html", noNight));
  expect(strict.findings.some((f) => f.prop === "--color-night-muted")).toBe(true);
  const light = await measurePage(browser, file("light-only.html", noNight), "", true);
  expect(light.findings.filter((f) => f.got === "undefined")).toEqual([]);
  const noDay = page(":root { --color-teal-dark: initial }");
  const day = await measurePage(browser, file("light-day.html", noDay), "", true);
  expect(day.findings.some((f) => f.prop === "--color-teal-dark")).toBe(true);
}, 60_000);

test("a brand token the surface never defines is red", async () => {
  const r = await measurePage(
    browser,
    file("token.html", page(":root { --type-small-family: initial }")),
  );
  expect(r.findings.some((f) => f.prop === "--type-small-family")).toBe(true);
}, 60_000);

// Every label, toned or hued, on every 7 % wash, on each ground of its theme, at a phone's 412 px:
// 4.5:1 or more. The plain hue on a status wash is drift.
test("every label clears 4.5:1 on every wash, light and night, at 412 px", async () => {
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
  await tab.setViewport({ width: 412, height: 900 });
  await tab.goto(pathToFileURL(file("wash.html", only(grounds))).href);
  const low = await tab.evaluate(() => {
    // Computed colours read as rgb() or color(srgb …), with an alpha or without.
    const rgba = (s: string) => {
      const n = s.match(/[\d.]+(?:e[-+]?\d+)?/gi)!.map(Number);
      const [r, g, b] = s.startsWith("color(") ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3);
      return [r!, g!, b!, n[3] ?? 1] as const;
    };
    const lum = (c: readonly number[]) =>
      [0.2126, 0.7152, 0.0722].reduce((sum, w, i) => {
        const v = c[i]! / 255;
        return sum + w * (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      }, 0);
    return [...document.querySelectorAll<HTMLElement>(".hw-label")].flatMap((el) => {
      const box = el.parentElement!;
      const ground = rgba(getComputedStyle(box.parentElement!).backgroundColor);
      const wash = rgba(getComputedStyle(box).backgroundColor);
      const under = ground.slice(0, 3).map((g, i) => wash[i]! * wash[3] + g * (1 - wash[3]));
      const [x, y] = [lum(rgba(getComputedStyle(el).color)), lum(under)].sort((p, q) => q - p);
      const ratio = (x! + 0.05) / (y! + 0.05);
      const name = `${box.closest("[data-theme]")!.getAttribute("style")} ${box.className}[${box.dataset.tone ?? box.dataset.hue ?? box.dataset.variant ?? ""}] ${el.dataset.hue ?? el.dataset.tone ?? "label"}`;
      return ratio < 4.5 ? [`${name} ${ratio.toFixed(2)}`] : [];
    });
  });
  await tab.close();
  expect(low).toEqual([]);
  const plain = await measurePage(
    browser,
    file(
      "wash-drift.html",
      page('.hw-status .hw-label[data-hue="red"] { color: var(--color-red) }'),
    ),
  );
  expect(plain.findings.some((f) => f.element === "label" && f.prop === "color")).toBe(true);
}, 60_000);

// Every text of every sample, in every scale and theme, against the fills behind it: 4.5:1, 3:1 at
// large size (24 px, or 18.66 px bold). A control's own fill counts, the browser's included, so a
// control inside an element that keeps the UA's face fails here. A disabled control is exempt.
test("every text in every sample clears WCAG AA in every scale, day and night", async () => {
  const grounds =
    '[data-theme="light"] { background: var(--color-white); color: var(--color-ink) } [data-theme="dark"] { background: var(--color-night); color: var(--color-night-ink) }';
  const tab = await browser.newPage();
  await tab.goto(pathToFileURL(file("contrast.html", page(grounds))).href);
  const low = await tab.evaluate(() => {
    const rgba = (s: string) => {
      const n = s.match(/[\d.]+(?:e[-+]?\d+)?/gi)!.map(Number);
      const [r, g, b] = s.startsWith("color(") ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3);
      return [r!, g!, b!, n[3] ?? 1] as const;
    };
    const lum = (c: readonly number[]) =>
      [0.2126, 0.7152, 0.0722].reduce((sum, w, i) => {
        const v = c[i]! / 255;
        return sum + w * (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      }, 0);
    const over = (top: readonly number[], under: number[]) =>
      under.map((u, i) => top[i]! * top[3]! + u * (1 - top[3]!));
    // The fills from the theme section down to el, composited in order.
    const behind = (el: Element) => {
      const chain: Element[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        chain.unshift(e);
        if (e.hasAttribute("data-theme")) break;
      }
      return chain.reduce(
        (c, e) => over(rgba(getComputedStyle(e).backgroundColor), c),
        [255, 255, 255],
      );
    };
    const tiles = document.querySelectorAll(
      "[data-hw-scale] > :is([data-hw-tile], [data-hw-sample])",
    );
    return [...tiles].flatMap((tile) =>
      [tile, ...tile.querySelectorAll("*")].flatMap((el) => {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (!own || el.closest(":disabled") || el.closest("[aria-hidden]")) return [];
        const s = getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none") return [];
        const [x, y] = [lum(over(rgba(s.color), behind(el))), lum(behind(el))].sort(
          (p, q) => q - p,
        );
        const ratio = (x! + 0.05) / (y! + 0.05);
        const px = parseFloat(s.fontSize);
        const large = px >= 24 || (px >= 18.66 && Number(s.fontWeight) >= 700);
        if (ratio >= (large ? 3 : 4.5)) return [];
        const section = tile.parentElement!;
        const name = tile.getAttribute("data-hw-tile") ?? tile.getAttribute("data-hw-sample");
        return [
          `${section.dataset.hwScale} ${section.dataset.theme} ${name} ${el.tagName.toLowerCase()} "${el.textContent!.trim().slice(0, 20)}" ${ratio.toFixed(2)}`,
        ];
      }),
    );
  });
  // A button or select in a label or a table head takes the role it sits in: its colour, no face.
  const faced = await tab.evaluate(() =>
    [
      ...document.querySelectorAll(
        "[data-hw-scale] :is(.hw-label, .hw-table th) :is(button, select)",
      ),
    ].flatMap((el) => {
      const s = getComputedStyle(el);
      const ok =
        s.color === getComputedStyle(el.parentElement!).color &&
        s.backgroundColor === "rgba(0, 0, 0, 0)" &&
        s.borderTopWidth === "0px";
      const where = el.closest<HTMLElement>("[data-hw-scale]")!.dataset;
      return ok ? [] : [`${where.hwScale} ${where.theme} ${el.textContent!.trim()}`];
    }),
  );
  await tab.close();
  expect(low).toEqual([]);
  expect(faced).toEqual([]);
}, 60_000);

// The nearest theme decides: a light slide inside a dark page draws its elements by day.
test("a light subtree inside a dark one draws the day rule", async () => {
  const r = await measurePage(
    browser,
    file(
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
  const [day, probe] = await html.evaluate(() => {
    const ref = document.createElement("span");
    ref.className = "hw-label";
    document.body.append(ref);
    return [getComputedStyle(ref).color, getComputedStyle(document.getElementById("probe")!).color];
  });
  await html.close();
  expect(probe).toBe(day);
}, 60_000);

// A cell takes no shadow root; a remove button sizes by the pill, not the browser's button font.
test("an element in a table cell and a pill's remove button are measured", async () => {
  const r = await measurePage(
    browser,
    file(
      "cell.html",
      page().replace(
        "</body>",
        '<table><tr><td class="hw-label">Zeitraum</td><td><span class="hw-pill">agentic<button type="button" class="hw-pill-remove" aria-label="Entfernen"></button></span></td></tr></table></body>',
      ),
    ),
  );
  expect(r.findings).toEqual([]);
  const page2 = await browser.newPage();
  await page2.goto(`file://${file("cell2.html", page())}`);
  const [btn, pill] = await page2.evaluate(() => {
    const b = document.querySelector(".hw-pill-remove")!;
    return [getComputedStyle(b).width, getComputedStyle(b.parentElement!).fontSize];
  });
  await page2.close();
  expect(btn).toBe(pill);
}, 60_000);

// The link's underline offset is in em: its reference reads the cell's 14 px, not the table's parent.
test("a link in a smaller table cell is measured at the cell's size", async () => {
  const r = await measurePage(
    browser,
    file(
      "cell-link.html",
      page().replace(
        "</body>",
        '<table style="font-size: 14px"><tr><td><a class="hw-link" href="#x">Agenda</a></td></tr></table></body>',
      ),
    ),
  );
  expect(r.findings).toEqual([]);
}, 60_000);

test("a joined field row is measured joined", async () => {
  const joined =
    '<div class="hw-field-row" data-joined><input class="hw-field" aria-label="Suche"><button type="button" class="hw-button">Go</button></div>';
  const r = await measurePage(
    browser,
    file("joined.html", page().replace("</body>", `${joined}</body>`)),
  );
  expect(r.findings).toEqual([]);
}, 60_000);

test("night is measured against the night rule", async () => {
  const r = await measurePage(
    browser,
    file("night.html", page('[data-theme="dark"] .hw-pill { color: var(--color-ink) }')),
  );
  expect(r.findings.filter((f) => f.element === "pill").length).toBeGreaterThan(0);
}, 60_000);

test("coverage: a used element without a tile, a stale tile, an unlisted element, an exception without a reason or a tile", () => {
  const config: Config = {
    pages: [],
    uses: ["card", "pill", "chart"],
    exceptions: { "total-band": "", "slide-table": "framed for the room" },
  };
  const out = coverage(config, [
    {
      page: "a.html",
      seen: ["card", "label"],
      tiles: [{ name: "card", version: own.version, holds: true }],
      exceptions: ["total-band"],
    },
    // A stale page listed after a fresh one still fails, named.
    {
      page: "b.html",
      seen: [],
      tiles: [{ name: "card", version: "0.1.0", holds: true }],
      exceptions: [],
    },
  ]);
  expect(out).toEqual([
    `card: the tile on b.html says brand v0.1.0, the installed package is v${own.version}; rebuild that page`,
    'pill: used, but no page shows it in a [data-hw-tile="pill"]',
    'brand-elements.json: "chart" is no shared element (label, label-box, pill, card, callout, quote, table, link, focus-ring, icon-button, strip, rule, code, inline-code, kbd, button, arrow-link, field, check, facts, dot-list, segmented, row, breadcrumb, status, frame, kpi, prose)',
    'label: a page shows it, but brand-elements.json does not list it in "uses"',
    'brand-elements.json: exception "total-band" names no reason',
    'slide-table: an exception without a [data-hw-exception="slide-table"] on a page',
  ]);
});

test("source: a rule styling an element-named class is red unless hw-* or an exception", () => {
  const files: Record<string, string> = {
    "src/a.css": `.card:hover { border-color: teal } .card::before { background: purple } :is(.linked-card, a.tag):is(:hover, :has(:is(a, summary):focus-visible)) { border-color: teal } .card:has(:is(a, button):focus-visible) { outline: 2px solid } .side-card:not(.x) { border-color: red } .doc-tag { border-radius: 9999px } .card .meta { color: red } .card { display: grid } .note { font-size: 9pt; color: grey } .total-note { font: 9pt sans-serif }
@media print { .callout { background: white } } .hw-card { border: 0 } .total-band { background: teal }
.eyebrow, .title { font-size: 9pt } .text-button { min-height: 2rem } .event-facts { margin-top: 0 } .button-row { gap: 1rem } .icon-button { width: 2rem }`,
    "src/components/Breadcrumbs.astro": `<nav/>`,
    "src/components/TrainingFacts.astro": `<dl class="hw-facts"/>`,
    "src/components/Card.astro": `<div class="card"/><style>.wrap { padding: 0 }</style>`,
    "src/components/Quote.astro": `<blockquote class="hw-quote"/>`,
    "src/components/Chip.astro": `<span/>`,
    "test/x.css": ".chip { border: 0 }",
  };
  files["deck/readout.css"] = ".quote { font-size: 2rem }";
  const out = sourceFindings(Object.keys(files), (p) => files[p]!, {
    "doc-tag": "the type tag",
    readout: { reason: "the deck's own medium", files: ["deck/readout.css"] },
  });
  expect(out).toEqual([
    'src/a.css: .side-card:not(.x) styles an element named like a shared one; use the hw-* element or list "side-card" as an exception',
    'src/a.css: .total-note styles an element named like a shared one; use the hw-* element or list "total-note" as an exception',
    'src/a.css: .callout styles an element named like a shared one; use the hw-* element or list "callout" as an exception',
    'src/a.css: .eyebrow styles an element named like a shared one; use the hw-* element or list "eyebrow" as an exception',
    'src/a.css: .text-button styles an element named like a shared one; use the hw-* element or list "text-button" as an exception',
    'src/a.css: .event-facts styles an element named like a shared one; use the hw-* element or list "event-facts" as an exception',
    'src/a.css: .icon-button styles an element named like a shared one; use the hw-* element or list "icon-button" as an exception',
    'src/components/Breadcrumbs.astro: a component named like a shared element; render the hw-* element or list "breadcrumbs" as an exception',
    'src/components/Card.astro: a component named like a shared element; render the hw-* element or list "card" as an exception',
    'src/components/Chip.astro: a component named like a shared element; render the hw-* element or list "chip" as an exception',
  ]);
});

test("the strip and the expert header strip draw the strip gradient, teal to purple", () => {
  expect(tokens["--gradient-strip"]).toBe(
    "linear-gradient(to right, var(--color-teal), var(--color-purple))",
  );
  for (const f of ["elements/strip.css", "expert/header.css"])
    expect(readFileSync(join(ROOT, f), "utf8")).toContain("background: var(--gradient-strip);");
});

test("rules opens at-rule blocks and reads each rule's properties", () => {
  expect(rules("@layer x { @media print { .a, .b { color: red; border: 0 } } } .c{x:1}")).toEqual([
    { selectors: [".a", ".b"], props: ["color", "border"] },
    { selectors: [".c"], props: ["x"] },
  ]);
});

// The print preset leaves the type sizes to print.css, which owns paper sizes; the screen preset
// sets every setting, so a screen cell inside a paper page is whole.
test("the screen preset sets every setting an element reads", () => {
  const screen = readFileSync(join(ROOT, "elements/scales.css"), "utf8").match(
    /\[data-hw-scale="screen"\] \{([^}]*)\}/,
  )![1]!;
  const optional = new Set([
    "--hw-label-family",
    "--hw-muted",
    "--hw-pill-hue",
    "--hw-pill-hue-night",
    "--hw-pill-edit-corner",
    "--hw-segment-line",
    "--hw-marker-gap",
    "--hw-marker-mid",
    "--hw-row-fill",
    "--hw-prose-width",
    "--hw-field-family",
    "--hw-button-corner",
  ]);
  expect(SETTINGS.filter((s) => !optional.has(s) && !screen.includes(`${s}:`))).toEqual([]);
});

// os 13 px, trainer hub 14 px, both dense.
test("dense with data-hw-type=regular takes the expert set's regular text, dense alone 13 px", async () => {
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
  const regular = ["--text-ui", "--text-ui--line-height", "--text-micro"].map(
    (v) => expert.match(new RegExp(`\\n\\s*${v}: ([^;]+);`))![1]!,
  );
  expect(await read('data-hw-scale="dense" data-hw-type="regular"')).toEqual(regular);
  expect(await read('data-hw-scale="dense"')).toEqual(["0.8125rem", "1.45", "0.6875rem"]);
  await p.close();
}, 60_000);

test("the print button stands as tall as its text in the brand corner at paper size, a carded one in the small corner", async () => {
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
      return [s.minHeight, s.fontSize, s.paddingTop, s.borderTopLeftRadius, s.borderTopRightRadius];
    });
  expect(await read("paper")).toEqual(["0px", "12.6667px", "4px", "16px", "4px"]);
  expect((await read("screen"))[3]).toBe("20px");
  expect((await read("carded"))[3]).toBe("5px");
  expect((await read("carded-paper")).slice(3)).toEqual(["4px", "4px"]);
  await p.setViewport({ width: 1280, height: 800 });
  expect((await read("paper"))[0]).toBe("0px");
  await p.close();
}, 60_000);

// Size scales with the medium, shape never: every sample draws the same corner kind and border on
// every scale and theme, and a brand corner is the medium's own, the card's.
test("every element keeps one shape on every scale and theme", async () => {
  const p = await browser.newPage();
  await open(p, pathToFileURL(file("shapes.html", page())).href);
  const shapes = await p.$$eval("section", (sections) =>
    sections.map((section) => {
      const corners = (s: CSSStyleDeclaration) =>
        [
          s.borderTopLeftRadius,
          s.borderTopRightRadius,
          s.borderBottomRightRadius,
          s.borderBottomLeftRadius,
        ].map(parseFloat);
      const [card] = corners(
        getComputedStyle(
          section.querySelector(
            "[data-hw-tile='card'] > .hw-card, [data-hw-sample='card'] > .hw-card",
          )!,
        ),
      );
      const kind = ([tl, tr, br, bl]: number[]) => {
        if (tl !== br || tr !== bl) return `uneven ${tl}/${tr}/${br}/${bl}`;
        if (tl !== tr) return `brand ${tl! / tr!}:1 ${tl === card ? "the card's" : `${tl}px`}`;
        if (tl === 0) return "square";
        return tl! > 999 ? "pill" : "small";
      };
      return [...section.querySelectorAll("[data-hw-tile], [data-hw-sample]")].flatMap((tile) =>
        [...tile.querySelectorAll("[class*='hw-']")].map((e, i) => {
          const s = getComputedStyle(e);
          const border = [
            s.borderTopStyle,
            s.borderRightStyle,
            s.borderBottomStyle,
            s.borderLeftStyle,
          ].join(" ");
          return `${tile.getAttribute("data-hw-tile") ?? tile.getAttribute("data-hw-sample")} ${i} ${e.getAttribute("class")}: ${kind(corners(s))}, ${border}`;
        }),
      );
    }),
  );
  await p.close();
  for (const other of shapes.slice(1)) expect(other).toEqual(shapes[0]!);
}, 60_000);

test("rules resolves nested rules against the parent and keeps the parent's own properties", () => {
  expect(
    rules(".card { border-radius: 8px; &:hover { color: red } .meta, & + & { x: 1 } }"),
  ).toEqual([
    { selectors: [".card:hover"], props: ["color"] },
    { selectors: [".card .meta", ".card + .card"], props: ["x"] },
    { selectors: [".card"], props: ["border-radius"] },
  ]);
});

test("a gap, flex-flow or logical property sets the longhands an element owns", () => {
  for (const [element, prop] of [
    ["kpi", "gap"],
    ["row", "gap"],
    ["kpi", "flex-flow"],
    ["card", "padding-inline"],
    ["callout", "border-inline-start"],
    ["card", "border-block-end-color"],
    ["card", "border-start-end-radius"],
  ])
    expect({ element, prop, owned: setsOwned(element!, prop!) }).toEqual({
      element,
      prop,
      owned: true,
    });
  expect(setsOwned("kpi", "margin-inline")).toBe(false);
});

test("source: a compound forks an element in any class order; an --hw-* setting is no hw-* class", () => {
  const files: Record<string, string> = {
    "src/a.css": `.project-card.is-open { border-radius: 4px } .is-open.project-card { border-radius: 4px } .note.hw-card { border-radius: 4px } .hw-card.note { border-radius: 4px }`,
    "src/components/TeamCard.astro": `<div class="team-card" style="gap:var(--hw-card-pad)"/>`,
    "src/components/NoteCard.astro": `<div class="hw-card"/>`,
  };
  expect(sourceFindings(Object.keys(files), (p) => files[p]!, {})).toEqual([
    'src/a.css: .project-card.is-open styles an element named like a shared one; use the hw-* element or list "project-card" as an exception',
    'src/a.css: .is-open.project-card styles an element named like a shared one; use the hw-* element or list "project-card" as an exception',
    'src/components/TeamCard.astro: a component named like a shared element; render the hw-* element or list "team-card" as an exception',
  ]);
});

test("source: a PascalCase component, a camelCase class and a nested rule are read like kebab case", () => {
  const files: Record<string, string> = {
    "src/components/ProjectCard.astro": `<div/>`,
    "src/components/StatusPill.tsx": `<span/>`,
    "src/components/Notebook.astro": `<div/>`,
    "src/a.scss": `.card { border-radius: 8px; &:hover { color: red } } .projectCard { padding: 0 }`,
  };
  expect(sourceFindings(Object.keys(files), (p) => files[p]!, {})).toEqual([
    'src/components/ProjectCard.astro: a component named like a shared element; render the hw-* element or list "project-card" as an exception',
    'src/components/StatusPill.tsx: a component named like a shared element; render the hw-* element or list "status-pill" as an exception',
    'src/a.scss: .card styles an element named like a shared one; use the hw-* element or list "card" as an exception',
    'src/a.scss: .projectCard styles an element named like a shared one; use the hw-* element or list "projectCard" as an exception',
  ]);
});

// The prose block repeats these elements' rules outside any layer, each declaration as the element
// file has it (the link's day rule adds Typography's weight undone). The first rule for a selector
// is day's, the last night's.
test.each([
  [".hw-prose :not(pre) > code", "inline-code.css", ".hw-inline-code", ""],
  [
    ".hw-prose a:not(.not-prose, .not-prose *)",
    "link.css",
    ":is(.hw-link, .hw-links a)",
    " font-weight: inherit;",
  ],
  [
    ".hw-prose a:not(.not-prose, .not-prose *):hover",
    "link.css",
    ":is(.hw-link, .hw-links a):hover",
    "",
  ],
])("the prose block's %s repeats %s", (prose, file, selector, extra) => {
  const block = (f: string, sel: string, night: boolean) => {
    const src = readFileSync(join(import.meta.dir, "../elements", f), "utf8");
    const at = night ? src.lastIndexOf(`${sel} {`) : src.indexOf(`${sel} {`);
    expect(at).toBeGreaterThan(-1);
    return src
      .slice(src.indexOf("{", at) + 1, src.indexOf("}", at))
      .replace(/\s+/g, " ")
      .trim();
  };
  for (const night of [false, true])
    expect(block("prose.css", prose, night)).toBe(
      block(file, selector, night) + (night ? "" : extra),
    );
});

// Typography's prose rules come in a later layer than the elements: its link weight and list
// indent must lose to the prose block, and the same values written unlayered must turn it red.
test("the prose block's links and lists hold against Typography's layer", async () => {
  const typography =
    "@layer utilities { .prose :where(a) { color: #111; font-weight: 500 } .prose :where(ul, ol) { padding-inline-start: 1.625em } }";
  const html = (css: string) =>
    only(
      `<style>${css}</style><div data-hw-tile="prose" data-hw-version="${own.version}">${DEMOS.prose!.replace('class="hw-prose"', 'class="prose hw-prose"')}</div>`,
    );
  const clean = await measurePage(browser, file("prose-typography.html", html(typography)));
  expect(clean.findings).toEqual([]);
  for (const [drift, want] of [
    [".prose.hw-prose a:not(.not-prose) { font-weight: 500 }", "a font-weight"],
    [".prose.hw-prose ul:not(.not-prose) { padding-inline-start: 1.625em }", "ul padding-left"],
    [".prose.hw-prose ol:not(.not-prose) { padding-inline-start: 1.625em }", "ol padding-left"],
  ] as const) {
    const r = await measurePage(browser, file("prose-drift.html", html(drift)));
    expect(
      r.findings.map(
        (f) => `${f.label.slice(f.label.lastIndexOf('" ') + 2).split(":")[0]} ${f.prop}`,
      ),
    ).toContain(want);
  }
}, 60_000);

test("brand-elements exits 2 on a brand-elements.json naming no page", () => {
  file("brand-elements.json", '{"pages":[],"uses":[]}');
  const r = Bun.spawnSync(["bun", join(import.meta.dir, "../scan/elements.ts")], { cwd: dir });
  expect(r.exitCode).toBe(2);
});

test("a keycap leaves a line of UI text as high as an inline keycap does, in the screen, dense and print scales", async () => {
  const p = await browser.newPage();
  const text = (style = "") =>
    `<p style="width:16rem;font:400 0.875rem/1.5 var(--font-sans)">Mit ${["/", "⌘", "K", "Esc"].map((k) => `<kbd class="hw-kbd"${style}>${k}</kbd>`).join(" ")} öffnen Suche und Befehle, schließen sie und springen zurück.</p>`;
  const body = ["screen", "dense", "print"]
    .map(
      (scale) => `<div data-hw-scale="${scale}">${text()}${text(' style="display:inline"')}</div>`,
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
  for (const [keycap, inline] of lines) expect(keycap).toBe(inline!);
}, 60_000);
