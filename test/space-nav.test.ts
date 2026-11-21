import { describe, expect, test } from "vitest";
import { buildSpaceTree } from "../expert/components/space-nav";

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
  test("puts a folder's index page on its branch and humanises a folder without one", () => {
    const tools = tree.find(({ href }) => href === "/kb/tools")!;
    expect(tools).toMatchObject({ href: "/kb/tools", hasPage: true, order: 2 });
    expect(tools.children[0]).toMatchObject({
      href: "/kb/tools/claude-code",
      label: "Claude Code",
      hasPage: false,
    });
    expect(tools.children[0]!.children[0]).toMatchObject({ label: "Context", hasPage: true });
  });
});
