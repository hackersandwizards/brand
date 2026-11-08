---
kind: work
status: open
priority: 2
owner: Ada
evidence: "label story, night row, 08.11.: the sortable head 'Name ↑' measured 1.35:1 on night in all four scales"
---

# The sortable label on night

A button inside `.hw-label` took the label's colour but kept the browser's light grey face, so on
night it read 1.35:1. Fixed in `elements/label.css` and, for a sort button in a table head,
`elements/table.css`; `test/elements.test.ts` measures every sample's text for WCAG AA in every
scale and theme. Remains: `/simplify`, `/code-review`, the release and the consumers' pin bumps.
