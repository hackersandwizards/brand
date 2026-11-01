// A consumer raising its brand pin may list, in the same commit, what the new scanner finds in its
// files as committed at HEAD; anything its own new code adds still fails. Each case runs the
// command in a throwaway Git repository, as a consumer's gate does.
import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import own from "../package.json";

const ROOT = join(import.meta.dir, "..");
const OLD = "0.0.1";
const dirs: string[] = [];
afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

const pkg = (version: string) =>
  JSON.stringify({
    devDependencies: {
      "@hackersandwizards/brand": `git+https://github.com/hackersandwizards/brand.git#v${version}`,
    },
  });

/** A consumer repository whose HEAD holds `files`, the pin at `pinned`. */
const consumer = (files: Record<string, string>, pinned = OLD) => {
  const dir = mkdtempSync(join(tmpdir(), "brand-upgrade-"));
  dirs.push(dir);
  const git = (...args: string[]) =>
    Bun.spawnSync(
      [
        "git",
        "-c",
        "user.name=t",
        "-c",
        "user.email=t@t",
        "-c",
        "commit.gpgsign=false",
        "-c",
        "core.hooksPath=/dev/null",
        ...args,
      ],
      { cwd: dir },
    );
  write(dir, { "package.json": pkg(pinned), ...files });
  git("init", "-q");
  git("add", "-A");
  git("commit", "-qm", "init");
  return dir;
};
const write = (dir: string, files: Record<string, string>) => {
  for (const [p, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), content);
  }
};
const run = (dir: string, bin: string, ...args: string[]) =>
  Bun.spawnSync(["bun", join(ROOT, "scan", bin), ...args], { cwd: dir }).exitCode;
const raise = (dir: string, files: Record<string, string> = {}) =>
  write(dir, { "package.json": pkg(own.version), ...files });

const CSS = ".a { border-radius: 6px; color: #123456; }\n";
const entry = (radius: number) =>
  JSON.stringify({ "a.css": { hex: 1, radius, reason: "r" } }, null, 2);

test("brand-colours: a pin raise may list what the new scanner finds in the committed file", () => {
  const dir = consumer({ "a.css": CSS, "brand-colours.json": entry(0) });
  expect(run(dir, "colours.ts")).toBe(1);
  raise(dir, { "brand-colours.json": entry(1) });
  expect(run(dir, "colours.ts")).toBe(0);
});

test("brand-colours: a finding the consumer's own code adds still fails during a pin raise", () => {
  const grown = consumer({ "a.css": CSS, "brand-colours.json": entry(0) });
  raise(grown, { "a.css": CSS + ".b { border-radius: 7px; }\n", "brand-colours.json": entry(2) });
  expect(run(grown, "colours.ts")).toBe(1);
  const added = consumer({ "a.css": CSS, "brand-colours.json": entry(0) });
  raise(added, {
    "b.css": ".b { border-radius: 7px; }\n",
    "brand-colours.json": JSON.stringify({
      ...JSON.parse(entry(1)),
      "b.css": { radius: 1, reason: "r" },
    }),
  });
  expect(run(added, "colours.ts")).toBe(1);
});

test("brand-colours: without a pin change the allowlist still may only shrink", () => {
  const dir = consumer({ "a.css": CSS, "brand-colours.json": entry(0) }, own.version);
  write(dir, { "brand-colours.json": entry(1) });
  expect(run(dir, "colours.ts")).toBe(1);
});

test("brand-colours --tighten during a pin raise lists the committed file's new findings", () => {
  const dir = consumer({
    "a.css": CSS,
    "b.css": ".b { border-radius: 7px; }\n",
    "brand-colours.json": entry(0),
  });
  raise(dir, { "c.css": ".c { border-radius: 8px; }\n" });
  expect(run(dir, "colours.ts", "--tighten")).toBe(0);
  const next = JSON.parse(readFileSync(join(dir, "brand-colours.json"), "utf8"));
  expect(next["a.css"]).toMatchObject({ hex: 1, radius: 1, reason: "r" });
  expect(next["b.css"]).toMatchObject({ radius: 1, reason: "" });
  expect(next["c.css"]).toBeUndefined();
});

const FAVICON = readFileSync(join(ROOT, "logos/favicon.svg"), "utf8");

test("brand-copies: a pin raise may list a committed file, never a new one", () => {
  const dir = consumer({ "public/a.svg": FAVICON, "brand-copies.json": "{}" });
  raise(dir, { "brand-copies.json": JSON.stringify({ "public/a.svg": "r" }) });
  expect(run(dir, "copies.ts")).toBe(0);
  write(dir, {
    "public/b.svg": FAVICON,
    "brand-copies.json": JSON.stringify({ "public/a.svg": "r", "public/b.svg": "r" }),
  });
  expect(run(dir, "copies.ts")).toBe(1);
  const same = consumer({ "public/a.svg": FAVICON, "brand-copies.json": "{}" }, own.version);
  write(same, { "brand-copies.json": JSON.stringify({ "public/a.svg": "r" }) });
  expect(run(same, "copies.ts")).toBe(1);
});

test("brand-scan: a pin raise may list a committed component, never a new one", () => {
  const dir = consumer({ "src/components/Pill.astro": "<span />\n", "brand-scan.json": "{}" });
  raise(dir, { "brand-scan.json": JSON.stringify({ pill: "r" }) });
  expect(run(dir, "components.ts")).toBe(0);
  write(dir, {
    "src/components/PageHeader.astro": "<h1 />\n",
    "brand-scan.json": JSON.stringify({ pill: "r", pageheader: "r" }),
  });
  expect(run(dir, "components.ts")).toBe(1);
  const same = consumer(
    { "src/components/Pill.astro": "<span />\n", "brand-scan.json": "{}" },
    own.version,
  );
  write(same, { "brand-scan.json": JSON.stringify({ pill: "r" }) });
  expect(run(same, "components.ts")).toBe(1);
});
