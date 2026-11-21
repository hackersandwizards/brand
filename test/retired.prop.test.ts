import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { retiredIn } from "../scan/retired";
import verbal from "../verbal/verbal.json";

const separators = [
  " ",
  "\t",
  "\\b",
  "\\f",
  "\\r",
  "\\r\\n",
  "\\t",
  "\\n",
  "&nbsp;",
  "</span><span>",
] as const;

test.prop(
  [
    fc.constantFrom(...verbal.retired.map(({ text }) => text)),
    fc.array(fc.constantFrom(...separators), { minLength: 1 }),
    unicodeString,
  ],
  {
    examples: verbal.retired.map<[string, (typeof separators)[number][], string]>(({ text }) => [
      text,
      ["&nbsp;", "</span><span>", "\\t"],
      "長".repeat(1024),
    ]),
  },
)(
  "recognises a retired line across whitespace, markup and encoded separators",
  (line, separators, attribute) => {
    const content = line
      .split(" ")
      .map((word, index) => (index ? separators[(index - 1) % separators.length] : "") + word)
      .join("");
    const html = `<span data-example="${encodeURIComponent(attribute)}">${content}</span>`;
    expect(retiredIn(html)).toEqual([line]);
  },
);
