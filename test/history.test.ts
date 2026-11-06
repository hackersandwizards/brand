import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { packed, ROOT } from "../scripts/git";

// What the package ships is public wherever a consumer serves or bundles it: a comment in it states
// how to use the token, element or command, never the history behind it. Scores, review rounds,
// dates, decision and item ids and names go to the commit message or docs/agent-work/.
const ITEMS = readdirSync(join(ROOT, "docs/agent-work/items"))
  .map((f) => basename(f, ".md"))
  .filter((id) => id.includes("-"));
const ITEM = new RegExp(`\\b(${ITEMS.join("|")})\\b`);
const HISTORY: [string, RegExp][] = [
  ["decision id", /\b(?:os\s+decision|decisions?\s+[a-z0-9]+(?:-[a-z0-9]+)+)/i],
  [
    "review score",
    /\bblind[\s-]+(?:panels?|reviews?|rounds?|A\/B)|\bscored\b|\bnoise\s+\d|\boverall of 10\b|\bpersonas?\b|\breviewers?\b/i,
  ],
  ["item id", /\b[A-Z]{2,4}-\d+\b|\bitems?\s+[a-z0-9]+(?:-[a-z0-9]+)+/],
  ["date", /\b20\d\d-\d\d-\d\d\b|\b\d{1,2}\.(?:0?[1-9]|1[0-2])\.(?:20\d\d)?(?!\w)/],
  ["person", /\b(?:Benedikt|Stefan|Stemmildt|Munz)\b/],
];
const findHistory = (text: string) => {
  const own = text.match(ITEM)?.[1];
  return [
    ...HISTORY.filter(([, re]) => re.test(text)).map(([kind]) => kind),
    ...(own ? [`item id ${own}`] : []),
  ];
};
// Block, HTML and line comments; a `//` inside a URL is no comment.
const comments = (source: string) =>
  (source.match(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|(?<![:"'`\w])\/\/.*/g) ?? []).join("\n");

const shippedCode = packed().filter((f) => /\.(?:css|astro|ts|html)$/.test(f));

test("the patterns hit the history the shipped files carried", () => {
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
    ["the group sits right of the desktop photo (blind review 1.11.: the claim", "date"],
    ["which Benedikt found too slim to see (2026-10-28). */", "person"],
  ])
    expect(findHistory(line)).toContain(kind);
  expect(findHistory(`see ${ITEMS[0]} for the rest`)).toContain(`item id ${ITEMS[0]}`);
  expect(comments("a { b: c } /* one */ // two\nx = 'https://x.y'")).toBe("/* one */\n// two");
});

test("no shipped file's comments carry review history", () => {
  expect(shippedCode.length).toBeGreaterThan(50);
  const hits = shippedCode
    .map((file) => ({ file, kinds: findHistory(comments(readFileSync(join(ROOT, file), "utf8"))) }))
    .filter((h) => h.kinds.length);
  expect(hits).toEqual([]);
});
