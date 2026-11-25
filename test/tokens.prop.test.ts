import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { parseTokens, rgb } from "../scripts/tokens";

// The whitespace before a theme variant and within declarations, and the space before its brace.
type ThemeSpacing = { separator: string; beforeBrace: string };
const SPACES = { separator: " ", beforeBrace: " " } satisfies ThemeSpacing;
const LINES = { separator: "\n\t", beforeBrace: " " } satisfies ThemeSpacing;
const COMPACT = { separator: " ", beforeBrace: "" } satisfies ThemeSpacing;
const COMPACT_LINES = { separator: "\n\t", beforeBrace: "" } satisfies ThemeSpacing;

test.prop(
  [
    fc.array(fc.integer(), { maxLength: 24 }),
    fc.constantFrom(SPACES, LINES, COMPACT, COMPACT_LINES),
    unicodeString,
  ],
  {
    examples: [
      [[], SPACES, ""],
      [[0, -1, 1], LINES, "漢".repeat(1024)],
      [[0, 1], COMPACT, ""],
    ],
  },
)(
  "reads custom properties from adjacent theme variants across comments and whitespace",
  (sizes, { separator, beforeBrace }, rawComment) => {
    const comment = rawComment.replaceAll("*/", "* /");
    const entries = sizes.map((size, index) => [`--size-${index}`, `${size}px`] as const);
    const css =
      `/* ${comment} @theme { --retired: 0 } */ @theme{color:black;}` +
      entries
        .map(
          ([name, value], index) =>
            `@theme${separator}${index % 2 ? "inline" : "static"}${beforeBrace}{${name}${separator}:/* ${comment} */${separator}${value}}`,
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
