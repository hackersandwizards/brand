import { expect, test } from "vitest";
import { planLayouts } from "../applications/backgrounds/layouts";

test("selects known layout IDs in device order for each base", () => {
  const jobs = planLayouts(
    ["light", "dark"],
    ["call:logo-ur", "mac:logo-r", "call:logo-ur", "ipad:absent"],
  );
  expect(jobs.map(({ base, file, layout }) => `${base}/${file}/${layout}`)).toEqual([
    "light/mac/logo-r",
    "light/call/logo-ur",
    "dark/mac/logo-r",
    "dark/call/logo-ur",
  ]);
});

test("an unknown layout ID schedules no renders", () => {
  expect(planLayouts(["light"], ["mac:absent"])).toEqual([]);
});
