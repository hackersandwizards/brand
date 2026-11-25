import base from "@hackersandwizards/scaffolding/stryker";

export default {
  ...base,
  incremental: false,
  mutate: [
    "scan/{allowlist,assets,colour-scan,colour-tokens,colours,components,copies,elements,engine-style,markers,retired,tree}.ts",
    "elements/{code,list-filter,table}.ts",
    "expert/components/space-nav.ts",
    "scripts/tokens.ts",
    "applications/mail-signature/fill.ts",
  ],
  vitest: { ...base.vitest, pool: "forks" },
  ignorePatterns: [...base.ignorePatterns, "/dist"],
};
