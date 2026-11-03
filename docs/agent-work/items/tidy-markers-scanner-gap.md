---
kind: work
status: open
priority: 3
order: 30
area: brand
owner: Poppy
evidence: "os docs/agent-work/2026-11-01-list-markers.md, section Offen (removed 02.11.; find it with git log --all -- that path in os)"
---

# brand-markers misses an li that shows both the disc and the square

When one `li` draws the round disc and the square marker at once, `brand-markers` reports nothing. trainer-hub had such a case, fixed there by hand. Not yet explained, same report: on the talks route `/slide-catalogue/print` three long items read -0.5 to -13.5 px, while the 2x crop shows them centred and the same block in the specimen reads at most 0.14 px.
