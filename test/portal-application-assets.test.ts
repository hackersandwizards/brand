import { expect, test } from "vitest";
import { assetCard, assetStems } from "../catalog/portal/application-assets";

test("tracked application files with the same stem form one asset", () => {
  const dir = "applications/booth";
  const assets = assetStems(dir);
  expect(assets.get("booth-banner-gradient-100x100")).toEqual({
    dir,
    stem: "booth-banner-gradient-100x100",
    files: ["booth-banner-gradient-100x100.pdf", "booth-banner-gradient-100x100.png"],
  });
  expect(assets.has("banner")).toBe(false);
  expect(assets.has("generate")).toBe(false);
  expect(assets.has("qr-hackersandwizards-dev")).toBe(false);
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
