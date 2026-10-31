import { describe, expect, test } from "bun:test";
import { containsPath, navLinkClass } from "../expert/components/space-nav";

describe("navLinkClass", () => {
  test("highlights only the page the reader is on", () => {
    const current = navLinkClass("/handbook/sales", "/handbook/sales").join(" ");
    const other = navLinkClass("/handbook/sales", "/handbook/legal").join(" ");
    expect(current).toContain("text-accent");
    expect(current).not.toContain("text-foreground/70");
    expect(other).toContain("text-foreground/70");
    expect(other).not.toContain("text-accent");
  });

  test("does not highlight a parent when a child page is open", () => {
    expect(navLinkClass("/handbook/sales", "/handbook/sales/pricing").join(" ")).toContain(
      "text-foreground/70",
    );
  });
});

describe("containsPath", () => {
  const node = { href: "/handbook/sales", label: "Sales", order: 0, hasPage: true, children: [] };
  test("matches the page itself and its subtree, not a sibling prefix", () => {
    expect(containsPath(node, "/handbook/sales")).toBe(true);
    expect(containsPath(node, "/handbook/sales/pricing")).toBe(true);
    expect(containsPath(node, "/handbook/sales-ops")).toBe(false);
  });
});
