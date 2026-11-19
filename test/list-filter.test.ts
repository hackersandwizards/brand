import { describe, expect, it } from "vitest";
import {
  countLine,
  fullTextUrl,
  hasWords,
  highlight,
  initListFilter,
  isActive,
  matches,
  ranked,
  readState,
  rebaseSrcset,
  searchWords,
  stateUrl,
  tally,
} from "../elements/list-filter";

// The trainer hub's cases (src/lib/__tests__/list-filter.test.ts), plus the count line for one.
const items = [
  { text: "context engineering claude-code", facets: { topic: ["tools"], tag: ["mcp", "memory"] } },
  { text: "context and productivity", facets: { topic: ["evidence"], tag: ["metrics"] } },
  { text: "spec-driven development", facets: { topic: ["tools"], tag: [] } },
];
const options = { topic: ["", "tools", "evidence"], tag: ["", "mcp", "memory", "metrics"] };

describe("list filter", () => {
  it("fills the count line, one or other, and joins the query onto a base with or without one", () => {
    expect(countLine("{shown} of {total}", 3, 9)).toBe("3 of 9");
    const copy = { one: "1 training", other: "{shown} trainings" };
    expect([countLine(copy, 1, 9), countLine(copy, 0, 9), countLine(copy, 4, 9)]).toEqual([
      "1 training",
      "0 trainings",
      "4 trainings",
    ]);
    expect(fullTextUrl("/search", "a b")).toBe("/search?q=a%20b");
    expect(fullTextUrl("/search?kind=knowledge", "x")).toBe("/search?kind=knowledge&q=x");
  });

  it("reads the URL's state and drops a value no option offers", () => {
    const state = readState(new URLSearchParams("q=+context+&topic=nope&tag=mcp"), options);
    expect(state).toEqual({ q: "context", facets: { topic: "", tag: "mcp" } });
    expect(isActive(state)).toBe(true);
    expect(isActive(readState(new URLSearchParams(""), options))).toBe(false);
  });

  it("matches every word and every chosen facet", () => {
    const state = { q: "Context ENG", facets: { topic: "tools", tag: "" } };
    expect(items.map((item) => matches(item, state))).toEqual([true, false, false]);
    expect(matches(items[1]!, { q: "context", facets: { topic: "tools", tag: "" } })).toBe(false);
  });

  it("reads pasted queries with mixed case and whitespace and requires every word", () => {
    const words = searchWords(" \tContext\n  ENGINEERING  ");
    expect(words).toEqual(["context", "engineering"]);
    expect(hasWords("Context and productivity", words)).toBe(false);
    expect(hasWords("Engineering in context", words)).toBe(true);
  });

  it("treats either a query or a chosen facet as active", () => {
    expect(isActive({ q: " context ", facets: { topic: "", tag: "" } })).toBe(true);
    expect(isActive({ q: " \t ", facets: { topic: "", tag: "mcp" } })).toBe(true);
    expect(isActive({ q: " \t ", facets: { topic: "", tag: "" } })).toBe(false);
  });

  it("counts a facet's values under the search and the other facets, not under itself", () => {
    const state = { q: "context", facets: { topic: "tools", tag: "" } };
    const topics = tally(items, state, "topic");
    expect([topics.get(""), topics.get("tools"), topics.get("evidence")]).toEqual([2, 1, 1]);
    expect(tally(items, state, "tag").get("mcp")).toBe(1);
    expect(tally(items, state, "tag").get("metrics")).toBeUndefined();
  });

  it("writes only set values into the URL and keeps other parameters", () => {
    const state = { q: "context", facets: { topic: "", tag: "mcp" } };
    expect(stateUrl("http://x/knowledge?topic=tools&pin=1", state)).toBe(
      "http://x/knowledge?pin=1&q=context&tag=mcp",
    );
  });

  it("clears the old query and facets without dropping the page fragment", () => {
    const href = "http://x/knowledge?q=context&topic=tools&pin=1#list";
    expect(stateUrl(href, { q: "", facets: { topic: "" } })).toBe("http://x/knowledge?pin=1#list");
  });

  it("marks the search words and escapes the rest", () => {
    expect(highlight("Context <b> & Code", ["context", "code"])).toBe(
      "<mark>Context</mark> &lt;b&gt; &amp; <mark>Code</mark>",
    );
    expect(highlight("a.b", ["."])).toBe("a<mark>.</mark>b");
    expect(highlight("Context Engineering", ["co", "context"])).toBe(
      "<mark>Context</mark> Engineering",
    );
  });

  it("ranks the page named for the query first, then title hits, and keeps order without one", () => {
    const titles = [
      "Specifications, tests, and context",
      "Context Engineering for Agents",
      "Context Engineering",
      "Pricing agentic coding",
    ];
    expect(ranked(titles, (t) => t, "context engineering")).toEqual([
      "Context Engineering",
      "Context Engineering for Agents",
      "Specifications, tests, and context",
      "Pricing agentic coding",
    ]);
    expect(ranked(titles, (t) => t, " ")).toBe(titles);
  });

  it("gives a title starting with the query priority over a shorter title ending with it", () => {
    const titles = ["A Guide to Context", "Context is Everything"];
    expect(ranked(titles, (t) => t, "context")).toEqual([
      "Context is Everything",
      "A Guide to Context",
    ]);
    expect(ranked(["Müllerhans", "Mueller Hans"], (t) => t, "  müller hans  ")).toEqual([
      "Mueller Hans",
      "Müllerhans",
    ]);
  });

  it("renders titles as text and leaves a title alone when there is nothing to mark", () => {
    expect(highlight(`Jo's "Guide" >`, ["guide"])).toBe(
      "Jo&#39;s &quot;<mark>Guide</mark>&quot; &gt;",
    );
    expect(highlight("Cafe\u0301", [])).toBe("Cafe\u0301");
    expect(highlight("Café", searchWords("\u0301"))).toBe("Café");
  });

  it("finds a name however its umlaut, accent or ß is typed, and marks it", () => {
    const people = [
      { text: "müller", facets: {} },
      { text: "Mueller", facets: {} },
      { text: "José Straße", facets: {} },
      { text: "miller", facets: {} },
    ];
    const hits = (q: string) =>
      people.flatMap((item, i) => (matches(item, { q, facets: {} }) ? [i] : []));
    for (const q of ["mueller", "müller", "MÜLLER", "Muell"]) expect(hits(q)).toEqual([0, 1]);
    // "ue" is no umlaut in "blue", so a name written Mueller needs the e.
    expect(hits("muller")).toEqual([0]);
    expect(hits("jose strasse")).toEqual([2]);
    expect(hits("josé straße")).toEqual([2]);
    expect(hits("strase")).toEqual([]);
    expect(hasWords("Café Zoë", searchWords("cafe zoe"))).toBe(true);
    expect(hasWords("Søren Łukasz Kærgaard", searchWords("soren lukasz kaergaard"))).toBe(true);
    expect(highlight("Søren", ["soren"])).toBe("<mark>Søren</mark>");
    expect(highlight("a & b", [])).toBe("a &amp; b");
    expect(highlight("Anna Müller", ["muller"])).toBe("Anna <mark>Müller</mark>");
    expect(highlight("Anna Müller", ["mueller"])).toBe("Anna <mark>Müller</mark>");
    expect(highlight("Straße & Weg", ["strasse"])).toBe("<mark>Straße</mark> &amp; Weg");
    expect(highlight("Mueller", ["müller"])).toBe("<mark>Mueller</mark>");
    expect(highlight("Grüße", ["grü"])).toBe("<mark>Grü</mark>ße");
    expect(ranked(["Anna Mueller", "Müller"], (t) => t, "müller")).toEqual([
      "Müller",
      "Anna Mueller",
    ]);
    // A title equal to the query in either form ranks as the exact title, above a shorter one.
    expect(ranked(["Müllerhans", "Mueller Hans"], (t) => t, "müller hans")).toEqual([
      "Mueller Hans",
      "Müllerhans",
    ]);
  });
});

describe("initListFilter", () => {
  it("leaves a root it already wired alone, so a second call stacks no listener", () => {
    let reads = 0;
    const root = {
      dataset: { ready: "" },
      querySelector: () => (reads++, null),
    } as unknown as HTMLElement;
    initListFilter(root);
    expect(reads).toBe(0);
  });
});

describe("rebaseSrcset", () => {
  const at = (url: string) => `B/${url}`;
  it("rebases each candidate and keeps its descriptor and spacing", () => {
    expect(rebaseSrcset("a.png 1x, b.png 2x", at)).toBe("B/a.png 1x, B/b.png 2x");
    expect(rebaseSrcset("a.png, b.png 2x", at)).toBe("B/a.png, B/b.png 2x");
  });
  it("keeps a comma inside an address", () => {
    expect(rebaseSrcset("w_100,h_100/a.png 1x,c.png 2x", at)).toBe(
      "B/w_100,h_100/a.png 1x,B/c.png 2x",
    );
    expect(rebaseSrcset("data:image/png;base64,AAAA 1x", at)).toBe(
      "B/data:image/png;base64,AAAA 1x",
    );
  });
});
