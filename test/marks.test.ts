import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SUN } from "../expert/components/theme-icons";
import { ROOT } from "../scripts/git";

// Each area mark in marker.css is its Lucide icon unchanged, at the version package.json pins:
// a lucide-static update that redraws an icon fails here until the mark is copied again. The mark
// without a data-mark is the other area.
const ICONS = {
  '[data-mark="trainings"]': "graduation-cap",
  '[data-mark="factory"]': "factory",
  '[data-mark="blog"]': "newspaper",
  '[data-mark="knowledge"]': "book-open",
  '[data-mark="podcast"]': "mic",
  "": "building-2",
};
const css = readFileSync(join(ROOT, "tokens/marker.css"), "utf8");
const shapes = (svg: string) =>
  [...svg.matchAll(/<(path|rect|circle|line|polyline|polygon|ellipse)\b([^>]*?)\/?>/g)].map(
    ([, tag, attrs]) => `${tag} ${attrs!.replaceAll('"', "'").replace(/\s+/g, " ").trim()}`,
  );
const lucide = (name: string) =>
  shapes(readFileSync(join(ROOT, `node_modules/lucide-static/icons/${name}.svg`), "utf8"));

test("every area mark draws its Lucide icon, other the default", () => {
  const marks = [
    ...css.matchAll(
      /\.hw-mark((?:\[data-mark="\w+"\])?) \{[^}]*?--_hw-icon: url\("data:image\/svg\+xml,([^"]+)"\)/g,
    ),
  ].map(([, selector, uri]) => [selector, uri!] as const);
  expect(marks.map(([selector]) => selector).sort()).toEqual(Object.keys(ICONS).sort());
  for (const [selector, uri] of marks) {
    expect({ selector, shapes: shapes(decodeURIComponent(uri)) }).toEqual({
      selector,
      shapes: lucide(ICONS[selector as keyof typeof ICONS]),
    });
  }
});

// One path, so a port draws it as it draws the moon: Lucide's circle as two arcs, then its rays.
test("the theme switch's sun draws Lucide's sun", () => {
  const [circle, ...rays] = lucide("sun");
  expect(circle).toBe("circle cx='12' cy='12' r='4'");
  const d = rays.map((ray) =>
    ray.slice("path d='".length, -1).replace(/^m([\d.]+ [\d.]+) ?/, "M$1l"),
  );
  expect(SUN).toBe(`M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z${d.join("")}`);
});
