import {
  countLine,
  highlight,
  LONG_LIST,
  matches,
  ranked,
  searchWords,
  type CountCopy,
  type FilterItem,
  type FilterState,
} from "./list-filter-state.ts";
import type { SourceRows } from "./list-filter-source.ts";

type Row = { el: HTMLElement; title: HTMLElement | null; plain: string; item: FilterItem };

function readCountCopy(json: string | undefined): CountCopy {
  if (json === undefined) throw new Error("List filter count copy missing: data-count");
  const value: unknown = JSON.parse(json);
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "one" in value &&
    "other" in value &&
    typeof value.one === "string" &&
    typeof value.other === "string"
  )
    return { one: value.one, other: value.other };
  throw new Error("data-count must be a string or contain one and other strings");
}

function readFilterFacets(json: string): FilterItem["facets"] {
  const value: unknown = JSON.parse(json);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("data-filter-facets must be an object");
  return Object.fromEntries(
    Object.entries<unknown>({ ...value }).map(([facet, values]) => {
      if (
        !Array.isArray(values) ||
        !values.every((item): item is string => typeof item === "string")
      )
        throw new Error(`data-filter-facets: "${facet}" must be a list of strings`);
      return [facet, values];
    }),
  );
}

/** Read a row before its title receives markup. */
function readRow(el: HTMLElement): Row {
  const title = el.querySelector<HTMLElement>("[data-filter-title]");
  const item: FilterItem = {
    text: el.dataset.filterText ?? "",
    facets: readFilterFacets(el.dataset.filterFacets ?? "{}"),
  };
  return { el, title, plain: title?.textContent ?? "", item };
}

/** In a long list a row off screen skips layout (list-filter.css) and stands in at the mean
 *  content height of the rows the browser renders, measured whenever the list's width changes
 *  (from 0 too, as a hidden list shows); a row once rendered keeps its own height. */
function observeRowHeight(list: HTMLElement, rows: () => Row[]) {
  let width = -1;
  new ResizeObserver(([entry]) => {
    if (entry === undefined) throw new Error("Resize entry missing: list filter");
    if (entry.contentRect.width === width) return;
    width = entry.contentRect.width;
    if (list.hasAttribute("data-long")) measureRowHeight(list, rows());
  }).observe(list);
}

function measureRowHeight(list: HTMLElement, rows: Row[]) {
  const rendered = rows.filter(
    ({ el }) =>
      !el.hidden &&
      [...el.children].some((child) => child.checkVisibility?.({ contentVisibilityAuto: true })),
  );
  const [first] = rendered;
  if (first === undefined) return;
  // The stand-in is the content box's height: padding and border come on top.
  const box = getComputedStyle(first.el);
  const inset = [box.paddingTop, box.paddingBottom, box.borderTopWidth, box.borderBottomWidth]
    .map(parseFloat)
    .reduce((a, b) => a + b);
  const mean =
    rendered.reduce((sum, { el }) => sum + el.getBoundingClientRect().height, 0) / rendered.length;
  list.style.setProperty("--hw-list-filter-row", `${mean - inset}px`);
}

function showRows(rows: Row[], state: FilterState): number {
  const words = searchWords(state.q);
  let shown = 0;
  for (const { el, title, plain, item } of rows) {
    el.hidden = !matches(item, state);
    if (el.hidden) continue;
    shown += 1;
    // A hidden row's title is rewritten when it shows again.
    if (title) title.innerHTML = highlight(plain, words);
  }
  return shown;
}

function filterResult(root: HTMLElement, selector: string) {
  const result = root.querySelector<HTMLElement>(selector);
  if (result === null) throw new Error(`List filter result element missing: ${selector}`);
  return result;
}

/** The DOM view of the results, including rows supplied by a template or fetched from a page. */
export class FilterView {
  private readonly list: HTMLElement;
  private readonly empty: HTMLElement;
  private readonly count: HTMLElement;
  private readonly overview: HTMLElement | null;
  private readonly browseAlways: boolean;
  private readonly copy: CountCopy;
  items: FilterItem[] = [];
  private rows: Row[] = [];
  // The rows as the page placed them, which may be a query's order.
  private placed: Row[] = [];
  private groups: HTMLElement[] = [];

  constructor(root: HTMLElement) {
    this.list = filterResult(root, "[data-filter-list]");
    this.empty = filterResult(root, "[data-filter-empty]");
    this.count = filterResult(root, "[data-filter-count]");
    this.overview = root.dataset.overview ? document.getElementById(root.dataset.overview) : null;
    this.browseAlways = root.dataset.listFilter !== "active";
    this.copy = readCountCopy(root.dataset.count);
  }

  /** Activate rendered rows and begin measuring the list as its width changes. */
  activate() {
    const template = this.list.querySelector<HTMLTemplateElement>("template[data-filter-rows]");
    template?.replaceWith(template.content);
    observeRowHeight(this.list, () => this.rows);
    this.collect();
  }

  /** Place the source markup in the list and index the newly installed rows. */
  install({ nodes, replace }: SourceRows) {
    if (replace) this.list.replaceChildren(...nodes);
    else this.list.append(...nodes);
    this.collect();
  }

  /** Index the list in both server order and the order currently on the page. */
  private collect() {
    const elements = [...this.list.querySelectorAll<HTMLElement>("[data-filter-item]")];
    this.rows = elements
      .slice()
      .sort((a, b) => Number(a.dataset.filterOrder ?? 0) - Number(b.dataset.filterOrder ?? 0))
      .map(readRow);
    this.items = this.rows.map((row) => row.item);
    const rowOf = new Map(this.rows.map((row) => [row.el, row]));
    this.placed = elements.map((el) => {
      const row = rowOf.get(el);
      if (row === undefined) throw new Error("List filter row missing from the element index");
      return row;
    });
    this.groups = [...this.list.querySelectorAll<HTMLElement>("[data-filter-group]")];
    this.list.toggleAttribute("data-long", this.rows.length >= LONG_LIST);
  }

  /** Rows move only when the order changes, and only within their own parent, so a grouped list
   *  keeps its groups. */
  private place(q: string) {
    const order = ranked(this.rows, (row) => row.plain, q);
    if (order.some((row, i) => row !== this.placed[i])) {
      for (const row of order) row.el.parentElement?.append(row.el);
      this.placed = order;
    }
    return order;
  }

  /** The overview yields to an active filter, including before source rows arrive. */
  showOverview(active: boolean) {
    if (this.overview) this.overview.hidden = active;
  }

  /** Leave the results hidden until there are source rows to filter. */
  hidePending() {
    this.list.hidden = true;
  }

  /** Apply a query to the available rows and keep the result status in sync. */
  render(state: FilterState, active: boolean): number {
    const shown = showRows(this.place(state.q), state);
    for (const group of this.groups)
      group.hidden = !group.querySelector("[data-filter-item]:not([hidden])");
    const listed = this.browseAlways || active;
    this.list.hidden = !listed || shown === 0;
    this.empty.hidden = !listed || shown > 0;
    this.count.textContent = listed ? countLine(this.copy, shown, this.items.length) : "";
    return shown;
  }
}
