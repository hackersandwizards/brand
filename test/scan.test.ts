import { expect, test } from "vitest";
import { forks, unlisted } from "../scan/components";

test("finds a consumer component named like an expert component in any folder, nothing else", () => {
  expect(
    forks([
      "src/components/Pill.astro",
      "src/components/pill.tsx",
      "components/app-header.tsx",
      "src/components/theme_toggle.astro",
      "src/components/Card.astro",
      "src/components/Pill.test.tsx",
      "node_modules/x/components/Pill.astro",
      "src/ui/AppHeader.astro",
      "src/layouts/SpaceNav.svelte",
      "src/components/ThemeToggle.vue",
      "src/components/Pill.ts",
    ]),
  ).toEqual({
    pill: ["src/components/Pill.astro", "src/components/pill.tsx"],
    appheader: ["components/app-header.tsx", "src/ui/AppHeader.astro"],
    spacenav: ["src/layouts/SpaceNav.svelte"],
    themetoggle: ["src/components/theme_toggle.astro", "src/components/ThemeToggle.vue"],
  });
});

test("flags an unlisted fork, an entry without a reason, one added against HEAD and a stale one", () => {
  const found = { pill: ["src/components/Pill.astro"] };
  expect(unlisted(found, { pill: "r" }, { pill: "r" })).toEqual([]);
  expect(unlisted(found, {}, {})).toHaveLength(1);
  expect(unlisted(found, { pill: " " }, { pill: "r" })).toHaveLength(1);
  expect(unlisted(found, { pill: "r" }, {})).toHaveLength(1);
  expect(unlisted({}, { pill: "r" }, { pill: "r" })).toEqual([
    "brand-scan.json: pill forks nothing; drop its entry (brand-scan --tighten)",
  ]);
});

test("fork findings name the files and the reason a new allowlist entry is blocked", () => {
  const found = { pill: ["features/Pill.astro", "shared/pill.tsx"] };
  expect(unlisted(found, {}, {})).toEqual([
    "features/Pill.astro, shared/pill.tsx: forks the expert component pill; import it from the package",
  ]);
  expect(unlisted(found, { pill: " " }, { pill: "Old entry" })).toEqual([
    "brand-scan.json: pill names no reason",
  ]);
  const allow = { pill: "Existing layout" };
  expect(unlisted(found, allow, {}, (key) => key === "pill")).toEqual([]);
  expect(unlisted(found, allow, {}, (key) => key === "header")).toEqual([
    "brand-scan.json: pill added against HEAD; the list may only shrink, or during a pin change name a fork committed as is",
  ]);
});
