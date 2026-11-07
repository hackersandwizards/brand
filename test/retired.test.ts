import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { retiredIn, textOf } from "../scan/retired";
import { packed, ROOT } from "../scripts/git";
import verbal from "../verbal/verbal.json";

const dirs: string[] = [];
afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true })));
const built = (files: Record<string, string | Uint8Array>) => {
  const dir = mkdtempSync(join(tmpdir(), "brand-retired-"));
  dirs.push(dir);
  for (const [p, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), content);
  }
  return dir;
};
const run = (...args: string[]) => {
  const r = Bun.spawnSync(["bun", join(ROOT, "scan/retired.ts"), ...args]);
  const err = r.stderr.toString();
  // An uncaught error exits 1 too: Bun's version trailer marks the crash.
  if (/^Bun v\d/m.test(err)) throw new Error(`brand-retired crashed:\n${err}`);
  return { code: r.exitCode, out: r.stdout.toString() + err };
};
const PAGE = `<html><body><h1>${verbal.claim.en}</h1><p>${verbal.boilerplate.en.replaceAll("&", "&amp;")}</p></body></html>`;
const line = verbal.retired[1].text;

test("finds a retired line raw, split across elements, entity-encoded and in another case", () => {
  const [a, b, c, ...rest] = line.split(" ");
  expect(retiredIn(`x ${line} y`)).toEqual([line]);
  expect(retiredIn(`<p>${a} ${b}</p>\n<p><b>${c}</b>${rest.join(" ")}</p>`)).toEqual([line]);
  expect(retiredIn(line.replaceAll(" ", "&nbsp;"))).toEqual([line]);
  expect(retiredIn(line.toUpperCase())).toEqual([line]);
  expect(retiredIn(JSON.stringify(verbal)).length).toBe(verbal.retired.length);
  expect(retiredIn(PAGE)).toEqual([]);
});

test("decodes umlaut entities and JS escapes, and matches a line only as a whole", () => {
  const de = verbal.retired.find((r) => r.text.includes("ü"))!.text;
  expect(retiredIn(de.replace("ü", "&uuml;"))).toEqual([de]);
  expect(retiredIn(de.replace("ü", "\\u00fc"))).toEqual([de]);
  expect(retiredIn(de.replace("ü", "&#252;"))).toEqual([de]);
  expect(retiredIn("We elevate your team.")).toEqual(["Elevate your team"]);
  expect(retiredIn("We elevate your teamwork.")).toEqual([]);
  expect(retiredIn("&#6a; &#99999999; &#x110000;")).toEqual([]);
});

test("brand-retired fails on a built folder carrying a retired line and passes a clean one", () => {
  const clean = built({ "index.html": PAGE, "_astro/font.woff2": new Uint8Array([0, 1, 2]) });
  const dirty = built({ "index.html": PAGE, "about/index.html": `<footer>${line}</footer>` });
  expect(run(clean).code).toBe(0);
  const hit = run(dirty);
  expect(hit.code).toBe(1);
  expect(hit.out).toContain(`about/index.html: "${line}"`);
  expect(run(join(dirty, "about/index.html")).code).toBe(1);
  expect(run(clean, join(dirty, "about")).code).toBe(1);
  const linked = built({ "index.html": PAGE });
  symlinkSync(join(dirty, "about/index.html"), join(linked, "about.html"));
  expect(run(linked).code).toBe(1);
  expect(run(dirty, join(dirty, "about")).out).toContain("in 1 of 2 files read");
});

// The package's own texts reach consumers' prompts, signatures and pages unbuilt.
test("no file the package ships carries a retired line, verbal.json aside", () => {
  const hits = packed()
    .filter((f) => !f.startsWith("verbal/"))
    .flatMap((f) => retiredIn(textOf(join(ROOT, f)) ?? "").map((l) => `${f}: ${l}`));
  expect(hits).toEqual([]);
});

test("brand-retired exits 2 on no path, a missing path and a folder without a text file", () => {
  expect(run().code).toBe(2);
  expect(run(join(tmpdir(), "brand-retired-missing")).code).toBe(2);
  expect(run(built({ "a.png": new Uint8Array([0]) })).code).toBe(2);
});
