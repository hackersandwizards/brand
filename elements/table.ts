// The ruled table for Markdown (elements/table.css). `tableScroll` is a rehype step: pass it after
// any sanitizer, which would drop its classes. Each table takes hw-table and sits in hw-table-scroll,
// a tab stop named by the heading above it ("Prices", then "Prices (2)" for the next table under
// the same heading), else by its column heads, else unnamed and without the region role; a table
// already in hw-table-scroll keeps its wrapper. In the browser, `scrollStops` (run by enhance() in
// behaviour.ts) keeps a wrapper a tab stop only while its table scrolls; without script every
// wrapper stays one.
import { wireOnce } from "./copy.ts";

type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

const classes = (node: Node) => [node.properties?.className ?? []].flat().map(String);
const raw = (node: Node): string =>
  node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(raw).join("");
const text = (node: Node) => raw(node).replace(/\s+/g, " ").trim();
const elements = (node: Node) => (node.children ?? []).filter((c) => c.type === "element");

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
      node.properties = {
        ...node.properties,
        className: [...new Set([...classes(node), "hw-table"])],
      };
      if (classes(parent).includes("hw-table-scroll")) return;
      if (heading) under++;
      // The column heads: the cells of the table's first row.
      const row = elements(node).flatMap((part) => elements(part).slice(0, 1))[0];
      const heads = row ? elements(row).map(text).filter(Boolean).join(" ") : "";
      const name = !heading ? heads : under > 1 ? `${heading} (${under})` : heading;
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

// One observer for every wrapper: each one it reports is a tab stop while its table scrolls.
let observer: ResizeObserver | undefined;
const fits = (wrapper: HTMLElement) => {
  if (wrapper.scrollWidth > wrapper.clientWidth + 1) wrapper.tabIndex = 0;
  else wrapper.removeAttribute("tabindex");
};

/** Each hw-table-scroll in `root` a tab stop while its table scrolls, and none while it fits. */
export function scrollStops(root: ParentNode = document) {
  observer ??= new ResizeObserver((entries) => {
    for (const w of new Set(entries.map((e) => e.target.closest<HTMLElement>(".hw-table-scroll"))))
      if (w) fits(w);
  });
  for (const wrapper of root.querySelectorAll<HTMLElement>(".hw-table-scroll")) {
    if (!wireOnce(wrapper, "table-scroll")) continue;
    observer.observe(wrapper);
    if (wrapper.firstElementChild) observer.observe(wrapper.firstElementChild);
  }
}
