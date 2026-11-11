---
kind: work
status: open
priority: 3
area: brand
order: 1985
owner: a brand session
evidence: "docs/agent-work/2026-11-11-shared-elements.md: each point below is in the section named beside it, checked against the files at HEAD on 11.11. (brand v2.15.0); reviewers' remarks from the blind reviews that section reports."
---

# Element findings no other item holds

Fix or measure the twelve shared-element findings below, each in the report section named beside it.

Each is small and left from a review or a measurement; none has been scored as a change yet. A
visible change to a shared element is scored blind on the surfaces that render it before it ships.

Defects:

1. **Field.** The textarea's resize grip sits in the brand corner's large curve: textarea.hw-field
   takes the brand corner and resize: vertical (two reviewers of the form-elements panel).
2. **Tabs, Focus ring.** The inset ring covers the selected tab's accent bar while it has focus.
3. **Focus ring.** The page title's lead and subtitle in expert/expert.css clip a focus ring
   (.page-title-lead keeps overflow: hidden); not measured.
4. **Ruled table.** Three reviewers saw more space above a table than below it, in both versions.
   A lead, measured on 11.11.: the head cells' 8 px top padding sits above the table's first ink,
   while the last row's sits inside the closing hairline (25 px from the text above to the head's
   text, 16.5 px from the last hairline to the text below); not yet scored.
5. **Toast.** Reviewers asked for a lighter night ground for the overlays (toast, menu, dialog and
   popover share it); it needs its own round across surfaces.
6. **App header.** The night logo is a second image; one image whose source the theme switches
   would serve both themes.
7. **Inline code.** A whole chip at the full column width followed by a comma runs the comma past
   the column edge.
8. **Ruled table, night.** Reviewers on both models read the edge shadow on night as a smudge on a
   phone at night ink 22 %; v2.16.0 ships 12 %, for AA, which no reviewer has judged on that point.
9. **Carousel, list row.** Both take their ring room back in a negative margin (`carousel.css`,
   `row.css`, as `focus.css` advises), which on the table reached 5 px past a container without side
   padding; not measured on them.

Not yet explained or not checked:

10. **Callout.** Round 2 of the callout review captured today's state (T) blank on the slide, so T's
    round-2 scores are void; no re-capture was run.
11. **Consumer checks.** What the order of page preparation changes in a brand-elements measurement
    (finding B-19).
12. **Across elements, Night.** Whether the trainer hub sets its own night ground, against which its
    quiet grey measured 4.8:1 before B-01.

Check: each point fixed with its measurement, or recorded in the report as kept with its reason,
and this item deleted.
