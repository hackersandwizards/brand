import base from "@hackersandwizards/scaffolding/stryker";

export default {
  ...base,
  incremental: false,
  mutate: [
    "scan/{assets,colour-scan,colour-tokens,colours,components,copies,elements,markers,retired,tree}.ts",
    "elements/{code,list-filter,table}.ts",
    "expert/components/space-nav.ts",
    "scripts/tokens.ts",
    "applications/mail-signature/fill.ts",
  ],
  vitest: { ...base.vitest, pool: "forks" },
  ignorePatterns: [...base.ignorePatterns, "/dist"],
};
