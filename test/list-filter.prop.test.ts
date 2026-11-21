import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import {
  matches,
  ranked,
  readState,
  rebaseSrcset,
  searchWords,
  stateUrl,
  tally,
} from "../elements/list-filter";

const facetName = fc.oneof(fc.constantFrom("constructor", "__proto__", "toString"), unicodeString);
const queryWord = unicodeString.map((s) => `w${s.replace(/\s/gu, "_")}z`);

test.prop([fc.array(queryWord), fc.constantFrom(" ", "\t", "\n", "\u00a0")], {
  examples: [
    [[], "\t"],
    [["wÉ😀z", `w${"A".repeat(1024)}z`], "\n"],
  ],
})("splits pasted queries into lowercase words across whitespace", (words, separator) => {
  expect(searchWords(separator + words.join(separator) + separator)).toEqual(
    words.map((word) => word.toLowerCase()),
  );
});

test.prop([facetName, unicodeString, unicodeString], {
  examples: [
    ["__proto__", "Grüße & 東京", "東京 & #"],
    ["constructor", "", ""],
    ["toString", " ", "a=b"],
    ["\t&/#", ` ${"ü".repeat(1024)} `, "%#?"],
  ],
})(
  "round-trips offered URL state, omits empty values and preserves unrelated state",
  (key, q, value) => {
    const facet = key === "q" || key === "pin" ? `${key}-facet` : key;
    const options = Object.fromEntries([[facet, [value]]]);
    const facets = Object.fromEntries([[facet, value]]);
    const original = new URL("https://example.test/knowledge?pin=1#list");
    original.searchParams.set("q", "old");
    original.searchParams.set(facet, value + "old");
    expect(readState(original.searchParams, options)).toEqual({
      q: "old",
      facets: Object.fromEntries([[facet, ""]]),
    });

    const url = new URL(stateUrl(original.href, { q, facets }));
    expect(url.pathname).toBe(original.pathname);
    expect(url.hash).toBe("#list");
    expect(url.searchParams.getAll("pin")).toEqual(["1"]);
    expect(url.searchParams.getAll("q")).toEqual(q ? [q] : []);
    expect(url.searchParams.getAll(facet)).toEqual(value ? [value] : []);
    expect(readState(url.searchParams, options)).toEqual({ q: q.trim(), facets });
    expect(readState(new URLSearchParams(), options)).toEqual({
      q: "",
      facets: Object.fromEntries([[facet, ""]]),
    });
  },
);

test.prop(
  [
    facetName,
    facetName,
    unicodeString,
    fc.array(fc.tuple(fc.boolean(), fc.boolean(), fc.integer({ min: -1, max: 4 }))),
  ],
  {
    examples: [
      [
        "__proto__",
        "constructor",
        "",
        [
          [true, true, 2],
          [true, false, 1],
          [false, true, 1],
          [true, true, 0],
          [true, true, -1],
        ],
      ],
      [
        "toString",
        "__proto__",
        "Grüße",
        [
          [true, true, 1],
          [true, false, 0],
          [false, true, 2],
        ],
      ],
      ["", "", "長".repeat(1024), []],
    ],
  },
)(
  "filters by every word and facet and counts each matching item once per value",
  (param, other, label, rows) => {
    const otherParam = other === param ? other + "/" : other;
    const selected = label + "1";
    const alternative = label + "2";
    const state = {
      q: "ALPHA beta",
      facets: Object.fromEntries([
        [param, selected],
        [otherParam, "yes"],
      ]),
    };
    const items = rows.map(([search, allowed, copies]) => {
      const facets: [string, string[]][] = [];
      if (copies >= 0)
        facets.push([
          param,
          copies ? Array.from({ length: copies }, () => selected) : [alternative],
        ]);
      if (allowed) facets.push([otherParam, ["yes"]]);
      return { text: search ? "beta ALPHABET" : "alpha", facets: Object.fromEntries(facets) };
    });
    expect(items.map((item) => matches(item, state))).toEqual(
      rows.map(([search, allowed, copies]) => search && allowed && copies > 0),
    );
    const eligible = rows.filter(([search, allowed]) => search && allowed);
    const expected = new Map<string, number>();
    if (eligible.length) expected.set("", eligible.length);
    for (const [value, count] of [
      [selected, eligible.filter(([, , copies]) => copies > 0).length],
      [alternative, eligible.filter(([, , copies]) => copies === 0).length],
    ] as const)
      if (count) expected.set(value, count);
    expect(tally(items, state, param)).toEqual(expected);
  },
);

test.prop([fc.stringMatching(/^[a-z]{1,16}$/), fc.nat(32), fc.boolean()], {
  examples: [
    ["a", 0, true],
    ["context", 20, false],
  ],
})(
  "ranks exact titles, then prefix hits, then shorter titles, keeping source order on ties",
  (word, padding, blank) => {
    const rows = [
      { title: `0${word}` },
      { title: `${word} 00${"0".repeat(padding)}` },
      { title: word },
      { title: `${word} 0` },
      { title: `${word} 1` },
      { title: "0" },
    ];
    expect(ranked(rows, (row) => row.title, blank ? " \t" : word)).toEqual(
      blank ? rows : [rows[2], rows[3], rows[4], rows[1], rows[0], rows[5]],
    );
  },
);

const asset = unicodeString.map((s) => `data:,${encodeURIComponent(s)},tail.png`);
test.prop([fc.array(fc.tuple(asset, fc.constantFrom("", " 1x", "\t2x", "\n384w")))], {
  examples: [
    [[]],
    [
      [
        ["data:,a,b.png", ""],
        ["data:,c,d.png", "\t2x"],
        [`/${"é".repeat(1024)}.png`, " 1x"],
      ],
    ],
  ],
})(
  "rebases only srcset addresses and preserves commas, descriptors and whitespace",
  (candidates) => {
    const srcset = candidates.map(([url, descriptor]) => url + descriptor).join(", \t");
    expect(rebaseSrcset(srcset, (url) => `base/${url}`)).toBe(
      candidates.map(([url, descriptor]) => `base/${url}${descriptor}`).join(", \t"),
    );
  },
);
