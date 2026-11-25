import { expect, test } from "vitest";
import { parseLayoutArgs, planLayouts } from "../applications/backgrounds/layouts";

test("selects known layout IDs in device order for each base", () => {
  const jobs = planLayouts(
    "/output",
    ["light", "dark"],
    ["call:logo-ur", "mac:logo-r", "call:logo-ur", "ipad:absent"],
  );
  expect(jobs.map(({ base, wallpaper: { file }, layout }) => `${base}/${file}/${layout}`)).toEqual([
    "light/mac/logo-r",
    "light/call/logo-ur",
    "dark/mac/logo-r",
    "dark/call/logo-ur",
  ]);
});

test("an unknown layout ID schedules no renders", () => {
  expect(planLayouts("/output", ["light"], ["mac:absent"])).toEqual([]);
});

test.each([
  {
    args: ["/output", "--layouts"],
    parsed: { out: "/output", bases: ["dark", "light"], only: undefined },
  },
  {
    args: ["/output", "--layouts", "--base", "light"],
    parsed: { out: "/output", bases: ["light"], only: undefined },
  },
  {
    args: ["/output", "--layouts", "--only", "mac:logo-r,call:logo-ur"],
    parsed: { out: "/output", bases: ["dark", "light"], only: ["mac:logo-r", "call:logo-ur"] },
  },
])("parses the layout selection from $args", ({ args, parsed }) => {
  expect(parseLayoutArgs(args)).toEqual(parsed);
});

test.each([
  { base: "dark", id: "call:logo-ur", file: "call", layout: "logo-ur", tone: "dark" },
  { base: "light", id: "mac-studio:logo-r", file: "mac-studio", layout: "logo-r", tone: "mid" },
  { base: "light", id: "call:logo-ur", file: "call", layout: "logo-ur", tone: "light" },
] as const)(
  "plans the written wallpaper and preview for $base $id",
  ({ base, id, file, layout, tone }) => {
    expect(planLayouts("/output", [base], [id])).toMatchObject([
      {
        wallpaper: { file, path: `/output/${base}/${file}/${layout}.png`, tone },
        mockStem: `/output/mocks/${base}~${layout}`,
      },
    ]);
  },
);
