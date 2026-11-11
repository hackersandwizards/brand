import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { brandFiles, brandSizes, contentHash, isBrandCopy, lfsOid } from "../scan/colours";
import { copyOf, signatures, unlistedCopies } from "../scan/copies";
import { ROOT } from "../scripts/git";

const wordmark = readFileSync(join(ROOT, "logos/wordmark.svg"), "utf8");
const brand = brandFiles();
const identical = (text: string) => brand.get(contentHash(Buffer.from(text)));

test("an LFS pointer names its object through ext lines and CRLF; other text names none", () => {
  const oid = "a".repeat(64);
  const v1 = "version https://git-lfs.github.com/spec/v1";
  const ext = `ext-0-foo sha256:${"b".repeat(64)}`;
  expect(lfsOid(Buffer.from(`${v1}\n${ext}\n${ext}\noid sha256:${oid}\nsize 1\n`))).toBe(oid);
  expect(lfsOid(Buffer.from(`${v1}\r\noid sha256:${oid}\r\nsize 1\r\n`))).toBe(oid);
  expect(lfsOid(Buffer.from(`version 2\noid sha256:${oid}\n`))).toBeUndefined();
});

test("knows every manifest file and the generated formats", () => {
  const paths = new Set(brand.values());
  for (const p of ["logos/lockup.svg", "tokens/tokens.css", "generated/tokens.ts"])
    expect({ p, known: paths.has(p) }).toEqual({ p, known: true });
  expect(signatures.size).toBeGreaterThan(2);
});

test("finds an identical copy, a renamed or recoloured logo, and nothing else", () => {
  const files: Record<string, string> = {
    "public/brand/wordmark.svg": wordmark,
    "public/img/logo.svg": wordmark,
    "src/components/Logo.astro": `<svg>${wordmark.replaceAll("#1A7285", "#ff0000").replaceAll("#1a7285", "#ff0000")}</svg>`,
    "public/lockup.svg": "<svg/>",
    "src/components/Card.astro": "<div class='card'></div>",
    "src/data/logos.json": "[]",
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
  expect(hits["src/data/logos.json"]).toBeUndefined();
});

test("a document the documents engine composed may inline the lockup, nothing else", () => {
  const lockup = readFileSync(join(ROOT, "logos/lockup.svg"), "utf8");
  const doc = (head: string, body: string) =>
    copyOf(
      "src/content/documents/quote.html",
      () => `<html><head>${head}</head><body><header>${body}</header></body></html>`,
      () => undefined,
    );
  expect(doc("<style data-hw-document>.page{}</style>", lockup)).toBeUndefined();
  expect(doc("<style>.page{}</style>", lockup)).toContain("drawing");
  // The engine's marker covers its own lockup, never a recoloured wordmark beside it.
  const red = wordmark.replace(/fill="[^"]*"/g, 'fill="red"');
  expect(doc("<style data-hw-page></style>", lockup + red)).toContain("drawing");
  expect(doc("<style data-hw-document>.page{}</style>", `<svg>${wordmark}</svg>`)).toContain(
    "drawing",
  );
});

test("a document the documents engine composed may inline the unmodified wordmark, never a changed one", () => {
  const doc = (head: string, body: string) =>
    copyOf(
      "src/content/documents/readout.html",
      () => `<html><head>${head}</head><body>${body}</body></html>`,
      () => undefined,
    );
  const engine = "<style data-hw-readout>.slide{}</style>";
  // The documents engine's svgUri: percent-encodes only what a URL or an attribute needs.
  const uri = (svg: string) =>
    `data:image/svg+xml,${svg.replace(/[%#"<>&\n\r\t]/g, encodeURIComponent)}`;
  const base64 = (svg: string) =>
    `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const img = (src: string) => `<img class="wordmark" src="${src}" alt="hackers&amp;wizards">`;
  const night = readFileSync(join(ROOT, "logos/wordmark-night.svg"), "utf8");
  const red = wordmark.replace(/fill="[^"]*"/g, 'fill="red"');
  const cropped = wordmark.replace('viewBox="96 96 6571 952"', 'viewBox="96 96 3000 952"');
  expect(doc(engine, img(uri(wordmark)).repeat(6))).toBeUndefined();
  expect(doc(engine, img(base64(wordmark)))).toBeUndefined();
  expect(doc(engine, img(uri(night)) + wordmark)).toBeUndefined();
  for (const changed of [red, cropped]) {
    expect(doc(engine, img(uri(changed)))).toContain("drawing");
    expect(doc(engine, changed)).toContain("drawing");
  }
  // Without the engine's marker, the unmodified wordmark is a copy too.
  expect(doc("<style>.slide{}</style>", img(uri(wordmark)))).toContain("drawing");
  expect(doc("<style>.slide{}</style>", wordmark)).toContain("drawing");
});

test("flags an unlisted copy, an entry without a reason, one added against HEAD and a stale one", () => {
  const found = { "public/favicon.svg": "identical to brand logos/favicon.svg" };
  const allow = { "public/favicon.svg": "r" };
  expect(unlistedCopies(found, allow, allow)).toEqual([]);
  expect(unlistedCopies(found, {}, {})).toHaveLength(1);
  expect(unlistedCopies(found, { "public/favicon.svg": " " }, allow)).toHaveLength(1);
  expect(unlistedCopies(found, allow, {})).toHaveLength(1);
  expect(unlistedCopies({}, allow, allow)).toEqual([
    "brand-copies.json: public/favicon.svg is no copy; drop its entry (brand-copies --tighten)",
  ]);
});

test("a print master known by hash alone is found by its bytes, a directory is no copy", () => {
  const dir = mkdtempSync(join(tmpdir(), "brand-copies-"));
  try {
    const master = join(dir, "print.tif");
    writeFileSync(master, Buffer.alloc(5000, 7));
    const files = new Map(brand).set(
      contentHash(readFileSync(master)),
      "logos/master-not-on-disk.tif",
    );
    const sizes = brandSizes(files);
    expect(isBrandCopy(master, files, sizes)).toBe("logos/master-not-on-disk.tif");
    expect(isBrandCopy(dir, files, sizes)).toBeUndefined();
  } finally {
    rmSync(dir, { recursive: true });
  }
});
