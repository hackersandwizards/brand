import { expect, test } from "vitest";
import { forks, unlisted } from "../scan/components";

test("recognises the shipped Pill, ThemeToggle and SpaceNav component names", () => {
  expect(forks(["Pill.astro", "src/theme_toggle.astro", "src/SpaceNav.svelte"])).toEqual({
    pill: ["Pill.astro"],
    themetoggle: ["src/theme_toggle.astro"],
    spacenav: ["src/SpaceNav.svelte"],
  });
});

test("an inherited constructor does not approve a fork finding", () => {
  expect(
    unlisted({ constructor: ["src/Component.astro"] }, { allow: {}, committed: undefined }),
  ).toEqual([
    "src/Component.astro: forks the expert component constructor; import it from the package",
  ]);
});

test("flags an unlisted fork, an entry without a reason, one added against HEAD and a stale one", () => {
  const found = { pill: ["src/components/Pill.astro"] };
  expect(unlisted(found, { allow: { pill: "r" }, committed: { pill: "r" } })).toEqual([]);
  expect(unlisted(found, { allow: {}, committed: {} })).toHaveLength(1);
  expect(unlisted(found, { allow: { pill: " " }, committed: { pill: "r" } })).toHaveLength(1);
  expect(unlisted(found, { allow: { pill: "r" }, committed: {} })).toHaveLength(1);
  expect(unlisted({}, { allow: { pill: "r" }, committed: { pill: "r" } })).toEqual([
    "brand-scan.json: pill has an unused fork allowance that could hide a new fork. Run bun run brand-scan --tighten to drop the entry.",
  ]);
});

test("fork findings name the files and the reason a new allowlist entry is blocked", () => {
  const found = { pill: ["features/Pill.astro", "shared/pill.tsx"] };
  expect(unlisted(found, { allow: {}, committed: {} })).toEqual([
    "features/Pill.astro, shared/pill.tsx: forks the expert component pill; import it from the package",
  ]);
  expect(unlisted(found, { allow: { pill: " " }, committed: { pill: "Old entry" } })).toEqual([
    "brand-scan.json: pill has an undocumented component exception. Set the entry's string value to explain why the fork must stay.",
  ]);
  const allow = { pill: "Existing layout" };
  expect(unlisted(found, { allow, committed: {} }, (key) => key === "pill")).toEqual([]);
  expect(unlisted(found, { allow, committed: {} }, (key) => key === "header")).toEqual([
    "brand-scan.json: pill adds a fork exception beyond what HEAD and the pin-change rule permit. Import the expert component from the package and remove this entry.",
  ]);
});
