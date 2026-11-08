import { expect, test } from "bun:test";
import verbal from "../verbal/verbal.json";

// The claim's highlight word stands in the claim in each language, so a surface can find it.
test("the claim carries its word in both languages", () => {
  for (const lang of ["en", "de"] as const)
    expect(verbal.claim[lang].split(/\W+/u)).toContain(verbal.claim.word[lang]);
});

test("no retired slogan is a current text", () => {
  // Every text with an English and a German version is current.
  const current = Object.values(verbal).flatMap((v) =>
    v && typeof v === "object" && "en" in v ? [v.en, v.de].filter((t) => t !== null) : [],
  );
  expect(verbal.retired.length).toBeGreaterThan(0);
  for (const r of verbal.retired) {
    expect(current.some((c) => c.includes(r.text))).toBe(false);
    expect(["claim", "headline", "mission"]).toContain(r.replacedBy);
  }
});
