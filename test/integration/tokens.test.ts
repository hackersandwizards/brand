import { expect, test } from "vitest";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { compile } from "tailwindcss";
import { ROOT } from "../../scripts/git";
import { parseTokens, SOURCE } from "../../scripts/tokens";

const css = readFileSync(SOURCE, "utf8");
const tokens = parseTokens(css);

function checkWithSource(file: string, source: string) {
  const scratch = join(ROOT, "node_modules/.cache/check-msgs");
  mkdirSync(scratch, { recursive: true });
  const dir = mkdtempSync(join(scratch, "tokens-test-"));
  try {
    for (const path of [
      "applications/linkedin-visuals/render.ts",
      "applications/mail-signature/template.html",
      "elements/elements.css",
      "expert/expert.css",
      "package.json",
      "scripts/code-theme.ts",
      "scripts/copy-entry.ts",
      "scripts/css-declarations.ts",
      "scripts/font-outputs.ts",
      "scripts/git.ts",
      "scripts/tokens.ts",
      "tokens/document.css",
      "tokens/fonts.css",
      "tokens/layers.css",
      "tokens/print.css",
      "tokens/tokens.css",
    ]) {
      const target = join(dir, path);
      mkdirSync(dirname(target), { recursive: true });
      if (path === file) writeFileSync(target, source);
      else if (path === "elements/elements.css") writeFileSync(target, "");
      else copyFileSync(join(ROOT, path), target);
    }
    const result = Bun.spawnSync([process.execPath, "run", "check:tokens"], {
      cwd: dir,
      stderr: "pipe",
    });
    return { dir, result };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// A stylesheet Tailwind does not compile reads the measures with var(): every build writes them,
// while a token no utility or rule names stays out.
test("a Tailwind build that names no utility writes the measures and no other token", async () => {
  const built = (
    await compile(`@import "./tokens.css";`, {
      base: join(ROOT, "tokens"),
      loadStylesheet: async (_id, base) => ({ path: SOURCE, base, content: css }),
    })
  ).build([]);
  for (const k of ["--container-measure", "--container-measure-h1", "--container-measure-h2"])
    expect(built).toContain(`${k}: ${tokens[k]};`);
  expect(built).not.toContain("--color-teal:");
});

test.each([
  {
    file: "expert/expert.css",
    source: "@theme { .nested { --text-ui: 1rem } }",
    message:
      "expert/expert.css has a missing or unreadable @theme block, so token generation stopped. Put custom property declarations in a flat @theme, @theme static, or @theme inline block.",
  },
  {
    file: "expert/expert.css",
    source: "@theme { --text-body: 1rem; }",
    message:
      "expert.css repeats --text-body from tokens/tokens.css, which would give the generated data two values for one name. Remove the duplicate declaration from expert/expert.css or give the expert step its own name.",
  },
  {
    file: "applications/mail-signature/template.html",
    source: '<div style="font-family: Arial, sans-serif;">Example</div>',
    message:
      "mail-signature/template.html must supply both stacks for generated/fonts.json. In applications/mail-signature/template.html, reuse one font-family stack ending in sans-serif and one ending in monospace.",
  },
  {
    file: "tokens/fonts.css",
    source:
      '@font-face { font-family: "Example"; src: url("fonts/example.woff2") format("woff2"), url(example.ttf); }',
    message:
      'tokens/fonts.css contains a font URL the generated fontFaceRules cannot rebase. Write each @font-face URL as url("fonts/<file>").',
  },
])("check:tokens gives a fix for a finding in $file", ({ file, source, message }) => {
  const { result } = checkWithSource(file, source);
  expect(result.exitCode).toBe(1);
  expect(result.stderr.toString().split("\n")).toContain(`error: ${message}`);
});

test("check:tokens points to the supported import syntax for flat CSS", () => {
  const file = "elements/elements.css";
  const { dir, result } = checkWithSource(file, "@import url(https://example.test/layout.css);");
  expect(result.exitCode).toBe(1);
  expect(result.stderr.toString().split("\n")).toContain(
    `error: ${join(dir, file)}: @import url(https://example.test/layout.css); would leave an unresolved import or asset in the flat stylesheet. Point imports to a local stylesheet on a line of the form @import "./file.css"; and embed relative assets as data URLs.`,
  );
});
