import { typeahead } from "./list-navigation.ts";

// Tree: the APG keys, one tab stop on the current node.
const visibleNodes = (tree: Element) =>
  [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter(
    (n) => n.offsetParent !== null,
  );
function activateNode(node: HTMLElement) {
  const tree = node.closest('[role="tree"]');
  if (!tree) return;
  if (node.hasAttribute("aria-expanded"))
    node.setAttribute("aria-expanded", String(node.getAttribute("aria-expanded") !== "true"));
  // A folder without aria-selected only opens; the current document stays selected.
  if (!node.hasAttribute("aria-expanded") || node.hasAttribute("aria-selected")) {
    for (const n of tree.querySelectorAll('[aria-selected="true"]'))
      n.setAttribute("aria-selected", "false");
    node.setAttribute("aria-selected", "true");
  }
  focusNode(node);
}
function focusNode(node: HTMLElement) {
  node
    .closest('[role="tree"]')!
    .querySelectorAll<HTMLElement>('[tabindex="0"]')
    .forEach((n) => (n.tabIndex = -1));
  node.tabIndex = 0;
  node.focus();
}
type TreePosition = { node: HTMLElement; visible: HTMLElement[]; index: number };

/** Expands a closed branch or moves to its next visible node. */
function enterBranch({ node, visible, index }: TreePosition) {
  const expanded = node.getAttribute("aria-expanded");
  if (expanded === "false") node.setAttribute("aria-expanded", "true");
  if (expanded === "true") focusTreeIndex(visible, index + 1);
}

/** Collapses an open branch or moves to its visible parent. */
function leaveBranch({ node, visible }: TreePosition) {
  if (node.getAttribute("aria-expanded") === "true") {
    node.setAttribute("aria-expanded", "false");
    return;
  }
  const parent = node.parentElement?.closest<HTMLElement>('[role="treeitem"]');
  if (parent && visible.includes(parent)) focusNode(parent);
}

/** Follows the row's own link or activates the node. */
function followTreeNode({ node }: TreePosition) {
  const link = node.querySelector<HTMLElement>(":scope > .hw-tree-row a");
  if (link) link.click();
  else activateNode(node);
}

/** Moves the roving tab stop when navigation yields a nonnegative index. */
function focusTreeIndex(visible: HTMLElement[], index: number) {
  if (index >= 0) focusNode(visible[index]!);
}

const treeKeys = new Map<string, (position: TreePosition) => void>([
  [
    "ArrowDown",
    ({ visible, index }) => focusTreeIndex(visible, Math.min(index + 1, visible.length - 1)),
  ],
  ["ArrowUp", ({ visible, index }) => focusTreeIndex(visible, Math.max(index - 1, 0))],
  ["Home", ({ visible }) => focusTreeIndex(visible, 0)],
  ["End", ({ visible }) => focusTreeIndex(visible, visible.length - 1)],
  ["ArrowRight", enterBranch],
  ["ArrowLeft", leaveBranch],
  ["Enter", followTreeNode],
  [" ", followTreeNode],
]);

/** Moves focus to the next visible node matching a typed character without Ctrl or Command. */
function searchTreeByKey(e: KeyboardEvent, { visible, index }: TreePosition) {
  if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;
  e.preventDefault();
  const next = typeahead(visible, e.key, index);
  focusTreeIndex(visible, next);
}

/** Dispatches navigation and activation keys from the focused tree item. */
export function onTreeKey(e: KeyboardEvent, node: HTMLElement) {
  if (e.target !== node) return;
  const visible = visibleNodes(node.closest('[role="tree"]')!);
  const position = { node, visible, index: visible.indexOf(node) };
  const handle = treeKeys.get(e.key);
  if (!handle) return searchTreeByKey(e, position);
  e.preventDefault();
  handle(position);
}

/** Activates the tree item owning the clicked row. */
export function onTreeRowClick(target: HTMLElement) {
  const row = target.closest<HTMLElement>(".hw-tree-row");
  if (row) activateNode(row.parentElement as HTMLElement);
}

/** Starts each tree at its selected item or the first item. */
export function initTrees(root: ParentNode) {
  for (const tree of root.querySelectorAll<HTMLElement>('.hw-tree[role="tree"]')) {
    const nodes = [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')];
    const current = tree.querySelector<HTMLElement>('[aria-selected="true"]') ?? nodes[0];
    for (const n of nodes) n.tabIndex = n === current ? 0 : -1;
  }
}
