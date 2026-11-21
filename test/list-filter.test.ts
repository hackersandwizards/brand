import { describe, expect, it, test, vi } from "vitest";
import {
  countLine,
  fullTextUrl,
  hasWords,
  highlight,
  initListFilter,
  isActive,
  matches,
  ranked,
  searchWords,
  tally,
  readState,
  rebaseSrcset,
} from "../elements/list-filter";

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

  it("writes a selected __proto__ radio facet into the page URL", () => {
    const input = Object.assign(new EventTarget(), { value: "", defaultValue: "" });
    const radio = Object.assign(new EventTarget(), {
      name: "__proto__",
      value: "selected",
      checked: true,
      defaultChecked: false,
    });
    const form = Object.assign(new EventTarget(), {
      querySelector: () => input,
      querySelectorAll: (selector: string) => (selector.includes("radio") ? [radio] : []),
    });
    const list = {
      querySelector: () => null,
      querySelectorAll: () => [],
      toggleAttribute: () => false,
    };
    const nodes = new Map<string, object>([
      ["form", form],
      ["[data-filter-list]", list],
      ["[data-filter-empty]", {}],
      ["[data-filter-count]", {}],
      ["[data-filter-panel]", new EventTarget()],
    ]);
    const root = {
      dataset: { count: '"{shown} of {total}"' },
      querySelector: (selector: string) => nodes.get(selector) ?? null,
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
  expect(rebaseSrcset("data:image/png;base64,AAAA 1x", (url) => `B/${url}`)).toBe(
    "B/data:image/png;base64,AAAA 1x",
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
