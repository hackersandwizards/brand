import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { transform } from "lightningcss";
import { ROOT } from "../scripts/git";

const css = (f: string) => readFileSync(`${ROOT}/${f}`, "utf8");

// The island takes the colours and what is built from them back, nothing else: a corner or a scale
// an ancestor sets holds on it.
test("tokens.root.css's island block declares only the colour tokens and those reading them", () => {
  const tokens = css("generated/tokens.root.css");
  const island = tokens.slice(tokens.indexOf(":where("));
  expect(island).toContain("--color-bg:");
  expect(island).toContain("--gradient-strip:");
  expect(island).not.toContain("--radius-brand:");
  expect(island).not.toContain("--text-meta:");
});

const darkSelector = [
  [
    {
      type: "attribute",
      namespace: null,
      name: "data-theme",
      operation: { operator: "equal", value: "dark", caseSensitivity: "case-sensitive" },
    },
  ],
];

const nightScopeReferences = (file: string) => {
  const scopes: boolean[] = [];
  const references: string[] = [];
  let count = 0;
  transform({
    filename: file,
    code: readFileSync(`${ROOT}/${file}`),
    visitor: {
      Rule: {
        scope({ value }) {
          const dark = isDeepStrictEqual(value.scopeStart, darkSelector);
          scopes.push(dark);
          count += Number(dark);
        },
      },
      RuleExit: {
        scope() {
          scopes.pop();
        },
      },
      Variable({ name }) {
        if (scopes.includes(true)) references.push(name.ident);
      },
    },
  });
  return { file, count, references };
};

// A data-theme="dark" element below a light html keeps that page's roles (expert.css), so an
// element's night scope reads the night roles from --hw-night-*, never --accent and its kin.
test("the elements' night scopes read no page role", () => {
  const roles = [
    "--background",
    "--foreground",
    "--accent",
    "--on-accent",
    "--border",
    "--input",
    "--muted",
  ];
  const stylesheets = [...new Bun.Glob("elements/*.css").scanSync(ROOT)].map(nightScopeReferences);
  expect(stylesheets.reduce((total, sheet) => total + sheet.count, 0)).toBeGreaterThan(0);
  const found = stylesheets.flatMap(({ file, references }) =>
    references.filter((name) => roles.includes(name)).map((name) => ({ file, name })),
  );
  expect(found).toEqual([]);
});
