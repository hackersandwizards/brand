import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";
import { parseTokens, resolveColors, SOURCE } from "../scripts/tokens";

// What a Tailwind consumer's :root holds per theme: the tokens, then the @theme inline block, which
// Tailwind emits there under the same names, then the theme's roles. Each role must resolve to a
// colour, without a cycle through a name the inline block shadows.
const css = readFileSync(join(ROOT, "expert/expert.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const block = (head: RegExp) => parseTokens(`@theme {${head.exec(css)![1]}}`);
const light = block(/:root,\s*\[data-theme="light"\]\s*\{([^}]*)\}/);
// On a night page both blocks match html, so night keeps every light role it does not set.
const dark = { ...light, ...block(/html\[data-theme="dark"\]\s*\{([^}]*)\}/) };
const inline = block(/@theme inline\s*\{([^}]*)\}/);
const token = resolveColors(parseTokens(readFileSync(SOURCE, "utf8")));
const namedRoleNames = (roles: Record<string, string>) =>
  Object.keys(roles).filter((name) => !/^\d/.test(roles[name]!));
const root = (roles: Record<string, string>) => {
  const all = { ...parseTokens(readFileSync(SOURCE, "utf8")), ...inline, ...roles };
  for (const k of namedRoleNames(roles)) all[`--color-role${k}`] = `var(${k})`;
  // A cycle would recurse without end in resolveColors: name it instead.
  const visit = (k: string, path: string[]): void => {
    if (path.includes(k)) throw new Error(`cycle: ${[...path, k].join(" -> ")}`);
    for (const [, ref] of (all[k] ?? "").matchAll(/var\((--[\w-]+)\)/g)) visit(ref, [...path, k]);
  };
  for (const k of Object.keys(all)) visit(k, []);
  const colors = resolveColors(all);
  return (k: string) => colors[k.startsWith("--color-") ? k : `--color-role${k}`];
};

test("light roles resolve to the token values, without a cycle", () => {
  const value = root(light);
  expect({
    border: value("--border"),
    colorBorder: value("--color-border"),
    slate: value("--hue-slate"),
  }).toEqual({ border: "#d0d2d8", colorBorder: "#d0d2d8", slate: "#545861" });
  expect({
    border: value("--border"),
    slate: value("--hue-slate"),
    muted: value("--hw-muted"),
  }).toEqual({
    border: token["--color-border"],
    slate: token["--color-muted"],
    muted: token["--color-muted"],
  });
});

test("every light and dark role resolves to a colour", () => {
  for (const [theme, roles] of Object.entries({ light, dark })) {
    const names = namedRoleNames(roles);
    expect(names, `Select named roles from the ${theme} theme`).not.toHaveLength(0);
    const value = root(roles);
    for (const name of names)
      expect(value(name), `Resolve the ${theme} role ${name} to a colour`).toMatch(
        /^#[0-9a-f]{6}$/,
      );
  }
});

test("the select chevron is border-strong on light and night-muted on night", () => {
  const select = readFileSync(join(ROOT, "elements/select.css"), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const strokes = [...select.matchAll(/stroke='%23([0-9a-f]{6})'/g)].map(([, hex]) => `#${hex}`);
  expect(strokes).toEqual([token["--color-border-strong"], token["--color-night-muted"]]);
});

test("teal, purple, rust and slate equal no error, warning or success", () => {
  for (const roles of [light, dark]) {
    const value = root(roles);
    const status = ["--error", "--warning", "--success"].map(value);
    for (const hue of ["--hue-teal", "--hue-purple", "--hue-rust", "--hue-slate"])
      expect(status).not.toContain(value(hue));
  }
});

test("every text-foreground step from /20 to /65 takes the dim floor", () => {
  const listed = [
    ...css.matchAll(/\.text-foreground\\\/(\d+) \{\s*color: [^;]*max\(\1%, var\(--dim-floor\)\)/g),
  ].map((m) => Number(m[1]));
  expect(listed).toEqual([20, 25, 30, 35, 40, 45, 50, 55, 60, 65]);
});

// night.css serves pages without expert.css, so it repeats the day roles for a light island.
test("night.css gives a light island inside night expert.css's day roles", () => {
  const nightCss = readFileSync(join(ROOT, "tokens/night.css"), "utf8");
  const island = parseTokens(
    `@theme {${/\[data-hw-night\] \[data-theme="light"\]\s*\{([^}]*)\}/.exec(nightCss)![1]}}`,
  );
  const roles = ["--background", "--foreground", "--accent", "--muted", "--border"];
  expect(roles.filter((k) => !(k in island))).toEqual([]);
  // Resolved from the tokens alone, as on a page without Tailwind.
  const copy = resolveColors({
    ...parseTokens(readFileSync(SOURCE, "utf8")),
    ...island,
    ...Object.fromEntries(roles.map((k) => [`--color-role${k}`, `var(${k})`])),
  });
  const day = root(light);
  for (const k of roles) expect([k, copy[`--color-role${k}`]]).toEqual([k, day(k)]);
});
