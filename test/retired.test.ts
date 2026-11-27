import { defined } from "@hackersandwizards/scaffolding/defined";
import { afterAll, expect, test } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { decodeJsEscapes, retiredIn, scanRetiredPaths } from "../scan/retired";
import { ROOT } from "../scripts/git";
import { packed } from "./packed";
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
const PAGE = `<html><body><p>${verbal.claim.en}</p><h1>${verbal.headline.en}</h1><p>${verbal.boilerplate.en.replaceAll("&", "&amp;")}</p></body></html>`;
const line = verbal.retired[1].text;

test.each([
  { label: "an escaped backslash before u0041", input: "\\\\u0041", expected: "\\u0041" },
  { label: "a Unicode escape", input: "\\u00e4", expected: "ä" },
  { label: "a newline escape", input: "\\n", expected: " " },
  { label: "an escaped quote", input: '\\"', expected: '"' },
  { label: "an escaped slash", input: "\\/", expected: "/" },
  { label: "a lone trailing backslash", input: "end\\", expected: "end\\" },
])("decodes JS escapes with $label", ({ input, expected }) => {
  expect(decodeJsEscapes(input)).toBe(expected);
});

test("finds a retired line raw, split across elements and entity-encoded", () => {
  const [a, b, c, ...rest] = line.split(" ");
  expect(retiredIn(`x ${line} y`)).toEqual([line]);
  expect(retiredIn(`<p>${a} ${b}</p>\n<p><b>${c}</b>${rest.join(" ")}</p>`)).toEqual([line]);
  expect(retiredIn(line.replaceAll(" ", "&nbsp;"))).toEqual([line]);
  expect(retiredIn(JSON.stringify(verbal)).length).toBe(verbal.retired.length);
  expect(retiredIn(PAGE)).toEqual([]);
});

test("decodes umlaut entities and JS escapes, and matches a line only as a whole", () => {
  const de = defined(
    verbal.retired.find((r) => r.text.includes("ü")),
    "retired line with an umlaut",
  ).text;
  expect(retiredIn(de.replace("ü", "&uuml;"))).toEqual([de]);
  expect(retiredIn(de.replace("ü", "\\u00fc"))).toEqual([de]);
  expect(retiredIn(de.replace("ü", "&#252;"))).toEqual([de]);
  expect(retiredIn("We elevate your teamwork.")).toEqual([]);
  expect(retiredIn("&#6a; &#99999999; &#x110000;")).toEqual([]);
});

// Every line in the forms a page sets it in must fail, and prose using the same words must pass.
test("finds every retired line with or without its stop, plural, possessive and in any case", () => {
  const title = (l: string) =>
    l.replace(/(^|\s)(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());
  for (const { text } of verbal.retired) {
    const bare = text.replace(/[.!?]$/, "");
    const words = bare.split(" ");
    const forms = [
      text.toUpperCase(),
      title(text),
      `<h2>${bare}</h2>`,
      `"title":"${text}"`,
      `<p>${words.slice(0, 2).join(" ")}</p> <p><b>${words[2]}</b> ${words.slice(3).join(" ")}</p>`,
      `${bare}s`,
      `${bare}'s`,
      `${bare}&rsquo;s`,
      `${bare}&#39;s`,
      `${bare.toUpperCase()}S`,
      `<p>a \\u003c b ${words.slice(0, 2).join(" ")}</p> <p>${words.slice(2).join(" ")}</p>`,
    ];
    for (const form of forms) expect([form, retiredIn(form)]).toEqual([form, [text]]);
  }
});

// Speaker notes reach a build as JSON-serialised island props, their line breaks escaped.
test("finds retired lines in an island's JSON-serialised speaker notes", () => {
  const [first, ...rest] = line.split(" ");
  for (const whitespace of ["\n", "\r\n", "\t", "\f", "\b"]) {
    const props = JSON.stringify({ notes: first + whitespace + rest.join(" ") });
    expect(retiredIn(`<astro-island props="${props.replaceAll('"', "&quot;")}">`)).toEqual([line]);
  }
});

test("keeps escaped backslashes literal in a retired line", () => {
  const [a, ...rest] = line.split(" ");
  const tail = rest.join(" ");
  expect(retiredIn(`${a}\\\\n${tail}`)).toEqual([]);
  expect(retiredIn(`${a}&#92;n${tail}`)).toEqual([]);
});

test("strips markdown emphasis inside and around a line", () => {
  const [a, b, ...rest] = line.split(" ");
  const tail = rest.join(" ");
  const forms = [
    `**${line}**`,
    `${a} **${b}** ${tail}`,
    `*${a} ${b}* ${tail}`,
    `__${a}__ ${b} _${tail}_`,
    JSON.stringify({ notes: `- **${a}**\n  ${b} ${tail}` }),
  ];
  for (const form of forms) expect([form, retiredIn(form)]).toEqual([form, [line]]);
  expect(retiredIn("We *elevate your team* with agents.")).toEqual([]);
  for (const glue of ["_", "__", "**"]) expect(retiredIn(`${a}${glue}${b} ${tail}`)).toEqual([]);
  expect(retiredIn(`if (x < y) {} **${a}** ${b} ${tail} <b>`)).toEqual([line]);
});

test("passes prose that uses a short line's words mid-sentence", () => {
  const prose = [
    "tools that elevate your team's review speed",
    "We elevate your team.",
    "<p>The training will elevate your team&rsquo;s practice.</p>",
    "Agents elevate your teams when they share context.",
    "Elevated your team",
    "Elevate your team-building day",
    "teams thrive with AI tools",
    `<p>${verbal.claim.de}</p><h1>${verbal.headline.de}</h1><p>${verbal.boilerplate.de}</p><p>${verbal.position.de}</p>`,
  ];
  for (const p of prose) expect([p, retiredIn(p)]).toEqual([p, []]);
});

const retiredPage = `<footer>${line}</footer>`;

test("brand-retired passes a clean build that also contains a binary asset", () => {
  const clean = built({ "index.html": PAGE, "_astro/font.woff2": new Uint8Array([0, 1, 2]) });
  expect(run(clean).code).toBe(0);
});

test.each([
  { label: "page copy", file: "about/index.html", content: retiredPage, retired: [line] },
  {
    label: "bundled verbal.json",
    file: "app.js",
    content: `export const verbal = ${JSON.stringify(verbal)};`,
    retired: verbal.retired.map(({ text }) => text),
  },
])("brand-retired reports the path and retired line in $label", ({ file, content, retired }) => {
  const dir = built({ [file]: content });
  const hit = run(dir);
  expect(hit.code).toBe(1);
  expect(hit.out.trimEnd().split("\n")).toEqual([
    ...retired.map((text) => `${join(dir, file)}: "${text}"`),
    'brand-retired: a retired line in 1 of 1 files read. Replace it in the source with the current value of the field its "replacedBy" names in @hackersandwizards/brand/verbal.json, import only the fields you use if the whole file is bundled, and rebuild.',
  ]);
});

test.each<{ label: string; files: Record<string, string>; paths: string[] }>([
  {
    label: "an explicitly named file",
    files: { "about/index.html": retiredPage },
    paths: ["about/index.html"],
  },
  {
    label: "one of several folders",
    files: { "clean/index.html": PAGE, "dirty/about/index.html": retiredPage },
    paths: ["clean", "dirty/about"],
  },
])("brand-retired fails on a retired line in $label", ({ files, paths }) => {
  const dir = built(files);
  expect(run(...paths.map((path) => join(dir, path))).code).toBe(1);
});

test("brand-retired follows a symlink to a built file", () => {
  const target = built({ "about/index.html": retiredPage });
  const linked = built({});
  symlinkSync(join(target, "about/index.html"), join(linked, "about.html"));
  expect(run(linked).code).toBe(1);
});

test("brand-retired counts a file once when the arguments overlap", () => {
  const dirty = built({ "index.html": PAGE, "about/index.html": retiredPage });
  expect(run(dirty, join(dirty, "about")).out).toContain("in 1 of 2 files read");
});

test("separates text and binary files while counting distinct paths", () => {
  const dir = built({
    "index.html": PAGE,
    "about/index.html": retiredPage,
    "font.woff2": new Uint8Array([0]),
  });
  const dirty = join(dir, "about/index.html");
  const binary = join(dir, "font.woff2");
  expect(scanRetiredPaths([dir, dirty, binary])).toEqual({
    hits: new Map([[dirty, [line]]]),
    empty: [binary],
    read: 2,
  });
});

// The package's own texts reach consumers' prompts, signatures and pages unbuilt.
test("no file the package ships carries a retired line, verbal.json aside", () => {
  const paths = packed()
    .filter((f) => !f.startsWith("verbal/"))
    .map((f) => join(ROOT, f));
  const diagnostics = [...scanRetiredPaths(paths).hits].flatMap(([file, lines]) =>
    lines.map((line) => `${relative(ROOT, file)}: ${line}`),
  );
  expect(diagnostics).toEqual([]);
});

test("brand-retired exits 2 on no path", () => {
  expect(run().code).toBe(2);
});

test("brand-retired identifies a missing output path", () => {
  const missing = join(built({}), "missing");
  expect(run(missing)).toEqual({
    code: 2,
    out: `brand-retired: missing output at ${missing} blocks the scan. Build first and pass the actual output folders or files.\n`,
  });
});

test("brand-retired identifies a build containing no text", () => {
  const binary = built({ "a.png": new Uint8Array([0]) });
  expect(run(binary)).toEqual({
    code: 2,
    out: `brand-retired: no text files in ${binary}, so the scan cannot check these inputs. Build first and pass folders or files containing the rendered text.\n`,
  });
  // An input without text still fails alongside a readable input.
  expect(run(built({ "index.html": PAGE }), binary).code).toBe(2);
});

test("brand-retired reads past a dangling symlink", () => {
  const dir = built({ "index.html": PAGE });
  symlinkSync(join(dir, "gone.html"), join(dir, "latest.html"));
  expect(run(dir).code).toBe(0);
});
