import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { forks, unlisted } from "../scan/components";

test.prop(
  [
    unicodeString,
    fc
      .record({
        separator: fc.constantFrom("", "-", "_"),
        applyCase: fc.constantFrom("toLowerCase", "toUpperCase"),
      })
      .map(({ separator, applyCase }) => {
        const base = "App" + separator + "Header";
        return { base, name: base[applyCase]() };
      }),
    fc.constantFrom(".astro", ".tsx", ".jsx", ".vue", ".svelte"),
  ],
  {
    examples: [
      ["", { base: "AppHeader", name: "appheader" }, ".astro"],
      ["資料/" + "長".repeat(1024), { base: "App_Header", name: "APP_HEADER" }, ".svelte"],
    ],
  },
)(
  "picks expert component names independent of folders, casing and word separators",
  (directory, { base, name }, extension) => {
    const prefix = `consumer/${encodeURIComponent(directory)}/`;
    const files = [prefix + name + extension, prefix + "nested/" + base + extension];
    expect(
      forks([
        ...files,
        prefix + "Not" + base + extension,
        prefix + base + ".ts",
        prefix + base + ".test" + extension,
        prefix + "node_modules/" + base + extension,
      ]),
    ).toEqual({ appheader: files });
  },
);

test.prop([fc.oneof(fc.constantFrom("constructor", "__proto__", "toString"), unicodeString)], {
  examples: [["constructor"], ["__proto__"], ["toString"], [""], ["長".repeat(1024)]],
})("only own allowlist, finding and committed keys count for a component name", (name) => {
  const found = Object.fromEntries([[name, ["src/Component.astro"]]]);
  const allow = Object.fromEntries([[name, "reason"]]);
  expect(unlisted(found, { allow: {}, committed: undefined })).toEqual([
    `src/Component.astro: forks the expert component ${name}; import it from the package`,
  ]);
  expect(unlisted({}, { allow, committed: allow })).toEqual([
    `brand-scan.json: ${name} has an unused fork allowance that could hide a new fork. Run bun run brand-scan --tighten to drop the entry.`,
  ]);
  expect(unlisted(found, { allow, committed: {} })).toEqual([
    `brand-scan.json: ${name} adds a fork exception beyond what HEAD and the pin-change rule permit. Import the expert component from the package and remove this entry.`,
  ]);
  expect(unlisted(found, { allow, committed: allow })).toEqual([]);
});
