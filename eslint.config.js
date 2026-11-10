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
    // Inside bun's nested wait for expect().rejects the shared browser's DevTools socket broke
    // ("Invalid WebSocket frame: RSV2 and RSV3 must be clear"); later tests failed "Target closed".
    files: ["test/**", "**/*.test.*"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[property.name=/^(rejects|resolves)$/]:matches([object.callee.name='expect'], [object.object.callee.name='expect'])",
          message:
            "bun's expect().rejects and .resolves return nothing and wait in a nested event loop; await the promise, then expect what it settled to.",
        },
      ],
    },
  },
  prettier,
);
