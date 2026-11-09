import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import fonts from "../generated/fonts.json";
import { ROOT } from "../scripts/git";
import { fontFaces, palettes, parseTokens, resolveColors, rgb, SOURCE } from "../scripts/tokens";

const css = readFileSync(SOURCE, "utf8");
const tokens = parseTokens(css);
const colors = resolveColors(tokens);
const namesAnother = (k: string) => /^var\(--color-[\w-]+\)$/.test(tokens[k]);
const { neutrals, hues } = palettes(css);
const print = readFileSync(SOURCE.replace("tokens.css", "print.css"), "utf8");

const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test("reads every declaration of tokens.css", () => {
  expect(Object.keys(tokens)).toHaveLength(169);
  expect(tokens["--color-teal"]).toBe("#1a7285");
});

test("mixes color-mix() tokens in sRGB", () => {
  expect(colors["--color-night-ink"]).toBe("#ebeced"); // white 92 % on night
  expect(colors["--color-subtle"]).toBe(colors["--color-muted"]);
});

test("ampersand-light, written out against night.css's loop, stays ampersand 60 % on white", () => {
  const mix = rgb(colors["--color-ampersand"]).map((v) => Math.round(v * 0.6 + 255 * 0.4));
  expect(rgb(colors["--color-ampersand-light"])).toEqual(mix);
});

test("holds 31 brand colours, a token naming another adding none", () => {
  const own = Object.keys(colors).filter((k) => !namesAnother(k));
  expect(own).toHaveLength(31);
  expect(new Set(own.map((k) => colors[k])).size).toBe(31);
});

test("every role clears WCAG AA: text on light 4.5:1 on bg and white, night on night and night-2", () => {
  expect(hues).toHaveLength(7);
  for (const { text, night } of hues) {
    for (const ground of ["bg", "white"])
      expect(contrast(colors[`--color-${text}`], colors[`--color-${ground}`])).toBeGreaterThan(4.5);
    for (const ground of ["night", "night-2"])
      expect(contrast(colors[`--color-${night}`], colors[`--color-${ground}`])).toBeGreaterThan(
        4.5,
      );
  }
});

test("the two palettes hold every brand colour, and name only brand colours", () => {
  const cells = new Set([
    ...neutrals.flatMap((r) => [r.day, r.night]),
    ...hues.flatMap((r) => [r.base, r.text, r.night]),
    ...hues.flatMap((r) =>
      Object.keys(colors)
        .filter((k) =>
          [40, 7].some(
            (p) => tokens[k] === `color-mix(in srgb, var(--color-${r.base}) ${p}%, white)`,
          ),
        )
        .map((k) => k.replace("--color-", "")),
    ),
  ]);
  cells.delete("-");
  const own = Object.keys(colors)
    .filter((k) => !namesAnother(k))
    .map((k) => k.replace("--color-", ""));
  expect([...cells].sort()).toEqual(own.sort());
  expect(neutrals.every((r) => r.day !== "-" || r.night !== "-")).toBe(true);
});

test("every code colour clears 4.5:1 on night and night-2", () => {
  const roles = Object.keys(tokens).filter((k) => k.startsWith("--code-") && k !== "--code-bg");
  expect(roles).toHaveLength(6);
  for (const k of roles)
    for (const ground of ["night", "night-2"])
      expect(contrast(colors[tokens[k].slice(4, -1)], colors[`--color-${ground}`])).toBeGreaterThan(
        4.5,
      );
});

test("every chart series clears 3:1 on white", () => {
  for (let i = 1; i <= 6; i++) {
    const ref = tokens[`--chart-${i}`].match(/^var\((--color-[\w-]+)\)$/)![1];
    expect(contrast(colors[ref], "#ffffff")).toBeGreaterThan(3);
  }
});

test("print.css's page-box variables match its @page rule, which cannot read them", () => {
  const v = (name: string) => print.match(new RegExp(`${name}: ([^;]+);`))![1];
  expect(print).toContain(
    `@page {\n  size: A4;\n  margin: 14mm 0 ${v("--print-margin-bottom")};\n}`,
  );
  expect(v("--print-page-height")).toBe("297mm");
});

test("fonts.json names each family tokens.css leads with, and every file it lists ships", () => {
  for (const stack of [tokens["--font-sans"], tokens["--font-mono"]])
    expect(fonts.faces.map((f) => `"${f.fontFamily}"`)).toContain(stack.split(",")[0]);
  for (const f of fonts.faces) expect(existsSync(join(ROOT, "tokens/fonts", f.file))).toBe(true);
});

// A static latin-ext face covers what its Latin file lacks only if its range is fonts.css's.
test("print.css's latin-ext faces take fonts.css's range, at every Latin weight", () => {
  const faces = fontFaces(print);
  const range = Object.fromEntries(
    fonts.faces.filter((f) => f.unicodeRange).map((f) => [f.fontFamily, f.unicodeRange!]),
  );
  const weights = (subset: string) =>
    faces
      .filter((f) => new RegExp(`-${subset}-\\d+-normal`).test(f.file))
      .map((f) => `${f.fontFamily} ${f.fontWeight}`);
  for (const f of faces.filter((f) => f.file.includes("-latin-ext-")))
    expect(f.unicodeRange).toBe(range[f.fontFamily]);
  expect(weights("latin")).not.toEqual([]);
  expect(weights("latin-ext")).toEqual(weights("latin"));
});

// A live page shows the fallback face meanwhile, never blank text for up to 3 s.
test("every screen and static face is font-display: swap", () => {
  for (const f of [...fonts.faces, ...fontFaces(print)]) expect(f.fontDisplay).toBe("swap");
});

test("static-fonts.css holds print.css's faces, each url reaching its file from generated/", () => {
  const css = readFileSync(join(ROOT, "generated/static-fonts.css"), "utf8");
  // fontFaces throws on a src outside url("fonts/…"), so a url the generator missed fails here.
  expect(fontFaces(css.replaceAll('url("../tokens/', 'url("'))).toEqual(fontFaces(print));
  for (const [, url] of css.matchAll(/url\("([^"]+)"\)/g))
    expect(existsSync(join(ROOT, "generated", url))).toBe(true);
});

// A face drawn before its web face arrives keeps the web face's lines only if the stack names a
// metric-matched fallback right after it, and every page loading either font file declares it.
test("each stack names its fallback face second, and both font files declare its faces", () => {
  const screen = readFileSync(join(ROOT, "tokens/fonts.css"), "utf8");
  const local = (text: string) =>
    [...text.matchAll(/@font-face\s*\{[^}]*src: local\([^}]*\}/g)].map(([face]) => face);
  for (const stack of ["--font-sans", "--font-mono", "--font-code"]) {
    const fallback = tokens[stack]!.split(",")
      .map((f) => f.trim())
      .find((f) => f.endsWith(' Fallback"'))!;
    expect(fallback).toBe(tokens[stack]!.split(",")[0]!.replace(" Variable", " Fallback"));
    expect(local(screen).some((face) => face.includes(`font-family: ${fallback};`))).toBe(true);
  }
  for (const face of local(screen))
    for (const d of ["size-adjust", "ascent-override", "descent-override", "line-gap-override"])
      expect(face).toContain(`${d}: `);
  const fallbacks = local(readFileSync(join(ROOT, "generated/static-fonts.css"), "utf8"));
  expect(fallbacks).toEqual(local(screen));
});

// Tailwind v4 resolves a utility such as text-<name> against two theme namespaces: text-label is
// a colour wherever --color-label exists, and the element loses the --text-label size. No name may
// sit in both namespaces of such a utility, in any CSS file the package ships, a consumer's @theme
// reading tokens.css and expert.css side by side.
const SHARED = [
  ["text", "color"],
  ["shadow", "color"],
  ["font", "font-weight"],
  ["container", "spacing"],
] as const;
const collisions = (source: string) => {
  const names = (ns: string) =>
    new Set(
      [...source.matchAll(new RegExp(`--${ns}-([a-z0-9-]+?)(?:--[\\w-]+)?\\s*:`, "g"))].map(
        (m) => m[1]!,
      ),
    );
  return SHARED.flatMap(([a, b]) => {
    const other = names(b);
    return [...names(a)].filter((n) => other.has(n)).map((n) => `--${a}-${n} / --${b}-${n}`);
  });
};

test("no theme namespace pair a Tailwind utility reads shares a name", () => {
  expect(collisions("--color-label: x; --text-label: 1rem; --text-label--line-height: 1;")).toEqual(
    ["--text-label / --color-label"],
  );
  const shipped = [...new Bun.Glob("{tokens,expert,elements,generated}/**/*.css").scanSync(ROOT)];
  expect(shipped).toContain("expert/expert.css");
  const source = shipped
    .map((f) => readFileSync(join(ROOT, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, ""))
    .join("\n");
  expect(collisions(source)).toEqual([]);
});
