import { limit } from "@hackersandwizards/scaffolding/test-timeout";
import { expect, test } from "vitest";
import { join } from "node:path";
import { ROOT } from "../../scripts/git";

// Rendered: beside running text, in a label, in a baseline-aligned flex row and before an H1, on
// light and night, the mark's middle sits within half a pixel of the cap-height middle, and a line
// with the mark is as tall as the same line without it.
test(
  "the mark sits on the cap-height middle and never makes its line taller",
  async () => {
    const { launch } = await import("../../scan/browser");
    const { pathToFileURL } = await import("node:url");
    const { mkdtempSync, rmSync, writeFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const link = (f: string) =>
      `<link rel="stylesheet" href="${pathToFileURL(join(ROOT, f)).href}">`;
    const rows = [
      [`<p style="font: 16px/1.5 var(--font-sans)">`, ""],
      [`<p style="font: 15px/1.25 var(--font-sans)">`, ""],
      [`<p class="hw-label" style="line-height: 1.4">`, ""],
      [
        `<p style="display: inline-flex; align-items: baseline; font: 16px/1.5 var(--font-sans)">`,
        "",
      ],
      [`<p data-heading style="font: 700 48px/1.1 var(--font-mono)">`, ' data-size="heading"'],
    ];
    const body = ["light", "dark"]
      .map(
        (theme) =>
          `<div data-theme="${theme}">` +
          rows
            .map(([open, size]) => {
              const probe =
                '<span data-probe style="display:inline-block;width:0;height:0"></span>';
              const mark = `<span class="hw-mark" data-mark="blog"${size} aria-hidden="true"></span>`;
              return `${open}${probe}${mark}Hxg Blog</p>${open}${probe}Hxg Blog</p>`;
            })
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
        [...document.querySelectorAll("p:has(.hw-mark)")].map((p) => {
          const probe = p.querySelector("[data-probe]")!.getBoundingClientRect();
          const mark = p.querySelector(".hw-mark")!.getBoundingClientRect();
          const ctx = document.createElement("canvas").getContext("2d")!;
          ctx.font = getComputedStyle(p).font;
          const cap = ctx.measureText("H").actualBoundingBoxAscent;
          return {
            lineDifference:
              p.getBoundingClientRect().height -
              p.nextElementSibling!.getBoundingClientRect().height,
            off: mark.top + mark.height / 2 - (probe.bottom - cap / 2),
          };
        }),
      );
      expect(found.map(({ off }) => Math.abs(off) <= 0.5)).toEqual(Array<boolean>(10).fill(true));
      expect(found.map(({ lineDifference }) => lineDifference)).toEqual(Array<number>(10).fill(0));
    } finally {
      await browser.close();
      rmSync(dir, { recursive: true, force: true });
    }
  },
  limit(60_000),
);
