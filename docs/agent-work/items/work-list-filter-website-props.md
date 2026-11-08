---
kind: work
status: open
priority: 3
order: 2040
area: brand
owner: a website session
evidence: "brand v1.51.0 ships source, listed, inline and the label budget in expert/components/ListFilter.astro, with their cases in test/catalog/list-filter.test.ts (docs/agent-work/2026-11-08-brand-followups.md, section 7)."
---

# The website switches its list pages to brand's ListFilter

Brand's part is done. What remains is the website's: render the blog hub, the knowledge index and
the reading list with brand's `ListFilter` (its facets as `facets`, one entry each, since v1.58.0;
rows' facets as JSON in `data-filter-facets`, the tag in it too), and delete `ui/ListFilter.astro`. Done when its e2e cases pass on brand's component.
