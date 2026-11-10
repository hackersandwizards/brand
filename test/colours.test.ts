import { expect, test } from "bun:test";
import {
  fnColour,
  scanned,
  scanSource,
  onLadder,
  tighten,
  violations,
  type Allowlist,
} from "../scan/colours";

const zero = { hex: 0, tokenHex: 0, font: 0, palette: 0, rgb: 0, radius: 0, shadow: 0 };

test("counts off-token hex, token hex, off-brand fonts and palette classes", () => {
  const { counts, hexes, fonts } = scanSource(
    `.a { color: #123456; background: #1A7285; font-family: Georgia, serif; }
     .b { font-family: var(--font-sans); } /* #ffffff in a comment */
     <div class="bg-red-500 text-slate-700" id="#add">
     .c { box-shadow: 0 0 4px #12345680; color: #1A728580; border-color: #3458; }`,
    ".astro",
  );
  expect(counts).toEqual({ ...zero, hex: 2, tokenHex: 2, font: 1, palette: 2, shadow: 1 });
  expect(hexes).toEqual(["#123456", "#3458"]);
  expect(fonts).toEqual(["Georgia"]);
});

test("reads styling wherever it sits, never tests, builds, hub tooling or prose", () => {
  expect(
    [
      "src/a.css",
      "app/page.tsx",
      "scripts/x.py",
      "public/a.svg",
      "docs/agent-work/r.html",
      "docs/agent-work/x.js",
      "docs/decisions/items.js",
      "src/content/documents/x.html",
      "src/styles/brand/tokens.css",
      "public/site.webmanifest",
      ".claude/skills/voice/other.json",
    ].every(scanned),
  ).toBe(true);
  expect(
    [
      "src/a.test.ts",
      "dist/a.css",
      "node_modules/x/a.css",
      ".claude/skills/parallel-session/page.html",
      ".claude/skills/voice/verbal.json",
      "README.md",
      "public/a.png",
      "brand-colours.json",
      "brand-elements.json",
    ].some(scanned),
  ).toBe(false);
});
const allow: Allowlist = { "a.css": { ...zero, hex: 2, reason: "r" } };

test("flags a count above its entry, an unlisted file, a missing reason, a grown and a stale entry", () => {
  const a = { "a.css": { ...zero, hex: 2 } };
  expect(violations(a, allow, allow)).toEqual([]);
  expect(
    violations({ "a.css": { ...zero, hex: 3 }, "b.css": { ...zero, font: 1 } }, allow, allow),
  ).toHaveLength(2);
  expect(violations(a, { "a.css": { ...zero, hex: 2, reason: " " } }, undefined)).toHaveLength(1);
  expect(violations(a, allow, { "a.css": { ...zero, hex: 1, reason: "r" } })).toHaveLength(1);
  expect(violations({}, allow, allow)).toEqual([
    "brand-colours.json: a.css is clean; drop its entry (brand-colours --tighten)",
  ]);
});

test("a value moved to another file moves its entry, while the list's total for that metric holds", () => {
  const before: Allowlist = { "a.css": { ...zero, hex: 3, shadow: 1, reason: "r" } };
  const moved: Allowlist = {
    "a.css": { ...zero, hex: 1, shadow: 1, reason: "r" },
    "b.css": { ...zero, hex: 2, reason: "moved from a.css" },
  };
  const files = { "a.css": { ...zero, hex: 1, shadow: 1 }, "b.css": { ...zero, hex: 2 } };
  expect(violations(files, moved, before)).toEqual([]);
  // Control: the same move with one more hex than a.css gave up.
  const grown = { ...moved, "b.css": { ...zero, hex: 3, reason: "moved from a.css" } };
  expect(violations({ ...files, "b.css": { ...zero, hex: 3 } }, grown, before)).toEqual([
    "brand-colours.json: b.css hex grew against HEAD; the allowlist's total may only shrink, or during a pin change an entry grow to the count of the file as committed",
  ]);
});

test("a partner's mark may be listed against HEAD; a partner entry needs a name, a reason and an SVG", () => {
  const logo = "public/conf-logo.svg";
  const partner: Allowlist = { [logo]: { partner: "A Conference", reason: "r" } };
  expect(violations({ [logo]: { ...zero, hex: 32, rgb: 2 } }, partner, {})).toEqual([]);
  // Control: the same entry without its partner is a grown entry.
  expect(
    violations({ [logo]: { ...zero, hex: 32 } }, { [logo]: { ...zero, hex: 32, reason: "r" } }, {}),
  ).toHaveLength(1);
  // Only an SVG named for its owner is a partner's mark.
  const note = { "a.ts": { ...zero, hex: 1, partner: "A Conference", reason: "r" } };
  expect(violations({ "a.ts": { ...zero, hex: 1 } }, note, {})).toHaveLength(2);
  const unnamed = { [logo]: { ...zero, hex: 32, partner: " ", reason: "r" } };
  expect(violations({ [logo]: { ...zero, hex: 32 } }, unnamed, {})).toHaveLength(2);
  expect(tighten({ [logo]: { ...zero, hex: 30 } }, partner)).toEqual(partner);
  // Tightening keeps a misplaced partner, so the run after it still fails on it.
  const counts = { "a.ts": { ...zero, hex: 1 } };
  expect(violations(counts, tighten(counts, note), {})).toEqual(violations(counts, note, {}));
});

test("an entry turned partner frees no total for another file to grow into", () => {
  const head: Allowlist = {
    "a.svg": { ...zero, hex: 50, reason: "r" },
    "b.css": { ...zero, hex: 1, reason: "r" },
  };
  const now: Allowlist = {
    "a.svg": { ...head["a.svg"]!, partner: "Acme" },
    "b.css": { ...zero, hex: 40, reason: "r" },
  };
  const files = { "a.svg": { ...zero, hex: 50 }, "b.css": { ...zero, hex: 40 } };
  expect(violations(files, now, head)).toEqual([
    "brand-colours.json: b.css hex grew against HEAD; the allowlist's total may only shrink, or during a pin change an entry grow to the count of the file as committed",
  ]);
});

test("tightening lowers and drops entries and zero metrics, never raises or adds", () => {
  expect(tighten({ "a.css": { ...zero, hex: 5 }, "b.css": { ...zero, hex: 1 } }, allow)).toEqual({
    "a.css": { hex: 2, reason: "r" },
  });
  expect(tighten({ "a.css": { ...zero, hex: 1 } }, allow)["a.css"].hex).toBe(1);
  expect(tighten({}, allow)).toEqual({});
  expect(tighten({ "b.css": { ...zero, hex: 1 } }, undefined)).toEqual({
    "b.css": { hex: 1, reason: "" },
  });
  expect(tighten({ "a.css": { ...zero, hex: 1, rgb: 1 } }, allow)["a.css"].rgb).toBeUndefined();
});

test("an allowance above the file's count is a finding: lower it", () => {
  expect(violations({ "a.css": { ...zero, hex: 1 } }, allow, allow)).toEqual([
    "brand-colours.json: a.css: hex 1, allowed 2; lower it (brand-colours --tighten)",
  ]);
  // Control: the count the entry allows.
  expect(violations({ "a.css": { ...zero, hex: 2 } }, allow, allow)).toEqual([]);
});

test("counts the colour notations, names and font forms beside hex and rgb()", () => {
  const count = (src: string, ext: string) =>
    Object.fromEntries(Object.entries(scanSource(src, ext).counts).filter(([, n]) => n));
  expect(
    count(
      ".a { color: oklch(60% 0.2 30); background: tomato; border-color: color-mix(in srgb, red 40%, blue); x: lab(50% 40 59); y: hwb(12 50% 0%); z: color(display-p3 1 0 0) }",
      ".css",
    ),
  ).toEqual({ hex: 3, rgb: 4 });
  expect(count(".a { font: 600 1rem/1.2 Arial, sans-serif }", ".css")).toEqual({ font: 1 });
  expect(
    count(
      `<div class="border-b-gray-200 border-x-red-500 ring-offset-red-500 placeholder-gray-400 font-serif text-[oklch(0.7_0.1_200)] bg-[tomato]">`,
      ".astro",
    ),
  ).toEqual({ hex: 1, font: 1, palette: 4, rgb: 1 });
  expect(count(".a { color: #fab } .b { color: #abc }", ".css")).toEqual({ hex: 2 });
  expect(count(`<svg><path fill="red" d="M0"/></svg>`, ".svg")).toEqual({ hex: 1 });
  expect(
    count(
      `<svg font-family="Arial"></svg><script>const s = { "font-family": "Arial" };</script><style>.a { -webkit-box-shadow: 0 0 1px #000; font-family: Interstate; color: hsl(0.5turn 50% 50%) }</style>`,
      ".astro",
    ),
  ).toEqual({ font: 3, rgb: 1, shadow: 1 });
  expect(
    count(".a { color: white; background: color-mix(in srgb, black 7%, transparent) }", ".css"),
  ).toEqual({
    tokenHex: 2,
  });
  // Controls: tokens, keywords and script that only looks like a colour.
  expect(
    count(
      `.a { font: inherit; font: 600 1rem/1.2 var(--font-sans); font-family: "Inter Variable", sans-serif; font-family: Inter; color: color-mix(in srgb, var(--color-ink) 70%, transparent); background: transparent; fill: currentColor; border: 0 none; color: inherit; background: url(red.png) }`,
      ".css",
    ),
  ).toEqual({});
  expect(
    count(
      `const color = (x: string) => x; color(lab); const lab = (a: number) => a; lab(1); const t = { color: teal, background: bg }; document.querySelector("#fab"); location.hash = "#add"; const font = await loadFont();`,
      ".ts",
    ),
  ).toEqual({});
  expect(count(`<a href="#add">x</a><a href="#faq">y</a>`, ".html")).toEqual({});
});

test("a glob or a URL in markup opens no comment; a frontmatter or script line comment is one", () => {
  const style =
    "<style>.a { color: #ff0000; border-radius: 13px } /* c */ .b { color: #00ff00 }</style>";
  expect(
    scanSource(`---\nconst p = import.meta.glob("../posts/*.md");\n---\n${style}`, ".astro").counts,
  ).toEqual({ ...zero, hex: 2, radius: 1 });
  expect(
    scanSource(
      `<img srcset="a.png 1x, //cdn/b.png 2x" style="color:#123456"><a href=//host/x style="color:#654321">z</a>`,
      ".html",
    ).counts.hex,
  ).toBe(2);
  expect(scanSource(`---\nconst a = 1; // #123456\n---\n<p/>`, ".astro").counts.hex).toBe(0);
  expect(scanSource(`<script>const a = 1; // #123456</script>`, ".html").counts.hex).toBe(0);
});

test("a four-digit hex of letters alone counts where its colour part is a grey", () => {
  expect(
    scanSource(".a { color: #ffff; background: #ccca; border: #eee; }", ".css").counts,
  ).toEqual({ ...zero, hex: 2, tokenHex: 1 });
});

test("a // in CSS, SVG or a url() hides nothing after it; a script's line comment does", () => {
  const css = ".a { background: url(//cdn.example.com/x.png); color: #123456 }";
  expect(scanSource(css, ".css").counts.hex).toBe(1);
  expect(scanSource(`<p>a // b</p><path fill="#123456"/>`, ".svg").counts.hex).toBe(1);
  expect(
    scanSource(`<div style="background:url(//x/y.png);color:#123456">`, ".html").counts.hex,
  ).toBe(1);
  expect(scanSource(`const a = 1; // #123456`, ".ts").counts.hex).toBe(0);
});

test("an entry written before rgb, radius and shadow existed allows none of them", () => {
  const old = { "a.css": { hex: 1, tokenHex: 0, font: 0, palette: 0, reason: "r" } };
  expect(violations({ "a.css": { ...zero, hex: 1 } }, old, old)).toEqual([]);
  expect(violations({ "a.css": { ...zero, hex: 1, rgb: 1 } }, old, old)).toHaveLength(1);
});

test("rgb() and hsl() literals count like hex: off-token as rgb, a token's colour as tokenHex", () => {
  expect(fnColour("rgb", "26, 114, 133")).toBe("#1a7285");
  expect(fnColour("rgba", "26 114 133 / 0.4")).toBe("#1a7285");
  expect(fnColour("hsl", "0, 0%, 100%")).toBe("#ffffff");
  expect(fnColour("rgb", "var(--x)")).toBeUndefined();
  const { counts, hexes } = scanSource(
    `.a { color: rgba(255, 214, 0, 0.5); background: rgb(26 114 133 / 40%);
       border-color: hsl(120, 100%, 25%); outline-color: rgb(var(--c)); }
     const x = \`rgba(\${r}, 0, 0, 1)\`;`,
    ".tsx",
  );
  expect(counts).toEqual({ ...zero, rgb: 2, tokenHex: 1 });
  expect(hexes).toEqual(["rgba(255, 214, 0, 0.5)", "hsl(120, 100%, 25%)"]);
});

test("a radius or shadow off the tokens counts, a token, a keyword or a reference does not", () => {
  const ok = scanSource(
    `.a { border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,.05); }
     .b { border-radius: var(--radius-brand); box-shadow: var(--shadow-overlay); border-top-left-radius: 0; }
     .c { --card-radius: 20px 5px; box-shadow: none; }
     const s = { borderRadius: 9999, boxShadow: "0 18px 46px rgb(25 40 58 / 0.1)" };
     <div class="rounded-sm rounded-brand rounded-full shadow-card shadow-overlay rounded-[var(--radius-sm)]">
     const t = { borderRadius: radius, boxShadow: \`\${shadow}\` };
     const u = { borderRadius: tokens["--radius-brand"], boxShadow: tokens['--shadow-card'], borderTopLeftRadius: tokens[\`--\${kind}\`] };
     .d { border-radius: var(--hw-corner, var(--radius-sm)); box-shadow: var(--a, var(--b, var(--shadow-card))); }`,
    ".tsx",
  ).counts;
  expect(ok).toEqual(zero);
  const bad = scanSource(
    `.a { border-radius: 6px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
     .b { --chip-radius: 4px; }
     const s = { borderRadius: 6, boxShadow: "0 0 0 3px #123456" };
     <div class="rounded-lg md:rounded-t-xl shadow-md rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
     const u = { borderRadius: tokens["--color-teal"], boxShadow: tokens["--radius-sm"], borderTopLeftRadius: tokens["--radius-lg"] };
     .d { border-radius: var(--hw-corner, calc(1px + 2px)); }`,
    ".tsx",
  ).counts;
  expect(bad).toEqual({ ...zero, radius: 9, shadow: 5 });
});

test("an SVG may write a token hex and the tint ladder, never an off-ladder colour", () => {
  for (const tint of ["#fef8ee", "#fbd89d", "#a2272c", "#864618", "#f2fdf6", "#f7f1fd", "#c6dce0"])
    expect({ tint, on: onLadder(tint) }).toEqual({ tint, on: true });
  expect(onLadder("#f52849")).toBe(false);
  expect(onLadder("#1a1a1a")).toBe(false);
  expect(
    scanSource(
      '<svg><rect fill="#1A7285"/><rect fill="#FEF8EE"/><rect fill="#F52849"/></svg>',
      ".svg",
    ).counts,
  ).toEqual({ ...zero, hex: 1 });
  expect(scanSource('<rect fill="#FEF8EE"/>', ".html").counts).toEqual({ ...zero, hex: 1 });
});

test("skips the documents engine's style elements in a composed document, reads the rest", () => {
  const css = ":root { --color-teal: #1a7285; --radius: 5px 20px; } .x { color: #123456; }";
  const engine = `<style data-hw-document>${css}</style><style data-hw-onepager>${css}</style>`;
  expect(scanSource(`<html><head>${engine}</head><body></body></html>`, ".html").counts).toEqual(
    zero,
  );
  const hand = scanSource(`<html><head><style>${css}</style></head></html>`, ".html").counts;
  expect(hand).toEqual({ ...zero, hex: 1, tokenHex: 1, radius: 1 });
  expect(scanSource(`${engine}<p style="color: #123456">x</p>`, ".html").counts).toEqual({
    ...zero,
    hex: 1,
  });
});

test("a glob string in script reads as no comment", () => {
  const config = `export default { content: ["./src/*"], theme: { color: "#123456" }, ignore: ["**/x"] };`;
  expect(scanSource(config, ".ts").counts).toEqual({ ...zero, hex: 1 });
  expect(scanSource(`const a = 1; /* #123456 */`, ".ts").counts).toEqual(zero);
});
