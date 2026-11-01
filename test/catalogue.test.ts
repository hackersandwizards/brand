import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/git";

// A duplicate anchor means two things on the page claim one name: rename the less specific one.
test("catalogue.html has no duplicate id", () => {
  const ids = [
    ...readFileSync(join(ROOT, "catalogue.html"), "utf8").matchAll(/\sid="([^"]+)"/g),
  ].map((m) => m[1]);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});

// The Logos section names as many logos as it shows cards.
test("catalogue.html counts the logos it shows", () => {
  const html = readFileSync(join(ROOT, "catalogue.html"), "utf8");
  const word = html.match(/<p>(\w+) logos, each one line\./)![1];
  const cards = html.match(/<article class="logo" /g)!.length;
  expect(["One", "Two", "Three", "Four", "Five", "Six"].indexOf(word) + 1).toBe(cards);
});

// The design guide: a colour swatch is square, never a scaled corner.
test("catalogue.html colour swatches are square", () => {
  const html = readFileSync(join(ROOT, "catalogue.html"), "utf8");
  expect(html.match(/\.swatch span \{[^}]*border-radius: ([^;]+);/)![1]).toBe("0");
});
