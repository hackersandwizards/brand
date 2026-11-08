import { describe, expect, test } from "bun:test";
import { buildSpaceTree, containsPath } from "../expert/components/space-nav";

describe("containsPath", () => {
  const node = { href: "/handbook/sales", label: "Sales", order: 0, hasPage: true, children: [] };
  test("matches the page itself and its subtree, not a sibling prefix", () => {
    expect(containsPath(node, "/handbook/sales")).toBe(true);
    expect(containsPath(node, "/handbook/sales/pricing")).toBe(true);
    expect(containsPath(node, "/handbook/sales-ops")).toBe(false);
  });
});

describe("buildSpaceTree", () => {
  const entry = (id: string, title?: string, order?: number) => ({ id, data: { title, order } });
  const tree = buildSpaceTree(
    "/kb",
    [
      entry("overview", "Start"),
      entry("tools/claude-code/context", "Context"),
      entry("tools", "Tools", 2),
      entry("glossary", "Glossary", 1),
      entry("agents", "Agents"),
    ],
    (e) => e.data.title ?? e.id,
  );
  test("orders by order, then label, and leaves the overview out", () => {
    expect(tree.map((n) => n.label)).toEqual(["Glossary", "Tools", "Agents"]);
  });
  test("puts a folder's index page on its branch and humanises a folder without one", () => {
    const tools = tree[1]!;
    expect(tools).toMatchObject({ href: "/kb/tools", hasPage: true, order: 2 });
    expect(tools.children[0]).toMatchObject({
      href: "/kb/tools/claude-code",
      label: "Claude Code",
      hasPage: false,
    });
    expect(tools.children[0]!.children[0]).toMatchObject({ label: "Context", hasPage: true });
  });
});
