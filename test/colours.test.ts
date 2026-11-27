import { expect, test } from "vitest";
import { scanSource } from "../scan/colour-scan";
import { fnColour, onLadder } from "../scan/colour-tokens";
import { tighten, violations, type Allowlist } from "../scan/colours";
import { scanned } from "../scan/tree";

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
      "scripts/latest_render.py",
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
      "scripts/test_render.py",
      "scripts/render_test.py",
      "conftest.py",
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
  expect(violations(a, allow, { committed: allow })).toEqual([]);
  expect(
    violations({ "a.css": { ...zero, hex: 3 }, "b.css": { ...zero, font: 1 } }, allow, {
      committed: allow,
    }),
  ).toEqual([
    "a.css: hex 3, allowed 2. Reference matching brand tokens from tokens.css or tokens.json in the source that produces the styling.",
    "b.css: font 1, allowed 0. Reference matching brand tokens from tokens.css or tokens.json in the source that produces the styling.",
  ]);
  expect(violations(a, { "a.css": { ...zero, hex: 2, reason: " " } }, undefined)).toHaveLength(1);
  expect(
    violations(a, allow, { committed: { "a.css": { ...zero, hex: 1, reason: "r" } } }),
  ).toHaveLength(1);
  expect(violations({}, allow, { committed: allow })).toEqual([
    "brand-colours.json: a.css has no off-token findings, so its allowance could hide new ones. Run bun run brand-colours --tighten to drop the entry.",
  ]);
});

test("a value moved to another file moves its entry, while the list's total for that metric holds", () => {
  const before: Allowlist = { "a.css": { ...zero, hex: 3, shadow: 1, reason: "r" } };
  const moved: Allowlist = {
    "a.css": { ...zero, hex: 1, shadow: 1, reason: "r" },
    "b.css": { ...zero, hex: 2, reason: "moved from a.css" },
  };
  const files = { "a.css": { ...zero, hex: 1, shadow: 1 }, "b.css": { ...zero, hex: 2 } };
  expect(violations(files, moved, { committed: before })).toEqual([]);
  // Control: the same move with one more hex than a.css gave up.
  const grown = { ...moved, "b.css": { ...zero, hex: 3, reason: "moved from a.css" } };
  expect(
    violations({ ...files, "b.css": { ...zero, hex: 3 } }, grown, { committed: before }),
  ).toEqual([
    "brand-colours.json: b.css hex increases the total allowance beyond what HEAD and the pin-change rule permit. Replace excess values with brand tokens, then run bun run brand-colours --tighten.",
  ]);
});

const partnerLogo = "public/conf-logo.svg";
const partner = { [partnerLogo]: { partner: "A Conference", reason: "r" } };
const misplacedPartner = { "a.ts": { ...zero, hex: 1, partner: "A Conference", reason: "r" } };

test("exempts a named partner SVG from HEAD growth checks", () => {
  expect(
    violations({ [partnerLogo]: { ...zero, hex: 32, rgb: 2 } }, partner, { committed: {} }),
  ).toEqual([]);
  // Control: the same entry without its partner is a grown entry.
  expect(
    violations(
      { [partnerLogo]: { ...zero, hex: 32 } },
      { [partnerLogo]: { ...zero, hex: 32, reason: "r" } },
      { committed: {} },
    ),
  ).toHaveLength(1);
});

test("flags a partner entry on a non-SVG file", () => {
  // Only an SVG named for its owner is a partner's mark.
  expect(violations({ "a.ts": { ...zero, hex: 1 } }, misplacedPartner, { committed: {} })).toEqual([
    'brand-colours.json: a.ts: "partner" can only exempt a named third-party SVG mark. Set "partner" to the mark owner\'s name on an SVG entry or remove the field.',
    "brand-colours.json: a.ts hex increases the total allowance beyond what HEAD and the pin-change rule permit. Replace excess values with brand tokens, then run bun run brand-colours --tighten.",
  ]);
});

test("flags a partner entry with a blank owner", () => {
  const unnamed = { [partnerLogo]: { ...zero, hex: 32, partner: " ", reason: "r" } };
  expect(
    violations({ [partnerLogo]: { ...zero, hex: 32 } }, unnamed, { committed: {} }),
  ).toHaveLength(2);
});

test("preserves a named partner SVG entry when tightening", () => {
  expect(tighten({ [partnerLogo]: { ...zero, hex: 30 } }, partner)).toEqual(partner);
});

test("keeps a misplaced partner reportable after tightening", () => {
  // Tightening keeps a misplaced partner, so the run after it still fails on it.
  const counts = { "a.ts": { ...zero, hex: 1 } };
  expect(violations(counts, tighten(counts, misplacedPartner), { committed: {} })).toEqual(
    violations(counts, misplacedPartner, { committed: {} }),
  );
});

test("an entry turned partner frees no total for another file to grow into", () => {
  const head = {
    "a.svg": { ...zero, hex: 50, reason: "r" },
    "b.css": { ...zero, hex: 1, reason: "r" },
  };
  const now: Allowlist = {
    "a.svg": { ...head["a.svg"], partner: "Acme" },
    "b.css": { ...zero, hex: 40, reason: "r" },
  };
  const files = { "a.svg": { ...zero, hex: 50 }, "b.css": { ...zero, hex: 40 } };
  expect(violations(files, now, { committed: head })).toEqual([
    "brand-colours.json: b.css hex increases the total allowance beyond what HEAD and the pin-change rule permit. Replace excess values with brand tokens, then run bun run brand-colours --tighten.",
  ]);
});

test("removing a partner mark frees no allowance and adding one with a count costs none", () => {
  const committed = { "old.svg": { hex: 20, partner: "Prior sponsor", reason: "Sponsor mark" } };
  const allow = {
    "new.svg": { hex: 8, partner: "Current sponsor", reason: "Sponsor mark" },
    "page.css": { hex: 1, reason: "Custom colour" },
  };
  const files = { "new.svg": { ...zero, hex: 8 }, "page.css": { ...zero, hex: 1 } };
  expect(violations(files, allow, { committed })).toEqual([
    "brand-colours.json: page.css hex increases the total allowance beyond what HEAD and the pin-change rule permit. Replace excess values with brand tokens, then run bun run brand-colours --tighten.",
  ]);
});

test("a first tighten records findings without inventing a reason", () => {
  expect(tighten({ "b.css": { ...zero, hex: 1 } }, undefined)).toEqual({
    "b.css": { hex: 1, reason: "" },
  });
});

test("tightening drops an unused allowance and keeps each file and metric within its own ceiling", () => {
  expect(
    tighten(
      { "a.css": { ...zero, hex: 1, rgb: 1 }, "b.css": { ...zero, hex: 1 } },
      { ...allow, "clean.css": { hex: 1, reason: "r" } },
    ),
  ).toEqual({ "a.css": { hex: 1, reason: "r" } });
});

test("tighten preserves a file literally named __proto__", () => {
  const files = { ["__proto__"]: { ...zero, hex: 1 } };
  const prior = { ["__proto__"]: { reason: "recorded", hex: 1 } };
  expect(Object.entries(tighten(files, prior))).toEqual(Object.entries(prior));
});

test("clamps an RGB channel of 256 before emitting its hex bytes", () => {
  expect(fnColour("rgb", "0 256 0")).toBe("#00ff00");
});

test("an allowance above the file's count is a finding: lower it", () => {
  expect(violations({ "a.css": { ...zero, hex: 1 } }, allow, { committed: allow })).toEqual([
    "brand-colours.json: a.css: hex 1, allowed 2. Run bun run brand-colours --tighten to lower the allowance to the file's count.",
  ]);
  // Control: the count the entry allows.
  expect(violations({ "a.css": { ...zero, hex: 2 } }, allow, { committed: allow })).toEqual([]);
});

test.each([
  {
    label: "modern functions and names in CSS",
    src: ".a { color: oklch(60% 0.2 30); background: tomato; border-color: color-mix(in srgb, red 40%, blue); x: lab(50% 40 59); y: hwb(12 50% 0%); z: color(display-p3 1 0 0) }",
    ext: ".css",
    expected: { ...zero, hex: 3, rgb: 4 },
  },
  {
    label: "a font shorthand",
    src: ".a { font: 600 1rem/1.2 Arial, sans-serif }",
    ext: ".css",
    expected: { ...zero, font: 1 },
  },
  {
    label: "Tailwind utility styles",
    src: `<div class="border-b-gray-200 border-x-red-500 ring-offset-red-500 placeholder-gray-400 font-serif text-[oklch(0.7_0.1_200)] bg-[tomato]">`,
    ext: ".astro",
    expected: { ...zero, hex: 1, font: 1, palette: 4, rgb: 1 },
  },
  {
    label: "short hex colours in CSS",
    src: ".a { color: #fab } .b { color: #abc }",
    ext: ".css",
    expected: { ...zero, hex: 2 },
  },
  {
    label: "a named SVG fill",
    src: `<svg><path fill="red" d="M0"/></svg>`,
    ext: ".svg",
    expected: { ...zero, hex: 1 },
  },
  {
    label: "font, colour and shadow across Astro sections",
    src: `<svg font-family="Arial"></svg><script>const s = { "font-family": "Arial" };</script><style>.a { -webkit-box-shadow: 0 0 1px #000; font-family: Interstate; color: hsl(0.5turn 50% 50%) }</style>`,
    ext: ".astro",
    expected: { ...zero, font: 3, rgb: 1, shadow: 1 },
  },
  {
    label: "white and black as token values",
    src: ".a { color: white; background: color-mix(in srgb, black 7%, transparent) }",
    ext: ".css",
    expected: { ...zero, tokenHex: 2 },
  },
])("counts the styling in $label", ({ src, ext, expected }) => {
  expect(scanSource(src, ext).counts).toEqual(expected);
});

test.each([
  {
    label: "brand fonts and CSS keywords",
    src: `.a { font: inherit; font: 600 1rem/1.2 var(--font-sans); font-family: "Inter Variable", sans-serif; font-family: Inter; color: color-mix(in srgb, var(--color-ink) 70%, transparent); background: transparent; fill: currentColor; border: 0 none; color: inherit; background: url(red.png) }`,
    ext: ".css",
    expected: zero,
  },
  {
    label: "script identifiers and selector strings",
    src: `const color = (x: string) => x; color(lab); const lab = (a: number) => a; lab(1); const t = { color: teal, background: bg }; document.querySelector("#fab"); location.hash = "#add"; const font = await loadFont();`,
    ext: ".ts",
    expected: zero,
  },
  {
    label: "HTML fragment links",
    src: `<a href="#add">x</a><a href="#faq">y</a>`,
    ext: ".html",
    expected: zero,
  },
])("counts nothing for $label", ({ src, ext, expected }) => {
  expect(scanSource(src, ext).counts).toEqual(expected);
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

// A number such as an issue's (#128) is no colour in prose; in a colour's value it is one.
test("a short hex of digits alone counts only where a value stands", () => {
  expect(scanSource('{ "reason": "opens pull request #128): 10 s" }', ".json").counts.hex).toBe(0);
  expect(scanSource("<p>Issue #1234 is fixed</p>", ".html").counts.hex).toBe(0);
  expect(scanSource(".a { color: #128; }", ".css").counts.hex).toBe(1);
  expect(scanSource('<rect fill="#1234"/>', ".html").counts.hex).toBe(1);
  // Control: a short hex mixing digits and letters counts wherever it stands.
  expect(scanSource("<p>see #1a2</p>", ".html").counts.hex).toBe(1);
});

// A consumer declaring brand's own faces, the fallback ones included, declares no other font; a
// stack opening on a fallback face still sets text in the fallback.
test("an @font-face naming a brand face counts nothing, a stack opening on its fallback does", () => {
  const face = (family: string) =>
    scanSource(`@font-face { font-family: "${family}"; src: local("Arial"); }`, ".css").counts.font;
  for (const f of ["Inter Fallback", "Inter Fallback Roboto", "JetBrains Mono Fallback"])
    expect([f, face(f)]).toEqual([f, 0]);
  expect(face("My Own")).toBe(1);
  expect(scanSource('.a { font-family: "Inter Fallback", sans-serif; }', ".css").counts.font).toBe(
    1,
  );
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
  expect(violations({ "a.css": { ...zero, hex: 1 } }, old, { committed: old })).toEqual([]);
  expect(
    violations({ "a.css": { ...zero, hex: 1, rgb: 1 } }, old, { committed: old }),
  ).toHaveLength(1);
});

test("rgb() and hsl() literals count like hex: off-token as rgb, a token's colour as tokenHex", () => {
  const { counts, hexes } = scanSource(
    `.a { color: rgba(255, 214, 0, 0.5); background: rgb(26 114 133 / 40%);
       border-color: hsl(120, 100%, 25%); outline-color: rgb(var(--c)); }
     const x = \`rgba(\${r}, 0, 0, 1)\`;`,
    ".tsx",
  );
  expect(counts).toEqual({ ...zero, rgb: 2, tokenHex: 1 });
  expect(hexes).toEqual(["rgba(255, 214, 0, 0.5)", "hsl(120, 100%, 25%)"]);
});

test.each([
  ["rgb", "26, 114, 133", "#1a7285"],
  ["rgba", "26 114 133 / 0.4", "#1a7285"],
  ["hsl", "0, 0%, 100%", "#ffffff"],
  ["RGB", " 100% 0% 20% / 40% ", "#ff0033"],
  ["rgb", "50% 30% 70%", "#804db3"],
  ["hsl", "0.5turn 50% 25%", "#206060"],
  ["hsl", "100grad 100% 50%", "#80ff00"],
  ["hsl", "1.5707963267948966rad 100% 50%", "#80ff00"],
  ["hsl", "120deg 50% 75%", "#9fdf9f"],
])("resolves %s(%s) before opacity", (fn, args, hex) => {
  expect(fnColour(fn, args)).toBe(hex);
});

test("counts rgb(74 222 50%) as the brand green", () => {
  const { counts } = scanSource(".a { color: rgb(74 222 50%); }", ".css");
  expect(counts).toEqual({ ...zero, tokenHex: 1 });
});

test.each(["a10 20 30", "10px 20 30", "10 none 30", "10 20", "var(--x)"])(
  "rgb(%s) contains no literal colour",
  (args) => {
    expect(fnColour("rgb", args)).toBeUndefined();
  },
);

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

test("recognises a token shadow across CSS formatting and a radius from the theme", () => {
  const { counts } = scanSource(
    `.a {
      box-shadow: 0  2px   4px RGBA(  0 ,  0 , 0 , .05  ) !important;
      border-radius: theme(borderRadius.brand);
    }
    .b { border-radius: theme(borderRadius.brand) / 12px; }`,
    ".css",
  );
  expect(counts).toEqual({ ...zero, radius: 1 });
});

test("only reads live styling after markup, CSS and script comments", () => {
  const { counts, hexes } = scanSource(
    `<!-- <path fill="#123456" />
         <path fill="#654321" /> -->
     <style media="screen">/* .a { color:#ff0000 } */
       .b { background: url(//cdn.example/image.png); color: #aabbcc; }
     </style>
     <script>
       // const unused = { color: "#decade" };
       const active = { color: "#bada55" };
     </script>`,
    ".astro",
  );
  expect(counts).toEqual({ ...zero, hex: 2 });
  expect(hexes).toEqual(["#aabbcc", "#bada55"]);
  expect(scanSource("// color: #123456\nconst value = 0;", ".ts").counts).toEqual(zero);
  expect(scanSource("const color = rgb(10, 20, 30)// custom ink", ".ts").counts).toEqual({
    ...zero,
    rgb: 1,
  });
});

test("a numeric issue anchor or spaced SVG fragment is distinct from a short colour literal", () => {
  expect(scanSource('<a href="#1222">Issue #1222</a><path fill="#1222" />', ".html").hexes).toEqual(
    ["#1222"],
  );
  expect(scanSource('<path fill="url(  #fab)" />', ".svg").counts).toEqual(zero);
});

test("preserves a diagnostic's alpha channel and gives it a consistent hex spelling", () => {
  const { counts, hexes } = scanSource(".shape { background: #F4A3C2DD; }", ".css");
  expect(counts).toEqual({ ...zero, hex: 1 });
  expect(hexes).toEqual(["#f4a3c2dd"]);
});

test("counts each literal in a colour mix once, including repeated names", () => {
  const { counts, hexes } = scanSource(
    `const style = { color: "color-mix(in srgb, tomato 30%, tomato)", backgroundColor: "black" };`,
    ".tsx",
  );
  expect(counts).toEqual({ ...zero, hex: 2, tokenHex: 1 });
  expect(hexes).toEqual(["tomato", "tomato"]);
});

test("finds colour mix arguments inside a CSS template literal", () => {
  const src = "const styles = `.card { background: color-mix(in srgb, tomato 40%, white); }`";
  const { counts, hexes } = scanSource(src, ".ts");
  expect(counts).toEqual({ ...zero, hex: 1, tokenHex: 1 });
  expect(hexes).toEqual(["tomato"]);
});

test("Python floor division does not hide a colour later on the same line", () => {
  const src = 'width = width // 2; draw(size=width, color="tomato")';
  expect(scanSource(src, ".py").hexes).toEqual(["tomato"]);
});

test("a JSX component can receive a brand role while a native element sets a literal colour", () => {
  const { counts, hexes } = scanSource(
    `<Badge
       color = "red"
     />
     <path fill={tone || "black"} />
     <path color="tomato" />`,
    ".tsx",
  );
  expect(counts).toEqual({ ...zero, hex: 1, tokenHex: 1 });
  expect(hexes).toEqual(["tomato"]);
});

test("a multiline JSX value can set a colour, while a palette lookup key sets none", () => {
  const { counts, hexes } = scanSource(
    `<path fill={ready &&\n       "tomato"}
       stroke={"purple"   in palette ? palette.purple : "black"} />`,
    ".tsx",
  );
  expect(counts).toEqual({ ...zero, hex: 1, tokenHex: 1 });
  expect(hexes).toEqual(["tomato"]);
});

test("scans the literal fallback colours in an SVG fill alongside an interpolated paint server", () => {
  const src =
    "const paint = `<path fill=\"${primary ? 'url(#first)' : 'url(#second)'} ${dark ? 'white' : 'tomato'}\"/>`;";
  const { counts, hexes } = scanSource(src, ".ts");
  expect(counts).toEqual({ ...zero, hex: 1, tokenHex: 1 });
  expect(hexes).toEqual(["tomato"]);
});

test("reports the first font in a quoted shorthand with a weight and line height", () => {
  const { counts, fonts } = scanSource(
    `const inherited = { font: useSystemFont };
     const quoted = { font: 'italic 700 12px/1.5 "Times New Roman", Georgia' };`,
    ".tsx",
  );
  expect(counts).toEqual({ ...zero, font: 1 });
  expect(fonts).toEqual(["Times New Roman"]);
});

test("reports the font stack's leading family and the Tailwind serif class", () => {
  const src = `<p class="font-serif" style="font-family: Georgia, serif">Example</p>`;
  expect(scanSource(src, ".html").fonts).toEqual(["Georgia", "font-serif"]);
});

test("allows a fallback face declaration but reports text explicitly set in that face", () => {
  const { counts, fonts } = scanSource(
    `@font-face { font-family: "Inter Fallback"; src: local("Arial"); }
     body { font-family: "Inter Fallback"; }`,
    ".css",
  );
  expect(counts).toEqual({ ...zero, font: 1 });
  expect(fonts).toEqual(["Inter Fallback"]);
});

test("ignores comments before a font family in stylesheet values", () => {
  const src = ".a { font-family: /* Web face */ Inter, sans-serif; }";
  expect(scanSource(src, ".css").counts).toEqual(zero);
  expect(scanSource(`<style>${src}</style>`, ".astro").counts).toEqual(zero);
});

test("reports both families in a padded, interpolated font attribute", () => {
  const src = "const label = `<text font-family=\"  ${wide ? 'Arial' : 'Georgia'}\">`";
  const { counts, fonts } = scanSource(src, ".ts");
  expect(counts).toEqual({ ...zero, font: 2 });
  expect(fonts).toEqual(["Arial", "Georgia"]);
});

test("a pin change may add up to the scanner's count for the file as committed", () => {
  const committed = { "older.css": { hex: 1, reason: "Existing artwork" } };
  const current = { ...committed, "art.css": { hex: 2, reason: "Existing artwork" } };
  const files = { "older.css": { ...zero, hex: 1 }, "art.css": { ...zero, hex: 2 } };
  expect(
    violations(files, current, { committed, ceiling: { "art.css": { ...zero, hex: 2 } } }),
  ).toEqual([]);
  expect(
    violations(files, current, { committed, ceiling: { "art.css": { ...zero, hex: 1 } } }),
  ).toEqual([
    "brand-colours.json: art.css hex increases the total allowance beyond what HEAD and the pin-change rule permit. Replace excess values with brand tokens, then run bun run brand-colours --tighten.",
  ]);
});

test("a clean file with an empty reason gets distinct allowlist findings", () => {
  expect(
    violations({ "art.css": zero }, { "art.css": { hex: 1, reason: " " } }, undefined),
  ).toEqual([
    "brand-colours.json: art.css: hex 0, allowed 1. Run bun run brand-colours --tighten to lower the allowance to the file's count.",
    'brand-colours.json: art.css has an undocumented exception. Set its "reason" to explain why the exception is needed.',
    "brand-colours.json: art.css has no off-token findings, so its allowance could hide new ones. Run bun run brand-colours --tighten to drop the entry.",
  ]);
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

// Each was counted by the scanner of v2.12.0 and names no off-brand colour or font.
test.each([
  ["a brand family in an inline style", `<p style="font-family: 'Inter'">x</p>`, ".astro"],
  ["a brand family marked !important", `.a { font-family: Inter !important; }`, ".css"],
  ["a brand shorthand marked !important", `.a { font: 16px/1.5 Inter !important; }`, ".css"],
  ["a comment in CRLF frontmatter", `---\r\nconst a = 1; // #123456\r\n---\r\n<p>x</p>`, ".astro"],
  ["a fragment reference", `<rect fill="url(#fade)"/>`, ".svg"],
  ["id selectors of letters", `.a:not(#feed, #face) {}`, ".css"],
  ["letters in prose", `<p>Shades: #bad, #fab</p>`, ".html"],
  ["a component's colour prop", `<Badge color="purple" />`, ".astro"],
  ["a type's union of names", `interface P { color: "teal" | "purple" }`, ".ts"],
  ["a comment after an apostrophe", `<p>it's</p><style>/* don't use #ff0000 */</style>`, ".html"],
  ["a variable in Python", `write(p, note, color=white)`, ".py"],
])("counts nothing in %s", (_, src, ext) => {
  expect(scanSource(src, ext).counts).toEqual(zero);
});

test.each([
  { label: "letters as a colour value", src: `.a{color:#fab}`, ext: ".css" },
  { label: "letters in a border", src: `.a{border: 1px solid #abc}`, ext: ".css" },
  { label: "letters in a fill", src: `<rect fill="#abc"/>`, ext: ".svg" },
  { label: "letters in a class's brackets", src: `<div class="bg-[#fab]"></div>`, ext: ".astro" },
  { label: "a named colour in a style object", src: `const s = { color: "red" };`, ext: ".tsx" },
  {
    label: "a style after an apostrophe",
    src: `<p>it's</p><style>.a{color:#ff0000}</style>`,
    ext: ".html",
  },
  { label: "a quoted colour in Python", src: `write(p, note, color="red")`, ext: ".py" },
])("counts $label", ({ src, ext }) => {
  expect(scanSource(src, ext).counts).toEqual({ ...zero, hex: 1 });
});

const svgFillWithFallback = '<rect fill={i === 2 ? "var(--color-ink)" : "white"} />';

test.each([
  {
    label: "an Astro fill with a token fallback",
    src: svgFillWithFallback,
    ext: ".astro",
    expected: { ...zero, tokenHex: 1 },
  },
  {
    label: "a JSX fill with a token fallback",
    src: `const r = ${svgFillWithFallback};`,
    ext: ".tsx",
    expected: { ...zero, tokenHex: 1 },
  },
  // The strings an interpolation can take are read; its names are not.
  {
    label: "conditional branches in an interpolation",
    src: "const s = `<rect fill=\"${on ? 'tomato' : 'teal'}\"/>`;",
    ext: ".ts",
    expected: { ...zero, hex: 2 },
  },
  // An interpolation runs to its matching brace; grouping parentheses keep a branch a value.
  {
    label: "a literal fallback after an object argument",
    src: "const s = `<rect fill=\"${tone({ dark }) ?? 'tomato'}\"/>`;",
    ext: ".js",
    expected: { ...zero, hex: 1 },
  },
  {
    label: "parenthesised conditional branches",
    src: '<path fill={on ? (dark ? "white" : "tomato") : "teal"} />',
    ext: ".tsx",
    expected: { ...zero, hex: 2, tokenHex: 1 },
  },
  // Outside a component's tag color= is an assignment, and JSX in .js reads like .jsx.
  {
    label: "a script assignment outside a component",
    src: 'const color = "tomato";',
    ext: ".tsx",
    expected: { ...zero, hex: 1 },
  },
  {
    label: "a JSX fill in a .js file",
    src: '<path fill={on ? "tomato" : "teal"} />',
    ext: ".js",
    expected: {
      ...zero,
      hex: 2,
    },
  },
])("counts literal colours in $label", ({ src, ext, expected }) => {
  expect(scanSource(src, ext).counts).toEqual(expected);
});

test.each([
  {
    label: "a font lookup",
    src: 'const s = `<text font-family="${FAM[fam]}">`;',
    ext: ".js",
    expected: zero,
  },
  {
    label: "both literal font families",
    src: "const s = `<text font-family=\"${big ? 'Arial' : 'Georgia'}\">`;",
    ext: ".js",
    expected: { ...zero, font: 2 },
  },
  {
    label: "a dynamic family and a brand fallback",
    src: "const s = `<text font-family=\"${on ? `${A}` : 'Inter'}\">`;",
    ext: ".js",
    expected: zero,
  },
])("checks literal font families in $label", ({ src, ext, expected }) => {
  expect(scanSource(src, ext).counts).toEqual(expected);
});

test.each([
  {
    label: "an Astro component",
    src: '<Pill color={on ? "teal" : "purple"} />',
    ext: ".astro",
    expected: zero,
  },
  // A JSX component's colour prop maps a name to a token, as in Astro.
  {
    label: "a JSX component",
    src: '<Badge color={ok ? "green" : "red"} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "a JSX component before a long suffix",
    src: `<Badge color={ok ? "green" : "red"} />\n${"x".repeat(600)}`,
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "a JSX component after an arrow callback",
    src: '<Badge onClick={() => go()} color={ok ? "green" : "red"} />',
    ext: ".tsx",
    expected: zero,
  },
])("treats colour roles as component props in $label", ({ src, ext, expected }) => {
  expect(scanSource(src, ext).counts).toEqual(expected);
});

test.each([
  {
    label: "a bare colour identifier",
    src: 'const s = `<rect fill="${white}"/>`;',
    ext: ".js",
    expected: zero,
  },
  // A component's colour prop maps a name to a token, and an object after a colon is a map.
  {
    label: "a nested style object",
    src: 'const t = { color: { primary: "teal" } };',
    ext: ".ts",
    expected: zero,
  },
  // A brace after = in script or Python opens an object or a dict; a compared string is no value.
  {
    label: "an object assigned to color",
    src: 'const color = { ok: "green", bad: "red" };',
    ext: ".ts",
    expected: zero,
  },
  {
    label: "an object assigned to fill",
    src: 'const fill = { a: "white" };',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "a Python dict assignment",
    src: 'background = {"x": "white"}',
    ext: ".py",
    expected: zero,
  },
  {
    label: "a Python dict argument",
    src: 'plot(color={"ok": "green"})',
    ext: ".py",
    expected: zero,
  },
  {
    label: "a string compared with a theme",
    src: '<path fill={theme === "black" ? "var(--x)" : "var(--y)"} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "a palette subscript",
    src: '<path fill={palette["white"]} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "a multiline comparison",
    src: '<path fill={theme ===\n  "black" ? a : b} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "a call argument",
    src: '<path fill={pick(on, "white")} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "a string used as the left operand of in",
    src: '<path fill={"white" in m ? a : b} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "conditional subscript keys",
    src: '<path fill={p[dark ? "white" : "black"]} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "conditional call arguments",
    src: '<path fill={pick(on ? "white" : "black")} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "an object literal in a lookup",
    src: '<path fill={{ ok: "tomato" }[k]} />',
    ext: ".tsx",
    expected: zero,
  },
  {
    label: "a string in a membership call",
    src: '<path fill={names.includes("black") ? a : b} />',
    ext: ".astro",
    expected: zero,
  },
  {
    label: "a bare fallback after an object argument",
    src: 'const s = `<rect fill="${tone({ dark }) ?? white}"/>`;',
    ext: ".js",
    expected: zero,
  },
  {
    label: "an interpolation nested inside a call argument",
    src: "const s = `<rect fill=\"${pick(`${on ? 'tomato' : 'x'}`)}\"/>`;",
    ext: ".js",
    expected: zero,
  },
])("ignores colour names outside value positions in $label", ({ src, ext, expected }) => {
  expect(scanSource(src, ext).counts).toEqual(expected);
});

test.each([
  {
    label: "unquoted names across several custom properties",
    src: ".a { --mark: white; --fill: hotpink; --ease: linear; --text-color: black }",
    ext: ".css",
    expected: { ...zero, tokenHex: 2, hex: 1 },
  },
  {
    label: "an unquoted script identifier",
    src: 'const s = { "--mark": white };',
    ext: ".ts",
    expected: zero,
  },
  {
    label: "an inline style",
    src: '<div style="--mark: tomato"></div>',
    ext: ".astro",
    expected: {
      ...zero,
      hex: 1,
    },
  },
  {
    label: "a quoted script value",
    src: 'const s = { "--mark": "white" };',
    ext: ".ts",
    expected: {
      ...zero,
      tokenHex: 1,
    },
  },
  // !important still leaves one name; a quoted value in CSS is a string.
  {
    label: "a name with !important",
    src: ".a { --mark: tomato !important; }",
    ext: ".css",
    expected: {
      ...zero,
      hex: 1,
    },
  },
  { label: "a quoted CSS string", src: '.a { --label: "red"; }', ext: ".css", expected: zero },
  { label: "a quoted SCSS string", src: '.a { --label: "red"; }', ext: ".scss", expected: zero },
])("counts colours in custom properties for $label", ({ src, ext, expected }) => {
  expect(scanSource(src, ext).counts).toEqual(expected);
});
