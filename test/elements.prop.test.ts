import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { rules } from "../scan/elements";

const id = fc.stringMatching(/^[a-z]{1,24}$/);
test.prop([id, id, id, unicodeString], {
  examples: [
    ["a", "b", "c", ""],
    ["parent", "child", "sibling", "長".repeat(1024)],
  ],
})(
  "opens at-rules and expands every nested selector against every parent",
  (parent, child, sibling, rawComment) => {
    const parents = [`.p-${parent}`, `.s-${sibling}`];
    const inside = `.c-${child}`;
    const comment = rawComment.replaceAll("*/", "* /");
    expect(
      rules(`/* ${comment} */ @media (width > 1px) {
    ${parents.join(", ")} {
      padding: 0;
      &:is(:hover, :focus), ${inside} { color: red; }
    }
  }`),
    ).toEqual([
      {
        selectors: parents.flatMap((p) => [p + ":is(:hover, :focus)", p + " " + inside]),
        props: ["color"],
      },
      { selectors: parents, props: ["padding"] },
    ]);
  },
);
