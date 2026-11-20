import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { ROOT } from "../scripts/git";

const css = (f: string) => readFileSync(`${ROOT}/${f}`, "utf8");

// The island takes the colours and what is built from them back, nothing else: a corner or a scale
// an ancestor sets holds on it.
test("tokens.root.css's island block declares only the colour tokens and those reading them", () => {
  const tokens = css("generated/tokens.root.css");
  const island = tokens.slice(tokens.indexOf(":where("));
  expect(island).toContain("--color-bg:");
  expect(island).toContain("--gradient-strip:");
  expect(island).not.toContain("--radius-brand:");
  expect(island).not.toContain("--text-meta:");
});

// A data-theme="dark" element below a light html keeps that page's roles (expert.css), so an
// element's night scope reads the night roles from --hw-night-*, never --accent and its kin.
test("the elements' night scopes read no page role", () => {
  const ROLE = /var\(\s*--(background|foreground|accent|on-accent|border|input|muted)(?=[\s,)])/;
  const found: string[] = [];
  for (const f of new Bun.Glob("elements/*.css").scanSync(ROOT)) {
    const text = css(f);
    for (const m of text.matchAll(/@scope \(\[data-theme="dark"\]\)[^{]*\{/g)) {
      let depth = 1;
      let i = m.index + m[0].length;
      while (depth && i < text.length) depth += { "{": 1, "}": -1 }[text[i++]!] ?? 0;
      const hit = ROLE.exec(text.slice(m.index, i));
      if (hit) found.push(`${f}: ${hit[0]}`);
    }
  }
  expect(found).toEqual([]);
});
