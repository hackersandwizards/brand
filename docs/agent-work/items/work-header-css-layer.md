---
kind: work
status: open
priority: 3
area: brand
order: 1995
owner: a brand session
evidence: "brand-next2 run, 12.11.: header.css's rules wrapped in @layer components in place on the built pages of os, admin, slides, talks, testimonials and brand (in-page simulation, not a build), computed styles of every header element diffed at 1440 and 390 px, light and dark. With the header.css file wrapped whole, test/header.test.ts's two catalog-list cases at 375 px go red. A control inserting only the layer order showed the 10 px narrower story frames in os and admin as the simulation's own artifact."
---

# header.css in a cascade layer, all but the phone header's height

Measure whether `header.css` can move into `@layer components` with its `:root:has(...)` override
of `--spacing-app-header` left unlayered, so a consumer's utility can hide or restyle a header link
without an unlayered rule of its own.

Moved whole, it fails: on a plain page the unlayered `tokens.root.css` then wins over the header's
`--spacing-app-header`, so at phone width the header's catalog row is left out of the height (brand
portal, slides catalog, testimonials catalog). `docs/header.md` states that and how a consumer
overrides a link today (testimonials' unlayered rule, talks' `max-md:hidden!`).

Next: build brand's own catalog with that split, run `test/header.test.ts`, and diff the header on
the six consumers' built pages from their own builds against the pinned brand. Zero diff: release
it, and brief testimonials and talks to drop their workarounds. Any diff: screenshot pairs at 1440
and 390 px and the blind-review sizing before it ships.
