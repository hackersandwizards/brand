---
kind: work
status: open
priority: 3
area: brand
order: 1990
owner: a brand session
evidence: "Checked 12.11.: prose paragraphs still take max-width var(--container-measure) (elements/prose.css:64), 33em (tokens/tokens.css:339), so 429px at the dense 13px; not re-rendered, not scored. Visible to os readers: notes wrap early on a wide screen."
---

# A wider text width for notes at the dense scale

Score a wider reading width for running text in the expert systems before the measure changes.

At the dense scale 33em is 429 px, so a record's notes in os wrap early on a wide page. A wider
`--hw-prose-width` at the dense scale would reach os, admin and the trainer hub.

Next: render os's record pages and admin's item page with the notes at 33em, 40em and 45em, at
1408 px, and score blind with readers of those pages (Claude and Codex). Check: the scores recorded
here, and a dense-scale value in `elements/scales.css` or the reason to keep 33em.
