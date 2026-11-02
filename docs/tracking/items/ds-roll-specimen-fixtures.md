---
kind: decision
status: assumed
priority: 1
order: 1
area: brand
owner: Benedikt
assumption: "Astrobook at /design-system/ is the catalogue in every repo that has one now. The slides and documents specimen pages and the verifier's /design-system route stay, because brand-elements, brand-markers and specimen --check read them as files without a server; documents' specimen index is also its public GitHub Pages site. talks removed its own Next route instead."
---

# Assumed: slides, documents and the verifier keep their own pages as gate fixtures beside Astrobook

design-system-tool: Astrobook in every repo. Report: os docs/tracking/2026-11-02-design-system-rollout.md.

Benedikt decided hub-max on 02.11. (os `docs/tracking/items/repo-uniformity-plan.md`): the generators move into one Astro catalog app per repo and the four `serve.ts` go. That rollout ends this assumption; until it lands the pages stay as gate fixtures.
