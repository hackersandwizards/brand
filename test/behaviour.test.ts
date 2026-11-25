import { assert, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hastToHtml, markdownToHast, markdownToHtml } from "satteri";
import { tableScroll, tableScrollPlugin } from "../elements/table";
import { ROOT } from "../scripts/git";

test("the behaviour files hold no markup built from strings they did not create", () => {
  for (const f of [
    "elements/behaviour.ts",
    "elements/carousel.ts",
    "elements/command.ts",
    "elements/copy.ts",
    "elements/list-navigation.ts",
    "elements/motion-preference.ts",
    "elements/popover.ts",
    "elements/tree.ts",
    "elements/usage-hold.ts",
  ])
    expect(readFileSync(join(ROOT, f), "utf8")).not.toMatch(/innerHTML|insertAdjacentHTML/);
});

test("the rehype step wraps each table in a named hw-table-scroll", () => {
  type Node = Parameters<ReturnType<typeof tableScroll>>[0];
  const el = (tagName: string, children: Node[] = [], properties = {}): Node => ({
    type: "element",
    tagName,
    properties,
    children,
  });
  const t = (s: string): Node => ({ type: "text", value: s });
  const table = (head: string) =>
    el("table", [el("thead", [el("tr", [el("th", [t(head)]), el("th", [t("Wert")])])])], {
      className: ["own"],
    });
  const wrapped = el("div", [table("C")], { className: ["hw-table-scroll"] });
  const tree: Node & { children: Node[] } = {
    type: "root",
    children: [
      table("Name"),
      el("h2", [t(" Preis"), el("strong", [t("e")])]),
      table("A"),
      el("p"),
      table("B"),
      wrapped,
    ],
  };
  tableScroll()(tree);
  expect(tree.children.map((node) => node.tagName)).toEqual([
    "div",
    "h2",
    "div",
    "p",
    "div",
    "div",
  ]);
  const [name, , prices, , morePrices] = tree.children;
  const wrappers = [name, prices, morePrices];
  expect(wrappers.map((w) => ({ tag: w?.tagName, properties: w?.properties }))).toEqual([
    {
      tag: "div",
      properties: {
        className: ["hw-table-scroll"],
        tabIndex: 0,
        role: "region",
        ariaLabel: "Name Wert",
      },
    },
    {
      tag: "div",
      properties: {
        className: ["hw-table-scroll"],
        tabIndex: 0,
        role: "region",
        ariaLabel: "Preise",
      },
    },
    {
      tag: "div",
      properties: {
        className: ["hw-table-scroll"],
        tabIndex: 0,
        role: "region",
        ariaLabel: "Preise (2)",
      },
    },
  ]);
  const namedTable = name?.children?.[0];
  assert(namedTable, "The Name region must contain the original table");
  expect(namedTable.properties?.className).toEqual(["own", "hw-table"]);
  // A table already in a wrapper keeps it: one tab stop, one region.
  expect(wrapped.children![0]!.tagName).toBe("table");
});

test("the Sätteri plugin writes what the rehype step writes, its count fresh in each document", () => {
  const md = [
    "| Name | Wert |\n| - | - |\n| a | 1 |",
    "## Preis*e*",
    "| A | B |\n| - | - |\n| 1 | 2 |",
    "Text",
    "| C | D |\n| - | - |\n| 3 | 4 |",
    "> | Q | R |\n> | - | - |\n> | 5 | 6 |",
  ].join("\n\n");
  const tree = markdownToHast(md);
  tableScroll()(tree as Parameters<ReturnType<typeof tableScroll>>[0]);
  const plugin = () => markdownToHtml(md, { hastPlugins: [tableScrollPlugin] }).html.trimEnd();
  const first = plugin();
  expect(first).toBe(hastToHtml(tree).trimEnd());
  expect([...first.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1])).toEqual([
    "Name Wert",
    "Preise",
    "Preise (2)",
    "Preise (3)",
  ]);
  expect(plugin()).toBe(first);
});

test("no two scrolling tables share a region name, under a repeated heading or without one", () => {
  const t = "| Name | Wert |\n| - | - |\n| a | 1 |";
  const empty = "|  |  |\n| - | - |\n| a | 1 |";
  const md = [t, t, "## Beispiel", t, "## Beispiel", t, "## Beispiel (2)", t].join("\n\n");
  const html = markdownToHtml(md, { hastPlugins: [tableScrollPlugin] }).html;
  expect([...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1])).toEqual([
    "Name Wert",
    "Name Wert (2)",
    "Beispiel",
    "Beispiel (2)",
    "Beispiel (2) (2)",
  ]);
  // A table with neither heading nor column heads stays unnamed, however many there are.
  const bare = markdownToHtml([empty, empty].join("\n\n"), {
    hastPlugins: [tableScrollPlugin],
  }).html;
  expect(bare).not.toContain("aria-label");
});
