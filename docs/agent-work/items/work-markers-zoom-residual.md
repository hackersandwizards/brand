---
kind: work
status: open
priority: 3
order: 2020
owner: a brand session
evidence: "brand-markers sweep 08.11.: 11 to 36 px text, line heights 1.25 to 1.6, zooms 1, 0.96897, 0.92, 0.85, 0.8, 0.75, at 2x and 4x, with and without a newline after <li>; one-factor controls per cause"
---

# Markers under a CSS zoom: what remains

Fixed in the same release: Inter's descent (494/2048 em), 1/128 px before the half-leading's
`round(down)`, `--hw-zoom` in the prose task box and in check.css's side, and brand-markers reading
boxes two frames after it rewrites the lines. With these, a list marker sits within 0.25 px on
all 832 readings per zoom at 1, 0.96897, 0.85 and 0.75; no reading moved further off at any zoom.

1. **1lh under a zoom.** 18 px/1.45 at 0.92, 20 px/1.5 and 20 px/1.4 at 0.8 read 0.90 px high:
   `1lh` resolves to 23.984 real px where Chrome's line box is 24.016 (slides run, control: Chrome's value in
   place of `1lh` reads 0.10 px). A 1/32 px nudge clears 0.92 but moves 8 readings off unzoomed,
   8 at 0.96897, 16 at 0.85, 12 at 0.8 and 12 at 0.75, up to 1.17 px; 1/64 moves 4 to 8 off at
   0.96897, 0.85 and 0.75. Not adopted; no rule from `1lh` found yet.
2. **Line height 1.25 under a zoom of 0.92 or less.** 4 to 28 of 208 readings off (0.41 to 1.95
   px) at 11 to 24 px text, list, element and prose task box alike; the same before this release.
   Cause not yet explained.
3. **The read-only task tick under a zoom.** 8 to 48 of 48 readings off, 0.26 to 0.98 px. Chrome
   draws the tick's mask larger than the box: at 16 px under 0.96897, 43 rows of ink at 4x
   against 40 unzoomed in the same 16 px box. Control: a mask size of the box's side times the
   zoom gives 48 → 12 off at 0.96897, still 0.5 px; not adopted, since it leans on that rendering.
