import { defineConfig } from "vitest/config";

const timeout = Number(process.env.SCAFFOLDING_TEST_TIMEOUT_MS || 5000);

export default defineConfig({
  plugins: [
    {
      name: "bun-import-meta",
      enforce: "pre",
      // Vite gives transformed modules dirname even when the test process runs on Bun.
      transform(code, id) {
        if (id.endsWith(".ts") && /\bimport\.meta\.dir\b/.test(code)) {
          return code.replace(/\bimport\.meta\.dir\b/g, "import.meta.dirname");
        }
      },
    },
  ],
  test: {
    testTimeout: timeout,
    hookTimeout: timeout,
    // The browser suites ran one file at a time under Bun.
    fileParallelism: false,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["test/**/*.test.ts"],
          exclude: ["test/catalog/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "catalog",
          include: ["test/catalog/**/*.test.ts"],
        },
      },
    ],
  },
});
