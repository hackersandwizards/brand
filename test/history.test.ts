import { expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import pkg from "../package.json";
import { ROOT } from "../scripts/git";

// What a consumer serves is public: the code and stylesheets brand exports state how to use a token
// or element, never the history behind it. Scores, review rounds, dates, decision and item ids and
// names go to the commit message or docs/agent-work/.
const ITEMS = readdirSync(join(ROOT, "docs/agent-work/items"))
  .map((f) => basename(f, ".md"))
  .filter((id) => id.includes("-"));
const HISTORY: [string, RegExp][] = [
  ["decision id", /\b(?:os\s+decision|decisions?\s+[a-z0-9]+(?:-[a-z0-9]+)+)/i],
  [
    "review score",
    /\bblind\b|\bscored?\b|\bnoise\s+\d|\boverall of 10\b|\bpersonas?\b|\breviewers?\b/i,
  ],
  ["item id", /\b[A-Z]{2,4}-\d+\b|\bitems?\s+[a-z0-9]+(?:-[a-z0-9]+)+/],
  ["date", /\b20\d\d-\d\d-\d\d\b|\b\d\d\.\d\d\.(?:20\d\d)?(?!\d)/],
  ["person", /\b(?:Benedikt|Stefan|Stemmildt|Munz)\b/],
];
const findHistory = (text: string) => {
  const own = ITEMS.find((id) => new RegExp(`\\b${id}\\b`).test(text));
  return [
    ...HISTORY.filter(([, re]) => re.test(text)).map(([kind]) => kind),
    ...(own ? [`item id ${own}`] : []),
  ];
};

// Every exported file a page serves or a build bundles: stylesheets, components and their scripts.
const exported = () =>
  Object.values(pkg.exports).flatMap((target) => {
    const path = join(ROOT, target);
    const files = target.endsWith("/*")
      ? readdirSync(path.slice(0, -2)).map((f) => join(path.slice(0, -2), f))
      : [path];
    return files.filter((f) => /\.(css|astro|ts)$/.test(f) && statSync(f).isFile());
  });

test("the patterns hit the history the exported files carried", () => {
  // Verbatim from the comments that shipped up to v1.16.0.
  for (const [line, kind] of [
    ["readout deck's rem (decision design-system-hub-spoke: every value", "decision id"],
    [
      "takes sm, one only read stays pill (os\n decision label-system C, 2026-11-01).",
      "decision id",
    ],
    [
      "(2026-11-06, overall of 10, noise 0.33) the hairline in the label's colour scored 8.2",
      "review score",
    ],
    ["At 1.5rem blind reviewers read the mark as tight to the", "review score"],
    ["The small sizes come from OS-1's three blind rounds", "item id"],
    ["the last line (blind panel 01.11.). */", "date"],
    ["which Benedikt found too slim to see (2026-10-28). */", "person"],
  ])
    expect(findHistory(line)).toContain(kind);
  expect(findHistory(`see ${ITEMS[0]} for the rest`)).toContain(`item id ${ITEMS[0]}`);
});

test("no exported file carries review history", () => {
  const files = exported();
  expect(files.length).toBeGreaterThan(30);
  const hits = files
    .map((f) => ({ file: f.slice(ROOT.length + 1), kinds: findHistory(readFileSync(f, "utf8")) }))
    .filter((h) => h.kinds.length);
  expect(hits).toEqual([]);
});
