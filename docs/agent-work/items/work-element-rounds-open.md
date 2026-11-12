---
kind: work
status: open
priority: 3
area: brand
order: 1986
owner: a brand session
evidence: "12.11.: left open by the element-findings batch (report 2026-11-11-shared-elements.md, sections Ruled table, Toast and Consumer checks); none re-measured since. Visible, minor: the table's space above and its night edge on a phone."
---

# Element points that need a round of their own

Score or explain the four shared-element points below, each in the report section named beside it.

Each needs a cross-surface round or an experiment the element-findings batch of 12.11. did not run.
A visible change to a shared element is scored blind on the surfaces that render it before it ships.

1. **Ruled table.** Three reviewers saw more space above a table than below it. Measured on 11.11.:
   the head cells' 8 px top padding sits above the table's first ink, the last row's inside the
   closing hairline (25 px from the text above to the head's text, 16.5 px from the last hairline to
   the text below). Not scored.
2. **Toast.** Reviewers asked for a lighter night ground for the overlays (toast, menu, dialog and
   popover share it); it needs its own round across surfaces.
3. **Ruled table, night.** Reviewers on both models read the edge shadow on night as a smudge on a
   phone at 22 %; v2.16.0 ships 12 % for AA. The comments of the round that showed 12 % are gone
   with its scratch, so only a new phone-at-night round answers it.
4. **Consumer checks.** What the order of page preparation changes in a `brand-elements`
   measurement (finding B-19). Not yet explained: `scan/elements.ts` reads the page's classes before
   it opens the folds and waits for the fonts, then measures; no run has varied that order.

Check: each point fixed with its scores, or recorded in the report as kept with its reason, and
this item deleted.
