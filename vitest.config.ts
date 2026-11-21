import base from "@hackersandwizards/scaffolding/vitest";
import { mergeConfig } from "vitest/config";

const mutation = Boolean(process.env.STRYKER_MUTATOR_WORKER);

export default mergeConfig(base, {
  plugins: [
    {
      name: "bun-import-meta",
      enforce: "pre",
      // Vite gives transformed modules dirname even when the test process runs on Bun.
      transform(code: string, id: string) {
        if (id.endsWith(".ts") && /\bimport\.meta\.dir\b/.test(code)) {
          return code.replace(/\bimport\.meta\.dir\b/g, "import.meta.dirname");
        }
      },
    },
  ],
  test: {
    server: mutation ? { deps: { inline: ["@hackersandwizards/scaffolding"] } } : undefined,
    // Run one test file at a time so the browser suites do not compete for Chrome.
    fileParallelism: false,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: mutation
            ? [
                "test/{behaviour,code,colours,copies,elements,list-filter,mail-signature,markers,retired,scan,space-nav,tokens,upgrade}.test.ts",
                "test/*.prop.test.ts",
              ]
            : ["test/**/*.test.ts"],
          exclude: ["test/integration/**", "test/catalog/**"],
        },
      },
      ...(!mutation
        ? [
            {
              extends: true,
              test: {
                name: "integration",
                include: ["test/integration/**/*.test.ts"],
              },
            },
            {
              extends: true,
              test: {
                name: "catalog",
                include: ["test/catalog/**/*.test.ts"],
              },
            },
          ]
        : []),
    ],
  },
});
