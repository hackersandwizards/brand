import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { tableScroll } from "../elements/table";

type TableNode = Parameters<ReturnType<typeof tableScroll>>[0];

test.prop([unicodeString, fc.integer({ min: 0, max: 12 })], {
  examples: [
    ["", 2],
    ["長".repeat(1024), 3],
    ["  Économie\t& données  ", 12],
    ["constructor", 1],
    ["__proto__", 0],
  ],
})(
  "wraps each table once with a distinct region name derived from its heading",
  (heading, count) => {
    const tree: TableNode = {
      type: "root",
      children: [
        { type: "element", tagName: "h2", children: [{ type: "text", value: heading }] },
        ...Array.from({ length: count }, () => ({
          type: "element",
          tagName: "table",
          properties: { className: ["existing"] },
        })),
      ],
    };
    const base = heading.trim().split(/\s+/u).join(" ");
    const transform = tableScroll();
    transform(tree);
    const wrappers = tree.children?.slice(1);
    expect(wrappers).toHaveLength(count);
    for (const [index, wrapper] of (wrappers ?? []).entries()) {
      expect(wrapper).toMatchObject({
        tagName: "div",
        properties: {
          className: ["hw-table-scroll"],
          tabIndex: 0,
          ...(base && { role: "region", ariaLabel: index ? `${base} (${index + 1})` : base }),
        },
        children: [{ tagName: "table", properties: { className: ["existing", "hw-table"] } }],
      });
      if (!base) expect(wrapper.properties).not.toHaveProperty("ariaLabel");
    }
    const once = structuredClone(tree);
    transform(tree);
    expect(tree).toEqual(once);
  },
);
