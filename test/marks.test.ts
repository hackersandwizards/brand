import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SUN } from "../expert/components/theme-icons";
import { ROOT } from "../scripts/git";

// Each area mark in marker.css is its Lucide icon unchanged, at the version package.json pins:
// a lucide-static update that redraws an icon fails here until the mark is copied again. The mark
// without a data-mark is other.
const ICONS = {
  trainings: "graduation-cap",
  factory: "factory",
  blog: "newspaper",
  knowledge: "book-open",
  podcast: "mic",
  other: "building-2",
};
const css = readFileSync(join(ROOT, "tokens/marker.css"), "utf8");
const shapes = (svg: string) =>
  [...svg.matchAll(/<(path|rect|circle|line|polyline|polygon|ellipse)\b([^>]*?)\/?>/g)].map(
    ([, tag, attrs]) => `${tag} ${attrs!.replaceAll('"', "'").replace(/\s+/g, " ").trim()}`,
  );
const lucide = (name: string) =>
  shapes(readFileSync(join(ROOT, `node_modules/lucide-static/icons/${name}.svg`), "utf8"));

test("every area mark draws its Lucide icon, other the default", () => {
  const marks = [
    ...css.matchAll(
      /\.hw-mark(?:\[data-mark="(\w+)"\])? \{[^}]*?--_hw-icon: url\("data:image\/svg\+xml,([^"]+)"\)/g,
    ),
  ].map(([, area, uri]) => [area ?? "other", uri!] as const);
  expect(marks.map(([area]) => area).sort()).toEqual(Object.keys(ICONS).sort());
  for (const [area, uri] of marks) {
    expect({ area, shapes: shapes(decodeURIComponent(uri)) }).toEqual({
      area,
      shapes: lucide(ICONS[area as keyof typeof ICONS]),
    });
  }
});

// One path, so a port draws it as it draws the moon: Lucide's circle as two arcs, then its rays.
test("the theme switch's sun draws Lucide's sun", () => {
  const [circle, ...rays] = lucide("sun");
  expect(circle).toBe("circle cx='12' cy='12' r='4'");
  const d = rays.map((ray) =>
    ray.slice("path d='".length, -1).replace(/^m([\d.]+ [\d.]+) ?/, "M$1l"),
  );
  expect(SUN).toBe(`M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z${d.join("")}`);
});

// Rendered: beside running text, in a label, in a baseline-aligned flex row and before an H1, on
// light and night, the mark's middle sits within half a pixel of the cap-height middle, and a line
// with the mark is as tall as the same line without it.
test("the mark sits on the cap-height middle and never makes its line taller", async () => {
  const { launch } = await import("../scan/markers");
  const { pathToFileURL } = await import("node:url");
  const { mkdtempSync, rmSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const link = (f: string) => `<link rel="stylesheet" href="${pathToFileURL(join(ROOT, f)).href}">`;
  const rows = [
    `<p style="font: 16px/1.5 var(--font-sans)">`,
    `<p style="font: 15px/1.25 var(--font-sans)">`,
    `<p class="hw-label" style="line-height: 1.4">`,
    `<p style="display: inline-flex; align-items: baseline; font: 16px/1.5 var(--font-sans)">`,
    `<p data-heading style="font: 700 48px/1.1 var(--font-mono)">`,
  ];
  const body = ["light", "dark"]
    .map(
      (theme) =>
        `<div data-theme="${theme}">` +
        rows
          .flatMap((open) =>
            [true, false].map(
              (mark) =>
                `${open}<span data-probe style="display:inline-block;width:0;height:0"></span>${mark ? `<span class="hw-mark" data-mark="blog"${open.includes("data-heading") ? ' data-size="heading"' : ""} aria-hidden="true"></span>` : ""}Hxg Blog</p>`,
            ),
          )
          .join("") +
        `</div>`,
    )
    .join("");
  const dir = mkdtempSync(join(tmpdir(), "brand-marks-"));
  const html = join(dir, "marks.html");
  writeFileSync(
    html,
    `<!doctype html><meta charset="utf-8">${["generated/tokens.root.css", "tokens/fonts.css", "elements/elements.css", "tokens/marker.css"].map(link).join("")}<body style="margin:0">${body}</body>`,
  );
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(html).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const found = await page.evaluate(() =>
      [...document.querySelectorAll("p")].map((p) => {
        const probe = p.querySelector("[data-probe]")!.getBoundingClientRect();
        const mark = p.querySelector(".hw-mark")?.getBoundingClientRect();
        const ctx = document.createElement("canvas").getContext("2d")!;
        ctx.font = getComputedStyle(p).font;
        const cap = ctx.measureText("H").actualBoundingBoxAscent;
        return {
          height: p.getBoundingClientRect().height,
          off: mark ? mark.top + mark.height / 2 - (probe.bottom - cap / 2) : 0,
        };
      }),
    );
    for (let i = 0; i < found.length; i += 2) {
      expect({ i, off: Math.abs(found[i]!.off) <= 0.5 }).toEqual({ i, off: true });
      expect({ i, height: found[i]!.height }).toEqual({ i, height: found[i + 1]!.height });
    }
  } finally {
    await browser.close();
    rmSync(dir, { recursive: true, force: true });
  }
}, 60_000);
