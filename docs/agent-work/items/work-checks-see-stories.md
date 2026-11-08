---
kind: work
status: open
priority: 1
order: 100
owner: Ada
evidence: "08.11., v1.42.0: brand-elements and brand-markers measure every story page of a built catalog (catalog key, --catalog), the source rule reads @apply and btn, and test/catalog-scan.test.ts runs it over expert/; controls in that test, report os docs/agent-work/2026-11-08-catalog-coherence.md"
---

# The brand checks see inside catalog stories: what remains

The checks are done and released in v1.42.0; two things remain.

1. **The expert layer's forks.** The fork rule over `expert/` (`test/catalog-scan.test.ts`,
   `KNOWN`) finds nine, each a duplicate of a shared element, held in that list until fixed
   there. Their own run, after the forms-structure run:
   - `expert/components/FilterChip.astro`, `FilterChipBar.astro`: components named like the pill,
     without `hw-pill`.
   - `expert/components/Pill.astro`: a second pill in Tailwind classes beside `elements/pill.css`.
   - `expert/expert.css` `.btn-primary`, `.btn-secondary`: buttons in `@apply` beside `hw-button`.
     os's built story `Filters/batch-ops/two-selected` draws `.btn-secondary` with the brand
     corner inside a brand-cornered bar: 4 rendered findings.
   - `expert/expert.css` `.chip-link`, `.chip-link-muted`: pills in `@apply` beside `hw-pill`.
   - `expert/expert.css` `.filter-chip`, `.filter-chip .chip-remove`: a pill and its remove
     button beside `hw-pill` and `hw-pill-remove`; the round look is decision label-system C.
2. **Each consumer turns it on** at its next brand raise, with the line in the release report.
   Measured on the built catalogs in the checkouts, 08.11., with this brand's elements: os's 338
   story states give 9 rendered differences on 4 stories in 46 s, all states, so no first-state
   mode is needed. The `btn` name finds 4 os classes the audit's sweep did not report
   (`detail-panel-toolbar-btn`, `list-row-action-btn`, `popup-menu-btn`, `popup-menu-btn-sm`, on
   os `origin/main`); the website's 11 are its item `work-brand-past-v1-28-5`'s.

   Where the catalog is the site's home (documents, slides, mail), `dist/catalog/stories` holds
   only forwarding pages and the stories sit in `dist/stories`: the key names `dist` there.

Completion check: `KNOWN` is empty, and every consumer's `brand-elements.json` has a `catalog`.
