import { expect, test } from "bun:test";
import { forks, unlisted } from "../scan/components";

test("finds a consumer component named like an expert component, nothing else", () => {
  expect(
    forks([
      "src/components/Pill.astro",
      "src/components/pill.tsx",
      "components/app-header.tsx",
      "src/components/theme_toggle.astro",
      "src/components/Card.astro",
      "src/components/Pill.test.tsx",
      "node_modules/x/components/Pill.astro",
      "src/pages/Pill.astro",
    ]),
  ).toEqual({
    pill: ["src/components/Pill.astro", "src/components/pill.tsx"],
    appheader: ["components/app-header.tsx"],
    themetoggle: ["src/components/theme_toggle.astro"],
  });
});

test("flags an unlisted fork, an entry without a reason and one added against HEAD", () => {
  const found = { pill: ["src/components/Pill.astro"] };
  expect(unlisted(found, { pill: "r" }, { pill: "r" })).toEqual([]);
  expect(unlisted(found, {}, {})).toHaveLength(1);
  expect(unlisted({}, { pill: " " }, { pill: "r" })).toHaveLength(1);
  expect(unlisted({}, { pill: "r" }, {})).toHaveLength(1);
});
