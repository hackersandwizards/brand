import { describe, expect, it } from "bun:test";
import {
  countLine,
  fullTextUrl,
  hasWords,
  highlight,
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
    expect(highlight("Anna Müller", ["muller"])).toBe("Anna <mark>Müller</mark>");
    expect(highlight("Anna Müller", ["mueller"])).toBe("Anna <mark>Müller</mark>");
    expect(highlight("Straße & Weg", ["strasse"])).toBe("<mark>Straße</mark> &amp; Weg");
    expect(highlight("Mueller", ["müller"])).toBe("<mark>Mueller</mark>");
    expect(highlight("Grüße", ["grü"])).toBe("<mark>Grü</mark>ße");
    expect(ranked(["Anna Mueller", "Müller"], (t) => t, "müller")).toEqual([
      "Müller",
      "Anna Mueller",
    ]);
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
