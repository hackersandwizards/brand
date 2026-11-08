---
kind: work
status: open
priority: 1
order: 100
owner: Ada
evidence: "08.11., v1.42.0: brand-elements and brand-markers measure every story page of a built catalog (catalog key, --catalog), the source rule reads @apply and btn, and test/catalog-scan.test.ts runs it over expert/; controls in that test, report os docs/agent-work/2026-11-08-catalog-coherence.md"
---

# The brand checks see inside catalog stories: what remains

The checks are released in v1.42.0, and the expert layer has no fork left (`test/catalog-scan.test.ts`
expects none; `FilterChipBar` and `.chip-link` are exceptions there with their reasons). One thing
remains.

**Each consumer turns it on** at its next brand raise, with the line in the release report.
Measured on the built catalogs in the checkouts, 08.11., with this brand's elements: os's 338
story states give 9 rendered differences on 4 stories in 46 s, all states, so no first-state
mode is needed. The `btn` name finds 4 os classes the audit's sweep did not report
(`detail-panel-toolbar-btn`, `list-row-action-btn`, `popup-menu-btn`, `popup-menu-btn-sm`, on
os `origin/main`); the website's 11 are its item `work-brand-past-v1-28-5`'s.

Where the catalog is the site's home (documents, slides, mail), `dist/catalog/stories` holds
only forwarding pages and the stories sit in `dist/stories`: the key names `dist` there.

Completion check: every consumer's `brand-elements.json` has a `catalog`.
