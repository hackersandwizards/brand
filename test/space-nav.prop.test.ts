import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { buildSpaceTree, containsPath } from "../expert/components/space-nav";

const segment = unicodeString.map((s) => s.replaceAll("/", "-"));

test.prop([fc.array(segment, { minLength: 1, maxLength: 5 }), segment], {
  examples: [
    [["手引き", "constructor"], "__proto__"],
    [[""], ""],
    [["á".repeat(1024)], "toString"],
  ],
})("uses a slash boundary between a path and its descendants", (parts, child) => {
  const href = "/" + parts.join("/");
  const node = { href, label: "", order: 0, hasPage: true, children: [] };
  expect(containsPath(node, href)).toBe(true);
  expect(containsPath(node, `${href}/${child}`)).toBe(true);
  expect(containsPath(node, `${href}-${child}`)).toBe(false);
});

test.prop(
  [
    fc.array(fc.tuple(unicodeString, fc.option(fc.integer(), { nil: undefined })), {
      maxLength: 24,
    }),
  ],
  {
    examples: [
      [[]],
      [
        [
          ["é", 0],
          ["a", 0],
          ["z", -1],
          ["長".repeat(1024), undefined],
        ],
      ],
    ],
  },
)("orders sibling pages by numeric order then label and omits the overview", (pages) => {
  const data = pages.map(([label, order], index) => ({
    id: `group/page-${index}`,
    data: { label, order },
  }));
  const nodes = buildSpaceTree(
    "/space",
    [{ id: "overview", data: { label: "Start", order: -1 } }, ...data],
    (entry) => entry.data.label,
  );
  const expected = data.slice().sort((a, b) => {
    const order = (a.data.order ?? Infinity) - (b.data.order ?? Infinity);
    return order || a.data.label.localeCompare(b.data.label);
  });
  expect(nodes.map((node) => node.href)).toEqual(pages.length ? ["/space/group"] : []);
  expect(nodes.flatMap((node) => node.children.map((child) => child.href))).toEqual(
    expected.map((entry) => `/space/${entry.id}`),
  );
});
