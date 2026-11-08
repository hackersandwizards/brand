/** A space's navigation tree: one node per page or folder. */
export interface SpaceNode {
  href: string;
  label: string;
  order: number;
  hasPage: boolean;
  children: SpaceNode[];
}

/** A content entry the tree is built from: its id is its path below the space. */
export interface SpaceEntry {
  id: string;
  data: { order?: unknown };
}

/** The space's own landing page, rendered by the index page rather than the tree. */
export const SPACE_OVERVIEW_ID = "overview";

export function containsPath(node: SpaceNode, path: string): boolean {
  return path === node.href || path.startsWith(`${node.href}/`);
}

/** "context-engineering" as "Context Engineering": a folder's label until a page names it. */
export const humanizeSegment = (segment: string) =>
  segment
    .split("-")
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");

/** The tree under `base`: a node per entry and per folder above one, a folder's `index` page
 *  (Astro's glob loader strips `/index`) on its branch node with its title and order, siblings by
 *  `data.order`, then label. The entry `overview` is the space's landing page and stays out. */
export function buildSpaceTree<E extends SpaceEntry>(
  base: string,
  entries: E[],
  title: (entry: E) => string,
): SpaceNode[] {
  const roots: SpaceNode[] = [];
  const byPath = new Map<string, SpaceNode>();
  const ensure = (path: string): SpaceNode => {
    const existing = byPath.get(path);
    if (existing) return existing;
    const node: SpaceNode = {
      href: `${base}/${path}`,
      label: humanizeSegment(path.slice(path.lastIndexOf("/") + 1)),
      order: Number.POSITIVE_INFINITY,
      hasPage: false,
      children: [],
    };
    byPath.set(path, node);
    const parent = path.includes("/") ? ensure(path.slice(0, path.lastIndexOf("/"))) : null;
    (parent ? parent.children : roots).push(node);
    return node;
  };
  for (const entry of entries) {
    if (entry.id === SPACE_OVERVIEW_ID) continue;
    const node = ensure(entry.id);
    node.label = title(entry);
    node.hasPage = true;
    if (typeof entry.data.order === "number") node.order = entry.data.order;
  }
  const sort = (nodes: SpaceNode[]) => {
    nodes.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    for (const node of nodes) sort(node.children);
  };
  sort(roots);
  return roots;
}
