import { fc, test } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { failing } from "../scan/markers";

const offset = fc.oneof(
  fc.constantFrom(NaN, Infinity, -Infinity),
  fc.integer({ min: -128, max: 128 }).map((n) => n / 128),
);

test.prop([offset, fc.option(offset), fc.boolean()], {
  examples: [
    [0.25, -0.25, false],
    [-0.25, null, false],
    [33 / 128, null, false],
    [0, -33 / 128, false],
    [NaN, null, false],
    [0, NaN, false],
    [0, 0, true],
  ],
})(
  "accepts a single marker when its offset and any first-line indent are within a quarter pixel",
  (offset, indent, double) => {
    const within = (n: number) => n >= -0.25 && n <= 0.25;
    expect(
      failing({
        page: "x",
        label: "li",
        kind: "glyph",
        scale: 1,
        newline: false,
        offset,
        indent,
        double,
      }),
    ).toBe(double || !(within(offset) && (indent === null || within(indent))));
  },
);
