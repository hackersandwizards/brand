import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { brandFiles, contentHash } from "../scan/colours";
import { copyOf, signatures, unlistedCopies } from "../scan/copies";
import { ROOT } from "../scripts/git";

const wordmark = readFileSync(join(ROOT, "logos/wordmark.svg"), "utf8");
const brand = brandFiles();
const identical = (text: string) => brand.get(contentHash(Buffer.from(text)));

test("knows every manifest file, the generated formats and the client marks", () => {
  const paths = new Set(brand.values());
  for (const p of ["logos/lockup.svg", "tokens/tokens.css", "generated/tokens.ts"])
    expect({ p, known: paths.has(p) }).toEqual({ p, known: true });
  expect([...paths].some((p) => p.startsWith("clients/"))).toBe(true);
  expect(signatures.size).toBeGreaterThan(2);
});

test("finds an identical copy, a renamed or recoloured logo, and nothing else", () => {
  const files: Record<string, string> = {
    "public/brand/wordmark.svg": wordmark,
    "public/img/logo.svg": wordmark,
    "src/components/Logo.astro": `<svg>${wordmark.replaceAll("#1A7285", "#ff0000").replaceAll("#1a7285", "#ff0000")}</svg>`,
    "public/lockup.svg": "<svg/>",
    "src/components/Card.astro": "<div class='card'></div>",
  };
  const hits = Object.fromEntries(
    Object.keys(files).map((p) => [
      p,
      copyOf(
        p,
        (f) => files[f],
        (f) => identical(files[f]),
      ),
    ]),
  );
  expect(hits["public/brand/wordmark.svg"]).toBe("identical to brand logos/wordmark.svg");
  expect(hits["public/img/logo.svg"]).toBe("identical to brand logos/wordmark.svg");
  expect(hits["src/components/Logo.astro"]).toContain("drawing");
  expect(hits["public/lockup.svg"]).toBe("named like brand logos/lockup.svg");
  expect(hits["src/components/Card.astro"]).toBeUndefined();
});

test("a document the documents engine composed may inline the logo, a hand-written one may not", () => {
  const body = `<header><svg>${wordmark}</svg></header>`;
  const doc = (head: string) =>
    copyOf(
      "src/content/documents/quote.html",
      () => `<html><head>${head}</head><body>${body}</body></html>`,
      () => undefined,
    );
  expect(doc("<style data-hw-document>.page{}</style>")).toBeUndefined();
  expect(doc("<style>.page{}</style>")).toContain("drawing");
});

test("flags an unlisted copy, an entry without a reason and one added against HEAD", () => {
  const found = { "public/favicon.svg": "identical to brand logos/favicon.svg" };
  const allow = { "public/favicon.svg": "r" };
  expect(unlistedCopies(found, allow, allow)).toEqual([]);
  expect(unlistedCopies(found, {}, {})).toHaveLength(1);
  expect(unlistedCopies({}, { "public/favicon.svg": " " }, allow)).toHaveLength(1);
  expect(unlistedCopies({}, allow, {})).toHaveLength(1);
});
