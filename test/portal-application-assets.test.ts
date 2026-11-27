import { renderCatalog } from "@hackersandwizards/scaffolding/catalog/render.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applicationsGroup } from "../catalog/portal/applications";
import { PortalAssets } from "../catalog/portal/assets";
import { renderPortalDocument } from "../catalog/portal/document";
import { ROOT } from "../scripts/git";
import { expect, test } from "vitest";
import { assetCard, groupApplicationFiles } from "../catalog/portal/application-assets";

const dir = "applications/example";

test("groups sorted file variants by stem and keeps different stems separate", () => {
  const files = [
    "applications/example/poster.png",
    "applications/example/badge.svg",
    "applications/example/poster.pdf",
  ];
  expect([...groupApplicationFiles(dir, files).values()]).toEqual([
    { dir, stem: "badge", files: ["badge.svg"] },
    { dir, stem: "poster", files: ["poster.pdf", "poster.png"] },
  ]);
});

test.each([
  ["CSS", "applications/example/banner.css"],
  ["TypeScript", "applications/example/generate.ts"],
  ["Python", "applications/example/render.py"],
  ["QR input", "applications/example/qr-source.svg"],
])("excludes %s from the application inventory", (_kind, file) => {
  expect(groupApplicationFiles(dir, [file]).size).toBe(0);
});

test.each([
  {
    case: "shows PNG before SVG",
    files: ["sample.svg", "sample.png"],
    primary: "sample.png",
    preview: '<img src="applications/example/sample.png" alt="sample" loading="lazy">',
    links:
      '<a href="applications/example/sample.svg" download>svg</a><a href="applications/example/sample.png" download>png</a>',
  },
  {
    case: "shows SVG when there is no PNG",
    files: ["sample.pdf", "sample.svg"],
    primary: "sample.svg",
    preview: '<img src="applications/example/sample.svg" alt="sample" loading="lazy">',
    links:
      '<a href="applications/example/sample.pdf" download>pdf</a><a href="applications/example/sample.svg" download>svg</a>',
  },
  {
    case: "frames HTML before plain text",
    files: ["sample.txt", "sample.html"],
    primary: "sample.html",
    preview:
      '<iframe src="applications/example/sample.html" title="sample" loading="lazy"></iframe>',
    links:
      '<a href="applications/example/sample.txt" download>txt</a><a href="applications/example/sample.html" download>html</a>',
  },
  {
    case: "frames plain text when it is the only preview",
    files: ["sample.txt"],
    primary: "sample.txt",
    preview:
      '<iframe src="applications/example/sample.txt" title="sample" loading="lazy"></iframe>',
    links: '<a href="applications/example/sample.txt" download>txt</a>',
  },
  {
    case: "labels a download with no preview",
    files: ["sample.ai", "sample.pdf"],
    primary: "sample.ai",
    preview: '<span class="pdf">AI</span>',
    links:
      '<a href="applications/example/sample.ai" download>ai</a><a href="applications/example/sample.pdf" download>pdf</a>',
  },
])("an application card $case", ({ files, primary, preview, links }) => {
  const html = assetCard({ dir: "applications/example", stem: "sample", files }, "example-sample");
  expect(html).toBe(
    `<figure class="asset" id="example-sample"><div class="views" data-theme="light"><a href="applications/example/${primary}" target="_blank">${preview}</a></div><figcaption><code>sample</code><span class="dl">${links}</span></figcaption></figure>`,
  );
});

test("the generated portal head inlines the canonical pre-paint theme reader", () => {
  const head = renderPortalDocument("", [], "").split("</head>")[0];
  const script = readFileSync(join(ROOT, "tokens/theme-read.js"), "utf8");
  expect(head?.includes(`<script>\n${script}</script>`)).toBe(true);
});

test.each(["documents", "mail"])("the %s tile displays and indexes its package", (pkg) => {
  const group = applicationsGroup(new PortalAssets());
  const item = group.items.find(({ href }) => href === `#applications/app-${pkg}`);
  expect(item?.note).toBe(`@hackersandwizards/${pkg}`);
  const html = renderCatalog({ title: "Brand", lead: "", groups: [group] });
  expect(html).toMatch(
    new RegExp(`href="#applications/app-${pkg}" data-search="[^"]+ @hackersandwizards/${pkg} "`),
  );
});
