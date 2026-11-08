---
kind: work
status: open
priority: 3
order: 1530
area: brand
owner: a brand session
evidence: "os report docs/agent-work/2026-11-08-component-consolidation.md, cluster 1: ListFilter takes the union of the hub's and the website's props. v1.47.0 ships the hub's props plus browse, the one/other count line and [data-filter-group]; the website's ui/ListFilter.astro (08.11.) also takes source, listed and inline, which v1.47.0 lacks."
---

# The website's remaining list-filter props, and the values layout

1. `source` (a page listing every row, where the form sends its query and whose rows load on first
   use) and `listed` (rows kept in the page under an overview without JavaScript), as the
   website's `src/components/ui/ListFilter.astro` has them; `inline` (the select beside the search
   from `lg`). Port the website's `e2e/components/list-filter.spec.ts` cases for them into
   `test/catalog/list-filter.test.ts`.
2. A values layout that takes os `FilterRow`'s rule: choices up to a label budget, else a select.

Done when the website's list pages render brand's `ListFilter` with these props and its e2e cases
pass in brand's catalog test.
