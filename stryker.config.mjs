import base from "@hackersandwizards/scaffolding/stryker";

export default {
  ...base,
  mutate: [
    "scan/{colours,components,copies}.ts",
    "elements/{code,list-filter}.ts",
    "expert/components/space-nav.ts",
    "scripts/tokens.ts",
    "applications/mail-signature/fill.ts",
  ],
  plugins: ["./scripts/stryker-vitest.mjs"],
  vitest: { ...base.vitest, pool: "forks" },
  ignorePatterns: [...base.ignorePatterns, "/dist"],
};
