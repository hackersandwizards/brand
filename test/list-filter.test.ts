import { afterEach, assert, describe, expect, it, test, vi } from "vitest";
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
  type FilterState,
} from "../elements/list-filter";
import { acceptsText, initListFilter, isSearchChord } from "../elements/list-filter-browser";
import { FilterForm } from "../elements/list-filter-form";
import { FilterSource, rebaseSrcset, sourceAddress } from "../elements/list-filter-source";

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

describe("the search shortcut", () => {
  it.each([
    { name: "Ctrl+k", keys: { ctrlKey: true }, accepted: true },
    { name: "Meta+k", keys: { metaKey: true }, accepted: true },
    { name: "Ctrl+K", keys: { ctrlKey: true, key: "K" }, accepted: true },
    { name: "Alt+Ctrl+k", keys: { ctrlKey: true, altKey: true }, accepted: false },
    { name: "Shift+Ctrl+k", keys: { ctrlKey: true, shiftKey: true }, accepted: false },
    { name: "plain k", keys: {}, accepted: false },
    { name: "Ctrl+x", keys: { ctrlKey: true, key: "x" }, accepted: false },
  ])("$name has shortcut eligibility $accepted", ({ keys, accepted }) => {
    const event = { key: "k", ctrlKey: false, metaKey: false, altKey: false, shiftKey: false };
    expect(isSearchChord({ ...event, ...keys })).toBe(accepted);
  });

  it.each([
    { markup: "<textarea></textarea>", editable: false, keep: true },
    { markup: "<select></select>", editable: false, keep: true },
    { markup: '<input type="text">', editable: false, keep: true },
    { markup: "<input>", editable: false, keep: true },
    { markup: '<input type="radio">', editable: false, keep: false },
    { markup: '<input type="checkbox">', editable: false, keep: false },
    { markup: "<button></button>", editable: false, keep: false },
    { markup: "<div contenteditable></div>", editable: true, keep: true },
  ])("$markup keeps native keystrokes: $keep", ({ markup, editable, keep }) => {
    const matches = (selector: string) => {
      const element = vi.fn();
      new HTMLRewriter().on(selector, { element }).transform(markup);
      return element.mock.calls.length > 0;
    };
    expect(acceptsText({ isContentEditable: editable, matches })).toBe(keep);
  });
});

describe("source rows", () => {
  const address = "https://example.test/knowledge/all/";
  afterEach(() => vi.unstubAllGlobals());

  const stubSourceDocument = () => {
    vi.stubGlobal(
      "DOMParser",
      class {
        parseFromString() {
          return { querySelector: () => ({ childNodes: [] }) };
        }
      },
    );
  };

  it.each([
    { given: "../talk/", want: "https://example.test/knowledge/talk/" },
    { given: "https://assets.example.test/a.png", want: "https://assets.example.test/a.png" },
    { given: "#icon", want: "#icon" },
    { given: "http://[broken", want: "http://[broken" },
  ])("resolves $given as $want", ({ given, want }) => {
    expect(sourceAddress(given, address)).toBe(want);
  });

  it("shares one in-flight request and installs and applies its rows once", async () => {
    const response = Promise.withResolvers<Response>();
    const fetched = vi.fn(() => response.promise);
    const settled = Promise.withResolvers<void>();
    const source = new FilterSource(address);
    const install = vi.fn(() => source.loaded);
    const apply = vi.fn(() => {
      settled.resolve();
      return source.loaded;
    });
    const fail = vi.fn(settled.resolve);
    vi.stubGlobal("fetch", fetched);
    stubSourceDocument();

    void source.load(install, apply, fail);
    void source.load(install, apply, fail);
    response.resolve(new Response(""));
    await settled.promise;
    void source.load(install, apply, fail);

    expect(fetched.mock.calls).toEqual([[address]]);
    expect(install.mock.calls).toEqual([[{ nodes: [], replace: true }]]);
    expect(install.mock.results).toEqual([{ type: "return", value: false }]);
    expect(apply.mock.results).toEqual([{ type: "return", value: true }]);
    expect(source.failed).toBe(false);
  });

  it.each([
    { name: "rejected request", fetchRows: () => Promise.reject(new TypeError("offline")) },
    { name: "HTTP error", fetchRows: () => Promise.resolve(new Response("", { status: 503 })) },
  ])("reports a $name once without installing rows or retrying", async ({ fetchRows }) => {
    const fetched = vi.fn(fetchRows);
    const settled = Promise.withResolvers<void>();
    const source = new FilterSource(address);
    const install = vi.fn();
    const apply = vi.fn(settled.resolve);
    const fail = vi.fn(() => {
      settled.resolve();
      return source.failed;
    });
    vi.stubGlobal("fetch", fetched);
    stubSourceDocument();

    void source.load(install, apply, fail);
    void source.load(install, apply, fail);
    await settled.promise;
    void source.load(install, apply, fail);

    expect(fetched.mock.calls).toEqual([[address]]);
    expect({ loaded: source.loaded, failed: source.failed }).toEqual({
      loaded: false,
      failed: true,
    });
    expect(fail.mock.results).toEqual([{ type: "return", value: true }]);
    expect(install).not.toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
  });

  it.each([{ address: undefined }, { address: "" }])(
    "uses local rows without fetching when the address is $address",
    ({ address }) => {
      const fetched = vi.fn();
      vi.stubGlobal("fetch", fetched);
      const source = new FilterSource(address);
      const install = vi.fn();
      const apply = vi.fn();
      const fail = vi.fn();
      void source.load(install, apply, fail);
      expect({ loaded: source.loaded, failed: source.failed }).toEqual({
        loaded: true,
        failed: false,
      });
      expect(fetched).not.toHaveBeenCalled();
      expect(install).not.toHaveBeenCalled();
      expect(apply).not.toHaveBeenCalled();
      expect(fail).not.toHaveBeenCalled();
    },
  );
});

function formFixture(selectName = "days") {
  const input = { value: "", defaultValue: "" };
  const all = { name: "topic", value: "", checked: true, defaultChecked: true };
  const tools = { name: "topic", value: "tools", checked: false, defaultChecked: false };
  class Select {
    name = selectName;
    value = "";
    options = [
      { value: "", selected: true, defaultSelected: true },
      { value: "2", selected: false, defaultSelected: false },
    ];
  }
  const select = new Select();
  const radios = [all, tools];
  const fields = new Map<string, object[]>([
    ['input[type="radio"]', radios],
    ['input[type="radio"], select', [...radios, select]],
    ["select", [select]],
    ["fieldset", []],
  ]);
  const form = {
    querySelector: (selector: string) => {
      assert(selector === 'input[name="q"]', `Unexpected form selector: ${selector}`);
      return input;
    },
    querySelectorAll: (selector: string) => {
      const nodes = fields.get(selector);
      assert(nodes, `Unexpected form selector: ${selector}`);
      return nodes;
    },
  };
  const nodes = new Map<string, object | null>([
    ["form", form],
    ["[data-filter-panel]", {}],
    ["[data-filter-toggle]", null],
  ]);
  const root = {
    querySelector: (selector: string) => {
      assert(nodes.has(selector), `Unexpected root selector: ${selector}`);
      return nodes.get(selector);
    },
    querySelectorAll: () => [],
  };
  vi.stubGlobal("HTMLSelectElement", Select);
  return { filter: new FilterForm(root as unknown as HTMLElement), input, all, tools, select };
}

describe("FilterForm", () => {
  const clearState: FilterState = { q: "", facets: {} };
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    {
      name: "a checked radio and a select",
      typed: " context ",
      tools: true,
      days: "2",
      want: { q: "context", facets: { topic: "tools", days: "2" } },
    },
    {
      name: "an unchecked radio group",
      typed: "",
      tools: false,
      days: "",
      want: { q: "", facets: { topic: "", days: "" } },
    },
  ])("reads $name", ({ typed, tools: checked, days, want }) => {
    const { filter, input, all, tools, select } = formFixture();
    input.value = typed;
    all.checked = false;
    tools.checked = checked;
    select.value = days;
    expect(filter.read()).toEqual(want);
  });

  it("prefers the select when a facet has both a select and a checked radio", () => {
    const { filter, tools, select } = formFixture("topic");
    tools.checked = true;
    select.value = "2";
    expect(filter.read()).toEqual({ q: "", facets: { topic: "2" } });
  });

  it("reads a facet named __proto__ as form data", () => {
    const { filter, select } = formFixture("__proto__");
    select.value = "2";
    expect(filter.read()).toEqual({ q: "", facets: { topic: "", ["__proto__"]: "2" } });
  });

  it.each([
    {
      name: "sets all controls from URL state",
      state: { q: "context", facets: { topic: "tools", days: "2" } },
      before: { all: true, tools: false, days: "" },
      want: { q: "context", all: false, tools: true, days: "2" },
    },
    {
      name: "resets omitted facets to All",
      state: clearState,
      before: { all: false, tools: true, days: "2" },
      want: { q: "", all: true, tools: false, days: "" },
    },
  ])("$name", ({ state, before, want }) => {
    const { filter, input, all, tools, select } = formFixture();
    input.value = "old";
    all.checked = before.all;
    tools.checked = before.tools;
    select.value = before.days;
    filter.write(state);
    expect({ q: input.value, all: all.checked, tools: tools.checked, days: select.value }).toEqual(
      want,
    );
  });

  it.each([
    { name: "the server values", change: () => {}, untouched: true },
    {
      name: "typing",
      change: ({ input }: ReturnType<typeof formFixture>) => {
        input.value = "context";
      },
      untouched: false,
    },
    {
      name: "a radio change",
      change: ({ tools }: ReturnType<typeof formFixture>) => {
        tools.checked = true;
      },
      untouched: false,
    },
    {
      name: "a select change",
      change: ({ select }: ReturnType<typeof formFixture>) => {
        const selected = select.options[1];
        assert(selected, "expected the two-day option");
        selected.selected = true;
      },
      untouched: false,
    },
  ])("reports untouched after $name: $untouched", ({ change, untouched }) => {
    const fixture = formFixture();
    change(fixture);
    expect(fixture.filter.isUntouched()).toBe(untouched);
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
