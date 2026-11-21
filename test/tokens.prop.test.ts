import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { parseTokens, rgb } from "../scripts/tokens";

test.prop(
  [
    fc.array(fc.integer(), { maxLength: 24 }),
    fc.constantFrom(" ", "\n\t"),
    unicodeString,
    fc.boolean(),
  ],
  {
    examples: [
      [[], " ", "", false],
      [[0, -1, 1], "\n\t", "漢".repeat(1024), false],
      [[0, 1], " ", "", true],
    ],
  },
)(
  "reads custom properties from adjacent theme variants across comments and whitespace",
  (sizes, space, rawComment, compact) => {
    const comment = rawComment.replaceAll("*/", "* /");
    const entries = sizes.map((size, index) => [`--size-${index}`, `${size}px`] as const);
    const css =
      `/* ${comment} @theme { --retired: 0 } */ @theme{color:black;}` +
      entries
        .map(
          ([name, value], index) =>
            `@theme${space}${index % 2 ? "inline" : "static"}${compact ? "" : " "}{${name}${space}:/* ${comment} */${space}${value}}`,
        )
        .join("");
    expect(parseTokens(css)).toEqual(Object.fromEntries(entries));
  },
);

test.prop([fc.uint8Array({ minLength: 3, maxLength: 3 })], {
  examples: [[new Uint8Array([0, 128, 255])], [new Uint8Array([255, 0, 10])]],
})("decodes three hex byte pairs in RGB order", (bytes) => {
  expect(rgb("#" + Buffer.from(bytes).toString("hex").toUpperCase())).toEqual([...bytes]);
});
