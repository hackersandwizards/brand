import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";

// Each area mark in marker.css is its Lucide icon unchanged, at the version package.json pins:
// a lucide-static update that redraws an icon fails here until the mark is copied again.
const ICONS = {
  trainings: "graduation-cap",
  factory: "factory",
  blog: "newspaper",
  knowledge: "book-open",
  podcast: "mic",
  other: "building-2",
};
const css = readFileSync(join(ROOT, "tokens/marker.css"), "utf8");
const shapes = (svg: string) =>
  [...svg.matchAll(/<(path|rect|circle|line|polyline|polygon|ellipse)\b([^>]*?)\/?>/g)].map(
    ([, tag, attrs]) => `${tag} ${attrs!.replaceAll('"', "'").replace(/\s+/g, " ").trim()}`,
  );

test("every area mark draws its Lucide icon", () => {
  const marks = [
    ...css.matchAll(
      /\[data-mark="(\w+)"\] \{\s*--_hw-mark: url\("data:image\/svg\+xml,([^"]+)"\)/g,
    ),
  ];
  expect(marks.map(([, area]) => area)).toEqual(Object.keys(ICONS));
  for (const [, area, uri] of marks) {
    const icon = readFileSync(
      join(ROOT, `node_modules/lucide-static/icons/${ICONS[area as keyof typeof ICONS]}.svg`),
      "utf8",
    );
    expect({ area, shapes: shapes(decodeURIComponent(uri!)) }).toEqual({
      area,
      shapes: shapes(icon),
    });
  }
});
