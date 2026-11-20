import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compile } from "tailwindcss";
import { ROOT } from "../../scripts/git";
import { parseTokens, SOURCE } from "../../scripts/tokens";

const css = readFileSync(SOURCE, "utf8");
const tokens = parseTokens(css);

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
