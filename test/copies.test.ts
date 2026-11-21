import { expect, test } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { brandFiles, brandSizes, contentHash, isBrandCopy, lfsOid } from "../scan/colours";
import { copyOf, signatures, unlistedCopies } from "../scan/copies";
import { ROOT } from "../scripts/git";

const wordmark = readFileSync(join(ROOT, "logos/wordmark.svg"), "utf8");
const brand = brandFiles();
const identical = (text: string) => brand.get(contentHash(Buffer.from(text)));

test("an inherited __proto__ does not approve a copied path", () => {
  expect(unlistedCopies({ ["__proto__"]: "byte copy" }, {}, undefined)).toEqual([
    "__proto__: byte copy; import it from the package",
  ]);
});

test("an extension's hash is distinct from the LFS object ID on the next CRLF line", () => {
  const oid = "a".repeat(64);
  const pointer = `version https://git-lfs.github.com/spec/v1\r\next-0-foo sha256:${"b".repeat(64)}\r\noid sha256:${oid}\r\nsize 1\r\n`;
  expect(lfsOid(Buffer.from(pointer))).toBe(oid);
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
    expect(doc(engine, img(base64(changed)))).toContain("drawing");
    expect(doc(engine, changed)).toContain("drawing");
  }
  // Without the engine's marker, the unmodified wordmark is a copy too.
  expect(doc("<style>.slide{}</style>", img(uri(wordmark)))).toContain("drawing");
  expect(doc("<style>.slide{}</style>", img(base64(wordmark)))).toContain("drawing");
  expect(doc("<style>.slide{}</style>", wordmark)).toContain("drawing");
});

test("finds a logo inside a base64 or percent-encoded data: URI in any file", () => {
  const red = wordmark.replace(/fill="[^"]*"/g, 'fill="red"');
  const css = (src: string) =>
    copyOf(
      "src/styles/logo.css",
      () => `.logo{background:url(${src})}`,
      () => undefined,
    );
  const b64 = Buffer.from(red).toString("base64");
  expect(css(`data:image/svg+xml;base64,${b64}`)).toContain("drawing");
  expect(css(`"data:image/svg+xml;charset=utf-8;base64,${b64}"`)).toContain("drawing");
  expect(css(`"data:image/svg+xml,${encodeURIComponent(red)}"`)).toContain("drawing");
  // Nested: a base64 page carrying the base64 logo.
  const page = Buffer.from(`<img src="data:image/svg+xml;base64,${b64}">`).toString("base64");
  expect(css(`data:text/html;base64,${page}`)).toContain("drawing");
  expect(
    css(`data:image/svg+xml;base64,${Buffer.from("<svg/>").toString("base64")}`),
  ).toBeUndefined();
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

test("copy findings identify the file and reason, with new entries allowed only for files at the pin change", () => {
  const path = "src/assets/copied.svg";
  const found = { [path]: "identical to brand logos/wordmark.svg" };
  expect(unlistedCopies(found, {}, {})).toEqual([
    "src/assets/copied.svg: identical to brand logos/wordmark.svg; import it from the package",
  ]);
  expect(unlistedCopies(found, { [path]: " " }, { [path]: "Old entry" })).toEqual([
    "brand-copies.json: src/assets/copied.svg names no reason",
  ]);
  const allow = { [path]: "Existing artwork" };
  expect(unlistedCopies(found, allow, {}, (p) => p === path)).toEqual([]);
  expect(unlistedCopies(found, allow, {}, (p) => p === "other.svg")).toEqual([
    "brand-copies.json: src/assets/copied.svg added against HEAD; the list may only shrink, or during a pin change name a file committed as is",
  ]);
});

test("a composed document can carry the lockup in a data URL with leading whitespace", () => {
  const lockup = readFileSync(join(ROOT, "logos/lockup.svg"), "utf8");
  const image = `<img src="data:image/svg+xml,${encodeURIComponent(` \n  ${lockup}`)}">`;
  const scan = (head: string) =>
    copyOf(
      "document.html",
      () => `${head}\n${image}`,
      () => undefined,
    );
  expect(scan("<style data-hw-document></style>")).toBeUndefined();
  expect(scan("<style></style>")).toContain("drawing");
});

test("document rendering can reformat the wordmark's tag whitespace", () => {
  const formatted = wordmark.replaceAll("><", ">\n  <").replace(" viewBox", "\n  viewBox");
  const scan = (head: string) =>
    copyOf(
      "document.html",
      () => `${head}\n${formatted}`,
      () => undefined,
    );
  expect(scan("<style data-hw-document></style>")).toBeUndefined();
  expect(scan("<style></style>")).toContain("drawing");
});

test("binary files are checked for byte copies without scanning their contents as markup", () => {
  const metadata = () => `%PDF-1.7\n% embedded artwork metadata\n${wordmark}`;
  expect(copyOf("print.pdf", metadata, () => undefined)).toBeUndefined();
  expect(copyOf("print.pdf", metadata, () => "logos/lockup.pdf")).toBe(
    "identical to brand logos/lockup.pdf",
  );
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

test("finds a copy still stored as an LFS pointer when its filename and size differ", () => {
  const dir = mkdtempSync(join(tmpdir(), "brand-copies-"));
  try {
    const path = join(dir, "attachment.bin");
    const oid = "a".repeat(64);
    writeFileSync(
      path,
      `version https://git-lfs.github.com/spec/v1\noid sha256:${oid}\nsize 4096\n`,
    );
    const files = new Map([[oid, "logos/master-not-on-disk.tif"]]);
    expect(isBrandCopy(path, files, brandSizes(files))).toBe("logos/master-not-on-disk.tif");
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("recognises a small shipped file that was copied under a different extension", () => {
  const dir = mkdtempSync(join(tmpdir(), "brand-copies-"));
  try {
    const asset = "applications/mail-signature/template.txt";
    const bytes = readFileSync(join(ROOT, asset));
    const path = join(dir, "attachment.bin");
    writeFileSync(path, bytes);
    const files = new Map([[contentHash(bytes), asset]]);
    expect(isBrandCopy(path, files, brandSizes(files))).toBe(asset);
  } finally {
    rmSync(dir, { recursive: true });
  }
});
