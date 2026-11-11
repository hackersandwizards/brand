// The ruled table for Markdown (elements/table.css). `tableScroll` is a rehype step: pass it after
// any sanitizer, which would drop its classes. Each table takes hw-table and sits in hw-table-scroll,
// a tab stop named by the heading above it ("Prices", then "Prices (2)" for the next table under
// the same heading), else by its column heads, else unnamed and without the region role. In the
// browser, `scrollStops` (run by enhance() in behaviour.ts) keeps a wrapper a tab stop only while
// its table scrolls; without script every wrapper stays one.
import { wireOnce } from "./copy.ts";

type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

const text = (node: Node): string =>
  node.type === "text"
    ? (node.value ?? "")
    : (node.children ?? []).map(text).join(" ").replace(/\s+/g, " ").trim();

/** The rehype step: every table in hw-table, wrapped in a named hw-table-scroll. */
export const tableScroll = () => (tree: Node) => {
  let heading = "";
  let under = 0;
  const walk = (parent: Node) => {
    const children = parent.children ?? [];
    children.forEach((node, i) => {
      if (node.type !== "element") return;
      if (/^h[1-6]$/.test(node.tagName ?? "")) [heading, under] = [text(node), 0];
      if (node.tagName !== "table") return walk(node);
      const own = node.properties?.className;
      const list = (Array.isArray(own) ? own : own ? [own] : []).map(String);
      node.properties = { ...node.properties, className: [...new Set([...list, "hw-table"])] };
      const n = heading ? ++under : 0;
      const head = (node.children ?? []).find((c) => c.type === "element");
      const name = heading ? (n > 1 ? `${heading} (${n})` : heading) : head ? text(head) : "";
      children[i] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["hw-table-scroll"],
          tabIndex: 0,
          ...(name && { role: "region", ariaLabel: name }),
        },
        children: [node],
      };
    });
  };
  walk(tree);
};

/** Each hw-table-scroll in `root` a tab stop while its table scrolls, and none while it fits. */
export function scrollStops(root: ParentNode = document) {
  for (const wrapper of root.querySelectorAll<HTMLElement>(".hw-table-scroll")) {
    if (!wireOnce(wrapper, "table-scroll")) continue;
    const fits = () => {
      if (wrapper.scrollWidth > wrapper.clientWidth + 1) wrapper.tabIndex = 0;
      else wrapper.removeAttribute("tabindex");
    };
    const observer = new ResizeObserver(fits);
    observer.observe(wrapper);
    if (wrapper.firstElementChild) observer.observe(wrapper.firstElementChild);
    fits();
  }
}
