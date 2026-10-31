/** A space's navigation tree: one node per page or folder, as each app's own tree builder makes it. */
export interface SpaceNode {
  href: string;
  label: string;
  order: number;
  hasPage: boolean;
  children: SpaceNode[];
}

export function containsPath(node: SpaceNode, path: string): boolean {
  return path === node.href || path.startsWith(`${node.href}/`);
}

export function navLinkClass(href: string, currentPath: string): string[] {
  return [
    "block truncate rounded-sm px-2 py-1 text-ui transition-colors",
    href === currentPath
      ? "bg-accent/7 font-medium text-accent"
      : "text-foreground/70 hover:bg-muted/40 hover:text-foreground",
  ];
}
