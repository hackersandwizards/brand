import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { codeClasses } from "../elements/code";

const className = unicodeString.map((word) => `c-${word.replace(/\s/gu, "-")}`);
test.prop(
  [
    fc.array(className),
    fc.option(fc.constantFrom(" ", "\t", "\n", " \t "), { nil: undefined }),
    fc.boolean(),
  ],
  {
    examples: [
      [[], undefined, false],
      [["hw-code", "é", "hw-code"], "\t", true],
      [["長".repeat(1024), "__proto__"], undefined, true],
    ],
  },
)(
  "adds the code block class once, preserving the other classes and dropping inline style",
  (classes, separator, styled) => {
    const node = {
      properties: {
        class: separator ? classes.join(separator) : classes,
        ...(styled && { style: "background: black" }),
      },
    };
    codeClasses.pre(node);
    expect(node.properties).toEqual({ class: [...new Set([...classes, "hw-code"])].join(" ") });
  },
);

test.prop([fc.integer({ min: 0, max: 15 })], {
  examples: [[0], [1], [2], [4], [7], [8], [15]],
})("sets only the italic, bold and underline bits of the font style", (fontStyle) => {
  const node = { properties: { style: "color: black" } };
  codeClasses.span(node, 0, 0, node, { fontStyle });
  const flags = fontStyle.toString(2).padStart(3, "0").slice(-3).split("").reverse();
  const classes = ["italic", "bold", "underline"].filter((_, index) => flags[index] === "1");
  expect(node.properties).toEqual(
    classes.length ? { class: classes.map((name) => `hw-code-${name}`).join(" ") } : {},
  );
});
