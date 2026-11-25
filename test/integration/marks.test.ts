import { expect } from "vitest";
import { test } from "../limit";
import { join } from "node:path";
import { ROOT } from "../../scripts/git";

// Rendered: beside running text, in a label, in a baseline-aligned flex row and before an H1, on
// light and night, the mark's middle sits within half a pixel of the cap-height middle, and a line
// with the mark is as tall as the same line without it.
test("the mark sits on the cap-height middle and never makes its line taller", async () => {
  const { launch } = await import("../../scan/browser");
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
