---
kind: work
status: open
priority: 2
owner: "a brand session, then os and trainer-hub"
evidence: "os `docs/tracking/2026-11-02-design-system-rollout.md` (phase 2, 02.11.)"
---

# Design-system rollout, what remains after phase 2

Phase 2 shipped brand v0.29.0 to v0.29.2 and moved every spoke onto brand elements and values; every UI repo has `/design-system/` (table in the report). What remains:

1. `brand-elements` measures every instance: os /documents takes 162 s of the 180 s limit, 229 s with `hw-row`, so os's list rows stay its own (pixel-identical with `hw-row`, ready once the scan measures each distinct markup once or caps instances). Also: dense sets `--hw-row-stripe`/`--hw-row-gap`, and `--hw-row-pad` splits block and inline.
2. The brand proposals in `ds3-brand-follow-ups` and `ds2-brand-proposals`, then each spoke drops the exception a shipped proposal makes moot.

The pins that remain are point 3 of `ds3-brand-follow-ups`.
