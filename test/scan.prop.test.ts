import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { forks, unlisted } from "../scan/components";

test.prop(
  [
    unicodeString,
    fc.constantFrom("", "-", "_"),
    fc.boolean(),
    fc.constantFrom(".astro", ".tsx", ".jsx", ".vue", ".svelte"),
  ],
  {
    examples: [
      ["", "", false, ".astro"],
      ["資料/" + "長".repeat(1024), "_", true, ".svelte"],
    ],
  },
)(
  "picks expert component names independent of folders, casing and word separators",
  (directory, separator, upper, extension) => {
    const prefix = `consumer/${encodeURIComponent(directory)}/`;
    const base = "App" + separator + "Header";
    const name = upper ? base.toUpperCase() : base.toLowerCase();
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
  expect(unlisted(found, {}, undefined)).toEqual([
    `src/Component.astro: forks the expert component ${name}; import it from the package`,
  ]);
  expect(unlisted({}, allow, allow)).toEqual([
    `brand-scan.json: ${name} forks nothing; drop its entry (brand-scan --tighten)`,
  ]);
  expect(unlisted(found, allow, {})).toEqual([
    `brand-scan.json: ${name} added against HEAD; the list may only shrink, or during a pin change name a fork committed as is`,
  ]);
  expect(unlisted(found, allow, allow)).toEqual([]);
});
