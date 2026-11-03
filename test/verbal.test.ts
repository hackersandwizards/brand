import { expect, test } from "bun:test";
import verbal from "../verbal/verbal.json";

// The claim's highlight word stands in the claim in each language, so a surface can find it.
test("the claim carries its word in both languages", () => {
  for (const lang of ["en", "de"] as const)
    expect(verbal.claim[lang].split(/\W+/u)).toContain(verbal.claim.word[lang]);
});

// A retired line is never the canonical one, and names what replaced it.
test("no retired slogan is a current text", () => {
  const current = [verbal.claim.en, verbal.claim.de, verbal.mission.en, verbal.mission.de];
  for (const r of verbal.retired) {
    expect(current.some((c) => c.includes(r.text))).toBe(false);
    expect(["claim", "mission"]).toContain(r.replacedBy);
  }
});
