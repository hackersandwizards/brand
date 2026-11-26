import { defined } from "@hackersandwizards/scaffolding/defined";
import { assert, expect, test } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import generatedCodeTheme from "../generated/code-theme.json";
import { fontFaceRules, preloadFiles } from "../generated/font-faces";
import fonts from "../generated/fonts.json";
import { tokens as jsonTokens } from "../generated/tokens.json";
import { tokens as generatedTokens } from "../generated/tokens";
import { codeTheme } from "../scripts/code-theme";
import { declarations } from "../scripts/css-declarations";
import { faceRules, fallbackFaces, fontFaces } from "../scripts/font-outputs";
import { ROOT, sha256 } from "../scripts/git";
import { palettes, parseTokens, resolveColors, rgb, SOURCE } from "../scripts/tokens";

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
  expect(Object.keys(tokens)).toHaveLength(177);
  expect(tokens["--color-teal"]).toBe("#1a7285");
});

test("reads compact and multiline custom properties and skips commented theme blocks", () => {
  expect(
    parseTokens(`/* Old theme
      @theme { --retired: 1px; }
    */
    @theme {
      --step:/* base step */ 1rem;
      --measure:2rem;
      --grid  : repeat(
        2,   minmax(0, 1fr)
      );
    }`),
  ).toEqual({ "--step": "1rem", "--measure": "2rem", "--grid": "repeat(2, minmax(0, 1fr))" });
});

test("reports a missing or unreadable theme block before generating tokens", () => {
  for (const css of ["body { font-size: 1rem }", "@theme { .nested { --step: 1rem } }"])
    expect(() => parseTokens(css)).toThrow("a @theme block parseTokens cannot read");
});

test("CSS declarations drop comments and collapse whitespace without changing values", () => {
  expect(declarations('font-family: /* face */ "Example"; grid: repeat( 2,   1fr );')).toEqual({
    "font-family": '"Example"',
    grid: "repeat(2, 1fr)",
  });
});

test("the data formats carry expert.css's type steps, its aliases left out; the CSS formats do not", () => {
  const expert = readFileSync(join(ROOT, "expert/expert.css"), "utf8");
  const generated = (file: string) => readFileSync(join(ROOT, "generated", file), "utf8");
  const json: Record<string, string> = jsonTokens;
  const root = generated("tokens.root.css");
  const steps = [...expert.matchAll(/^ {2}(--text-[\w-]+): (?!var\()([^;]+);/gm)];
  const stepNames = steps.map(([, name]) => name);
  for (const name of [
    "--text-page",
    "--text-heading",
    "--text-subheading",
    "--text-subheading--line-height",
    "--text-ui",
    "--text-micro",
  ])
    expect(stepNames).toContain(name);
  for (const [, name, value] of steps) {
    expect(json[defined(name, "expert type step name")]).toBe(
      defined(value, "expert type step value"),
    );
    expect(root).not.toContain(`${name}:`);
  }
  expect(json["--text-meta"]).toBeUndefined();
  expect<Record<string, string>>(generatedTokens).toEqual(json);
  expect(generated("tokens.py")).toContain(JSON.stringify(json, null, 4));
});

test("mixes color-mix() tokens in sRGB", () => {
  expect(colors["--color-night-ink"]).toBe("#ebeced"); // white 92 % on night
  expect(colors["--color-subtle"]).toBe(colors["--color-muted"]);
});

test("the Shiki theme maps token roles and ANSI colours to the shipped theme", () => {
  expect(codeTheme(tokens, colors)).toEqual(generatedCodeTheme);
});

test("Shiki scopes keep their role colours and font styles", () => {
  const theme = codeTheme(
    {
      "--code-bg": "#101010",
      "--code-fg": "#f0f0f0",
      "--code-comment": "#888888",
      "--code-keyword": "var(--color-purple-night)",
      "--code-string": "#00cccc",
      "--code-inserted": "#00dd00",
      "--code-deleted": "#dd0000",
    },
    { "--color-purple-night": "#aa00cc" },
  );
  expect(theme.colors).toMatchObject({
    "editor.background": "#101010",
    "editor.foreground": "#f0f0f0",
    "terminal.ansiMagenta": "#aa00cc",
  });
  expect(theme.tokenColors).toEqual(
    expect.arrayContaining([
      { scope: ["keyword", "storage", "storage.type"], settings: { foreground: "#aa00cc" } },
      { scope: ["markup.italic"], settings: { foreground: "#f0f0f0", fontStyle: "italic" } },
    ]),
  );
});

test("ampersand-light, written out against night.css's loop, stays ampersand 60 % on white", () => {
  const mix = rgb(colors["--color-ampersand"]).map((v) => Math.round(v * 0.6 + 255 * 0.4));
  expect(rgb(colors["--color-ampersand-light"])).toEqual(mix);
});

test("holds 32 brand colours, a token naming another adding none", () => {
  const own = Object.keys(colors).filter((k) => !namesAnother(k));
  expect(own).toHaveLength(32);
  expect(new Set(own.map((k) => colors[k])).size).toBe(32);
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
  expect(neutrals.map(({ day, night }) => [day, night])).not.toContainEqual(["-", "-"]);
});

test("every code colour clears 4.5:1 on night and night-2", () => {
  const roles = new Set(Object.keys(tokens).filter((k) => k.startsWith("--code-")));
  expect(roles.delete("--code-bg")).toBe(true);
  expect(roles.size).toBe(6);
  for (const k of roles)
    for (const ground of ["night", "night-2"])
      expect(contrast(colors[tokens[k].slice(4, -1)], colors[`--color-${ground}`])).toBeGreaterThan(
        4.5,
      );
});

test("every chart series clears 3:1 on white", () => {
  for (let i = 1; i <= 6; i++) {
    const ref = defined(
      tokens[`--chart-${i}`].match(/^var\((--color-[\w-]+)\)$/),
      "chart colour reference",
    )[1];
    expect(contrast(colors[ref], "#ffffff")).toBeGreaterThan(3);
  }
});

test("print.css's page-box variables match its @page rule, which cannot read them", () => {
  const v = (name: string) => defined(print.match(new RegExp(`${name}: ([^;]+);`)), name)[1];
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

test("font data skips commented faces and keeps the live face's descriptors", () => {
  const css = String.raw`/* @font-face {
    font-family: "Retired";
    src: url("fonts/retired.woff2") format("woff2");
  } */
  @font-face {
    font-family: "Example \"Text\"";
    src: url("fonts/example.woff2") format("woff2");
    font-weight: /* variable range */ 100   900;
    unicode-range: U+0020, U+0050-0059;
  }`;
  expect(fontFaces(css)).toEqual([
    {
      file: "example.woff2",
      format: "woff2",
      fontFamily: String.raw`Example \"Text\"`,
      fontWeight: "100 900",
      unicodeRange: "U+0020,U+0050-0059",
    },
  ]);
});

// A static latin-ext face covers what its Latin file lacks only if its range is fonts.css's.
test("print.css's latin-ext faces take fonts.css's range, at every Latin weight", () => {
  const faces = fontFaces(print);
  const range = Object.fromEntries(
    fonts.faces
      .filter((f) => f.unicodeRange)
      .map((f) => [f.fontFamily, defined(f.unicodeRange, "unicode range for " + f.fontFamily)]),
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
// metric-matched fallback right after the web face's own names, and every page loading either font
// file declares it.
test("each stack names its fallback face after the web face, and both font files declare it", () => {
  const screen = fallbackFaces(readFileSync(join(ROOT, "tokens/fonts.css"), "utf8"));
  const stacked = new Set<string>();
  for (const stack of ["--font-sans", "--font-mono", "--font-code"]) {
    const names = defined(tokens[stack], stack)
      .split(",")
      .map((f) => f.trim());
    const primary = defined(names[0], "primary font family");
    const fallback = primary.replace(" Variable", " Fallback");
    const at = names.indexOf(fallback);
    expect(
      names
        .slice(0, at)
        .every((n) => n.startsWith(defined(primary.split(" ")[0], "primary font prefix"))),
    ).toBe(at > 0);
    for (let i = at; names[i]?.startsWith(fallback.slice(0, -1)); i++)
      stacked.add(defined(names[i], "fallback font family"));
  }
  expect(
    new Set(
      screen.map((face) => defined(face.match(/font-family: ("[^"]+")/), "quoted font family")[1]),
    ),
  ).toEqual(stacked);
  for (const face of screen)
    for (const d of [
      "size-adjust",
      "ascent-override",
      "descent-override",
      "line-gap-override",
      "unicode-range",
    ])
      expect(face).toContain(`${d}: `);
  expect(fallbackFaces(readFileSync(join(ROOT, "generated/static-fonts.css"), "utf8"))).toEqual(
    screen,
  );
  expect(fonts.fallbacks.map((f) => f.fontFamily)).toEqual(
    screen.map((face) => defined(face.match(/font-family: "([^"]+)"/), "font family")[1]),
  );
});

// A page inlining print.css resolves its imports by this one-line, double-quoted, relative form,
// and an @import after any other rule is dropped by the browser.
test("print.css imports fonts.css's fallback faces before any rule", () => {
  expect(
    print
      .replace(/\/\*[^]*?\*\//g, "")
      .trimStart()
      .startsWith('@import "../generated/fallback-faces.css";\n'),
  ).toBe(true);
});

// A surface serving the font files from its own path writes fonts.css's rules with its own urls.
test("fontFaceRules gives fonts.css's rules, each url the base or the function's answer", () => {
  const screen = readFileSync(join(ROOT, "tokens/fonts.css"), "utf8");
  const rules = faceRules(screen).join("\n\n");
  expect(fontFaceRules("fonts/")).toBe(rules);
  const prefixed = fontFaceRules("/static/fonts/");
  expect(fontFaces(prefixed.replaceAll('url("/static/', 'url("'))).toEqual(fontFaces(screen));
  expect(fallbackFaces(prefixed)).toEqual(fallbackFaces(screen));
  const files = fonts.faces.map((f) => f.file);
  expect(fontFaceRules((file) => `data:font/woff2;base64,${btoa(file)}`)).toBe(
    files.reduce(
      (out, file) =>
        out.replace(`url("fonts/${file}")`, `url("data:font/woff2;base64,${btoa(file)}")`),
      rules,
    ),
  );
});

test.each([
  {
    name: "a literal base",
    base: "/cdn/fonts/",
    hash: "4eb8cc241eadbf0363de2dc2fc01cc0761d6d780849ce683c5293b37f65acb20",
  },
  {
    name: "a data URL callback",
    base: (file: string) => `data:font/woff2;base64,${btoa(file)}`,
    hash: "4ae11192f920dafed3a909931a61bd616ab1351225885d491f3535dd5afc1a0a",
  },
  {
    name: "a callback returning literal replacement syntax",
    base: (file: string) => `https://cdn.example/$&/${file}`,
    hash: "2ff5b05ca548da7c6022041780a8d156fcd2bba54373ccaa66387096b338e1e8",
  },
])("fontFaceRules retains the original CSS for $name", ({ base, hash }) => {
  expect(sha256(Buffer.from(fontFaceRules(base)))).toBe(hash);
});

test("fontFaceRules calls the URL resolver in font source order", () => {
  const files: string[] = [];
  fontFaceRules((file) => {
    files.push(file);
    return file;
  });
  expect(files).toEqual([
    "inter-latin-wght-normal.woff2",
    "inter-latin-ext-wght-normal.woff2",
    "jetbrains-mono-latin-wght-normal.woff2",
    "jetbrains-mono-latin-ext-wght-normal.woff2",
  ]);
});

// A surface preloads preloadFiles and writes fontFaceRules: a preload no rule draws, or a face every
// page draws left unpreloaded, costs a request or a swap.
test("preloadFiles names the files of fontFaceRules' and fonts.json's faces without a unicode-range", () => {
  const unranged = faceRules(fontFaceRules("/x/"))
    .filter((face) => !face.includes("unicode-range"))
    .flatMap((face) => face.split("url(").slice(1))
    .map((source) => {
      const url = /^"([^"]+)"\)/.exec(source);
      assert(url, "A web font source must contain a double-quoted URL.");
      return url[1];
    });
  expect(unranged.length).toBeGreaterThan(0);
  expect(unranged).toEqual(preloadFiles.map((file) => `/x/${file}`));
  expect(fonts.faces.filter((f) => !("unicodeRange" in f)).map(({ file }) => `/x/${file}`)).toEqual(
    unranged,
  );
  for (const file of preloadFiles) expect(existsSync(join(ROOT, "tokens/fonts", file))).toBe(true);
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
      [...source.matchAll(new RegExp(`--${ns}-([a-z0-9-]+?)(?:--[\\w-]+)?\\s*:`, "g"))].map((m) =>
        defined(m[1], "token name"),
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

test("translucent white and the scrim are tokens the elements name, never a mix they write", () => {
  expect(generatedTokens["--white-line"]).toBe("color-mix(in srgb, white 15%, transparent)");
  expect(generatedTokens["--white-wash"]).toBe("color-mix(in srgb, white 7%, transparent)");
  expect(generatedTokens["--scrim"]).toBe(
    "color-mix(in srgb, var(--color-night) 40%, transparent)",
  );
  const dir = join(ROOT, "elements");
  const written = readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .filter((f) =>
      /color-mix\(in srgb, (white (15|7)%|var\(--color-night\) 40%), transparent\)/.test(
        readFileSync(join(dir, f), "utf8"),
      ),
    );
  expect(written).toEqual([]);
});

// docs/exports.md "Custom properties": every property an exported stylesheet defines is in a
// property file, a setting some element's opening comment lists, or named there as internal.
const INTERNAL_LITERALS = ["--hw-fg", "--hw-bg", "--hw-accent", "--hw-header-fill"];
const INTERNAL_FAMILIES = { "--_*": /^--_/, "--tw-prose-*": /^--tw-prose-/ };

test("every custom property is interface or named internal in docs/exports.md", () => {
  const declared = (f: string) =>
    [...readFileSync(join(ROOT, f), "utf8").matchAll(/(?:^|[;{\s])(--[\w-]+)\s*:/g)].map((m) =>
      defined(m[1], "custom property name"),
    );
  const opening = (f: string) => {
    const comment = /^\/\*[\s\S]*?\*\//.exec(readFileSync(join(ROOT, f), "utf8"));
    assert(comment, `Add an opening comment to ${f} that names its settings.`);
    return comment[0];
  };
  const elements = readdirSync(join(ROOT, "elements"))
    .filter((f) => f.endsWith(".css"))
    .map((f) => `elements/${f}`);
  const files = readdirSync(join(ROOT, "tokens"))
    .filter((f) => f.endsWith(".css"))
    .map((f) => `tokens/${f}`)
    .concat("expert/expert.css", "elements/scales.css");
  const settings = elements.flatMap((file) =>
    [...opening(file).matchAll(/--[\w-]+/g)].map(([name]) => name),
  );
  const iface = new Set([...files.flatMap(declared), ...settings]);
  const section = /## Custom properties\n([\s\S]*?)(\n## |$)/.exec(
    readFileSync(join(ROOT, "docs/exports.md"), "utf8"),
  );
  assert(section, "Restore the Custom properties section in docs/exports.md.");
  const internal = section[1].split("Internal")[1];
  assert(internal, "Document the internal custom properties in docs/exports.md.");
  const documented = [...internal.matchAll(/`(--[\w-]*\*?)`/g)].map(([, name]) => name);
  expect(documented.toSorted()).toEqual(
    [...INTERNAL_LITERALS, ...Object.keys(INTERNAL_FAMILIES)].sort(),
  );
  const rest = [...elements, "expert/header.css", "expert/app-base.css"]
    .flatMap((f) => declared(f).map((p) => [f, p] as const))
    .filter(([, p]) => !iface.has(p))
    .filter(([, p]) => !INTERNAL_LITERALS.includes(p))
    .filter(([, p]) => !Object.values(INTERNAL_FAMILIES).some((pattern) => pattern.test(p)));
  expect(rest).toEqual([]);
});
