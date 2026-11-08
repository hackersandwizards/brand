import { afterAll, beforeAll, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Browser } from "puppeteer-core";
import { catalogPages, launch, pool } from "../../scan/markers";
import { BASE, DIST, serveSite } from "./site";

// WCAG AA text contrast (axe-core's color-contrast rule) over every element story: each scale and
// night, as the catalog renders them, a chosen and an unchosen state where the sample shows both.
// ignoreLength: a one-digit count is text, which axe otherwise leaves unmeasured.
const AXE = readFileSync(join(import.meta.dir, "../../node_modules/axe-core/axe.min.js"), "utf8");

interface Axe {
  run(
    context: unknown,
    options: unknown,
  ): Promise<{ violations: { nodes: { target: string[]; any: { data: unknown }[] }[] }[] }>;
}

let browser: Browser;
let server: ReturnType<typeof serveSite>;
beforeAll(async () => {
  server = serveSite();
  browser = await launch();
});
afterAll(async () => {
  await browser?.close();
  await server?.stop(true);
});

const stories = () => `${server.url}${BASE.slice(1)}catalog`;

async function failures(url: string, css = "") {
  const p = await browser.newPage();
  try {
    await p.goto(url, { waitUntil: "networkidle0" });
    if (css) await p.addStyleTag({ content: css });
    await p.evaluate(AXE);
    const nodes = await p.evaluate(async () => {
      const { violations } = await (window as unknown as { axe: Axe }).axe.run(document, {
        runOnly: ["color-contrast"],
        checks: { "color-contrast": { options: { ignoreLength: true } } },
      });
      return violations.flatMap((v) =>
        v.nodes.map((n) => `${n.target.join(" ")} ${JSON.stringify(n.any[0]?.data)}`),
      );
    });
    return nodes.map((n) => `${url}: ${n}`);
  } finally {
    await p.close();
  }
}

test("every element story passes AA text contrast", async () => {
  const pages = catalogPages(join(DIST, "catalog"), stories());
  expect(pages.length).toBeGreaterThan(0);
  const found = await pool(pages, 8, (url) => failures(url));
  expect(found.flat()).toEqual([]);
}, 300_000);

test("the check reports a one-digit count too faint to read", async () => {
  const found = await failures(
    `${stories()}/stories/Forms/filter-value/screen/`,
    ".hw-choice-count { opacity: 0.8 }",
  );
  expect(found.length).toBe(3);
}, 60_000);
