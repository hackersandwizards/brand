import { assert, describe, expect, it, test, vi } from "vitest";
import {
  countLine,
  fullTextUrl,
  hasWords,
  highlight,
  isActive,
  matches,
  ranked,
  searchWords,
  tally,
  readState,
} from "../elements/list-filter";
import { initListFilter } from "../elements/list-filter-browser";
import { rebaseSrcset } from "../elements/list-filter-source";

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

  it("treats either a query or a chosen facet as active", () => {
    expect(isActive({ q: " context ", facets: { topic: "", tag: "" } })).toBe(true);
    expect(isActive({ q: " \t ", facets: { topic: "", tag: "mcp" } })).toBe(true);
    expect(isActive({ q: " \t ", facets: { topic: "", tag: "" } })).toBe(false);
  });

  it("ranks a title containing all search words ahead of a prefix containing only one", () => {
    const titles = ["Context", "Specifications, tests, and context engineering"];
    expect(ranked(titles, (title) => title, "context engineering")).toEqual([titles[1], titles[0]]);
    expect(ranked(titles, (title) => title, " ")).toBe(titles);
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

  it("renders titles as text and leaves a title alone when there is nothing to mark", () => {
    expect(highlight(`Jo's "Guide" >`, ["guide"])).toBe(
      "Jo&#39;s &quot;<mark>Guide</mark>&quot; &gt;",
    );
    expect(highlight("Cafe\u0301", [])).toBe("Cafe\u0301");
    expect(highlight("Café", searchWords("\u0301"))).toBe("Café");
  });

  it("marks complete source spans when a match starts inside a folded character", () => {
    expect(highlight("🍵 Cafe\u0301 & Straße", ["cafe", "se"])).toBe(
      "🍵 <mark>Café</mark> &amp; Stra<mark>ße</mark>",
    );
  });

  // "ue" is no umlaut in "blue", so a name written Mueller needs the e.
  it.each([
    { q: "mueller", indices: [0, 1] },
    { q: "müller", indices: [0, 1] },
    { q: "MÜLLER", indices: [0, 1] },
    { q: "Muell", indices: [0, 1] },
    { q: "muller", indices: [0] },
    { q: "jose strasse", indices: [2] },
    { q: "josé straße", indices: [2] },
    { q: "strase", indices: [] },
  ])("matches folded names for $q", ({ q, indices }) => {
    const people = [
      { text: "müller", facets: {} },
      { text: "Mueller", facets: {} },
      { text: "José Straße", facets: {} },
      { text: "miller", facets: {} },
    ];
    expect(
      [...people.entries()]
        .filter(([, item]) => matches(item, { q, facets: {} }))
        .map(([index]) => index),
    ).toEqual(indices);
  });

  it.each([
    { text: "Café Zoë", query: "cafe zoe" },
    { text: "Søren Łukasz Kærgaard", query: "soren lukasz kaergaard" },
  ])("finds every folded query word in $text", ({ text, query }) => {
    expect(hasWords(text, searchWords(query))).toBe(true);
  });

  it.each([
    { text: "Søren", words: ["soren"], html: "<mark>Søren</mark>" },
    { text: "a & b", words: [], html: "a &amp; b" },
    { text: "Anna Müller", words: ["muller"], html: "Anna <mark>Müller</mark>" },
    { text: "Anna Müller", words: ["mueller"], html: "Anna <mark>Müller</mark>" },
    { text: "Straße & Weg", words: ["strasse"], html: "<mark>Straße</mark> &amp; Weg" },
    { text: "Mueller", words: ["müller"], html: "<mark>Mueller</mark>" },
    { text: "Grüße", words: ["grü"], html: "<mark>Grü</mark>ße" },
  ])("renders escaped highlighting for $text with $words", ({ text, words, html }) => {
    expect(highlight(text, words)).toBe(html);
  });

  // A title equal to the query in either form ranks as the exact title, above a shorter one.
  it.each([
    { titles: ["Anna Mueller", "Müller"], query: "müller", order: ["Müller", "Anna Mueller"] },
    {
      titles: ["Müllerhans", "Mueller Hans"],
      query: "müller hans",
      order: ["Mueller Hans", "Müllerhans"],
    },
  ])("ranks the folded exact title first for $query", ({ titles, query, order }) => {
    expect(ranked(titles, (title) => title, query)).toEqual(order);
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

  it("writes a selected __proto__ radio facet into the page URL", () => {
    const input = Object.assign(new EventTarget(), { value: "", defaultValue: "" });
    const radio = Object.assign(new EventTarget(), {
      name: "__proto__",
      value: "selected",
      checked: true,
      defaultChecked: false,
    });
    const formLists = new Map([
      ['input[type="radio"]', [radio]],
      ['input[type="radio"], select', [radio]],
      ["select", []],
      ["fieldset", []],
    ]);
    const form = Object.assign(new EventTarget(), {
      querySelector: () => input,
      querySelectorAll: (selector: string) => {
        const targets = formLists.get(selector);
        assert(targets, `Unexpected form selector: ${selector}`);
        return targets;
      },
    });
    const list = {
      querySelector: () => null,
      querySelectorAll: () => [],
      toggleAttribute: () => false,
    };
    const nodes = new Map<string, object | null>([
      ["form", form],
      ["[data-filter-list]", list],
      ["[data-filter-empty]", {}],
      ["[data-filter-count]", {}],
      ["[data-filter-panel]", new EventTarget()],
      ["[data-filter-toggle]", null],
    ]);
    const root = {
      dataset: { count: '"{shown} of {total}"' },
      querySelector: (selector: string) => {
        assert(nodes.has(selector), `Unexpected root selector: ${selector}`);
        return nodes.get(selector);
      },
      querySelectorAll: () => [],
    };
    const replaceState = vi.fn();
    const fetchSource = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("HTMLSelectElement", class {});
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = vi.fn();
      },
    );
    vi.stubGlobal("location", new URL("https://example.test/knowledge"));
    vi.stubGlobal("history", { state: null, replaceState });
    vi.stubGlobal("addEventListener", vi.fn());
    vi.stubGlobal("document", new EventTarget());
    vi.stubGlobal("fetch", fetchSource);
    try {
      initListFilter(root as unknown as HTMLElement);
      expect(replaceState).toHaveBeenLastCalledWith(
        null,
        "",
        "https://example.test/knowledge?__proto__=selected",
      );
      expect(fetchSource).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

test("keeps a comma inside an address", () => {
  const at = (url: string) => `B/${url}`;
  expect(rebaseSrcset("data:image/png;base64,AAAA 1x", at)).toBe("B/data:image/png;base64,AAAA 1x");
  expect(rebaseSrcset("w_100,h_100/a.png 1x,c.png 2x", at)).toBe(
    "B/w_100,h_100/a.png 1x,B/c.png 2x",
  );
});

test("reads __proto__ as a facet from a URL", () => {
  const options = { ["__proto__"]: ["東京 & #"] };
  expect(
    readState(new URLSearchParams({ q: "Grüße & 東京", ["__proto__"]: "東京 & #" }), options),
  ).toEqual({
    q: "Grüße & 東京",
    facets: { ["__proto__"]: "東京 & #" },
  });
});

test("counts a row once when it repeats a constructor facet value", () => {
  const state = { q: "ALPHA beta", facets: { constructor: "1", "constructor/": "yes" } };
  const item = {
    text: "beta ALPHABET",
    facets: { constructor: ["1", "1"], "constructor/": ["yes"] },
  };
  expect(tally([item], state, "constructor")).toEqual(
    new Map([
      ["", 1],
      ["1", 1],
    ]),
  );
});
