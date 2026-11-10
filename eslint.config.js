import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".claude/**",
      ".githooks/**",
      "tokens/**",
      "logos/**",
      "generated/**",
      "dist/**",
      "**/.astro/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // bun's expect(promise).rejects and .resolves return nothing and wait in a nested event loop,
    // where the browser's DevTools socket broke ("RSV2 and RSV3 must be clear").
    files: ["test/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name=/^(rejects|resolves)$/]",
          message:
            "bun's .rejects and .resolves wait in a nested event loop; await the promise, then expect its value or error.",
        },
      ],
    },
  },
  prettier,
);
