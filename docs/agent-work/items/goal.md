---
kind: goal
status: open
---

# Goal

Benedikt, 01.11.2026 (relayed by Ada): „im hub (brand) soll ja der großteil liegen und in den spokes
nur die ausnahmen für die jeweiligen spokes. das müssen wir ganzheitlich noch mal sauber aufziehen so
das wir ein gutes dezentrales hub-spoke design system über alle repos haben“. Decided as
`shared-elements` "a + r1"; the design system's shape, the decision and its measurements are in
[the design-system report](../2026-11-11-design-system.md).

Limits: each spoke switches in its own repository, measured before and after in pixels; a visible
change gets a blind review, and a spoke keeps a local exception only where it scores clearly better
or the decision keeps the element per system. Brand writes into no other repository: work a spoke
owns goes there as a brief.

Done when:

1. Every spoke (documents, slides, website, certificate-verifier, trainer-hub, os, talks, admin,
   mail, practitioners) runs `brand-elements` in its own gate. Proof: each spoke's `package.json` or
   gate script at its `origin/main`. Reported met 11.11.: all ten run it, through a
   `check:elements` script or a gate script of their own (website `scripts/verify-elements.mjs`,
   trainer-hub and talks `scripts/check-elements.ts`, os `scripts/repo/check-elements.ts`); not
   verified by a delegate that built none of it.
2. Each spoke's `brand-elements` passes at its pinned brand version. Proof: the spoke's last gate
   run. Not yet checked.
3. The `shared-elements` decision is carried out and closed. Proof: brand v0.27.14. Reported met.
