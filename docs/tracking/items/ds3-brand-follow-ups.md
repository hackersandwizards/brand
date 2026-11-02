---
kind: work
status: open
priority: 3
owner: Ada
evidence: "ds3 run of 02.11.: brand v0.29.3, v0.29.4, v0.30.0; report os docs/tracking/2026-11-02-design-system-phase3.md"
---

# Design system phase 3: what remains of the brand follow-ups

Done in brand v0.29.3 to v0.30.0 (catalogue margin, header nav at 390 px, zero-width borders, field
family, filled secondary button, stage tokens, verifier footer arrow kept as brand's, list indent
kept as brand's, night defaults). What remains:

1. documents keeps its own night line (`tokens.css` `--night-line`, white 18 %) on the onepager hero
   and the closing band, where brand's `--color-night-line` is night ink at 15 %; switching is a
   visible change and needs a documents before/after review. Its soft accent and result tones
   (`--accent-soft`, `--result-soft`, a hue at 7 % on white) have no brand token yet.
2. The elements' own night rules (`row.css`, `facts.css`, `card.css` and others) still mix white at
   15 or 18 %; whether they take `--color-night-line` needs a review on os and trainer-hub night.
3. trainer-hub pins slides v0.24.1 and documents v0.3.1 on origin/main (02.11. evening); raising
   them follows their own releases. os is raised (documents v0.5.1, mail v0.2.0).
