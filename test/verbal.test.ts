import { expect, test } from "vitest";
import verbal from "../verbal/verbal.json";

// The claim's highlight word stands in the claim in each language, so a surface can find it.
test("the claim carries its word in both languages", () => {
  for (const lang of ["en", "de"] as const)
    expect(verbal.claim[lang].split(/\W+/u)).toContain(verbal.claim.word[lang]);
});

test("no retired slogan is a current text", () => {
  // Every text with an English and a German version is current.
  const current = Object.values(verbal)
    .filter((v) => v !== null)
    .filter((v) => typeof v === "object")
    .filter((v) => "en" in v)
    .flatMap(({ en, de }) => [en, de])
    .filter((text) => text !== null);
  expect(current.length).toBeGreaterThan(0);
  expect(verbal.retired.length).toBeGreaterThan(0);
  for (const r of verbal.retired) {
    expect(current.some((c) => c.includes(r.text))).toBe(false);
    expect(["claim", "headline", "mission"]).toContain(r.replacedBy);
  }
});
