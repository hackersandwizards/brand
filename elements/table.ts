// The ruled table for Markdown (elements/table.css). `tableScroll` is a rehype step for unified;
// `tableScrollPlugin` is the same step as a hast plugin for Sätteri, Astro 7's default Markdown
// processor (`satteri({ hastPlugins: [tableScrollPlugin] })`, or pushed onto an integration's
// `config.markdown.processor.options.hastPlugins`). Pass either after any sanitizer, which would
// drop its classes. Each table takes hw-table and sits in hw-table-scroll,
// a tab stop named by the heading above it, else by its column heads ("Prices", then "Prices (2)"
// for the next table of that name), else unnamed and without the region role; a table
// already in hw-table-scroll keeps its wrapper. In the browser, `scrollStops` (run by enhance() in
// behaviour.ts) marks each wrapper data-hw-scrolls, whose look table.css sets, and keeps it a tab
// stop only while its table scrolls; without script every wrapper stays one.
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

const HEADING = ["h1", "h2", "h3", "h4", "h5", "h6"];
type Wrapper = {
  type: "element";
  tagName: "div";
  properties: Record<string, string | number | string[]>;
  children: never[];
};
const withTable = (node: Node) => [...new Set([...classes(node), "hw-table"])];

/** Names each table in document order: the heading above it, else its column heads, numbered
 * from the second table of the same name, so no two regions share one. */
const namer = () => {
  let title = "";
  const used = new Set<string>();
  return {
    heading: (node: Node) => void (title = text(node)),
    wrapper: (table: Node): Wrapper => {
      // The column heads: the cells of the table's first row.
      const row = elements(table).flatMap((part) => elements(part).slice(0, 1))[0];
      const heads = row ? elements(row).map(text).filter(Boolean).join(" ") : "";
      const base = title || heads;
      let name = base;
      for (let n = 2; name && used.has(name); n++) name = `${base} (${n})`;
      used.add(name);
      return {
        type: "element",
        tagName: "div",
        properties: {
          className: ["hw-table-scroll"],
          tabIndex: 0,
          ...(name && { role: "region", ariaLabel: name }),
        },
        children: [],
      };
    },
  };
};

/** The rehype step: every table in hw-table, wrapped in a named hw-table-scroll. */
export const tableScroll = () => (tree: Node) => {
  const name = namer();
  const walk = (parent: Node) => {
    const children = parent.children ?? [];
    children.forEach((node, i) => {
      if (node.type !== "element") return;
      if (HEADING.includes(node.tagName ?? "")) name.heading(node);
      if (node.tagName !== "table") return walk(node);
      node.properties = { ...node.properties, className: withTable(node) };
      if (classes(parent).includes("hw-table-scroll")) return;
      children[i] = { ...name.wrapper(node), children: [node] };
    });
  };
  walk(tree);
};

/** What the Sätteri plugin calls on its context. */
type Context = {
  parent(node: Node): Node | undefined;
  setProperty(node: Node, name: string, value: string[]): void;
  wrapNode(node: Node, wrapper: Wrapper): void;
};

/** The same step as a Sätteri hast plugin: a factory, which Sätteri calls once per document. */
export const tableScrollPlugin = () => {
  const name = namer();
  return {
    name: "hw-table-scroll",
    element: {
      filter: [...HEADING, "table"],
      visit(node: Node, ctx: Context) {
        if (node.tagName !== "table") return name.heading(node);
        ctx.setProperty(node, "className", withTable(node));
        const parent = ctx.parent(node);
        if (parent && classes(parent).includes("hw-table-scroll")) return;
        ctx.wrapNode(node, name.wrapper(node));
      },
    },
  };
};

// One observer for every wrapper: each one it reports is marked and a tab stop while its table
// scrolls. The table is measured against the wrapper's content box, which stays the column's width
// whether or not the wrapper takes its ring room, so both marks reach the same answer.
let observer: ResizeObserver | undefined;
const mark = (wrapper: HTMLElement) => {
  const table = wrapper.firstElementChild?.getBoundingClientRect().width ?? 0;
  const s = getComputedStyle(wrapper);
  const column =
    wrapper.getBoundingClientRect().width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
  const scrolls = table > column + 1;
  wrapper.dataset.hwScrolls = String(scrolls);
  if (scrolls) wrapper.tabIndex = 0;
  else wrapper.removeAttribute("tabindex");
};

/** Each hw-table-scroll in `root` marked data-hw-scrolls="true" and a tab stop while its table
 * scrolls, "false" and none while it fits. */
export function scrollStops(root: ParentNode = document) {
  observer ??= new ResizeObserver((entries) => {
    for (const w of new Set(entries.map((e) => e.target.closest<HTMLElement>(".hw-table-scroll"))))
      if (w) mark(w);
  });
  for (const wrapper of root.querySelectorAll<HTMLElement>(".hw-table-scroll")) {
    if (!wireOnce(wrapper, "table-scroll")) continue;
    observer.observe(wrapper);
    if (wrapper.firstElementChild) observer.observe(wrapper.firstElementChild);
  }
}
