import base from "@hackersandwizards/scaffolding/stryker";

export default {
  ...base,
  incremental: false,
  mutate: [
    "scan/{allowlist,assets,browser,browser-csp,browser-workers,colour-scan,colour-tokens,colours,components,copies,element-classes,element-dom,element-exceptions,element-page,element-properties,element-rules,element-source,element-stylesheet,element-values,elements,elements-config,engine-style,marker-capture,marker-dom,marker-page,marker-readings,markers,retired,site,tree}.ts",
    "elements/{code,list-filter,list-filter-browser,list-filter-form,list-filter-source,list-filter-view,table}.ts",
    "expert/components/space-nav.ts",
    "scripts/tokens.ts",
    "applications/mail-signature/fill.ts",
  ],
  vitest: { ...base.vitest, pool: "forks" },
  ignorePatterns: [...base.ignorePatterns, "/dist"],
};
