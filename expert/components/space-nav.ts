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

/** text-foreground/65 sits under each app's --dim-floor: an app with a higher floor (the trainer
 *  hub's 70%) lifts it there. */
export function navLinkClass(href: string, currentPath: string): string[] {
  return [
    "block truncate rounded px-2 py-1 text-ui transition-colors",
    href === currentPath
      ? "bg-accent/8 font-medium text-accent"
      : "text-foreground/65 hover:bg-muted/50 hover:text-foreground",
  ];
}
