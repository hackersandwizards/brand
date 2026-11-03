---
kind: goal
status: open
---

# Goal

Benedikt, 01.11.2026 (relayed by Ada): „im hub (brand) soll ja der großteil liegen und in den spokes
nur die ausnahmen für die jeweiligen spokes. das müssen wir ganzheitlich noch mal sauber aufziehen so
das wir ein gutes dezentrales hub-spoke design system über alle repos haben“. Decided as
`shared-elements` "a + r1" (os `docs/agent-work/2026-11-01-shared-elements.md`).

Limits: each spoke switches in its own repository, measured before and after in pixels; a visible
change gets a blind review, and a spoke keeps a local exception only where it scores clearly better
or the decision keeps the element per system. Every spoke (documents, slides, website, certificate-verifier, trainer-hub, os, talks) runs
`brand-elements` green in its own gate and the `shared-elements` row has left `items.js` (brand
v0.27.14).
