---
kind: work
status: open
priority: 3
area: brand
order: 1975
owner: Ada
evidence: "Checked 13.11.: expert/header.css has no @layer and is unchanged since 426e3f5 (11.11.); the split build has not run. Internal."
---

# Measure header.css in a cascade layer, all but the phone header's height

Brief a brand session to measure whether `header.css` can move into `@layer components`.

Its `:root:has(...)` override of `--spacing-app-header` stays unlayered. A consumer's utility could
then hide or restyle a header link without an unlayered rule of its own.

Moved whole, it fails: on a plain page the unlayered `tokens.root.css` then wins over the header's
`--spacing-app-header`, so at phone width the header's catalog row is left out of the height (brand
portal, slides catalog, testimonials catalog). `docs/header.md` states that and how a consumer
overrides a link today (testimonials' unlayered rule, talks' `max-md:hidden!`).

Next: build brand's own catalog with that split, run `test/header.test.ts`, and diff the header on
the six consumers' built pages from their own builds against the pinned brand. Zero diff: release
it, and brief testimonials and talks to drop their workarounds. Any diff: screenshot pairs at 1440
and 390 px and the blind-review sizing before it ships.
