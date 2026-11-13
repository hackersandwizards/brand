---
kind: work
status: open
priority: 3
area: brand
order: 2030
owner: Ada
evidence: "Checked 12.11.: points 4 to 7 stand; nav.css:75 still gives the hover fill to any aria-expanded=true item and nav.css:47 styles every button:not([class]) in hw-nav. Points 1 to 3 stay closed until their condition changes. Internal."
---

# Element points closed by measurement, to reopen when a condition changes

Reopen a point below when its condition changes; until then nothing is to do.

Points 1 to 3 are requests that were measured rather than built or scored.

1. **Edge cue without scroll timelines.** No fallback was built: every current engine runs
   `animation-timeline: scroll()` (Chrome 115, Safari 26, Firefox 159). Older browsers scroll the
   table without the cue. Reopen if a surface's analytics show a real share of Safari before 26 or
   Firefox before 159.
2. **Search button corner beside a field.** Not reproduced. The website's build of 11.11. shows
   5 px on the field, the submit and the Filters button on every list-filter page, at 390, 700 and
   1280 px, with and without script. Production shows 20/5 px on both field and button, and its
   stylesheet holds neither v2.17.0 rule (the list filter's button corner, the field's small
   corner), so it predates that pin. Reopen if a page shows the two corners side by side.
3. **A lighter selection for a phone.** Not built. iOS Safari ignores `::selection`, so no value
   reaches an iPhone; Android Chrome applies it. On night a fill above 27 % teal-night drops a
   selected teal-night link below 4.5:1 (25 %: 4.81, 40 %: 3.42). By day a 35 % fill keeps a
   selected link at 4.61:1 and stands off white at 1.67:1 (25 % today: 1.43:1); it is the one
   candidate left, unscored.

Review findings on v2.21.0 left as they are:

4. `nav.css` gives the hover fill to any item with `aria-expanded="true"`, a link or summary
   included, and styles every button without a class inside `hw-nav`. No consumer's tracked source
   shows either inside `hw-nav` on 11.11.
5. A More button with `aria-current="true"` keeps its tint where its own list item holds the
   current page; the section rule covers links only. The More pattern opens a menu outside its row.
6. The dense touch floor is applied in `--hw-button-height` and again in `--hw-field-height`,
   `--hw-choice-height` and `.form-input`. Moving it into `button.css` (as accordion, tabs and menu
   do) needs print's `--hw-button-height: 0` written `0px`.
7. Tests: none yet pins a fitting table's static first column below 48rem, the dense button's
   44 px on a touch screen, or the nav button's states.

Check: each point reopened and handled, or deleted with this item.
